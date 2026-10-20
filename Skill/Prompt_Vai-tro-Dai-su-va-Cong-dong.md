# PROMPT: Bổ sung nội dung "Đại sứ cần làm gì" và "Cộng đồng bản địa cần làm gì" cho website HeritageLink

> Cách dùng: copy toàn bộ phần dưới đường kẻ, dán vào công cụ AI lập trình (Claude Code, Cursor, Copilot, v0…) đang mở mã nguồn website. Nếu công cụ không đọc được mã nguồn, dán kèm nội dung các file `index.html`, `ambassadors.html`, `detail.html`, file CSS và JS chính.

---

## 1. Bối cảnh dự án

Bạn là lập trình viên front-end kiêm biên tập nội dung cho **HeritageLink**, một nền tảng khởi nghiệp sinh viên kết nối **du khách – Đại sứ Di sản (sinh viên) – cộng đồng bản địa (nghệ nhân, hộ dân)** qua các trải nghiệm văn hóa có cấu trúc. Slogan: "Lưu giữ hồn cốt di sản". Giá trị cốt lõi: "Không chỉ đến để nhìn di sản, mà đến để sống cùng di sản."

Website đang chạy tại `https://heritagelink-qtld.onrender.com`. Đây là website gồm nhiều trang HTML tĩnh: `index.html`, `explore.html`, `detail.html?id=…`, `heritage.html`, `ambassadors.html`, `ambassador-apply.html`, `ai-itinerary.html`, `passport.html`, `bookings.html`, `login.html`. Ảnh nằm trong thư mục `/images/`.

**Trước khi viết code, hãy đọc mã nguồn hiện có** để nắm: header/menu, footer, bảng màu, font, class CSS, cách các trang đang lấy dữ liệu (file JS, JSON hay API). Mọi phần mới phải dùng lại đúng hệ thống giao diện đó, không thêm framework mới.

## 2. Mục tiêu

Hiện website mới thể hiện góc nhìn của du khách. Cần bổ sung nội dung giải thích rõ **mỗi bên phải làm gì, được gì và cam kết gì**, đúng với hồ sơ dự thi. Nguyên tắc xuyên suốt của mô hình:

- **Cộng đồng tập trung giữ và cung cấp giá trị cốt lõi.**
- **Đại sứ đảm nhiệm việc kết nối và số hóa.**
- **Nền tảng HeritageLink lo hạ tầng công nghệ, kiểm duyệt, thanh toán và phân phối.**

Thông điệp phải toát lên: với hộ dân thì *"bạn chỉ cần đồng ý và đón khách, phần còn lại có Đại sứ và HeritageLink lo"*; với sinh viên thì *"bạn là người biên kịch trải nghiệm, không chỉ là người quay video"*.

## 3. Phạm vi công việc

### 3.1. Trang `ambassadors.html`: thêm phần "Đại sứ Di sản cần làm gì?"

Giữ nội dung hiện có, bổ sung các khối sau theo thứ tự.

**(a) Đại sứ là ai**
- Sinh viên các trường đại học, cao đẳng, ưu tiên người đang học tập hoặc sinh sống tại địa phương có làng nghề, di sản hoặc trải nghiệm văn hóa đặc trưng.
- Tuyển qua kênh Đoàn Thanh niên – Hội Sinh viên, được tổ chức Đoàn/Hội xác nhận để tăng độ tin cậy khi làm việc với hộ dân.
- Đại sứ không phải khách trả phí. Họ là lực lượng tạo ra nguồn cung nội dung cho nền tảng.

**(b) Hành trình của một Đại sứ:** dùng timeline/stepper có số thứ tự, mỗi bước gồm tiêu đề, 1–2 câu mô tả và icon.

