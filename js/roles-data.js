/**
 * HeritageLink — Shared Roles & Revenue Split Data Engine
 * Centralized data source for Community, Ambassadors, Homepage Tri-Role, and Detail Experience Actors.
 * Adheres strictly to the project specification (85% Host, 5% Ambassador, 2% Payment, 8% Platform).
 */

// 1. Tỷ lệ chia doanh thu chuẩn cố định của dự án
const REVENUE_SPLIT = {
  host: 0.85,        // 85% Hộ dân / Nghệ nhân
  ambassador: 0.05,  // 5% Đại sứ Di sản (sinh viên)
  payment: 0.02,     // 2% Cổng thanh toán trực tuyến
  platform: 0.08     // 8% Nền tảng HeritageLink duy trì & phát triển
};

// Định dạng tiền tệ kiểu Việt Nam (VD: 850.000đ)
function formatVND(amount) {
  return Math.round(Number(amount) || 0).toLocaleString('vi-VN') + 'đ';
}

// Hàm tính toán phân bổ doanh thu tự động từ giá trải nghiệm
function calculateRevenueSplit(price) {
  const numericPrice = Number(price) || 0;
  return {
    price: numericPrice,
    formattedPrice: formatVND(numericPrice),
    host: Math.round(numericPrice * REVENUE_SPLIT.host),
    formattedHost: formatVND(numericPrice * REVENUE_SPLIT.host),
    ambassador: Math.round(numericPrice * REVENUE_SPLIT.ambassador),
    formattedAmbassador: formatVND(numericPrice * REVENUE_SPLIT.ambassador),
    payment: Math.round(numericPrice * REVENUE_SPLIT.payment),
    formattedPayment: formatVND(numericPrice * REVENUE_SPLIT.payment),
    platform: Math.round(numericPrice * REVENUE_SPLIT.platform),
    formattedPlatform: formatVND(numericPrice * REVENUE_SPLIT.platform)
  };
}

