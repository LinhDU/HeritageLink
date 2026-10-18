const express = require('express');
const { db, memoryStore, calculateRevenueSplit } = require('../db');
const { login, register, logout, getCurrentUser } = require('../controllers/authController');
const { getExperiences, getExperienceById, getImpact, createApplication } = require('../controllers/experienceController');
const { createBooking, getBookings } = require('../controllers/bookingController');
const {
  getAdminOverview,
  createExperience,
  updateExperience,
  deleteExperience,
  approveAmbassadorApplication,
  rejectAmbassadorApplication,
  createAmbassadorDirectly
} = require('../controllers/adminController');

const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HeritageLink API đang hoạt động' });
});

// Revenue split specification (Docx Section 5)
router.get('/api/revenue-split', (req, res) => {
  res.json({
    formula: {
      hostShare: 0.85,
      ambassadorShare: 0.05,
      paymentGatewayShare: 0.02,
      platformNetShare: 0.08,
      totalPlatformFee: 0.15
    },
    comparison: {
      heritagelinkFee: '15%',
      airbnbExperiencesFee: '20%',
      advantage: 'Đại sứ sinh viên hỗ trợ số hóa và tiếp thị bản địa thay vì nghệ nhân phải tự làm'
    },
    sampleSplit850k: calculateRevenueSplit(850000, 1)
  });
});

router.get('/api/experiences', getExperiences);
router.get('/api/experiences/:id', getExperienceById);
router.get('/api/impact', getImpact);
router.get('/api/ambassadors', async (req, res) => {
  const rows = await db.query('SELECT * FROM ambassador_applications ORDER BY createdAt DESC');
  res.json(rows);
});

router.post('/api/ambassador-applications', createApplication);
router.post('/api/register', register);
router.post('/api/login', login);
router.post('/api/logout', logout);
router.get('/api/session', getCurrentUser);
router.post('/api/bookings', createBooking);
router.get('/api/bookings', getBookings);
router.get('/api/admin/overview', getAdminOverview);
router.post('/api/admin/experiences', createExperience);
router.put('/api/admin/experiences/:id', updateExperience);
router.delete('/api/admin/experiences/:id', deleteExperience);
router.post('/api/admin/ambassadors/:id/approve', approveAmbassadorApplication);
router.post('/api/admin/ambassadors/:id/reject', rejectAmbassadorApplication);
router.post('/api/admin/ambassadors/create', createAmbassadorDirectly);

// Booking Lookup API (Referencing LocalLife.asia "Tra cứu đặt chỗ")
router.get('/api/bookings/lookup', (req, res) => {
  const { code, phone } = req.query;
  if (!code && !phone) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã đặt chỗ (ví dụ HL-BK01) hoặc số điện thoại.' });
  }

  const booking = memoryStore.bookings.find((b) => {
    if (code && b.bookingCode && b.bookingCode.toLowerCase() === code.trim().toLowerCase()) return true;
    if (phone) {
      const user = memoryStore.users.find((u) => u.id === b.userId);
      if (user && user.phone && user.phone.includes(phone.trim())) return true;
    }
    return false;
  });

  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy thông tin đặt chỗ phù hợp.' });
  }

  const exp = memoryStore.experiences.find((e) => e.id === booking.experienceId);
  const user = memoryStore.users.find((u) => u.id === booking.userId);

  res.json({
    ...booking,
    experienceTitle: exp ? exp.title : 'Trải nghiệm di sản',
    experienceLocation: exp ? exp.location : 'Việt Nam',
    experienceImage: exp ? exp.imageClass : 'images/gom-bacninh.jpg',
    artisanName: exp && exp.artisan ? exp.artisan.name : 'Nghệ nhân bản địa',
    userName: user ? user.name : 'Du khách',
    userPhone: user ? user.phone : 'Chưa cập nhật'
  });
});