1. **Đăng ký trực tuyến:** điền form tại `ambassador-apply.html`.
2. **Tuyển chọn:** HeritageLink xét hồ sơ, ưu tiên am hiểu địa phương.
3. **Nhận bộ hướng dẫn và template trực tuyến:** cách giới thiệu địa điểm, cách phỏng vấn nghệ nhân/hộ dân, thông tin cần thu thập, yêu cầu về ảnh và video, nguyên tắc kể chuyện di sản. Học trực tuyến, không cần đào tạo tập trung.
4. **Tìm điểm di sản:** chủ động tìm làng nghề, hộ dân, nghệ nhân hoặc trải nghiệm tiềm năng tại địa phương.
5. **Xin đồng ý của cộng đồng:** giải thích mô hình, xin đồng ý ghi hình/phỏng vấn, lấy số điện thoại/Zalo.
6. **Thiết kế kịch bản trải nghiệm 4 lớp:** cùng nghệ nhân xác định các lớp *Quan sát – Chạm – Tự làm – Nghe chuyện* (chi tiết ở khối c).
7. **Ghi hình, chụp ảnh, phỏng vấn:** quay bằng điện thoại thông minh theo template.
8. **Gửi kiểm duyệt:** nộp Hồ sơ Di sản lên nền tảng. Nếu được yêu cầu thì chỉnh sửa theo góp ý.
9. **Đăng tải và hỗ trợ vận hành:** khi trải nghiệm đã lên web, Đại sứ hỗ trợ xác nhận lịch đón khách, truyền đạt thông tin cho hộ dân và làm đầu mối hỗ trợ khách tại chỗ khi cần.
10. **Nhận hoa hồng và chứng nhận:** hưởng 5% giá trị mỗi booking phát sinh từ nội dung của mình, được ghi nhận vào Chứng nhận Đại sứ Di sản.

**(c) Vai trò "biên kịch trải nghiệm":** khối nổi bật (callout) giải thích rằng với mỗi hồ sơ, Đại sứ phải làm việc trực tiếp với nghệ nhân/hộ dân để xác định:
- **Công đoạn khách được tự tay làm** một cách an toàn và có ý nghĩa. Ví dụ: nặn một chi tiết gốm đơn giản, tập một động tác múa dân gian, gói một phần chiếc bánh truyền thống.
- **Công đoạn khách chỉ nên quan sát**, vì đòi hỏi tay nghề cao hoặc mang tính thiêng liêng (như phần lõi của một nghi lễ tín ngưỡng).
- **Vị trí lồng ghép câu chuyện nền** (lịch sử, ý nghĩa văn hóa, chuyện đời người thực hành) để tạo chiều sâu cảm xúc.

Có thể minh họa bằng 4 thẻ: Quan sát · Chạm · Tự làm · Nghe chuyện.

**(d) Bốn nhóm kỹ năng được đào tạo:** dạng lưới 4 thẻ.
1. **Phỏng vấn:** khai thác đúng câu chuyện cốt lõi thay vì thông tin bề mặt.
2. **Quay dựng bằng điện thoại:** ánh sáng, bố cục, âm thanh.
3. **Kể chuyện (storytelling):** truyền tải giá trị văn hóa, không chỉ mô tả quy trình.
4. **Đạo đức tiếp cận cộng đồng:** đặc biệt với nghi lễ, tín ngưỡng và ẩm thực gia truyền.

**(e) Checklist Hồ sơ Di sản Đại sứ cần nộp:** danh sách có ô tick (chỉ để hiển thị, không cần lưu):
- Tên trải nghiệm, phân loại (Làng nghề / Ẩm thực / Tour văn hóa – di tích / Sản phẩm thủ công), địa điểm.
- Câu chuyện: lịch sử, ý nghĩa văn hóa, câu chuyện người thực hành.
- Hồ sơ nghệ nhân/hộ dân: tên, số năm giữ nghề, lời kể ngắn.
- Kịch bản 4 lớp: Quan sát – Chạm – Tự làm – Nghe chuyện, ghi rõ phần nào chỉ được quan sát.
- Ảnh và video ngắn theo yêu cầu kỹ thuật của template.
- Thông tin thực tế: thời lượng, số khách tối đa, giá đề xuất, khung giờ, điểm hẹn, trang phục, lưu ý văn hóa.
- Xác nhận đã có sự đồng ý ghi hình của nghệ nhân/hộ dân, kèm số điện thoại/Zalo.

