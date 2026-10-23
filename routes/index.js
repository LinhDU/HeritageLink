const express = require('express');
const fs = require('fs');
const path = require('path');
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
  createAmbassadorDirectly,
  createHostDirectly,
  createClientDirectly,
  getAllAccounts
} = require('../controllers/adminController');

const router = express.Router();

// File upload API for images and videos
router.post('/api/upload', (req, res) => {
  try {
    const { data, name } = req.body || {};
    if (!data) {
      return res.status(400).json({ message: 'Không có dữ liệu tệp tải lên.' });
    }

    if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('images/') || data.startsWith('/uploads/'))) {
      return res.json({ url: data, filename: name || 'file' });
    }

    const matches = data.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Định dạng tệp không hợp lệ.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    let ext = 'bin';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';
    else if (name && name.includes('.')) ext = name.split('.').pop().toLowerCase();

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanName = (name || 'media').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `${Date.now()}_${cleanName}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return res.json({
      message: 'Tải tệp lên thành công!',
      url: fileUrl,
      filename,
      mimeType,
      size: buffer.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Lỗi khi lưu tệp tải lên.', error: err.message });
  }
});

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
router.post('/api/admin/hosts/create', createHostDirectly);
router.post('/api/admin/clients/create', createClientDirectly);
router.post('/api/admin/accounts/create', (req, res) => {
  const role = req.body?.role || 'ambassador';
  if (role === 'host') return createHostDirectly(req, res);
  if (role === 'client') return createClientDirectly(req, res);
  return createAmbassadorDirectly(req, res);
});
router.get('/api/admin/accounts', getAllAccounts);

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

// Get all registered hosts/artisans for selection
router.get('/api/hosts', (req, res) => {
  const hosts = memoryStore.users
    .filter((u) => u.role === 'host')
    .map((u) => ({
      id: u.id,
      name: u.name,
      craft: u.craft || 'Nghề thủ công bản địa',
      region: u.region || '',
      phone: u.phone || '',
      email: u.email
    }));
  res.json(hosts);
});

// Ambassador Tour Creation with Custom Detail UI Theme
router.post('/api/ambassador/experiences', async (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Chỉ Đại sứ Di sản mới có quyền tạo tour và thiết kế giao diện.' });
  }

  const {
    title,
    category,
    location,
    price,
    duration,
    maxGuests,
    imageUrl,
    videoUrl,
    videoTitle,
    galleryImages,
    hostId,
    hostName,
    story,
    specialIntro,
    layers,
    stages,
    artisan,
    packages,
    addons,
    customTheme,
    consentAgreed
  } = req.body || {};

  if (!title || !location) {
    return res.status(400).json({ message: 'Vui lòng cung cấp tên tour và địa phương.' });
  }

  const themeConfig = {
    themePreset: customTheme?.themePreset || customTheme?.palette || 'terracotta',
    palette: customTheme?.palette || customTheme?.themePreset || 'terracotta',
    primaryColor: customTheme?.primaryColor || customTheme?.colorPrimary || '#8d4925',
    colorPrimary: customTheme?.colorPrimary || customTheme?.primaryColor || '#8d4925',
    accentColor: customTheme?.accentColor || customTheme?.colorAccent || '#c59b27',
    colorAccent: customTheme?.colorAccent || customTheme?.accentColor || '#c59b27',
    secondaryColor: customTheme?.secondaryColor || customTheme?.colorBgSecondary || '#fdf8f5',
    colorBgSecondary: customTheme?.colorBgSecondary || customTheme?.secondaryColor || '#fdf8f5',
    heroLayout: customTheme?.heroLayout || 'split',
    fontStyle: customTheme?.fontStyle || customTheme?.fontFamily || 'serif',
    fontFamily: customTheme?.fontFamily || customTheme?.fontStyle || 'serif',
    badgeText: customTheme?.badgeText || 'Đại sứ Khảo sát 100% Thực địa',
    ambassadorNote: customTheme?.ambassadorNote || customTheme?.ambassadorGreeting || `Lời ngỏ từ Đại sứ ${req.session.user.name}: Hãy cùng chúng mình trải nghiệm trọn vẹn văn hóa sống bản địa!`,
    ambassadorGreeting: customTheme?.ambassadorGreeting || customTheme?.ambassadorNote || `Lời ngỏ từ Đại sứ ${req.session.user.name}: Hãy cùng chúng mình trải nghiệm trọn vẹn văn hóa sống bản địa!`,
    audioTitle: customTheme?.audioTitle || '',
    audioGuideUrl: customTheme?.audioGuideUrl || '',
    culturalTips: customTheme?.culturalTips || 'Tôn trọng nếp sống và phong tục người dân bản xứ.'
  };

  const newExp = {
    id: memoryStore.nextExperienceId++,
    category: category || 'craft',
    segmentName: category === 'craft' ? 'Làng nghề thủ công' : category === 'food' ? 'Ẩm thực địa phương' : category === 'culture' ? 'Tour văn hóa & Lưu trú' : 'Sản phẩm mang về',
    title,
    ambassador: req.session.user.name,
    ambassadorId: req.session.user.id,
    rating: 5.0,
    reviewCount: 0,
    duration: duration || '1 buổi (4 giờ)',
    maxGuests: Number(maxGuests || 8),
    location,
    price: Number(price || 850000),
    imageClass: imageUrl || 'images/gom-bacninh.jpg',
    videoUrl: videoUrl || '',
    videoTitle: videoTitle || 'Thước phim thực địa di sản',
    galleryImages: Array.isArray(galleryImages) && galleryImages.length ? galleryImages : [imageUrl || 'images/gom-bacninh.jpg', 'images/person_2.jpg', 'images/gal_2.jpg'],
    hostId: hostId ? Number(hostId) : null,
    hostName: hostName || (artisan?.name || 'Nghệ nhân bản địa'),
    badge: 'Chờ kiểm duyệt',
    status: 'pending',
    verifiedDate: 'Đang chờ Admin duyệt 3 tiêu chí',
    hasStay: category === 'culture',
    consentAgreed: !!consentAgreed,
    specialIntro: specialIntro || 'Trải nghiệm đặc sắc được khảo sát và bảo trợ trực tiếp bởi Đại sứ Sinh viên HeritageLink.',
    story: story || 'Hồ sơ di sản văn hóa do Đại sứ khảo sát thực địa và có sự ủy quyền kể chuyện từ nghệ nhân bản địa.',
    layers: layers || {
      layer1_observe: 'Quan sát các công đoạn chế tác bí truyền của làng.',
      layer1_image: '',
      layer1_video: '',
      layer2_touch: 'Cầm nắm nguyên liệu tự nhiên của vùng đất.',
      layer2_image: '',
      layer2_video: '',
      layer3_do: 'Tự tay làm sản phẩm thủ công dưới sự kèm cặp của nghệ nhân.',
      layer3_image: '',
      layer3_video: '',
      layer4_listen: 'Lắng nghe những huyền tích, chuyện giữ nghề ngàn đời.',
      layer4_image: '',
      layer4_video: ''
    },
    stages: Array.isArray(stages) && stages.length ? stages : [
      { id: 1, name: 'Giai đoạn 1: Quan sát', desc: layers?.layer1_observe || 'Quan sát các công đoạn chế tác bí truyền của làng.', image: layers?.layer1_image || '', video: layers?.layer1_video || '' },
      { id: 2, name: 'Giai đoạn 2: Chạm tay', desc: layers?.layer2_touch || 'Cầm nắm nguyên liệu tự nhiên của vùng đất.', image: layers?.layer2_image || '', video: layers?.layer2_video || '' },
      { id: 3, name: 'Giai đoạn 3: Tự làm', desc: layers?.layer3_do || 'Tự tay làm sản phẩm thủ công dưới sự kèm cặp của nghệ nhân.', image: layers?.layer3_image || '', video: layers?.layer3_video || '' },
      { id: 4, name: 'Giai đoạn 4: Lắng nghe', desc: layers?.layer4_listen || 'Lắng nghe những huyền tích, chuyện giữ nghề ngàn đời.', image: layers?.layer4_image || '', video: layers?.layer4_video || '' }
    ],
    artisan: artisan || {
      name: hostName || `Nghệ nhân hợp tác cùng ${req.session.user.name}`,
      years: 'Hơn 25 năm giữ nghề',
      quote: 'Mong văn hóa của làng được lan tỏa đến thế hệ trẻ muôn phương.',
      image: 'images/person_2.jpg'
    },
    packages: packages || {
      standardPrice: Number(price || 850000),
      standardDesc: 'Gói chuẩn: Kèm cặp thực hành 1:1 + Thành phẩm mang về.',
      premiumPrice: Number(price || 850000) + 300000,
      premiumDesc: 'Gói chuyên sâu: Trọn gói chuẩn + Bữa cơm quê truyền thống.'
    },
    addons: addons || [],
    customTheme: themeConfig,
    createdAt: new Date().toISOString()
  };

  memoryStore.experiences.unshift(newExp);
  if (typeof saveLocalFallback === 'function') saveLocalFallback();

  return res.status(201).json({
    message: 'Khởi tạo Tour Di sản và giao diện trang Detail thành công! Đã gửi hồ sơ lên Ban Quản Trị để thẩm định 3 tiêu chí.',
    experience: newExp
  });
});

// Ambassador Tour Update (incl. Custom Detail UI Theme)
router.put('/api/ambassador/experiences/:id', async (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Chỉ Đại sứ mới có quyền chỉnh sửa tour.' });
  }

  const id = Number(req.params.id);
  const exp = memoryStore.experiences.find((e) => e.id === id);

  if (!exp) {
    return res.status(404).json({ message: 'Không tìm thấy trải nghiệm.' });
  }

  const {
    title,
    category,
    location,
    price,
    duration,
    maxGuests,
    imageUrl,
    videoUrl,
    videoTitle,
    galleryImages,
    hostId,
    hostName,
    story,
    specialIntro,
    layers,
    stages,
    artisan,
    packages,
    addons,
    customTheme
  } = req.body || {};

  if (title) exp.title = title;
  if (category) {
    exp.category = category;
    exp.segmentName = category === 'craft' ? 'Làng nghề thủ công' : category === 'food' ? 'Ẩm thực địa phương' : category === 'culture' ? 'Tour văn hóa & Lưu trú' : 'Sản phẩm mang về';
  }
  if (location) exp.location = location;
  if (price) exp.price = Number(price);
  if (duration) exp.duration = duration;
  if (maxGuests) exp.maxGuests = Number(maxGuests);
  if (imageUrl) exp.imageClass = imageUrl;
  if (videoUrl !== undefined) exp.videoUrl = videoUrl;
  if (videoTitle !== undefined) exp.videoTitle = videoTitle;
  if (galleryImages) exp.galleryImages = galleryImages;
  if (hostId) exp.hostId = Number(hostId);
  if (hostName) exp.hostName = hostName;
  if (story) exp.story = story;
  if (specialIntro) exp.specialIntro = specialIntro;
  if (layers) exp.layers = { ...exp.layers, ...layers };
  if (stages) exp.stages = stages;
  if (artisan) exp.artisan = { ...exp.artisan, ...artisan };
  if (packages) exp.packages = { ...exp.packages, ...packages };
  if (addons) exp.addons = addons;

  if (customTheme) {
    exp.customTheme = {
      ...exp.customTheme,
      ...customTheme
    };
  }

  if (typeof saveLocalFallback === 'function') saveLocalFallback();

  return res.json({
    message: 'Cập nhật Tour và tùy biến giao diện trang Detail thành công!',
    experience: exp
  });
});

// Ambassador Tours List
router.get('/api/ambassador/experiences', (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
  }

  const myTours = memoryStore.experiences.filter(
    (e) =>
      req.session.user.role === 'admin' ||
      e.ambassadorId === req.session.user.id ||
      e.ambassador?.toLowerCase().includes('minh anh') ||
      e.ambassador === req.session.user.name
  );

  res.json(myTours);
});

router.post('/api/ambassador/propose-spot', async (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'ambassador' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Chỉ Đại sứ mới được đề xuất điểm di sản.' });
  }

  const { title, category, location, price, duration, badge, imageUrl, consentAgreed, customTheme } = req.body || {};
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
    culturalNotes: 'Tôn trọng nếp sống và văn hóa tâm linh của đồng bào bản địa.',
    customTheme: customTheme || {
      themePreset: 'terracotta',
      primaryColor: '#8d4925',
      accentColor: '#c59b27',
      heroLayout: 'split',
      fontStyle: 'serif',
      badgeText: 'Khảo sát thực địa bởi Đại sứ'
    }
  };

  memoryStore.experiences.unshift(newExp);
  if (typeof saveLocalFallback === 'function') saveLocalFallback();

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

