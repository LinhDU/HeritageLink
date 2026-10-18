const dns = require('node:dns');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

dns.setDefaultResultOrder('ipv4first');

let useFallback = !process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/heritagelink',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 2000
});

// Calculate revenue split exactly matching Docx Section 5.1.1:
// 85% Host/Artisan | 5% Ambassador | 2% Payment Gateway | 8% HeritageLink Net Revenue (Total Platform Fee: 15%)
function calculateRevenueSplit(pricePerGuest, guests) {
  const gmv = Number(pricePerGuest) * Number(guests);
  const hostRevenue = Math.round(gmv * 0.85);
  const ambassadorCommission = Math.round(gmv * 0.05);
  const paymentFee = Math.round(gmv * 0.02);
  const netPlatformRevenue = Math.round(gmv * 0.08);
  const platformFee = Math.round(gmv * 0.15); // 5% + 2% + 8% = 15% (vs Airbnb 20%)

  return {
    gmv,
    hostRevenue,
    ambassadorCommission,
    paymentFee,
    netPlatformRevenue,
    platformFee
  };
}

// 7 authentic experiences mapped to the 4 official segments in docx Section 4.2 & 3.3.9:
// 1. craft: Làng nghề thủ công (Giá mẫu ~ 850.000đ)
// 2. food: Ẩm thực địa phương (Giá mẫu ~ 750.000đ)
// 3. culture: Tour văn hóa / di tích (Giá mẫu ~ 1.000.000đ)
// 4. product: Sản phẩm thủ công mang về (Giá mẫu ~ 350.000đ)
// hasStay: true -> Thuộc tính Có lưu trú (Homestay)
const seedExperiences = [
  {
    id: 1,
    category: 'craft',
    segmentName: 'Làng nghề thủ công',
    title: 'Gốm truyền thống Phù Lãng – Nghệ thuật men da lươn 700 năm',
    location: 'Bắc Ninh',
    price: 850000,
    duration: '1 buổi (4 giờ)',
    maxGuests: 8,
    ambassador: 'Lê Minh Anh',
    ambassadorId: 2,
    hostId: 1,
    hostName: 'Bác Phạm Văn Nam',
    rating: 4.9,
    reviewCount: 38,
    imageClass: 'images/gom-bacninh.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: false,
    verifiedDate: '10/10/2026',
    story: 'Làng gốm Phù Lãng bên bờ sông Cầu có lịch sử hơn 700 năm. Khác với men ngọc hay men rạn Bát Tràng, gốm Phù Lãng nổi tiếng với men da lươn tự nhiên thô mộc, tạo hình từ đất sét vàng đỏ và nung hoàn toàn bằng củi rơm truyền thống.',
    // 4-layer Heritage Experience (Docx section 4.3)
    layers: {
      layer1_observe: 'Quan sát nghệ nhân chuốt gốm trên bàn xoay thủ công và kỹ thuật canh lửa lò nung củi rơm 3 ngày 3 đêm liên tục.',
      layer2_touch: 'Chạm tay vào khối đất sét phù sa ủ dẻo, cảm nhận bề mặt thô mộc ấm nóng của men da lươn vừa ra lò.',
      layer3_do: 'Trực tiếp nhào đất, tự tay chuốt chiếc cốc mộc hoặc bình hoa kỷ niệm dưới sự hướng dẫn 1:1 của nghệ nhân.',
      layer4_listen: 'Lắng nghe bác Nam kể huyền tích tổ nghề Hứa Vĩnh Kiều, chuyện làng gốm sơ tán thời chiến và triết lý sống hòa với đất.'
    },
    artisan: {
      name: 'Bác Phạm Văn Nam',
      years: '42 năm giữ nghề gốm mộc',
      quote: 'Gốm Phù Lãng không bóng bẩy tráng lệ, nó mang màu đất nâu ấm và khói rơm của làng quê Việt Nam.',
      image: 'images/person_2.jpg'
    },
    culturalNotes: 'Vui lòng mặc trang phục thoải mái để dễ nhào nặn đất. Giữ trật tự và không tự ý bước vào gian thờ tổ nghề gốm.',
    stampTheme: 'Làng nghề',
    stampId: 'STAMP-GOM-PHULANG'
  },
  {
    id: 2,
    category: 'culture',
    segmentName: 'Tour văn hóa & Lưu trú',
    title: 'Sống cùng đồng bào H\'Mông & Lô Lô Chải cao nguyên đá',
    location: 'Hà Giang (Tuyên Quang)',
    price: 1200000,
    duration: '2 ngày 1 đêm',
    maxGuests: 6,
    ambassador: 'Lê Minh Anh',
    ambassadorId: 2,
    hostId: 2,
    hostName: 'Gia đình Vàng A Sình',
    rating: 4.9,
    reviewCount: 46,
    imageClass: 'images/hagiang.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: true,
    verifiedDate: '08/10/2026',
    story: 'Trải nghiệm không gian sống mộc mạc bên bờ rào đá, thưởng thức thắng cố truyền thống, cùng dệt vải lanh nhuộm chàm và ngủ lại nhà trình tường cổ kính nép mình dưới chân cột cờ Lũng Cú.',
    layers: {
      layer1_observe: 'Quan sát các bà, các mẹ se sợi lanh nhuộm chàm và kỹ thuật xếp hàng rào đá không cần vôi vữa của người Mông.',
      layer2_touch: 'Chạm vào bức tường đất trình dày 50cm mát rượi vào mùa hè, ấm áp vào mùa đông và dải lanh dệt thủ công.',
      layer3_do: 'Cùng chủ nhà nướng ngô, nấu mèn mén bên bếp lửa bập bùng và thử tài vẽ sáp ong trên vải lanh.',
      layer4_listen: 'Nghe già bản kể sử thi qua tiếng khèn Mông du dương vắt ngang sườn núi đá tai mèo trong đêm se lạnh.'
    },
    artisan: {
      name: 'Trưởng bản Vàng A Sình',
      years: '35 năm gắn bó với văn hóa bản Mông',
      quote: 'Cửa nhà người Mông luôn mở rộng đón khách quý, chỉ mong mọi người hiểu và yêu quý nếp sống mộc mạc của chúng tôi.',
      image: 'images/person_3.jpg'
    },
    culturalNotes: 'Khi vào nhà trình tường không ngồi gian thiêng và không huýt sáo trong nhà. Xin phép trước khi chụp ảnh người già và trẻ nhỏ.',
    stampTheme: 'Không gian sống',
    stampId: 'STAMP-HAGIANG-LOLO'
  },
  {
    id: 3,
    category: 'craft',
    segmentName: 'Làng nghề thủ công',
    title: 'Thêu tay nghệ thuật Khoái Châu – Từng đường kim lưu giữ hồn cốt',
    location: 'Hưng Yên',
    price: 850000,
    duration: '1 buổi (3 giờ)',
    maxGuests: 8,
    ambassador: 'Quốc Bình',
    ambassadorId: 3,
    hostId: 3,
    hostName: 'Nghệ nhân Nguyễn Thị Lan',
    rating: 5.0,
    reviewCount: 29,
    imageClass: 'images/theu-hungyen.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: false,
    verifiedDate: '11/10/2026',
    story: 'Làng thêu truyền thống Khoái Châu nổi tiếng với kỹ thuật thêu cung đình tinh xảo. Mỗi họa tiết cánh sen, đôi hạc, tranh phong cảnh được kết hợp từ hàng trăm sắc chỉ tơ tằm óng ả.',
    layers: {
      layer1_observe: 'Quan sát đôi bàn tay thoăn thoắt kéo chỉ, phối màu sắc tinh tế của nghệ nhân lão thành trên khung thêu gỗ.',
      layer2_touch: 'Cảm nhận độ mịn mát của dải lụa tơ tằm thô và từng bó chỉ tơ tằm nhuộm thảo mộc tự nhiên.',
      layer3_do: 'Cầm kim xâu sợi, tự tay thêu một nhành hoa sen nhỏ trên khăn tay lưu niệm mang về nhà.',
      layer4_listen: 'Lắng nghe những quy tắc nghiêm ngặt của nghệ thuật thêu áo lễ ngày xưa và nỗ lực đưa tranh thêu ra thế giới.'
    },
    artisan: {
      name: 'Nghệ nhân Nguyễn Thị Lan',
      years: '38 năm gìn giữ nghề thêu ren cung đình',
      quote: 'Một mũi kim lệch là hỏng cả tấm áo. Nghề thêu dạy con người ta sự kiên nhẫn, bình tâm và trân quý từng nét chỉ.',
      image: 'images/person_1.jpg'
    },
    culturalNotes: 'Vui lòng rửa sạch tay trước khi chạm vào các cuộn chỉ tơ tằm tự nhiên. Giữ không gian yên tĩnh khi nghệ nhân đang tập trung thêu họa tiết khó.',
    stampTheme: 'Làng nghề',
    stampId: 'STAMP-THEU-KHOAICHAU'
  },
  {
    id: 4,
    category: 'food',
    segmentName: 'Ẩm thực địa phương',
    title: 'Mâm cơm đồng quê Hòa Vang – Hương vị gia đình miền Trung',
    location: 'Đà Nẵng',
    price: 750000,
    duration: '3 giờ (kèm ăn trưa)',
    maxGuests: 10,
    ambassador: 'Lan Anh',
    ambassadorId: 2,
    hostId: 4,
    hostName: 'Mẹ Bảy Hòa Vang',
    rating: 4.8,
    reviewCount: 52,
    imageClass: 'images/amthuc-danang.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: false,
    verifiedDate: '09/10/2026',
    story: 'Ẩm thực Hòa Vang mang đậm tính cố kết cộng đồng với mâm cơm nhà vườn: cá lóc kho tộ, rau luộc chấm mắm nêm, canh cua đồng và bánh xèo giòn rụm đượm vị củi lửa.',
    layers: {
      layer1_observe: 'Quan sát mẹ Bảy nhặt rau vườn thuốc nam, giã mắm ớt tỏi cối đá và nêm nếm gia vị đồng quê gia truyền.',
      layer2_touch: 'Tự tay hái những chùm đọt mồng tơi, lá tía tô còn đọng sương sớm trong vườn rau hữu cơ của gia đình.',
      layer3_do: 'Học cách đổ bánh xèo giòn tan trên chảo gang củi và quấn nem lụi nướng sả thơm nức mũi.',
      layer4_listen: 'Ngồi quây quần bên hiên nhà gỗ nghe mẹ kể chuyện mâm cơm ngày lũ, triết lý cân bằng âm dương trong ẩm thực dân gian.'
    },
    artisan: {
      name: 'Mẹ Bảy Hòa Vang',
      years: '45 năm nấu mâm cỗ quê truyền thống',
      quote: 'Nấu ăn cho khách cũng như nấu cho con cháu đi xa về. Từng hạt muối, củ gừng đều phải thật lòng, đượm tình.',
      image: 'images/person_4.jpg'
    },
    culturalNotes: 'Thưởng thức mâm cơm theo phong tục quây quần mời người lớn tuổi trước. Hãy chia sẻ trước nếu bạn có dị ứng thực phẩm.',
    stampTheme: 'Ẩm thực',
    stampId: 'STAMP-AMTHUC-DANANG'
  },
  {
    id: 5,
    category: 'culture',
    segmentName: 'Tour văn hóa & Di tích',
    title: 'Cố Đô Hoa Lư & Sông nước Tràng An – Huyền sử ngàn năm Đinh Lê',
    location: 'Ninh Bình',
    price: 1000000,
    duration: '1 ngày (7 giờ)',
    maxGuests: 12,
    ambassador: 'Lê Minh Anh',
    ambassadorId: 2,
    hostId: 5,
    hostName: 'Bác Nguyễn Văn Thắng',
    rating: 4.9,
    reviewCount: 64,
    imageClass: 'images/ninhbinh.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: false,
    verifiedDate: '12/10/2026',
    story: 'Hành trình ngược dòng thời gian về kinh đô thế kỷ thứ 10, chèo thuyền luồn lách qua các hang động karst tự nhiên ngập nước và tìm hiểu chiến thuật dời đô, định quốc của tiền nhân.',
    layers: {
      layer1_observe: 'Chiêm ngưỡng kiến trúc đền vua Đinh - vua Lê với những rồng đá, sập đá ngàn năm rêu phong uy nghiêm.',
      layer2_touch: 'Chạm tay vào làn nước ngầm trong vắt nhìn thấy đáy rong rêu và những khối nhũ đá triệu năm kiến tạo.',
      layer3_do: 'Thử sức cùng cô chú lái đò khua mái chèo gỗ nhẹ nhàng trôi qua vòm hang Tối, hang Sáng kỳ vĩ.',
      layer4_listen: 'Lắng nghe chuyện dựng nước, dẹp loạn 12 sứ quân và những huyền tích dân gian truyền khẩu bên dòng sông Sào Khê.'
    },
    artisan: {
      name: 'Bác Nguyễn Văn Thắng',
      years: '28 năm hướng dẫn và gìn giữ văn hóa Hoa Lư',
      quote: 'Mỗi khúc sông, ngọn núi ở đây đều mang trong mình một bài học dựng nước và tình yêu non sông của cha ông.',
      image: 'images/person_2.jpg'
    },
    culturalNotes: 'Trang phục kín đáo, lịch sự khi vào đền thờ vua. Luôn mặc áo phao cứu sinh an toàn khi ngồi trên thuyền.',
    stampTheme: 'Di tích',
    stampId: 'STAMP-HOALU-TRANGAN'
  },
  {
    id: 6,
    category: 'craft',
    segmentName: 'Làng nghề thủ công',
    title: 'Làm đèn lồng lụa Hội An – Thắp sáng không gian phố Hội',
    location: 'Quảng Nam',
    price: 850000,
    duration: '1 buổi (3 giờ)',
    maxGuests: 8,
    ambassador: 'Quốc Bình',
    ambassadorId: 3,
    hostId: 6,
    hostName: 'Nghệ nhân Huỳnh Văn Ba',
    rating: 5.0,
    reviewCount: 41,
    imageClass: 'images/hoian.jpg',
    badge: 'Đã kiểm duyệt',
    hasStay: false,
    verifiedDate: '11/10/2026',
    story: 'Đèn lồng là biểu tượng linh hồn của đô thị cổ Hội An. Trải nghiệm giúp bạn hiểu tường tận từ khâu vót nan tre ngâm nước muối chống mọt đến nghệ thuật căng lụa tơ tằm nhiều màu sắc.',
    layers: {
      layer1_observe: 'Quan sát nghệ nhân vót nan tre già đều tăm tắp và tạo khung đèn hình quả trám, hình tỏi độc đáo.',
      layer2_touch: 'Cảm nhận độ dẻo dai của nan tre và chất vải lụa Hà Đông mềm mại, óng ả bắt sáng rực rỡ.',
      layer3_do: 'Tự tay bôi keo dán lụa, căng nếp gấp và gắn tua rua để hoàn thiện chiếc đèn lồng mang thương hiệu cá nhân.',
      layer4_listen: 'Nghe kể chuyện giao thương thế kỷ 17, nguồn gốc đèn hoa đăng và ý nghĩa cầu may mắn, bình an cho gia đạo.'
    },
    artisan: {
      name: 'Nghệ nhân Huỳnh Văn Ba',
      years: '40 năm gắn bó với nghề làm đèn lồng Hội An',
      quote: 'Ánh sáng của chiếc đèn lồng lụa Hội An không chói lóa, nó ấm áp và đượm tình người phố cổ.',
      image: 'images/person_3.jpg'
    },
    culturalNotes: 'Cẩn thận khi dùng kéo và que vót nan. Tự do lựa chọn màu sắc lụa theo sở thích hoặc phong thủy.',
    stampTheme: 'Làng nghề',
    stampId: 'STAMP-DENLONG-HOIAN'
  },
  {
    id: 7,
    category: 'product',
    segmentName: 'Sản phẩm thủ công mang về',
    title: 'Bộ ấm chén gốm mộc nung rơm Phù Lãng thủ công',
    location: 'Bắc Ninh',
    price: 350000,
    duration: 'Đóng gói gửi tận nơi',
    maxGuests: 1,
    ambassador: 'Lê Minh Anh',
    ambassadorId: 2,
    hostId: 1,
    hostName: 'Xưởng gốm Bác Nam',
    rating: 5.0,
    reviewCount: 15,
    imageClass: 'images/gom-bacninh.jpg',
    badge: 'Sản phẩm OCOP',
    hasStay: false,
    verifiedDate: '14/10/2026',
    story: 'Sản phẩm thủ công do chính tay các nghệ nhân Phù Lãng chế tác, nung củi rơm tự nhiên, giữ trọn hương vị trà xanh mộc mạc của làng quê Bắc Bộ.',
    layers: {
      layer1_observe: 'Ngắm nhìn màu men da lươn tự nhiên tạo vân khói độc bản trên từng ấm trà.',
      layer2_touch: 'Cầm nắm chiếc quai ấm chắc chắn, bề mặt gốm đanh chắc và giữ nhiệt cực lâu.',
      layer3_do: 'Thưởng thức trà mạn Bắc Ninh pha bằng chính bộ ấm gốm thủ công.',
      layer4_listen: 'Hiểu về quy trình chọn đất và cách dưỡng ấm gốm qua năm tháng sử dụng.'
    },
    artisan: {
      name: 'Bác Phạm Văn Nam',
      years: '42 năm làm gốm thủ công',
      quote: 'Mỗi ấm chén nung củi là một tác phẩm duy nhất, không cái nào giống hệt cái nào.',
      image: 'images/person_2.jpg'
    },
    culturalNotes: 'Gốm mộc không pha hóa chất men bóng. Trước khi dùng lần đầu nên luộc qua nước sôi hoặc nước trà.',
    stampTheme: 'Sản phẩm',
    stampId: 'STAMP-PRODUCT-AMCHEN'
  }
];