**(f) Bộ quy tắc đạo đức Đại sứ:** 5–6 cam kết ngắn:
- Chỉ ghi hình và đăng tải khi đã có sự đồng ý của nghệ nhân/hộ dân.
- Phản ánh đúng bản chất văn hóa, không thêm thắt hay "sân khấu hóa" sai lệch.
- Tôn trọng không gian riêng tư, nơi thờ tự và phần thiêng liêng của nghi lễ. Không đưa phần này vào hoạt động khách tự làm.
- Không thương mại hóa di sản chỉ để tăng lượt đặt, nhất là di sản đang có nguy cơ mai một.
- Truyền đạt trung thực cho hộ dân về giá, cách chia doanh thu và lịch đón khách.
- Đặt chất lượng và chiều sâu nội dung lên trên số lượng hồ sơ.

**(g) Đại sứ được đánh giá thế nào:**
- **3 chỉ số hiệu suất:** số nội dung tạo ra · chất lượng trải nghiệm (đánh giá của khách) · số booking phát sinh. Cách tính này cân bằng số lượng với chất lượng.
- **3 tiêu chí kiểm duyệt hồ sơ:** Tính xác thực (đúng bản chất văn hóa) · Chất lượng storytelling (mạch lạc, có cảm xúc) · Mức độ tương tác thực chất (khách có thực sự được "làm" hay chỉ xem và chụp ảnh).

**(h) Đại sứ nhận được gì:** lưới 4 thẻ.
- **Hoa hồng 5%** trên giá trị mỗi giao dịch phát sinh từ nội dung mình tạo ra. Ví dụ: một khách đặt trải nghiệm 850.000đ thì Đại sứ nhận 42.500đ.
- **Chứng nhận Đại sứ Di sản** để đưa vào CV/portfolio.
- **Kỹ năng** truyền thông, kể chuyện, quay dựng.
- **Dashboard cá nhân** theo dõi lượt xem, số booking, hoa hồng, thành tích; tích điểm khi nội dung tạo ra booking thành công.

Kết thúc phần này bằng nút CTA "Đăng ký trở thành Đại sứ" dẫn tới `ambassador-apply.html`.

### 3.2. Tạo trang mới `community.html`: "Dành cho nghệ nhân và hộ dân"

Thêm mục **"Cộng đồng"** vào menu chính, đặt cạnh "Đại sứ Di sản", ở mọi trang. Đối tượng đọc là người lớn tuổi, ít dùng công nghệ, nên:
- **Chữ to** (body tối thiểu 18px), câu ngắn, từ ngữ đời thường, không dùng thuật ngữ tiếng Anh (không viết GMV, booking, dashboard; thay bằng "tổng tiền khách trả", "lượt đặt", "trang theo dõi").
- Nút lớn, tương phản cao, ít bước.

Nội dung trang:

**(a) Hero:** tiêu đề "Bạn giữ nghề – chúng tôi đưa khách đến". Phụ đề: "Không cần biết dùng mạng xã hội, không cần tự quảng cáo. Bạn chỉ cần đồng ý cho Đại sứ ghi hình và đón khách."

**(b) Ai có thể tham gia:** nghệ nhân, hộ dân làm nghề, người thực hành nghi lễ, hộ gia đình giữ món ăn gia truyền, làng nghề.

**(c) Bạn chỉ cần làm 4 việc:** hiển thị thật nổi bật, có số thứ tự lớn.
1. **Đồng ý tham gia:** đồng ý cho Đại sứ ghi hình, phỏng vấn và cung cấp số điện thoại/Zalo. Chỉ vậy là đủ để đăng ký.
2. **Cùng Đại sứ chuẩn bị trải nghiệm:** kể câu chuyện về nghề, chỉ ra phần nào khách được tự tay làm, phần nào khách chỉ nên đứng xem.
3. **Xác nhận lịch đón khách:** nhận tin báo khách đặt qua Zalo hoặc tin nhắn SMS, xác nhận trực tiếp hoặc qua Đại sứ phụ trách.
4. **Đón khách và hướng dẫn:** cung cấp trải nghiệm đúng như đã mô tả, đảm bảo chất lượng và an toàn cho khách. Khách check-in bằng mã QR tại điểm đến.