// 2. Dữ liệu dành cho Trang Cộng đồng bản địa & Nghệ nhân (community.html)
const COMMUNITY_DATA = {
  hero: {
    title: "Bạn giữ nghề – chúng tôi đưa khách đến",
    subtitle: "Không cần biết dùng mạng xã hội, không cần tự quảng cáo. Bạn chỉ cần đồng ý cho Đại sứ ghi hình và đón khách."
  },
  targetGroups: [
    {
      id: "artisan",
      icon: "icon-user",
      badge: "Nghệ nhân",
      title: "Nghệ nhân làm nghề",
      desc: "Những bậc thầy gìn giữ kỹ nghệ thủ công, hoa văn và tinh hoa làng nghề truyền thống qua nhiều thế hệ."
    },
    {
      id: "household",
      icon: "icon-home",
      badge: "Hộ gia đình",
      title: "Hộ dân làm nghề",
      desc: "Các gia đình đang trực tiếp sản xuất thủ công, nông sản truyền thống hoặc canh tác bản địa đặc sắc."
    },
    {
      id: "ritual",
      icon: "icon-compass",
      badge: "Văn hóa tâm linh",
      title: "Người thực hành nghi lễ",
      desc: "Người nắm giữ các phong tục tập quán, lời then, điệu xòe, tiếng khèn và lễ hội truyền thống thiêng liêng."
    },
    {
      id: "cuisine",
      icon: "icon-heart",
      badge: "Ẩm thực",
      title: "Hộ giữ món ăn gia truyền",
      desc: "Gia đình lưu giữ công thức món ăn cổ truyền, cách chế biến nguyên bản mang đậm hồn cốt ẩm thực địa phương."
    },
    {
      id: "village",
      icon: "icon-map-marker",
      badge: "Không gian",
      title: "Làng nghề truyền thống",
      desc: "Cộng đồng làng nghề, hợp tác xã văn hóa mong muốn đón khách tham quan trải nghiệm văn minh, tôn trọng bản sắc."
    }
  ],
  fourSteps: [
    {
      step: 1,
      title: "Đồng ý tham gia",
      desc: "Đồng ý cho Đại sứ ghi hình, phỏng vấn và cung cấp số điện thoại/Zalo. Chỉ vậy là đủ để đăng ký."
    },
    {
      step: 2,
      title: "Cùng Đại sứ chuẩn bị trải nghiệm",
      desc: "Kể câu chuyện về nghề, chỉ ra phần nào khách được tự tay làm, phần nào khách chỉ nên đứng xem."
    },
    {
      step: 3,
      title: "Xác nhận lịch đón khách",
      desc: "Nhận tin báo khách đặt qua Zalo hoặc tin nhắn SMS, xác nhận trực tiếp hoặc qua Đại sứ phụ trách."
    },
    {
      step: 4,
      title: "Đón khách và hướng dẫn",
      desc: "Cung cấp trải nghiệm đúng như đã mô tả, đảm bảo chất lượng và an toàn cho khách. Khách check-in bằng mã QR tại điểm đến."
    }
  ],
  notNeeded: [
    "Không phải tự đăng bài hay quản lý trang web.",
    "Không phải tự quay phim, chụp ảnh, viết giới thiệu.",
    "Không phải học cách dùng ứng dụng phức tạp.",
    "Không phải bỏ tiền quảng cáo."
  ],
  notNeededConclusion: "Đại sứ Di sản và HeritageLink làm thay bạn.",
  commitments: [
    "Cung cấp trải nghiệm đúng nội dung, thời lượng và giá đã thống nhất.",
    "Chịu trách nhiệm về chất lượng dịch vụ và an toàn của khách, vì HeritageLink hoạt động với tư cách sàn trung gian.",
    "Thông báo sớm cho Đại sứ khi cần đổi lịch hoặc tạm ngừng đón khách.",
    "Tham gia đánh giá hai chiều: khách đánh giá trải nghiệm, cộng đồng cũng phản hồi về khách và Đại sứ."
  ],
  faqs: [
    {
      question: "Tôi có mất phí gì không?",
      answer: "Hoàn toàn không. Bạn không phải trả bất kỳ khoản phí nào: không phí tham gia, không phí chụp ảnh quay phim, không phí đăng bài quảng bá. HeritageLink chỉ giữ 8% chi phí vận hành khi có khách thực tế đặt và trải nghiệm thành công."
    },
    {
      question: "Tiền khách trả về tay tôi khi nào, bằng cách nào?",
      answer: "Tiền được chuyển khoản trực tiếp vào tài khoản ngân hàng của bạn (hoặc người thân do bạn chỉ định, hoặc nhận tiền mặt qua Đại sứ phụ trách) ngay sau khi buổi trải nghiệm kết thúc và khách check-in thành công. Bạn luôn biết rõ số tiền thực nhận trước mỗi buổi đón khách."
    },
    {
      question: "Nếu tôi bận, không đón khách được thì sao?",
      answer: "Bạn hoàn toàn làm chủ thời gian. Khi bận việc riêng, gia đình có giỗ chạp, mùa màng bận rộn hay lý do sức khỏe, bạn chỉ cần gọi điện hoặc nhắn tin cho Đại sứ phụ trách để tạm đóng lịch nhận khách trên trang web."
    },
    {
      question: "Phần thờ cúng, nghi lễ trong nhà tôi có bị quay lên mạng không?",
      answer: "Tuyệt đối không khi bạn chưa đồng ý. Đại sứ chỉ ghi hình những nội dung bạn cho phép. Các khu vực thờ tự thiêng liêng, bí quyết gia truyền hay nghi lễ tâm linh sẽ chỉ để khách đứng ngoài chiêm bái hoặc hoàn toàn không đưa vào trải nghiệm, tùy theo mong muốn của bạn."
    },
    {
      question: "Tôi không biết dùng điện thoại thông minh thì có tham gia được không?",
      answer: "Bạn hoàn toàn tham gia được bình thường! Bạn chỉ cần có một chiếc điện thoại nghe gọi cơ bản để nhận cuộc gọi hoặc tin nhắn SMS báo lịch. Bạn Đại sứ sinh viên phụ trách địa bàn sẽ là người đồng hành hỗ trợ mọi khâu công nghệ thay bạn."
    }
  ]
};