// Fallback in-memory database with 4 distinct roles
const memoryStore = {
  experiences: JSON.parse(JSON.stringify(seedExperiences)),
  users: [
    {
      id: 1,
      email: 'admin@heritagelink.vn',
      name: 'Nguyễn Hoàng Long',
      passwordHash: bcrypt.hashSync('admin123', 10),
      passwordhash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      phone: '0988123456',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'daisu@heritagelink.vn',
      name: 'Lê Minh Anh',
      passwordHash: bcrypt.hashSync('daisu123', 10),
      passwordhash: bcrypt.hashSync('daisu123', 10),
      role: 'ambassador',
      phone: '0977345678',
      school: 'ĐH Khoa học Xã hội & Nhân văn',
      region: 'Bắc Ninh & Hà Giang (Tuyên Quang)',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      email: 'hodan@heritagelink.vn',
      name: 'Bác Phạm Văn Nam',
      passwordHash: bcrypt.hashSync('hodan123', 10),
      passwordhash: bcrypt.hashSync('hodan123', 10),
      role: 'host',
      phone: '0912345678',
      region: 'Phù Lãng, Bắc Ninh',
      craft: 'Gốm Phù Lãng',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      email: 'client@heritagelink.vn',
      name: 'Trần Văn Khách',
      passwordHash: bcrypt.hashSync('client123', 10),
      passwordhash: bcrypt.hashSync('client123', 10),
      role: 'client',
      phone: '0909988776',
      createdAt: new Date().toISOString()
    }
  ],
  ambassador_applications: [
    {
      id: 1,
      name: 'Trần Văn Hoàng',
      phone: '0934567890',
      email: 'hoang.tran@gmail.com',
      school: 'ĐH Văn Hóa Hà Nội',
      youthUnion: 'Đoàn trường ĐH Văn Hóa',
      region: 'Bắc Ninh',
      introLink: 'https://youtube.com',
      ethicsAgreed: true,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Lê Minh Anh',
      phone: '0977345678',
      email: 'daisu@heritagelink.vn',
      school: 'ĐH KHXH & Nhân Văn',
      youthUnion: 'Hội Sinh viên ĐHQG',
      region: 'Bắc Ninh & Hà Giang (Tuyên Quang)',
      introLink: 'https://youtube.com',
      ethicsAgreed: true,
      status: 'approved',
      createdAt: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: 1,
      bookingCode: 'HL-BK01',
      experienceId: 1,
      userId: 4,
      bookingDate: '2026-10-20',
      guests: 2,
      pricePerGuest: 850000,
      totalPrice: 1700000,
      gmv: 1700000,
      hostRevenue: 1445000, // 85%
      ambassadorCommission: 85000, // 5%
      paymentFee: 34000, // 2%
      netPlatformRevenue: 136000, // 8%
      status: 'completed', // completed after check-in
      paymentStatus: 'paid',
      qrCode: 'HL-CHK-BK01-9988',
      checkedInAt: '2026-10-20T14:30:00.000Z',
      hasReviewed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      bookingCode: 'HL-BK02',
      experienceId: 2,
      userId: 4,
      bookingDate: '2026-10-25',
      guests: 2,
      pricePerGuest: 1200000,
      totalPrice: 2400000,
      gmv: 2400000,
      hostRevenue: 2040000, // 85%
      ambassadorCommission: 120000, // 5%
      paymentFee: 48000, // 2%
      netPlatformRevenue: 192000, // 8%
      status: 'confirmed', // confirmed, waiting for checkin
      paymentStatus: 'paid',
      qrCode: 'HL-CHK-BK02-3344',
      checkedInAt: null,
      hasReviewed: false,
      createdAt: new Date().toISOString()
    }
  ],
  passport_stamps: [
    {
      id: 1,
      userId: 4,
      bookingId: 1,
      stampId: 'STAMP-GOM-PHULANG',
      title: 'Tem Di sản Gốm Phù Lãng',
      theme: 'Làng nghề',
      location: 'Bắc Ninh',
      icon: '🏺',
      earnedAt: '2026-10-20T14:30:00.000Z'
    }
  ],
  nextExperienceId: 8,
  nextBookingId: 3,
  nextAppId: 3,
  nextStampId: 2
};