**(d) Bạn KHÔNG cần làm:** khối đối chiếu với icon gạch chéo.
- Không phải tự đăng bài hay quản lý trang web.
- Không phải tự quay phim, chụp ảnh, viết giới thiệu.
- Không phải học cách dùng ứng dụng phức tạp.
- Không phải bỏ tiền quảng cáo.

→ "Đại sứ Di sản và HeritageLink làm thay bạn."

**(e) Bạn nhận được gì:**
- **85% số tiền khách trả** thuộc về bạn. Hiển thị ví dụ trực quan bằng thanh chia hoặc bảng: khách trả 850.000đ → bạn nhận **722.500đ**; 5% (42.500đ) cho Đại sứ; 2% (17.000đ) phí thanh toán; 8% (68.000đ) duy trì nền tảng.
- **Minh bạch:** sau mỗi lượt đặt, bạn biết rõ khách trả bao nhiêu, chi phí bao nhiêu, bạn thực nhận bao nhiêu. Bạn xem được doanh thu và lịch đặt chỗ ngay trên nền tảng.
- **Được quảng bá miễn phí** trên nền tảng có sẵn lượng khách truy cập.
- **Nhận thông báo qua kênh quen thuộc:** Zalo, SMS.
- **Hỗ trợ thủ tục thuế:** hệ thống chia doanh thu được thiết kế để khấu trừ và kê khai thuế thay cho hộ, cá nhân kinh doanh theo quy định hiện hành.
- **Có Đại sứ đồng hành** làm cầu nối, cập nhật thông tin và tiếp nhận phản hồi.

**(f) Trách nhiệm và cam kết của bên cung cấp trải nghiệm:** viết nhẹ nhàng, rõ ràng.
- Cung cấp trải nghiệm đúng nội dung, thời lượng và giá đã thống nhất.
- Chịu trách nhiệm về chất lượng dịch vụ và an toàn của khách, vì HeritageLink hoạt động với tư cách sàn trung gian.
- Thông báo sớm cho Đại sứ khi cần đổi lịch hoặc tạm ngừng đón khách.
- Tham gia đánh giá hai chiều: khách đánh giá trải nghiệm, cộng đồng cũng phản hồi về khách và Đại sứ.

**(g) Form đăng ký siêu ngắn:** tối đa 5 trường.
- Họ và tên
- Số điện thoại / Zalo
- Địa phương (xã/phường, tỉnh)
- Loại trải nghiệm (chọn: Làng nghề / Ẩm thực / Văn hóa – nghi lễ / Sản phẩm thủ công / Khác)
- Ô tick bắt buộc: "Tôi đồng ý để Đại sứ HeritageLink liên hệ, ghi hình và phỏng vấn"
- Tùy chọn: "Người đăng ký thay (Đại sứ / người thân)", dạng trường ẩn, mở ra khi tick.
- Nút "Gửi đăng ký". Sau khi gửi hiện thông báo: "Cảm ơn bạn! Đại sứ phụ trách khu vực sẽ gọi điện hoặc nhắn Zalo trong vài ngày tới." Nếu web chưa có backend thì lưu tạm vào `localStorage` (bọc try/catch) và ghi chú `// TODO: nối API`.