// 3. Dữ liệu dành cho Trang Đại sứ Di sản (ambassadors.html)
const AMBASSADOR_DATA = {
  definition: {
    who: "Đại sứ là ai?",
    description: "Sinh viên các trường đại học, cao đẳng, ưu tiên người đang học tập hoặc sinh sống tại địa phương có làng nghề, di sản hoặc trải nghiệm văn hóa đặc trưng. Được tuyển qua kênh Đoàn Thanh niên – Hội Sinh viên, có tổ chức Đoàn/Hội xác nhận để tăng độ tin cậy khi làm việc với hộ dân. Đại sứ không phải khách trả phí, mà là lực lượng nòng cốt tạo ra nguồn cung nội dung cho nền tảng."
  },
  journeySteps: [
    { step: 1, title: "Đăng ký trực tuyến", desc: "Điền form xét tuyển tại ambassador-apply.html.", icon: "icon-pencil" },
    { step: 2, title: "Tuyển chọn", desc: "HeritageLink xét duyệt hồ sơ, ưu tiên sinh viên am hiểu văn hóa và địa bàn địa phương.", icon: "icon-check-square-o" },
    { step: 3, title: "Nhận bộ hướng dẫn & template trực tuyến", desc: "Cách giới thiệu địa điểm, cách phỏng vấn nghệ nhân/hộ dân, thông tin cần thu thập, yêu cầu về ảnh/video và nguyên tắc kể chuyện di sản. Học trực tuyến, không cần đào tạo tập trung.", icon: "icon-book" },
    { step: 4, title: "Tìm điểm di sản", desc: "Chủ động tìm làng nghề, hộ dân, nghệ nhân hoặc trải nghiệm tiềm năng tại địa phương quê hương.", icon: "icon-compass" },
    { step: 5, title: "Xin đồng ý của cộng đồng", desc: "Giải thích mô hình hỗ trợ, xin đồng thuận ghi hình/phỏng vấn và lưu số điện thoại/Zalo liên lạc.", icon: "icon-handshake-o" },
    { step: 6, title: "Thiết kế kịch bản trải nghiệm 4 lớp", desc: "Cùng nghệ nhân xác định cụ thể 4 lớp: Quan sát – Chạm – Tự làm – Nghe chuyện.", icon: "icon-layers" },
    { step: 7, title: "Ghi hình, chụp ảnh, phỏng vấn", desc: "Tác nghiệp bằng điện thoại thông minh theo đúng bộ khung template hướng dẫn.", icon: "icon-camera" },
    { step: 8, title: "Gửi kiểm duyệt", desc: "Nộp Hồ sơ Di sản lên nền tảng và chỉnh sửa hoàn thiện theo góp ý của Hội đồng thẩm định.", icon: "icon-send" },
    { step: 9, title: "Đăng tải và hỗ trợ vận hành", desc: "Khi trải nghiệm lên sóng, hỗ trợ xác nhận lịch đón khách, truyền đạt thông tin cho hộ dân và làm đầu mối tại chỗ khi cần.", icon: "icon-globe" },
    { step: 10, title: "Nhận hoa hồng và chứng nhận", desc: "Hưởng 5% giá trị mỗi booking phát sinh từ nội dung mình tạo ra, được ghi nhận vào Chứng nhận Đại sứ Di sản.", icon: "icon-star" }
  ],
  scriptLayers: [
    {
      layer: "Quan sát",
      tag: "Lớp 1",
      title: "Công đoạn khách chỉ nên quan sát",
      desc: "Xác định rõ những khâu đòi hỏi tay nghề cao, dễ gây nguy hiểm (canh lò lửa, nấu men) hoặc mang tính thiêng liêng (phần lõi của nghi lễ tín ngưỡng).",
      icon: "icon-eye"
    },
    {
      layer: "Chạm",
      tag: "Lớp 2",
      title: "Chạm & Cảm nhận trực quan",
      desc: "Giúp du khách sờ tận tay chất liệu thô mộc: đất sét dẻo, thớ gỗ ngàn năm, sợi tơ tằm óng ả hay mùi thơm rơm rạ của men làng.",
      icon: "icon-hand-stop-o"
    },
    {
      layer: "Tự làm",
      tag: "Lớp 3",
      title: "Công đoạn khách được tự tay làm",
      desc: "Chọn công đoạn an toàn, vừa sức và có ý nghĩa: nặn chi tiết gốm đơn giản, tập động tác múa dân gian, gói một phần chiếc bánh truyền thống để có sản phẩm mang về.",
      icon: "icon-cog"
    },
    {
      layer: "Nghe chuyện",
      tag: "Lớp 4",
      title: "Lồng ghép câu chuyện nền",
      desc: "Gợi mở lịch sử, ý nghĩa văn hóa và tâm sự đời người thực hành nghề để trải nghiệm chạm tới chiều sâu cảm xúc của du khách.",
      icon: "icon-commenting-o"
    }
  ],
  skills: [
    {
      id: 1,
      title: "Kỹ năng Phỏng vấn",
      desc: "Khai thác câu chuyện cốt lõi, tâm tư đời nghề của nghệ nhân thay vì chỉ hỏi những thông tin bề mặt.",
      icon: "icon-microphone"
    },
    {
      id: 2,
      title: "Quay dựng bằng điện thoại",
      desc: "Làm chủ ánh sáng, bố cục khung hình, thu âm rõ nét và biên tập video ngắn bằng smartphone theo chuẩn.",
      icon: "icon-mobile"
    },
    {
      id: 3,
      title: "Kể chuyện (Storytelling)",
      desc: "Truyền tải giá trị và hồn cốt văn hóa sâu sắc, biến quy trình kỹ thuật khô khan thành mạch truyện giàu cảm xúc.",
      icon: "icon-pencil"
    },
    {
      id: 4,
      title: "Đạo đức tiếp cận cộng đồng",
      desc: "Tôn trọng tối đa ranh giới văn hóa, đặc biệt với không gian thờ tự, nghi lễ tín ngưỡng và ẩm thực gia truyền.",
      icon: "icon-heart"
    }
  ],
  checklist: [
    "Tên trải nghiệm, phân loại (Làng nghề / Ẩm thực / Tour văn hóa – di tích / Sản phẩm thủ công), địa điểm chi tiết.",
    "Câu chuyện văn hóa: lịch sử làng nghề, ý nghĩa biểu tượng, câu chuyện cuộc đời người thực hành nghề.",
    "Hồ sơ nghệ nhân/hộ dân: họ tên, số năm giữ nghề tâm huyết, lời kể ngắn xúc động.",
    "Kịch bản 4 lớp rõ ràng: Quan sát – Chạm – Tự làm – Nghe chuyện (chỉ rõ phần nào chỉ được quan sát).",
    "Bộ ảnh chất lượng cao và video ngắn theo đúng yêu cầu kỹ thuật của template.",
    "Thông tin thực tế: thời lượng, số khách tối đa, giá đề xuất, khung giờ đón, điểm hẹn, trang phục và lưu ý văn hóa.",
    "Xác nhận bằng văn bản/ghi âm đã có sự đồng ý của nghệ nhân/hộ dân kèm số điện thoại/Zalo liên lạc."
  ],
  ethics: [
    "Chỉ ghi hình và đăng tải khi đã có sự đồng ý rõ ràng của nghệ nhân và hộ dân.",
    "Phản ánh trung thực bản chất văn hóa, tuyệt đối không thêm thắt hay 'sân khấu hóa' làm sai lệch nét đẹp nguyên bản.",
    "Tôn trọng không gian riêng tư, nơi thờ tự và phần thiêng liêng của nghi lễ. Tuyệt đối không đưa phần này vào hoạt động khách tự làm.",
    "Không thương mại hóa di sản bất chấp để chạy theo số lượng đặt chỗ, đặc biệt với những di sản đang đứng trước nguy cơ mai một.",
    "Truyền đạt minh bạch, trung thực cho hộ dân về giá bán, tỷ lệ chia sẻ doanh thu và lịch đón tiếp khách.",
    "Đặt chất lượng, chiều sâu nội dung và sự an tâm của cộng đồng lên trên số lượng hồ sơ nộp lên."
  ],
  evaluation: {
    metrics: [
      { num: "01", name: "Số nội dung tạo ra", desc: "Số lượng hồ sơ di sản được số hóa hoàn chỉnh đạt chuẩn." },
      { num: "02", name: "Chất lượng trải nghiệm", desc: "Mức độ hài lòng và đánh giá thực tế của du khách sau khi check-in." },
      { num: "03", name: "Số booking phát sinh", desc: "Lượt đặt chỗ thực tế phát sinh từ chính nội dung Đại sứ biên soạn." }
    ],
    criteria: [
      { name: "Tính xác thực", desc: "Nội dung phản ánh đúng bản chất văn hóa và đời sống người dân, không phóng đại." },
      { name: "Chất lượng storytelling", desc: "Mạch chuyện liền mạch, hấp dẫn, truyền tải được rung động và chiều sâu cảm xúc." },
      { name: "Mức độ tương tác thực chất", desc: "Du khách thực sự được nhúng mình vào làm thử, không chỉ dừng ở xem và chụp ảnh." }
    ]
  },
  benefits: [
    {
      title: "Hoa hồng 5% mỗi booking",
      desc: "Hưởng 5% giá trị mỗi giao dịch phát sinh từ nội dung bạn xây dựng. Ví dụ: khách đặt tour 850.000đ thì bạn nhận 42.500đ.",
      icon: "icon-dollar"
    },
    {
      title: "Chứng nhận Đại sứ Di sản",
      desc: "Được cấp giấy chứng nhận chính thức để làm đẹp hồ sơ năng lực (CV/Portfolio) và ứng tuyển học bổng, việc làm.",
      icon: "icon-certificate"
    },
    {
      title: "Bộ kỹ năng thực chiến",
      desc: "Được rèn luyện toàn diện về nghiên cứu điền dã, phỏng vấn, quay dựng smartphone và đạo đức truyền thông văn hóa.",
      icon: "icon-graduation-cap"
    },
    {
      title: "Trang theo dõi cá nhân",
      desc: "Theo dõi trực tiếp lượt xem, số lượt đặt, tổng hoa hồng tích lũy và thành tích thăng hạng trong mạng lưới.",
      icon: "icon-dashboard"
    }
  ]
};