// Simulate VietQR payment
router.post('/api/bookings/:id/pay', (req, res) => {
  const id = Number(req.params.id);
  const booking = memoryStore.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking.' });
  }

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  if (!booking.qrCode) {
    booking.qrCode = `HL-CHK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  res.json({
    message: 'Thanh toán VietQR giả lập thành công! Mã QR check-in đã sẵn sàng.',
    booking
  });
});

// Check-in QR execution (Awards Passport Stamp & confirms revenue)
router.post('/api/bookings/:id/checkin', (req, res) => {
  const id = Number(req.params.id);
  const booking = memoryStore.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking.' });
  }

  booking.status = 'completed';
  booking.checkedInAt = new Date().toISOString();

  const exp = memoryStore.experiences.find((e) => e.id === booking.experienceId);

  // Award Cultural Passport stamp if not yet earned
  let newStamp = null;
  if (exp && exp.stampId) {
    const existing = memoryStore.passport_stamps.find(
      (s) => s.userId === booking.userId && s.stampId === exp.stampId
    );
    if (!existing) {
      newStamp = {
        id: memoryStore.nextStampId++,
        userId: booking.userId,
        bookingId: booking.id,
        stampId: exp.stampId,
        title: `Tem Di sản ${exp.title.split('–')[0].trim()}`,
        theme: exp.stampTheme || 'Làng nghề',
        location: exp.location,
        icon: exp.category === 'craft' ? '🏺' : exp.category === 'food' ? '🍲' : '⛩️',
        earnedAt: new Date().toISOString()
      };
      memoryStore.passport_stamps.push(newStamp);
    }
  }

  res.json({
    message: 'Check-in thành công! Chúc bạn có trải nghiệm văn hóa tuyệt vời.',
    booking,
    stampAwarded: newStamp
  });
});

// Heritage Passport API (Hộ chiếu Di sản)
router.get('/api/passport', (req, res) => {
  const userId = req.session.user ? req.session.user.id : 4;
  const userStamps = memoryStore.passport_stamps.filter((s) => s.userId === userId);

  const stampCount = userStamps.length;
  let rank = 'Người khám phá (Explorer)';
  let nextRank = 'Người kết nối (Connector)';
  let progress = Math.min(100, Math.round((stampCount / 3) * 100));

  if (stampCount >= 5) {
    rank = 'Đại sứ Di sản Cộng đồng (Community Ambassador)';
    nextRank = 'Cấp bậc tối cao';
    progress = 100;
  } else if (stampCount >= 3) {
    rank = 'Người gìn giữ (Guardian)';
    nextRank = 'Đại sứ Di sản Cộng đồng';
    progress = Math.min(100, Math.round((stampCount / 5) * 100));
  } else if (stampCount >= 2) {
    rank = 'Người kết nối (Connector)';
    nextRank = 'Người gìn giữ';
    progress = Math.min(100, Math.round((stampCount / 3) * 100));
  }

  // Pre-configured themes for discovery
  const allThemes = [
    { theme: 'Làng nghề', count: 3, icon: '🏺', desc: 'Gốm Phù Lãng, Thêu Khoái Châu, Đèn lồng Hội An' },
    { theme: 'Ẩm thực', count: 1, icon: '🍲', desc: 'Mâm cơm truyền thống Hòa Vang Đà Nẵng' },
    { theme: 'Không gian sống', count: 1, icon: '🏡', desc: 'Nhà trình tường H\'Mông Lô Lô Chải' },
    { theme: 'Di tích & Huyền sử', count: 1, icon: '⛩️', desc: 'Cố đô Hoa Lư & Quần thể Tràng An' }
  ];

  res.json({
    stamps: userStamps,
    stampCount,
    rank,
    nextRank,
    progress,
    themes: allThemes
  });
});

// Host / Community Portal API (/host)
router.get('/api/host/overview', (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'host' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Dành riêng cho Nghệ nhân & Hộ dân bản địa.' });
  }

  const hostBookings = memoryStore.bookings.map((b) => {
    const exp = memoryStore.experiences.find((e) => e.id === b.experienceId);
    const user = memoryStore.users.find((u) => u.id === b.userId);
    return {
      ...b,
      experienceTitle: exp ? exp.title : 'Trải nghiệm',
      location: exp ? exp.location : 'Việt Nam',
      guestName: user ? user.name : 'Du khách',
      guestPhone: user ? user.phone : '0909988776'
    };
  });

  const totalHostRevenue = hostBookings.reduce((sum, b) => sum + (b.hostRevenue || Math.round(b.totalPrice * 0.85)), 0);
  const completedBookings = hostBookings.filter((b) => b.status === 'completed').length;

  res.json({
    host: {
      name: 'Bác Phạm Văn Nam',
      craft: 'Gốm truyền thống Phù Lãng',
      location: 'Xã Phù Lãng, Thị xã Quế Võ, Bắc Ninh',
      years: '42 năm làm nghề',
      phone: '0912345678',
      shareRate: '85% GMV (Minh bạch)'
    },
    stats: {
      totalRevenue: totalHostRevenue,
      formattedRevenue: `${totalHostRevenue.toLocaleString('vi-VN')}đ`,
      completedBookings,
      upcomingBookings: hostBookings.filter((b) => b.status !== 'completed').length
    },
    bookings: hostBookings,
    mockZaloAlert: {
      sender: 'HeritageLink Zalo OA',
      time: '10 phút trước',
      message: '🔔 [HeritageLink] Bác Nam ơi, có khách mới đặt trải nghiệm Gốm Phù Lãng vào ngày 25/10 (2 người lớn). Bác nhấn vào đây để xem lịch đón khách nhé!'
    }
  });
});

// Host confirms booking
router.post('/api/host/bookings/:id/confirm', (req, res) => {
  const id = Number(req.params.id);
  const booking = memoryStore.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking.' });
  }

  booking.status = 'confirmed';
  res.json({ message: 'Đã xác nhận sẵn sàng đón tiếp du khách!', booking });
});

// Admin reviews experience with 3 criteria (Docx Section 4.8)
router.post('/api/admin/experiences/:id/review', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ Super Admin mới có quyền kiểm duyệt.' });
  }

  const id = Number(req.params.id);
  const exp = memoryStore.experiences.find((e) => e.id === id);
  if (!exp) {
    return res.status(404).json({ message: 'Không tìm thấy trải nghiệm.' });
  }

  const { decision, note, authenticityScore, storytellingScore, interactionScore } = req.body;

  exp.reviewScores = {
    authenticity: Number(authenticityScore || 9),
    storytelling: Number(storytellingScore || 9),
    interaction: Number(interactionScore || 9)
  };
  exp.reviewNote = note || '';

  if (decision === 'approve' || decision === 'approved') {
    exp.badge = 'Đã kiểm duyệt';
    exp.verifiedDate = new Date().toLocaleDateString('vi-VN');
  } else if (decision === 'need_edit') {
    exp.badge = 'Cần chỉnh sửa';
  } else {
    exp.badge = 'Từ chối';
  }

  res.json({ message: `Cập nhật trạng thái kiểm duyệt: ${exp.badge}`, experience: exp });
});

// Ambassador Portal APIs
router.get('/api/ambassador/overview', async (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập cổng Đại sứ.' });
  }

  const allExps = memoryStore.experiences;
  const mySpots = allExps.filter((e) => 
    e.ambassador.toLowerCase().includes('minh anh') || 
    req.session.user.role === 'admin' || 
    e.ambassador === req.session.user.name
  );

  const allBookings = memoryStore.bookings.map((b) => {
    const exp = memoryStore.experiences.find((e) => e.id === b.experienceId);
    const user = memoryStore.users.find((u) => u.id === b.userId);
    return {
      ...b,
      experienceTitle: exp ? exp.title : 'Trải nghiệm',
      userName: user ? user.name : 'Du khách'
    };
  });

  // Calculate actual ambassador commission (Docx Section 2 & 5: e.g. 5% GMV)
  const recordedCommission = allBookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.ambassadorCommission || Math.round(b.totalPrice * 0.05)), 0);

  const pendingCommission = allBookings
    .filter((b) => b.status !== 'completed')
    .reduce((sum, b) => sum + (b.ambassadorCommission || Math.round(b.totalPrice * 0.05)), 0);

  res.json({
    ambassador: req.session.user,
    stats: {
      views: '18.4K',
      bookings: allBookings.length,
      rating: '92/100',
      recordedCommission: `${recordedCommission.toLocaleString('vi-VN')}đ`,
      pendingCommission: `${pendingCommission.toLocaleString('vi-VN')}đ`,
      totalCommission: `${(recordedCommission + pendingCommission).toLocaleString('vi-VN')}đ`,
      partnerHosts: 14
    },
    trainingModules: [
      { id: 1, title: 'Kỹ năng Phỏng vấn & Khảo sát văn hóa bản địa', duration: '45 phút', status: 'completed' },
      { id: 2, title: 'Quay dựng video di sản bằng điện thoại thông minh', duration: '60 phút', status: 'completed' },
      { id: 3, title: 'Nghệ thuật Storytelling kể chuyện di sản sống', duration: '50 phút', status: 'completed' },
      { id: 4, title: 'Bộ quy tắc đạo đức tiếp cận & tôn trọng cộng đồng', duration: '40 phút', status: 'completed' }
    ],
    spots: mySpots.length ? mySpots : allExps.slice(0, 3),
    recentBookings: allBookings.slice(0, 5)
  });
});

router.post('/api/ambassador/propose-spot', async (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Chỉ Đại sứ mới được đề xuất điểm di sản.' });
  }

  const { title, category, location, price, duration, badge, imageUrl, consentAgreed } = req.body || {};
  if (!title || !location) {
    return res.status(400).json({ message: 'Vui lòng điền đủ thông tin điểm di sản.' });
  }

  const newExp = {
    id: memoryStore.nextExperienceId++,
    category: category || 'craft',
    segmentName: category === 'craft' ? 'Làng nghề thủ công' : category === 'food' ? 'Ẩm thực địa phương' : category === 'culture' ? 'Tour văn hóa' : 'Sản phẩm mang về',
    title,
    ambassador: req.session.user.name,
    ambassadorId: req.session.user.id,
    rating: 5.0,
    reviewCount: 0,
    duration: duration || '1 buổi (3 giờ)',
    location,
    price: Number(price || 850000),
    imageClass: imageUrl || 'images/gom-bacninh.jpg',
    badge: 'Chờ kiểm duyệt',
    verifiedDate: 'Đang thẩm định',
    hasStay: false,
    consentAgreed: !!consentAgreed,
    story: 'Hồ sơ di sản văn hóa do Đại sứ khảo sát thực địa và có sự ủy quyền kể chuyện từ nghệ nhân bản địa.',
    layers: {
      layer1_observe: 'Quan sát các công đoạn chế tác bí truyền của làng.',
      layer2_touch: 'Cầm nắm nguyên liệu tự nhiên của vùng đất.',
      layer3_do: 'Tự tay làm sản phẩm thủ công dưới sự kèm cặp của nghệ nhân.',
      layer4_listen: 'Lắng nghe những huyền tích, chuyện giữ nghề ngàn đời.'
    },
    artisan: {
      name: `Nghệ nhân hợp tác cùng ${req.session.user.name}`,
      years: 'Hơn 25 năm giữ nghề',
      quote: 'Mong văn hóa của làng được lan tỏa đến thế hệ trẻ muôn phương.'
    },
    culturalNotes: 'Tôn trọng nếp sống và văn hóa tâm linh của đồng bào bản địa.'
  };

  memoryStore.experiences.push(newExp);

  res.status(201).json({
    message: 'Đề xuất điểm di sản thành công! Hồ sơ đã được gửi tới Super Admin để thẩm định 3 tiêu chí.',
    spot: newExp
  });
});

// Living Heritage Profiles APIs (Hồ sơ Di sản sống)
router.get('/api/heritage-profiles', (req, res) => {
  const profiles = memoryStore.heritage_profiles || [];
  res.json(profiles);
});

router.get('/api/heritage-profiles/:slug', (req, res) => {
  const slug = req.params.slug;
  const profiles = memoryStore.heritage_profiles || [];
  const profile = profiles.find((p) => p.slug === slug);
  if (!profile) {
    return res.status(404).json({ message: 'Không tìm thấy Hồ sơ Di sản sống.' });
  }

  const linkedExp = profile.relatedExperienceId
    ? memoryStore.experiences.find((e) => e.id === profile.relatedExperienceId)
    : null;

  res.json({
    ...profile,
    relatedExperience: linkedExp
  });
});

// Community Inquiries (Khu vực dành cho Cộng đồng Bản địa & Nghệ nhân)
router.post('/api/community/inquire', (req, res) => {
  const { name, location, cultureType, phone, description, contactMethod } = req.body || {};
  if (!name || !phone || !location) {
    return res.status(400).json({ message: 'Vui lòng cung cấp họ tên, số điện thoại và địa phương.' });
  }

  const inquiry = {
    id: (memoryStore.community_inquiries?.length || 0) + 1,
    name,
    location,
    cultureType: cultureType || 'Làng nghề truyền thống',
    phone,
    description: description || '',
    contactMethod: contactMethod || 'Zalo',
    status: 'pending_contact',
    createdAt: new Date().toISOString()
  };

  if (!memoryStore.community_inquiries) {
    memoryStore.community_inquiries = [];
  }
  memoryStore.community_inquiries.push(inquiry);

  res.status(201).json({
    message: 'Gửi kết nối thành công! Đội ngũ HeritageLink và Đại sứ địa phương sẽ liên hệ với bạn trong 24h tới.',
    inquiry
  });
});

// Verified Review Submission
router.post('/api/bookings/:id/review', (req, res) => {
  const id = Number(req.params.id);
  const { rating, comment } = req.body || {};
  const booking = memoryStore.bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking.' });
  }

  if (booking.status !== 'completed') {
    return res.status(400).json({ message: 'Chỉ có thể đánh giá sau khi đã hoàn thành trải nghiệm (check-in).' });
  }

  booking.hasReviewed = true;
  booking.review = {
    rating: Number(rating || 5),
    comment: comment || 'Trải nghiệm văn hóa bản địa vô cùng ý nghĩa và chân thực.',
    reviewedAt: new Date().toISOString()
  };

  // Update experience review count and rating
  const exp = memoryStore.experiences.find((e) => e.id === booking.experienceId);
  if (exp) {
    exp.reviewCount = (exp.reviewCount || 0) + 1;
  }

  res.json({
    message: 'Cảm ơn bạn đã đóng góp phản hồi chân thực về trải nghiệm di sản!',
    review: booking.review
  });
});

// AI Itinerary Smart Generator (Rules-based with authentic heritage graph)
router.post('/api/ai-itinerary/generate', (req, res) => {
  const { destination, duration, culturalStyle, groupSize, budget } = req.body || {};

  // Destination filter or best picks
  let matchedExperiences = [...memoryStore.experiences];

  if (destination && destination !== 'all') {
    matchedExperiences = matchedExperiences.filter(
      (e) => e.location.toLowerCase().includes(destination.toLowerCase())
    );
  }

  if (matchedExperiences.length === 0) {
    matchedExperiences = [...memoryStore.experiences];
  }

  // Duration mapping (1 day, 2 days, 3 days)
  const isMultiDay = duration === '2d1n' || duration === '3d2n' || duration === '3_days' || duration === '2_days';

  const day1Exp = matchedExperiences[0] || memoryStore.experiences[0];
  const day2Exp = matchedExperiences[1] || memoryStore.experiences[1];
  const day3Exp = matchedExperiences[2] || memoryStore.experiences[2];

  const daysPlan = [
    {
      day: 1,
      title: `Ngày 1: Chạm ngõ ${day1Exp.location} – ${day1Exp.title.split('–')[0].trim()}`,
      location: day1Exp.location,
      experienceId: day1Exp.id,
      timeline: [
        { time: '08:00 - 09:30', activity: `Di chuyển đến ${day1Exp.location}, làm quen cùng Đại sứ sinh viên phụ trách địa bàn.` },
        { time: '09:30 - 12:00', activity: `Ghé thăm nhà nghệ nhân: ${day1Exp.artisan?.name || 'Nghệ nhân bản địa'}, lắng nghe huyền tích làng nghề.` },
        { time: '12:00 - 13:30', activity: 'Thưởng thức bữa trưa mộc mạc theo nếp ẩm thực gia đình bản địa.' },
        { time: '14:00 - 17:00', activity: `Trực tiếp tham gia workshop: ${day1Exp.layers?.layer3_do || 'Tự tay làm sản phẩm thủ công mang về'}.` },
        { time: '18:30 - 20:30', activity: 'Quây quần bên chén trà thơm, giao lưu văn nghệ dân gian hoặc nghỉ ngơi tại homestay.' }
      ],
      highlights: [day1Exp.title, `Đại sứ đồng hành: ${day1Exp.ambassador}`, 'Tự tay hoàn thiện tác phẩm kỷ niệm']
    }
  ];

  if (isMultiDay && day2Exp) {
    daysPlan.push({
      day: 2,
      title: `Ngày 2: Đi sâu vào bản sắc – ${day2Exp.title.split('–')[0].trim()}`,
      location: day2Exp.location,
      experienceId: day2Exp.id,
      timeline: [
        { time: '07:00 - 08:30', activity: 'Thức giấc sớm ngắm bình minh làng quê, thưởng thức bữa sáng bản địa (bánh cuốn/xôi ngũ sắc).' },
        { time: '09:00 - 11:30', activity: `Khám phá không gian văn hóa tiếp theo: ${day2Exp.title}.` },
        { time: '11:30 - 13:00', activity: 'Mâm cơm cộng đồng cùng các hộ dân địa phương.' },
        { time: '14:00 - 16:30', activity: `Thực hành trải nghiệm văn hóa: ${day2Exp.layers?.layer3_do || 'Học kỹ nghệ truyền thống'}.` },
        { time: '17:00', activity: 'Tổng kết hành trình, nhận tem Hộ chiếu Di sản số và chào tạm biệt nghệ nhân.' }
      ],
      highlights: [day2Exp.title, 'Giao lưu cộng đồng bản xứ', 'Đóng dấu tem Hộ chiếu Di sản']
    });
  }

  if ((duration === '3d2n' || duration === '3_days') && day3Exp) {
    daysPlan.push({
      day: 3,
      title: `Ngày 3: Lưu dấu ký ức – ${day3Exp.title.split('–')[0].trim()}`,
      location: day3Exp.location,
      experienceId: day3Exp.id,
      timeline: [
        { time: '08:00 - 10:30', activity: `Tham quan di tích và không gian sinh thái: ${day3Exp.location}.` },
        { time: '11:00 - 13:00', activity: 'Thưởng trà đàm đạo cùng già làng / nghệ nhân cao tuổi.' },
        { time: '14:00 - 15:30', activity: 'Mua sắm các sản phẩm OCOP thủ công ủng hộ quỹ sinh kế cộng đồng.' },
        { time: '16:00', activity: 'Khởi hành trở về, hoàn thành hành trình sống cùng di sản.' }
      ],
      highlights: ['Sản phẩm thủ công OCOP', 'Ủng hộ sinh kế nghệ nhân', 'Kỷ niệm khó phai']
    });
  }

  const estBudget = (day1Exp.price + (isMultiDay ? (day2Exp?.price || 0) : 0)) * (Number(groupSize) || 1);

  res.json({
    status: 'success',
    itineraryId: `HL-ITIN-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `Hành trình Di sản Tùy biến: ${destination && destination !== 'all' ? destination : 'Bắc Ninh & Hà Giang'}`,
    culturalStyle: culturalStyle || 'Trải nghiệm sâu cùng nghệ nhân',
    durationText: isMultiDay ? (duration === '3d2n' ? '3 ngày 2 đêm' : '2 ngày 1 đêm') : 'Trong ngày (1 ngày)',
    groupSize: Number(groupSize) || 2,
    estimatedTotal: estBudget,
    formattedBudget: `${estBudget.toLocaleString('vi-VN')}đ`,
    whyRecommended: 'Lộ trình được thiết kế cân bằng giữa việc quan sát kỹ thuật cổ truyền, tự tay thực hành sản phẩm và lắng nghe những huyền tích văn hóa chưa từng được đưa lên sách báo.',
    days: daysPlan,
    suggestedExperiences: matchedExperiences.slice(0, 3)
  });
});

module.exports = router;