**(h) Câu hỏi thường gặp (accordion)** với 5 câu:
- Tôi có mất phí gì không?
- Tiền khách trả về tay tôi khi nào, bằng cách nào?
- Nếu tôi bận, không đón khách được thì sao?
- Phần thờ cúng, nghi lễ trong nhà tôi có bị quay lên mạng không? *(Trả lời: chỉ ghi hình khi bạn đồng ý; phần thiêng liêng chỉ để khách quan sát hoặc không đưa vào trải nghiệm, tùy bạn quyết định.)*
- Tôi không biết dùng điện thoại thông minh thì có tham gia được không? *(Trả lời: được, Đại sứ có thể đăng ký và hỗ trợ thay bạn; thông báo có thể nhận qua SMS.)*

### 3.3. Trang chủ `index.html`: thêm khối "Ba bên – ba vai trò"

Thêm một section ngắn, đặt ngay sau hero hoặc trước phần "Cách hoạt động". Gồm 3 cột:

| | Du khách | Đại sứ Di sản | Nghệ nhân / Hộ dân |
|---|---|---|---|
| Làm gì | Tìm, đặt, trải nghiệm, check-in QR, đánh giá | Tìm điểm di sản, thiết kế kịch bản 4 lớp, ghi hình, gửi kiểm duyệt, hỗ trợ vận hành | Đồng ý tham gia, xác nhận lịch, đón và hướng dẫn khách |
| Nhận gì | Trải nghiệm xác thực, Hộ chiếu Di sản số | Hoa hồng 5%, chứng nhận, kỹ năng | 85% doanh thu, được quảng bá, minh bạch |
| Nút | Khám phá trải nghiệm | Trở thành Đại sứ | Đăng ký hợp tác → `community.html` |

Bên dưới là một dải nhỏ "HeritageLink lo phần còn lại: kiểm duyệt nội dung, công nghệ, thanh toán, chia doanh thu tự động và đối soát".

Thêm sơ đồ chuỗi hoạt động nằm ngang (cuộn ngang được trên mobile): **Đại sứ tạo nội dung → Kiểm duyệt → Đăng tải → Khách đặt → Trải nghiệm & QR check-in → Đánh giá → Chia doanh thu tự động.**

### 3.4. Trang `detail.html`: thêm khối "Ai làm gì trong trải nghiệm này"

Đặt sau phần "Người gìn giữ di sản". Lấy dữ liệu động theo `id` của trải nghiệm. Ví dụ với `id=3` (Gốm Phù Lãng):

- **Đại sứ Lê Minh Anh** đã khảo sát, ghi hình và xây dựng hồ sơ; là đầu mối xác nhận lịch và hỗ trợ bạn tại chỗ. Thêm nút "Liên hệ Đại sứ" (chỉ hiện sau khi đặt chỗ).
- **Nghệ nhân Phạm Văn Nam** trực tiếp hướng dẫn trải nghiệm và chịu trách nhiệm chất lượng, an toàn buổi trải nghiệm.
- **HeritageLink** kiểm duyệt nội dung theo 3 tiêu chí, xử lý thanh toán và chia doanh thu minh bạch.

Kèm huy hiệu nhỏ: "Đã có sự đồng ý ghi hình của nghệ nhân" · "Đã kiểm duyệt: xác thực · storytelling · tương tác".

**Sửa kèm trên trang này:**
- Phần "Bạn sẽ được trải nghiệm những gì?" đang ghi "5 tầng" nhưng chỉ liệt kê 4 bước. Thống nhất thành **4 lớp: Quan sát – Chạm – Tự làm – Nghe chuyện**.
- Khối đánh giá đang hiện cả "4.9" và "5.0 / 5.0". Chỉ giữ một số, tính từ dữ liệu đánh giá.

### 3.5. Nguồn dữ liệu

Tách toàn bộ nội dung mới (các bước, kỹ năng, quy tắc, FAQ, tỷ lệ chia) vào một file dữ liệu dùng chung, ví dụ `js/roles-data.js` hoặc `data/roles.json`, để sau này sửa chữ không phải đụng vào HTML. Tỷ lệ chia doanh thu khai báo **một lần** dạng hằng số:

```js
const REVENUE_SPLIT = { host: 0.85, ambassador: 0.05, payment: 0.02, platform: 0.08 };
```