// 4. Dữ liệu khối "Ba bên – Ba vai trò" cho Trang chủ (index.html)
const TRI_ROLE_DATA = {
  title: "Ba bên – Ba vai trò cùng gìn giữ di sản",
  subtitle: "Mô hình hợp tác tam giác bền vững: Du khách trải nghiệm sâu – Đại sứ kết nối số hóa – Cộng đồng giữ hồn cốt.",
  columns: [
    {
      role: "Du khách",
      badge: "Người trải nghiệm",
      whatTheyDo: "Tìm kiếm, đặt trải nghiệm, đắm mình vào văn hóa 4 lớp, check-in bằng mã QR và đánh giá xác thực.",
      whatTheyGet: "Trải nghiệm văn hóa sống bản địa nguyên bản, Hộ chiếu Di sản số và sự gắn kết với con người Việt Nam.",
      ctaText: "Khám phá trải nghiệm",
      ctaUrl: "explore.html",
      btnClass: "btn-outline-primary"
    },
    {
      role: "Đại sứ Di sản",
      badge: "Người số hóa & Cầu nối",
      whatTheyDo: "Tìm điểm di sản, xin đồng thuận cộng đồng, biên kịch kịch bản 4 lớp, ghi hình tác nghiệp và hỗ trợ đón khách tại chỗ.",
      whatTheyGet: "Hưởng hoa hồng 5% mỗi lượt đặt, Chứng nhận Đại sứ Di sản vào CV, bộ kỹ năng truyền thông thực chiến.",
      ctaText: "Trở thành Đại sứ",
      ctaUrl: "ambassador-apply.html",
      btnClass: "btn-accent"
    },
    {
      role: "Nghệ nhân / Hộ dân",
      badge: "Người giữ hồn cốt",
      whatTheyDo: "Đồng ý tham gia, chỉ dẫn công đoạn khách được làm/xem, xác nhận lịch qua tin nhắn và trực tiếp đón tiếp hướng dẫn khách.",
      whatTheyGet: "Nhận 85% tổng tiền khách trả, được quảng bá miễn phí, bảo mật bí quyết nghề và minh bạch từng lượt đặt.",
      ctaText: "Đăng ký hợp tác",
      ctaUrl: "community.html",
      btnClass: "btn-primary"
    }
  ],
  platformCommitment: "HeritageLink lo phần còn lại: kiểm duyệt nội dung theo 3 tiêu chí, hạ tầng công nghệ, thanh toán an toàn, chia doanh thu tự động và đối soát minh bạch.",
  processFlow: [
    { step: 1, text: "Đại sứ tạo nội dung" },
    { step: 2, text: "Kiểm duyệt 3 tiêu chí" },
    { step: 3, text: "Đăng tải trải nghiệm" },
    { step: 4, text: "Khách đặt chỗ" },
    { step: 5, text: "Trải nghiệm & QR check-in" },
    { step: 6, text: "Đánh giá hai chiều" },
    { step: 7, text: "Chia doanh thu tự động" }
  ]
};