function queryMemory(text, params = []) {
  const sql = text.trim();

  // Experiences
  if (sql.includes('SELECT * FROM experiences ORDER BY id ASC')) {
    return memoryStore.experiences.sort((a, b) => a.id - b.id);
  }
  if (sql.includes('SELECT * FROM experiences WHERE id = $1')) {
    const item = memoryStore.experiences.find((e) => e.id === Number(params[0]));
    return item ? [item] : [];
  }
  if (sql.includes('INSERT INTO experiences')) {
    const newExp = {
      id: memoryStore.nextExperienceId++,
      category: params[0],
      title: params[1],
      ambassador: params[2],
      rating: Number(params[3] || 5.0),
      duration: params[4] || '2 giờ',
      location: params[5],
      price: Number(params[6] || 850000),
      imageClass: params[7] || 'images/gom-bacninh.jpg',
      badge: params[8] || 'Chờ duyệt',
      segmentName: params[0] === 'craft' ? 'Làng nghề thủ công' : params[0] === 'food' ? 'Ẩm thực địa phương' : params[0] === 'culture' ? 'Tour văn hóa' : 'Sản phẩm mang về',
      layers: {
        layer1_observe: 'Quan sát các kỹ thuật truyền thống do nghệ nhân thực hiện.',
        layer2_touch: 'Chạm tay vào các chất liệu bản địa mộc mạc.',
        layer3_do: 'Tự tay thực hiện sản phẩm lưu niệm dưới sự hướng dẫn 1:1.',
        layer4_listen: 'Lắng nghe chuyện đời gìn giữ nghề truyền thống.'
      },
      artisan: {
        name: params[2] ? `Nghệ nhân đồng hành cùng ${params[2]}` : 'Nghệ nhân bản địa',
        years: 'Hơn 20 năm giữ nghề',
        quote: 'Mỗi sản phẩm là một câu chuyện tình yêu với quê hương bản xứ.'
      },
      culturalNotes: 'Trang phục lịch sự, tôn trọng phong tục bản địa.'
    };
    memoryStore.experiences.push(newExp);
    return [newExp];
  }
  if (sql.includes('UPDATE experiences')) {
    const id = Number(params[9]);
    const exp = memoryStore.experiences.find((e) => e.id === id);
    if (exp) {
      exp.category = params[0];
      exp.title = params[1];
      exp.ambassador = params[2];
      exp.rating = Number(params[3]);
      exp.duration = params[4];
      exp.location = params[5];
      exp.price = Number(params[6]);
      exp.imageClass = params[7];
      exp.badge = params[8];
    }
    return [exp];
  }
  if (sql.includes('DELETE FROM bookings WHERE experienceId = $1')) {
    memoryStore.bookings = memoryStore.bookings.filter((b) => b.experienceId !== Number(params[0]));
    return [];
  }
  if (sql.includes('DELETE FROM experiences WHERE id = $1')) {
    memoryStore.experiences = memoryStore.experiences.filter((e) => e.id !== Number(params[0]));
    return [];
  }

  // Users
  if (sql.includes('SELECT * FROM users WHERE email = $1')) {
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === String(params[0]).toLowerCase());
    return user ? [user] : [];
  }
  if (sql.includes("SELECT COUNT(*)::int AS count FROM users WHERE role = $1")) {
    const count = memoryStore.users.filter((u) => u.role === params[0]).length;
    return [{ count }];
  }
  if (sql.includes('SELECT COUNT(*)::int AS count FROM users')) {
    return [{ count: memoryStore.users.length }];
  }

  // Impact / stats (Objective Year 1 metrics aligned with docx)
  if (sql.includes('SELECT COUNT(*)::int AS count FROM experiences')) {
    return [{ count: memoryStore.experiences.length }];
  }
  if (sql.includes('SELECT COALESCE(SUM(totalPrice),0) AS total FROM bookings') || sql.includes('SELECT COALESCE(SUM(totalPrice), 0) AS total FROM bookings')) {
    const total = memoryStore.bookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
    return [{ total }];
  }
  if (sql.includes('SELECT COUNT(*)::int AS count FROM bookings')) {
    return [{ count: memoryStore.bookings.length }];
  }

  // Applications
  if (sql.includes('SELECT * FROM ambassador_applications ORDER BY createdAt DESC')) {
    return [...memoryStore.ambassador_applications].reverse();
  }
  if (sql.includes("SELECT COUNT(*)::int AS count FROM ambassador_applications WHERE status = 'pending'")) {
    const count = memoryStore.ambassador_applications.filter((a) => a.status === 'pending').length;
    return [{ count }];
  }
  if (sql.includes('INSERT INTO ambassador_applications')) {
    const app = {
      id: memoryStore.nextAppId++,
      name: params[0],
      phone: params[1] || '0988000111',
      school: params[2],
      region: params[3],
      introLink: params[4] || '',
      ethicsAgreed: true,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    memoryStore.ambassador_applications.push(app);
    return [app];
  }

  // Bookings
  if (sql.includes('INSERT INTO bookings')) {
    const expId = Number(params[0]);
    const userId = Number(params[1]);
    const bDate = params[2];
    const guests = Number(params[3]);
    const exp = memoryStore.experiences.find((e) => e.id === expId);
    const unitPrice = exp ? exp.price : 850000;
    const split = calculateRevenueSplit(unitPrice, guests);

    const b = {
      id: memoryStore.nextBookingId++,
      bookingCode: `HL-BK0${memoryStore.nextBookingId - 1}`,
      experienceId: expId,
      userId: userId,
      bookingDate: bDate,
      guests: guests,
      pricePerGuest: unitPrice,
      totalPrice: split.gmv,
      gmv: split.gmv,
      hostRevenue: split.hostRevenue,
      ambassadorCommission: split.ambassadorCommission,
      paymentFee: split.paymentFee,
      netPlatformRevenue: split.netPlatformRevenue,
      status: 'confirmed',
      paymentStatus: 'paid',
      qrCode: `HL-CHK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      checkedInAt: null,
      hasReviewed: false,
      createdAt: new Date().toISOString()
    };
    memoryStore.bookings.push(b);
    return [b];
  }

  if (sql.includes('FROM bookings b') && sql.includes('WHERE b.userId = $1')) {
    const userId = Number(params[0]);
    return memoryStore.bookings
      .filter((b) => b.userId === userId)
      .map((b) => {
        const exp = memoryStore.experiences.find((e) => e.id === b.experienceId);
        return {
          ...b,
          experienceTitle: exp ? exp.title : 'Trải nghiệm di sản',
          location: exp ? exp.location : 'Việt Nam',
          imageClass: exp ? exp.imageClass : 'images/gom-bacninh.jpg'
        };
      })
      .reverse();
  }

  if (sql.includes('FROM bookings b') && sql.includes('JOIN users u')) {
    return memoryStore.bookings
      .map((b) => {
        const exp = memoryStore.experiences.find((e) => e.id === b.experienceId);
        const usr = memoryStore.users.find((u) => u.id === b.userId);
        return {
          ...b,
          experienceTitle: exp ? exp.title : 'Trải nghiệm di sản',
          userName: usr ? usr.name : 'Du khách',
          userPhone: usr ? usr.phone : 'Chưa cập nhật'
        };
      })
      .slice(0, 15);
  }

  return [];
}

// Currency formatting utility
function formatPrice(price) {
  if (!price && price !== 0) return 'Liên hệ để biết chi tiết';
  return `${Number(price).toLocaleString('vi-VN')}đ`;
}

// Living Heritage Profiles (Hồ sơ Di sản sống)
const seedHeritageProfiles = [
  {
    slug: 'gom-phu-lang',
    title: 'Gốm Phù Lãng – Nghệ thuật men da lươn 700 năm bên bờ sông Cầu',
    location: 'Xã Phù Lãng, Thị xã Quế Võ, Tỉnh Bắc Ninh',
    category: 'craft',
    categoryName: 'Làng nghề thủ công',
    coverImage: 'images/gom-bacninh.jpg',
    ambassadorName: 'Lê Minh Anh',
    ambassadorSchool: 'ĐH Khoa học Xã hội & Nhân văn',
    consentGranted: 'Đã có biên bản thỏa thuận & ủy quyền truyền thông văn hóa từ Hội đồng Nghệ nhân Phù Lãng.',
    verifiedDate: '10/10/2026',
    history: 'Khởi nguồn từ thế kỷ 13 thời nhà Trần do quan Trạng Hứa Vĩnh Kiều truyền dạy, làng gốm Phù Lãng nằm nép mình bên dòng sông Cầu êm ả. Trải qua hơn 700 năm thăng trầm, đây là một trong ba dòng gốm cổ xưa bậc nhất miền Bắc còn giữ lửa nghề thủ công không pha lẫn.',
    processSteps: [
      { step: '1. Khai thác & luyện đất', desc: 'Sử dụng đất sét vàng đỏ phù sa sông Cầu phơi nỏ, đập vụn, ngâm bể và dùng chân xéo nhào nhuyễn đến độ quánh dẻo tuyệt đối.' },
      { step: '2. Chuốt mộc trên bàn xoay', desc: 'Nghệ nhân dùng đôi bàn tay trần và chân đạp bàn xoay tròn đều, tạo dáng chum, vò, lọ, chậu độc bản.' },
      { step: '3. Chế biến men da lươn bí truyền', desc: 'Men được làm hoàn toàn từ tro trấu, tro củi rừng và bùn phù sa sông Cầu nghiền mịn, không dùng bất kỳ hóa chất công nghiệp nào.' },
      { step: '4. Nung lửa củi rơm 3 ngày 3 đêm', desc: 'Sản phẩm được xếp vào lò bầu hoặc lò cóc, canh lửa củi rơm liên tục ở nhiệt độ 1.200°C tạo nên lớp men da lươn óng màu cánh gián tự nhiên.' }
    ],
    culturalValues: 'Phù Lãng không chỉ tạo ra vật dụng hàng ngày mà lưu giữ cả triết lý sống hòa hợp giữa con người với đất, nước và lửa. Từng vân men khói là bản hòa ca bất tận của đất mẹ Bắc Bộ.',
    artisan: {
      name: 'Bác Phạm Văn Nam',
      role: 'Chủ cơ sở gốm Nam Phù Lãng • 42 năm giữ nghề',
      quote: 'Gốm Phù Lãng không bóng bẩy tráng lệ, nó mang màu đất nâu ấm và khói rơm của làng quê Việt Nam.',
      image: 'images/person_2.jpg'
    },
    relatedExperienceId: 1
  },
  {
    slug: 'lo-lo-chai',
    title: 'Không gian sống & Văn hóa truyền thống Lô Lô Chải – Đồng Văn',
    location: 'Xã Lũng Cú, Huyện Đồng Văn, Hà Giang',
    category: 'culture',
    categoryName: 'Tour văn hóa & Lưu trú',
    coverImage: 'images/hagiang.jpg',
    ambassadorName: 'Lê Minh Anh',
    ambassadorSchool: 'ĐH Khoa học Xã hội & Nhân văn',
    consentGranted: 'Đồng thuận từ Già bản và Chi hội Homestay Lô Lô Chải.',
    verifiedDate: '08/10/2026',
    history: 'Nằm nép mình dưới chân núi Rồng và cột cờ Lũng Cú linh thiêng, làng Lô Lô Chải là nơi lưu giữ gần như nguyên vẹn kiến trúc nhà trình tường mái ngói âm dương cùng nếp sinh hoạt cổ xưa của đồng bào H\'Mông và người Lô Lô đen.',
    processSteps: [
      { step: '1. Nghệ thuật làm nhà trình tường', desc: 'Đất sét đỏ được giã nện từng lớp bằng chày gỗ tạo nên bờ tường dày 50 - 60cm vững chãi qua hàng trăm năm mưa tuyết cao nguyên.' },
      { step: '2. Xếp hàng rào đá không vữa', desc: 'Người đàn ông Mông nhặt từng viên đá tai mèo xếp khít khao che chắn gió rét cho ngôi nhà.' },
      { step: '3. Se lanh dệt vải nhuộm chàm', desc: 'Quy trình dệt thủ công kỳ công 41 công đoạn từ bóc vỏ lanh, luộc tro, dệt khung cửi đến vẽ sáp ong và ngâm chàm rừng.' },
      { step: '4. Diễn xướng tiếng khèn và sử thi', desc: 'Tiếng khèn Mông cất lên bên bếp lửa bập bùng gọi bạn tình và kể chuyện cội nguồn tổ tiên.' }
    ],
    culturalValues: 'Không gian sống kiên cường nơi rẻo cao, tình nghĩa xóm bản và sự trân trọng tuyệt đối với thiên nhiên đá xám.',
    artisan: {
      name: 'Trưởng bản Vàng A Sình',
      role: 'Trưởng ban Văn hóa thôn Lô Lô Chải • 35 năm gắn bó',
      quote: 'Cửa nhà người Mông luôn mở rộng đón khách quý, chỉ mong mọi người hiểu và yêu quý nếp sống mộc mạc của chúng tôi.',
      image: 'images/person_3.jpg'
    },
    relatedExperienceId: 2
  },
  {
    slug: 'theu-khoai-chau',
    title: 'Thêu tay nghệ thuật Khoái Châu – Từng đường kim lưu giữ hồn cốt',
    location: 'Huyện Khoái Châu, Tỉnh Hưng Yên',
    category: 'craft',
    categoryName: 'Làng nghề thủ công',
    coverImage: 'images/theu-hungyen.jpg',
    ambassadorName: 'Quốc Bình',
    ambassadorSchool: 'ĐH Mỹ thuật Công nghiệp',
    consentGranted: 'Đã nhận được sự ủy quyền của Nghệ nhân Nguyễn Thị Lan và HTX Thêu Khoái Châu.',
    verifiedDate: '11/10/2026',
    history: 'Vùng đất bãi bồi sông Hồng Hưng Yên nổi tiếng với nghề thêu tay truyền thống từng phục vụ hoàng gia triều đình xưa. Từng đóa sen, cánh hạc hay chân dung được khắc họa sống động từ những sợi chỉ tơ mỏng mảnh.',
    processSteps: [
      { step: '1. Phác thảo họa tiết trên lụa', desc: 'Nghệ nhân dùng bút chì mộc vẽ nét chính xác trên nền vải lụa tơ tằm căng chặt trên khung thêu gỗ lim.' },
      { step: '2. Tách sợi chỉ tơ óng ả', desc: 'Sợi chỉ tơ tằm được xé mảnh chỉ bằng 1/4 sợi tóc để thêu những chi tiết chuyển màu tinh vi nhất.' },
      { step: '3. Kỹ thuật thêu cung đình', desc: 'Kết hợp các mũi thêu châm, thêu luồn, thêu vặn, thêu phủ tỉ mỉ đến từng mi li mét.' },
      { step: '4. Hoàn thiện và bảo quản', desc: 'Kiểm tra đường chỉ mặt sau, là ủi phẳng phiu bằng nhiệt tự nhiên và đóng khung kính kín.' }
    ],
    culturalValues: 'Sự kiên nhẫn tột bực, tình yêu với cái đẹp thanh khiết và phẩm chất tỉ mỉ của người phụ nữ đồng bằng Bắc Bộ.',
    artisan: {
      name: 'Nghệ nhân Nguyễn Thị Lan',
      role: 'Nghệ nhân thêu ren cung đình • 38 năm gìn giữ nghề',
      quote: 'Một mũi kim lệch là hỏng cả tấm áo. Nghề thêu dạy con người ta sự kiên nhẫn, bình tâm và trân quý từng nét chỉ.',
      image: 'images/person_1.jpg'
    },
    relatedExperienceId: 3
  },
  {
    slug: 'am-thuc-hoa-vang',
    title: 'Mâm cơm đồng quê Hòa Vang – Triết lý ngũ hành ẩm thực xứ Quảng',
    location: 'Xã Hòa Nhơn, Huyện Hòa Vang, TP. Đà Nẵng',
    category: 'food',
    categoryName: 'Ẩm thực địa phương',
    coverImage: 'images/amthuc-danang.jpg',
    ambassadorName: 'Lan Anh',
    ambassadorSchool: 'ĐH Sư phạm Đà Nẵng',
    consentGranted: 'Đồng ý chia sẻ từ các hộ dân làm vườn sinh thái Hòa Vang.',
    verifiedDate: '09/10/2026',
    history: 'Hòa Vang là vành đai xanh cổ kính của Đà Nẵng, nơi lưu giữ tinh túy mâm cơm gia đình miền Trung từ thế kỷ 16: cá bống kho tiêu, canh rau tập tàng, mắm nêm cá cơm và bánh xèo vỏ giòn rụm.',
    processSteps: [
      { step: '1. Thu hái đọt rau vườn nhà', desc: 'Sáng sớm dạo quanh vườn rau hữu cơ hái đọt mồng tơi, lá tía tô, ngò gai còn đẫm sương đêm.' },
      { step: '2. Giã mắm cối đá thủ công', desc: 'Giã ớt tỏi Lý Sơn, thơm trái băm nhỏ hòa quyện mắm nêm nguyên chất đượm đà vị biển.' },
      { step: '3. Nấu bếp củi om cá lóc', desc: 'Kho cá trong niêu đất với nước hàng thắng đường mía trên bếp củi đỏ lửa liu riu.' },
      { step: '4. Quây quần bên hiên nhà gỗ', desc: 'Bày mâm cơm trên mâm đồng, mời người lớn tuổi và nghe chuyện thời mở đất phương Nam.' }
    ],
    culturalValues: 'Đạo hiếu, sự sẻ chia trong mâm cơm gia đình và tinh thần hiếu khách chân chất của người dân xứ Quảng.',
    artisan: {
      name: 'Mẹ Bảy Hòa Vang',
      role: 'Đại diện hộ gia đình ẩm thực nhà vườn • 45 năm gắn bó',
      quote: 'Nấu ăn cho khách cũng như nấu cho con cháu đi xa về. Từng hạt muối, củ gừng đều phải thật lòng, đượm tình.',
      image: 'images/person_4.jpg'
    },
    relatedExperienceId: 4
  },
  {
    slug: 'co-do-hoa-lu',
    title: 'Cố Đô Hoa Lư & Sông nước Tràng An – Huyền sử ngàn năm Đinh Lê',
    location: 'Huyện Hoa Lư, Tỉnh Ninh Bình',
    category: 'culture',
    categoryName: 'Tour văn hóa & Di tích',
    coverImage: 'images/ninhbinh.jpg',
    ambassadorName: 'Lê Minh Anh',
    ambassadorSchool: 'ĐH Khoa học Xã hội & Nhân văn',
    consentGranted: 'Phối hợp cùng Ban Quản lý Di tích Cố đô và Nghiệp đoàn Lái đò Tràng An.',
    verifiedDate: '12/10/2026',
    history: 'Kinh đô đầu tiên của nước Đại Cồ Việt thế kỷ thứ 10, nơi ghi dấu ấn oanh liệt của vua Đinh Tiên Hoàng và vua Lê Đại Hành, bao bọc bởi địa hình núi đá vôi tự nhiên trùng điệp.',
    processSteps: [
      { step: '1. Dâng hương Đền Vua Đinh - Vua Lê', desc: 'Tìm hiểu kiến trúc sập rồng đá nghìn năm và nghệ thuật chạm khắc gỗ cổ truyền.' },
      { step: '2. Chèo thuyền sông Sào Khê', desc: 'Lướt nhẹ trên dòng sông ngọc, nghe tiếng khua mái chèo gỗ của cô lái đò địa phương.' },
      { step: '3. Luồn lách hang động karst', desc: 'Khám phá vòm hang tự nhiên với thạch nhũ lung linh và dấu tích tiền sử.' },
      { step: '4. Đàm đạo huyền sử định quốc', desc: 'Lắng nghe những truyền tích dẹp loạn 12 sứ quân và tầm nhìn dời đô về Thăng Long.' }
    ],
    culturalValues: 'Ý chí độc lập tự chủ, niềm tự hào dân tộc và sự tri ân tiền nhân dựng nước.',
    artisan: {
      name: 'Bác Nguyễn Văn Thắng',
      role: 'Hội viên Hội Di sản Cố Đô • 28 năm hướng dẫn văn hóa',
      quote: 'Mỗi khúc sông, ngọn núi ở đây đều mang trong mình một bài học dựng nước và tình yêu non sông của cha ông.',
      image: 'images/person_2.jpg'
    },
    relatedExperienceId: 5
  },
  {
    slug: 'den-long-hoi-an',
    title: 'Làm đèn lồng lụa Hội An – Thắp sáng không gian phố cổ',
    location: 'Phường Minh An, TP. Hội An, Tỉnh Quảng Nam',
    category: 'craft',
    categoryName: 'Làng nghề thủ công',
    coverImage: 'images/hoian.jpg',
    ambassadorName: 'Quốc Bình',
    ambassadorSchool: 'ĐH Mỹ thuật Công nghiệp',
    consentGranted: 'Sự đồng thuận từ Nghệ nhân Huỳnh Văn Ba và Làng nghề đèn lồng Hội An.',
    verifiedDate: '11/10/2026',
    history: 'Đèn lồng xuất hiện tại đô thị cổ Hội An từ thế kỷ 16 do các thương nhân Hoa kiều và Nhật kiều mang đến, sau đó được các nghệ nhân bản địa sáng tạo và Việt hóa với nan tre già và lụa tơ tằm xứ Quảng.',
    processSteps: [
      { step: '1. Vót nan tre già dẻo dai', desc: 'Tre phải ngâm nước muối đủ 10 ngày để chống mối mọt rồi vót đều tay từng nan một.' },
      { step: '2. Tạo khung đèn đa dạng', desc: 'Gắn các nan tre vào vòng gỗ tạo hình quả trám, củ tỏi, hình đĩa bay độc đáo.' },
      { step: '3. Căng dán lụa tơ tằm', desc: 'Cắt dán vải lụa Hà Đông nhiều màu sắc, khéo léo miết từng đường keo không để nếp nhăn.' },
      { step: '4. Gắn tua rua & chui đèn', desc: 'Gắn tua chỉ mềm mại rủ xuống đáy đèn và hoàn thiện móc treo đồng mộc.' }
    ],
    culturalValues: 'Ánh sáng của tình người phố cổ, biểu tượng của sự may mắn, bình an và tinh thần giao thoa văn hóa quốc tế.',
    artisan: {
      name: 'Nghệ nhân Huỳnh Văn Ba',
      role: 'Bậc thầy chế tác đèn lồng lụa • 40 năm kinh nghiệm',
      quote: 'Ánh sáng của chiếc đèn lồng lụa Hội An không chói lóa, nó ấm áp và đượm tình người phố cổ.',
      image: 'images/person_3.jpg'
    },
    relatedExperienceId: 6
  }
];

// Attach heritage profiles to memory store
memoryStore.heritage_profiles = seedHeritageProfiles;
memoryStore.community_inquiries = [];

const db = {
  query: async (text, params = []) => {
    if (useFallback) {
      return queryMemory(text, params);
    }
    try {
      const result = await pool.query(text, params);
      return result.rows;
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to memory store:', err.message);
      return queryMemory(text, params);
    }
  },
  queryOne: async (text, params = []) => {
    if (useFallback) {
      const rows = queryMemory(text, params);
      return rows[0] || null;
    }
    try {
      const result = await pool.query(text, params);
      return result.rows[0] || null;
    } catch (err) {
      console.warn('PostgreSQL queryOne error, falling back to memory store:', err.message);
      const rows = queryMemory(text, params);
      return rows[0] || null;
    }
  }
};

let initialized = false;

const initializeDb = async () => {
  if (initialized) return;

  if (useFallback) {
    console.log('HeritageLink: Using in-memory data store with 4 Roles & Revenue Split (85/5/2/8).');
    initialized = true;
    return;
  }

  try {
    const client = await pool.connect();
    client.release();
    console.log('HeritageLink: Connected to PostgreSQL.');
  } catch (error) {
    console.warn('PostgreSQL connection failed, activating fallback in-memory store:', error.message);
    useFallback = true;
  }

  initialized = true;
};

module.exports = {
  db,
  initializeDb,
  memoryStore,
  calculateRevenueSplit,
  formatPrice,
  seedExperiences,
  seedHeritageProfiles
};