Mọi số tiền ví dụ đều phải tính từ hằng số này và giá trải nghiệm, định dạng theo kiểu Việt Nam (`850.000đ`). Không gõ tay số tiền.

## 4. Ràng buộc bắt buộc

1. **Bám đúng hồ sơ dự án.** Không bịa thêm con số, đối tác, giải thưởng hay số lượng Đại sứ/hộ dân đã tham gia. Không ghi "đã hợp tác với Đoàn/Hội" hay UNESCO; chỉ được viết "tuyển qua kênh Đoàn Thanh niên – Hội Sinh viên" như một định hướng.
2. **Tỷ lệ chia doanh thu cố định:** 85% hộ dân · 5% Đại sứ · 2% cổng thanh toán · 8% nền tảng (tổng phí nền tảng 15%).
3. **Tiếng Việt có dấu đầy đủ, nhất quán thuật ngữ:** "Đại sứ Di sản", "Hồ sơ Di sản sống", "Hộ chiếu Di sản số", "cộng đồng bản địa", "trải nghiệm 4 lớp". Không lẫn nhãn tiếng Anh.
4. **Giữ nguyên hệ thống giao diện hiện có:** màu, font, bo góc, cách đặt tên class. Header, menu và footer phải giống hệt các trang khác.
5. **Responsive:** hiển thị tốt từ 360px trở lên, không có thanh cuộn ngang ngoài ý muốn; các lưới 3–4 cột tự xuống 1 cột trên điện thoại.
6. **Khả năng truy cập:** đúng thứ bậc heading (một `h1` mỗi trang), `alt` cho ảnh, nhãn `<label>` cho mọi trường form, tương phản chữ đạt chuẩn WCAG AA, accordion dùng được bằng bàn phím.
7. **Không làm hỏng chức năng cũ** (đăng nhập, đặt chỗ, Hộ chiếu…). Không xóa nội dung hiện có trừ các lỗi nêu ở mục 3.4.
8. Ảnh minh họa: dùng ảnh có sẵn trong `/images/` hoặc khung placeholder có chú thích "Ảnh thực tế sẽ cập nhật". Không dùng ảnh stock nước ngoài.

## 5. Tiêu chí nghiệm thu

- [ ] Menu ở mọi trang có mục "Cộng đồng" dẫn tới `community.html`.
- [ ] `ambassadors.html` có đủ 8 khối (a)–(h) và nút CTA đăng ký.
- [ ] `community.html` có đủ 8 khối (a)–(h); form tối đa 5 trường và báo lỗi khi bỏ trống ô bắt buộc hoặc chưa tick đồng ý.
- [ ] Trang chủ có khối "Ba bên – ba vai trò" và sơ đồ chuỗi hoạt động.
- [ ] `detail.html` có khối "Ai làm gì", dữ liệu thay đổi theo `id`; đã sửa lỗi "5 tầng/4 bước" và lỗi hiển thị điểm đánh giá.
- [ ] Ví dụ 850.000đ hiển thị đúng 722.500đ / 42.500đ / 17.000đ / 68.000đ, tính từ `REVENUE_SPLIT`.
- [ ] Kiểm tra trên khung 360px, 768px, 1280px không vỡ bố cục.
- [ ] Không có lỗi trong console trình duyệt.

## 6. Cách trả kết quả

1. Liệt kê các file sẽ tạo mới hoặc sửa, kèm lý do ngắn.
2. Đưa **mã hoàn chỉnh** cho file mới; với file sửa, đưa đoạn thay đổi kèm vị trí chèn rõ ràng (hoặc file hoàn chỉnh nếu thay đổi nhiều).
3. Cuối cùng, liệt kê các điểm cần nhóm dự án tự bổ sung: ảnh thật, số tài khoản/kênh Zalo chính thức, nội dung pháp lý chi tiết, API lưu form.

Làm từng trang một theo thứ tự: `community.html` → `ambassadors.html` → `index.html` → `detail.html`. Dừng sau mỗi trang để tôi kiểm tra trước khi làm trang tiếp theo.