// 5. Dữ liệu động "Ai làm gì trong trải nghiệm này" cho Trang chi tiết (detail.html)
const DETAIL_ROLES_BY_EXP_ID = {
  1: {
    ambassadorName: "Lê Minh Anh",
    ambassadorRole: "đã khảo sát, ghi hình và xây dựng hồ sơ di sản sống này; là đầu mối xác nhận lịch và hỗ trợ bạn tại chỗ.",
    artisanName: "Bác Phạm Văn Nam",
    artisanRole: "trực tiếp hướng dẫn bạn chuốt gốm và chịu trách nhiệm về chất lượng, sự an toàn của buổi trải nghiệm.",
    platformRole: "kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch.",
    badges: ["Đã có sự đồng ý ghi hình của nghệ nhân", "Đã kiểm duyệt: xác thực · storytelling · tương tác"]
  },
  2: {
    ambassadorName: "Lê Minh Anh",
    ambassadorRole: "đã khảo sát thực địa tại Lô Lô Chải, xây dựng kịch bản sống cùng đồng bào; hỗ trợ điều phối lịch lưu trú.",
    artisanName: "Gia đình Vàng A Sình",
    artisanRole: "chủ nhà trực tiếp đón tiếp, hướng dẫn vẽ sáp ong, nướng ngô bên bếp lửa và chuẩn bị không gian nhà trình tường.",
    platformRole: "kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch.",
    badges: ["Đã có sự đồng ý ghi hình của hộ dân", "Đã kiểm duyệt: xác thực · storytelling · tương tác"]
  },
  3: {
    ambassadorName: "Lê Minh Anh",
    ambassadorRole: "đã khảo sát xưởng thêu, ghi hình câu chuyện mũi kim tay thợ; là đầu mối hỗ trợ thông tin trước chuyến đi.",
    artisanName: "Nghệ nhân Nguyễn Thị Thắm",
    artisanRole: "trực tiếp chỉ dẫn kỹ thuật luồn kim se chỉ và đồng hành cùng bạn hoàn thành bức thêu đầu tay mang về.",
    platformRole: "kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch.",
    badges: ["Đã có sự đồng ý ghi hình của nghệ nhân", "Đã kiểm duyệt: xác thực · storytelling · tương tác"]
  },
  8: {
    ambassadorName: "Nguyễn Hoàng Mạnh",
    ambassadorRole: "đã trực tiếp khảo sát thực địa tại làng Vạn Phúc, ghi hình cỗ khung cửi Jacquard gỗ và xây dựng hồ sơ Lụa Vân; là đầu mối kết nối cùng nghệ nhân Mai.",
    artisanName: "Nghệ nhân Nguyễn Thị Mai",
    artisanRole: "nghệ nhân 46 năm nghề trực tiếp hướng dẫn kỹ thuật quay tơ dệt lụa và chịu trách nhiệm về chất lượng, an toàn buổi trải nghiệm.",
    platformRole: "kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch (85% chuyển thẳng nghệ nhân).",
    badges: ["Đã có sự đồng thuận ủy quyền của nghệ nhân Mai", "Đã kiểm duyệt: xác thực · storytelling · tương tác"]
  },
  default: {
    ambassadorName: "Đại sứ Di sản HeritageLink",
    ambassadorRole: "đã khảo sát, ghi hình và xây dựng hồ sơ; là đầu mối xác nhận lịch và hỗ trợ bạn tại chỗ.",
    artisanName: "Nghệ nhân / Người giữ nghề bản địa",
    artisanRole: "trực tiếp hướng dẫn trải nghiệm và chịu trách nhiệm về chất lượng dịch vụ, an toàn của buổi trải nghiệm.",
    platformRole: "kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch.",
    badges: ["Đã có sự đồng ý ghi hình của nghệ nhân", "Đã kiểm duyệt: xác thực · storytelling · tương tác"]
  }
};

// Xuất các biến toàn cục cho cả môi trường script thông thường và module
if (typeof window !== 'undefined') {
  window.REVENUE_SPLIT = REVENUE_SPLIT;
  window.formatVND = formatVND;
  window.calculateRevenueSplit = calculateRevenueSplit;
  window.COMMUNITY_DATA = COMMUNITY_DATA;
  window.AMBASSADOR_DATA = AMBASSADOR_DATA;
  window.TRI_ROLE_DATA = TRI_ROLE_DATA;
  window.DETAIL_ROLES_BY_EXP_ID = DETAIL_ROLES_BY_EXP_ID;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REVENUE_SPLIT,
    formatVND,
    calculateRevenueSplit,
    COMMUNITY_DATA,
    AMBASSADOR_DATA,
    TRI_ROLE_DATA,
    DETAIL_ROLES_BY_EXP_ID
  };
}
