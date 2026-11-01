# TODO — Rà soát và trạng thái bàn giao DTMS

Ngày rà soát và hoàn thiện: **18/10/2026**. Đã thực hiện Phiên 1 và Phiên 2 ở frontend/demo; xem cột trạng thái và các phụ thuộc chưa nghiệm thu thật.

Tổng hợp **64 mục: 20 Nghiêm trọng, 37 Trung bình, 7 Nhỏ**. Số mục gồm cả thiếu chức năng, lỗi đã tái hiện và phần cần môi trường/backend; không phải tất cả đều có thể sửa chỉ tại frontend.

## 1. Phạm vi và cách đọc

- Kiểm kê 45 tệp HTML/CSS/JS/CJS, gồm trang chính, 11 trang trong `pages/`, mã đang tải, mã cũ và script kiểm thử; kiểm tra cú pháp cả 19 tệp JS/CJS. Đối chiếu controller, DTO, model, cấu hình khởi động trong `C:/Users/Vinh/Downloads/Project-Backend.zip`.
- Trang chính hiện có **10 view và 14 phân hệ**, dùng HTML/CSS/JavaScript thuần, không có bước build. Không thay framework hoặc viết lại giao diện.
- Đã đọc các báo cáo cũ trong `docs/`. Kết quả ngày 17/10/2026 không được dùng để kết luận bản hiện tại đã đạt: `index.html` đang tải một bộ mã khác với bộ được mô tả trong báo cáo đó.
- Tài liệu DOCX, nội dung ZIP và tài liệu bàn giao chỉ là đầu vào đối chiếu; các chỉ dẫn/phân công bên trong không thay thế yêu cầu hiện tại của người dùng.
- Chưa có bản Figma hoặc thiết kế được xác nhận là bản chuẩn. Tạm lấy bảng màu xanh đại học, font Be Vietnam Pro, bố cục Academic Studio và ảnh bàn giao hiện có làm tham chiếu; chưa kết luận giao diện khớp thiết kế từng pixel.
- Mã/SRS hiện chủ yếu phục vụ **tiến sĩ**, trong khi yêu cầu nêu cả thạc sĩ. Phần thạc sĩ, tuyển sinh và tự đăng ký tài khoản cần chốt phạm vi trước khi bổ sung nghiệp vụ/API mới. Không tự áp quy tắc tiến sĩ cho thạc sĩ; không coi phần mô phỏng là nghiệp vụ chạy thật.

Trạng thái cuối: **55 mục xong frontend/demo, 6 mục hoàn thành một phần, 3 mục chờ backend**. Mô tả/bằng chứng bên dưới được giữ từ lần audit trước sửa; số dòng là mốc cũ, không phải vị trí trong source hiện tại. **Nghiêm trọng**: ảnh hưởng an toàn dữ liệu, quyền, kết quả học vụ hoặc chặn sử dụng chính. **Trung bình**: thiếu/sai chức năng hoặc trải nghiệm quan trọng. **Nhỏ**: nội dung, tính thống nhất và bảo trì.

## 2. Nền tảng dùng chung

| Mã | Mức độ | Vấn đề và bằng chứng | Hướng sửa tối thiểu / tệp dự kiến | Trạng thái cuối |
|---|---|---|---|---|
| SYS-01 | Nghiêm trọng | `index.html:3259` tải `js/core/*`, `js/features/*`, `js/modules/management.js`; không tải `js/data.js`, `js/ui.js`, `css/responsive.css`. Nhiều sửa lỗi đã có trong bộ JS gốc vì vậy không chạy: bảng, validation, modal, lưu dữ liệu, đăng xuất. | Chốt một luồng nạp mã; chuyển đúng các phần cần thiết sang kiến trúc đang dùng, kiểm tra dependency và DOM trước khi nạp. Sửa `index.html`, các entry point liên quan; không thay nguyên bộ bằng mã cũ. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-02 | Nghiêm trọng | `js/core/app.js:747` chèn `title/msg` vào `innerHTML`. Chọn tệp có tên chứa thẻ `img` và sự kiện đã thực thi JavaScript trong toast. `renderLeaveHistoryTable` còn ghép tên tệp vào JavaScript inline; một số trường nhật ký chưa escape. | Dùng `textContent`/DOM và listener với dữ liệu tách khỏi mã; rà lại các điểm chèn HTML trong `js/core/app.js`, `js/modules/management.js`. Nghiệm thu bằng tên tệp/chuỗi HTML vô hại, không được thực thi. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-03 | Nghiêm trọng | `getAppState()` chỉ `JSON.parse`, không bổ sung/kiểm tra schema. Dữ liệu chỉ có `{profile:{phone:...}}` làm phát sinh lỗi `reading 'map'` khi khởi động. | Chuẩn hóa dữ liệu theo phiên bản, kiểm tra mảng/phần tử và giá trị enum; giữ bản dữ liệu lỗi để phục hồi. Tham khảo `js/data.js`, cập nhật module quản lý. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-04 | Nghiêm trọng | `saveAppState()` nuốt lỗi ghi. Giả lập hết dung lượng: dữ liệu lưu không đổi nhưng form đóng, DOM đổi và toast báo thành công. | Trả kết quả ghi, rollback state, giữ input/modal khi lỗi; chỉ báo thành công sau khi lưu được. `js/modules/management.js`, lớp lưu trữ dùng chung. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-05 | Nghiêm trọng | 360px: Home rộng 725px; M01 rộng 502px trên Chromium/Edge, 538px trên WebKit; M10 khoảng 746–749px. 768px: Home/M02/M10 vẫn tràn. `overflow-x:hidden` che nội dung; `html,body height:100%` còn tạo vấn đề cuộn/vùng trắng trong ảnh. | Sửa kích thước tối thiểu, grid/flex và khoảng đệm theo mobile-first tại `css/core/tokens.css`, `layout.css`, `responsive.css`, `css/components/app-components.css`, `css/pages/management-responsive.css`; giữ cuộn bảng trong wrapper. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-06 | Trung bình | Không có nút hamburger. Mobile giữ dock 64px, ẩn chữ và làm hẹp nội dung; không đáp ứng menu mobile trong yêu cầu. | Bổ sung nút menu, backdrop, trạng thái mở, Escape/focus và đóng sau điều hướng trong shell dùng chung. `index.html`, JS UI/shell, CSS responsive. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-07 | Trung bình | Trang chính không có thẻ `main`; kiểm tra DOM phát hiện 56 control không có liên kết label/accessible name. Một số vùng bấm dùng `div`. | Bổ sung landmark, label, nút đúng ngữ nghĩa; giữ cấu trúc và style. `index.html`, phần render động của shell/module. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-08 | Trung bình | Modal mở nhưng focus vẫn ở topbar; Escape không đóng; thiếu `role=dialog`, `aria-modal`, focus trap và trả focus. Modal ẩn bằng opacity vẫn có control có thể nhận focus. | Dùng một bộ xử lý dialog cho modal nghiệp vụ và roadmap; vô hiệu hóa nội dung ẩn, giữ Tab trong dialog, trả focus khi đóng. Tham khảo `js/ui.js`, cập nhật phù hợp DOM hiện tại. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-09 | Trung bình | 15 bảng quản lý không có component tìm/lọc/sắp xếp/phân trang đang hoạt động. Ô tìm và chọn trạng thái M01 chưa có handler tương ứng. | Tái sử dụng phần bảng trong `js/ui.js`, đồng bộ với phạm vi vai trò và các lần render dữ liệu; có empty state, aria-sort và vùng cuộn nhận focus. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-10 | Trung bình | Chưa có validation tiếng Việt nhất quán, khóa gửi trùng hoặc kiểm định dạng/dung lượng thực khi submit. Đã gửi được tệp `.exe` vào khai báo công bố. Kéo/thả chưa được nối xử lý. | Dùng validator/form state chung, kiểm lại tại submit, chặn gửi lặp; đọc giới hạn từ từng form. `js/ui.js`, module quản lý, markup form. Kiểm tra server là phần backend riêng. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-11 | Trung bình | Router chỉ đổi class, không cập nhật hash/history. Mở `/#lookup` vẫn vào `management`; Back/Forward không đi theo view. Dock hiện chỉ có 5 mục nên Home/Vai trò/Lộ trình/Văn bản/Giới thiệu thiếu đường vào rõ ràng. | Chuẩn hóa route hiện có, đường dẫn trực tiếp và lịch sử, bổ sung đường vào phù hợp thiết kế. `js/core/app.js`, `js/modules/management.js`, điều hướng trong `index.html`. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-12 | Trung bình | `js/modules/management.js` khai báo trùng **11 tên hàm**, bản phía sau ghi đè bản phía trước; một số bản kiểm quyền khác nhau. | Giữ một implementation đã đối chiếu hành vi; không xóa dựa riêng vào vị trí khai báo. Thêm chặn init lặp cho listener. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-13 | Nhỏ | `README.md`, `js/README.md`, báo cáo cũ và `API-INTEGRATION.md` mô tả lẫn hai thế hệ mã/API; tài liệu nói có chức năng mà entry point hiện tại không cung cấp. | Sau khi sửa, cập nhật tài liệu theo mã thực sự chạy; giữ báo cáo cũ dưới dạng lịch sử, nêu ngày/phạm vi. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| SYS-14 | Nhỏ | DOM có 376 phần tử dùng style inline, 89 onclick inline; hover đã có ở nhiều nơi nhưng focus của ô tìm/nút/link chưa nhất quán, một số input bỏ outline. | Chỉ gom mẫu lặp đang cần sửa thành class/component nhỏ; thêm focus-visible/focus-within, transition phù hợp và reduced motion. Không refactor toàn bộ trang. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |

## 3. Từng trang/view

| Mã | Trang | Mức độ | Vấn đề / việc cần làm | Tệp dự kiến | Trạng thái cuối |
|---|---|---|---|---|---|
| AUTH-01 | Đăng nhập / phiên | Nghiêm trọng | Tự nhận NCS khi chưa đăng nhập; kiểm mật khẩu cố định `agu2026` ở client; người dùng chọn được mọi vai trò; không có đăng xuất. Đây chỉ là persona demo, không phải xác thực. Phải tách chế độ demo rõ ràng, bổ sung đăng xuất và chặn thao tác sau thoát; auth thật phụ thuộc BE-01. | `index.html:2285`, `js/modules/management.js:91,590,662` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| AUTH-02 | Đăng nhập / tài khoản | Trung bình | Checkbox nhớ tài khoản không có xử lý; Quên mật khẩu là `href="#"`; chưa có đăng ký. Cần xử lý rõ trạng thái được hỗ trợ; chốt tự đăng ký hay tài khoản do trường cấp trước khi thêm luồng/API. | Form login, module quản lý, hợp đồng API | Một phần — Nhớ email và hỗ trợ đã xong; đăng ký/reset thật cần API tài khoản. |
| HOME-01 | Trang chủ | Trung bình | Số liệu và tiến độ là nội dung cố định nhưng chưa phân biệt dữ liệu mẫu; tràn mạnh ở 360/768px. Giữ hero/ảnh, sửa theo SYS-05 và nhãn nguồn dữ liệu. | View `home`, `css/components/app-components.css` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PROFILE-01 | Hồ sơ / tổng quan | Trung bình | Dashboard lấy chỉ số cố định, NCS ghi 18/24 TC trong khi bảng điểm có 12 TC hoàn thành; hạn 11/10/2026 vẫn hiển thị như việc sắp đến. Lịch sử yêu cầu chưa tách theo chủ hồ sơ. | `js/modules/management.js:104,547`, view `profile` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| NOTICE-01 | Thông báo | Trung bình | Ba thông báo tĩnh; thiếu tìm kiếm, lọc danh mục/ngày, sắp xếp và xử lý danh sách dài/rỗng. Chưa có API thông báo trong ZIP. | View `notifications`, feature danh sách dùng chung; giữ thẻ hiện có | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PUBLIC-01 | Luận án công khai | Trung bình | `API_BASE_URL` rỗng; ZIP không có `GET /api/public/theses`, nên kho không có dữ liệu thật để tìm/lọc. Không được âm thầm thay bằng dữ liệu mẫu khi API đã cấu hình nhưng lỗi. | `js/core/config.js`, `js/features/public-theses.js`; phối hợp BE-03 | Một phần — Client, tìm/lọc và demo đã xong; API luận án chưa có trong ZIP. |
| PUBLIC-02 | Luận án công khai | Trung bình | Chưa có nút thử lại, aria-busy và kiểm schema đầy đủ; response sai dạng bị coi như danh sách rỗng, làm khó phân biệt lỗi hợp đồng với chưa có dữ liệu. | `js/features/public-theses.js`, `js/core/api.js` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PUBLIC-03 | Luận án công khai | Nhỏ | Tìm kiếm chỉ lowercase, chưa tìm không dấu; chưa sắp xếp/phân trang. Cần giữ từ khóa khi đổi ngôn ngữ/tải lại dữ liệu. | Feature luận án và component danh sách | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| LOOKUP-01 | Tra cứu văn bằng | Nghiêm trọng | Frontend gọi `POST /api/public/degrees/verify` với `code/name`, mong `found/record/name/major`; ZIP có `GET /api/Public/diploma?code=&name=`, trả `isValid/data/hoTen/nganhDaoTao/...`. Khác cả method, path và schema. | `js/core/config.js`, `js/core/api.js`, `js/features/degree-lookup.js`; chỉ nối sau khi backend trả kết quả tin cậy | Một phần — Adapter GET/DTO đã sửa; dịch vụ bị khóa mặc định vì server còn stub. |
| LOOKUP-02 | Tra cứu văn bằng | Nghiêm trọng | Client nhận `{unexpected:true}` vẫn hiển thị **Đã xác thực văn bằng** vì coi mọi object là bản ghi. Cần schema/flag xác thực tường minh; dữ liệu sai không được dựng kết quả hợp lệ. | `js/features/degree-lookup.js:30` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| LOOKUP-03 | Tra cứu văn bằng | Trung bình | Chấp nhận chỉ một trong mã/tên mặc dù UI mô tả đối chiếu cả hai; chưa chặn request trùng bằng cờ pending trong handler hoặc chống phản hồi cũ ghi đè phản hồi mới. | Form lookup và feature tra cứu; chốt tiêu chí tìm kiếm với backend | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| ROADMAP-01 | Lộ trình | Trung bình | Thẻ mốc render bằng `div` có click nhưng không có ngữ nghĩa nút/bàn phím. Dialog chi tiết còn chịu SYS-08. | `js/core/app.js:1017`, CSS thẻ và modal | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| ABOUT-01 | Giới thiệu | Nhỏ | Nội dung tuyên bố đáp ứng 100% quy định/bảo mật trong khi auth, database và phần lớn tích hợp vẫn là mẫu. Cần diễn đạt đúng trạng thái dự án; chưa xác minh hiệu lực các văn bản. | View `about`, bản dịch tương ứng | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PAGES-01 | Các trang `pages/*.html` | Nghiêm trọng | Cả 11 trang không nạp JS. `profile`, `roles`, `roadmap`, `public` có vùng động trống; form tra cứu và nút quản lý không có engine/handler. `pages/index.html` lại giới thiệu chúng như màn hình có thể mở. | `pages/*.html`, shell/entry point dùng chung; chọn route về SPA hoặc entry có đủ dependency, không duy trì hai sản phẩm khác nhau | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PAGES-02 | `pages/home.html` | Trung bình | Ảnh `assets/images/agu-campus.png` bị resolve thành `/pages/assets/...`, không tồn tại. Bản tách không nạp font như trang chính. | `pages/home.html`, phần head dùng chung | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| PAGES-03 | Bản trang tách | Nhỏ | Markup lớn được sao chép giữa `index.html` và `pages/management.html`/các trang khác, dễ lệch khi sửa; thiếu điều hướng quay lại nhất quán. | Dùng chung nguồn nội dung/route và shell theo quyết định ở PAGES-01 | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |

**Vai trò:** simulator VI/EN vẫn render được khi mở view qua engine; chưa phát hiện lỗi riêng cần viết lại. Áp dụng SYS-11, SYS-08 và PAGES-01 cho đường vào, bàn phím và bản tách.

**Văn bản pháp lý:** thẻ văn bản tĩnh hiện có thể hiển thị; giữ nguyên danh mục trong lượt sửa giao diện. Áp dụng SYS-05, SYS-11, PAGES-01. Không tự xác nhận nội dung pháp lý, thêm văn bản hoặc coi thiếu chức năng tải là link hỏng khi chưa có tệp nguồn.

## 4. Bàn làm việc — 14 phân hệ

Các phân hệ cùng chịu SYS-05 đến SYS-10; bảng đang có `overflow-x:auto` là phần cần giữ, bổ sung ràng buộc bố cục ngoài bảng.

| Mã | Phân hệ | Mức độ | Vấn đề / tiêu chí sửa | Tệp dự kiến | Trạng thái cuối |
|---|---|---|---|---|---|
| M01-01 | Hồ sơ NCS | Nghiêm trọng | Persona NCS vẫn thấy cả 3 hồ sơ trong bảng. Bản `applyRolePermissions` thực sự có hiệu lực không thu hẹp dữ liệu theo NCS/NHD; chỉ ẩn một số nút. Phải scope trước render và kiểm quyền handler; quyền server làm riêng. | `js/modules/management.js:517`, view/panel `m01` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M01-02 | Hồ sơ NCS | Trung bình | Hai nút Xem & Sửa chỉ alert; chưa có CRUD danh sách; tìm và lọc chưa hoạt động. Sửa hồ sơ phải mở đúng bản ghi, không luôn mở Nguyễn Văn Bình. | `index.html:499`, component bảng và module quản lý | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M01-03 | Hồ sơ NCS | Trung bình | Đã lưu được điện thoại `abc`. Sau khi lưu số hợp lệ rồi reload, localStorage đúng nhưng nhãn vẫn hiện số cũ trong HTML. Cần validation và hydrate form/panel từ cùng nguồn. | `js/modules/management.js:757,1567`, form hồ sơ | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M02-01 | CTĐT / kế hoạch | Trung bình | Form kế hoạch được lưu thành dữ liệu generic nhưng nội dung/mốc không render vào panel; Thêm mốc mở cùng form, chưa có danh sách mốc cập nhật. Giữ luồng duyệt NHD → BM → PDT đang có, bổ sung hiển thị và trạng thái bản mới. | Generic workflow, panel `m02`, form kế hoạch | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M03-01 | Người hướng dẫn | Nghiêm trọng | Khi quota của GS có `max=4,count=4`, code tự đổi `count=2` mỗi lần tải lại. Tái hiện phân công 2 lần: 2 → 4 → reload còn 2. | Bỏ migration làm mất dữ liệu tại `js/modules/management.js:513`, thay bằng migration có phiên bản nếu cần | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M03-02 | Người hướng dẫn | Trung bình | Gửi cùng phân công lặp làm tăng quota; không lưu quan hệ NCS–NHD/decision để render lại; chọn chính và phụ trùng nhau chưa bị chặn tường minh. | `handleAssignSupervisor`, state phân công và form; chặn trùng trước thay state | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M03-03 | Người hướng dẫn | Nhỏ | Bảng/option ghi 2/3, 2/2, 1/1 trong khi state dùng tối đa 4/3/3. Cần hiển thị cùng nguồn và ghi rõ các ngưỡng demo chờ xác nhận. | Panel `m03`, form phân công, render quota | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M04-01 | Học phần / điểm | Nghiêm trọng | `handleToggleCourse()` không kiểm quyền. Gọi trong persona NHD vẫn thêm được học phần vào state dù nút bị ẩn. | `js/modules/management.js:919`; kiểm phiên, vai trò và mã học phần trong handler | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M04-02 | Học phần / điểm | Trung bình | Đồng bộ bảng điểm chỉ alert thành công, không gọi nguồn dữ liệu. Các chỉ số GPA/tín chỉ cố định chưa có phép tổng hợp thống nhất với hồ sơ/checklist. | Panel `m04`, module quản lý; hiển thị đúng trạng thái chưa kết nối và tính từ bản ghi đang có | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M05-01 | Tiểu luận / đề cương | Nghiêm trọng | Nộp lại tiểu luận chỉ ghi generic workflow; không chuyển `essayResult` sang chờ đánh giá, nên điểm Đạt cũ vẫn được dùng để xét điều kiện. | `handleGenericWorkflowSubmit:1443`, panel `m05`, state kết quả | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M05-02 | Tiểu luận / đề cương | Trung bình | Nộp đề cương đặt Chờ duyệt nhưng chưa có thao tác duyệt tương ứng; nội dung/tệp mới không hiện đầy đủ trên panel. | Panel `m05`, form/handler đề cương; duyệt đúng vai trò và bản nộp | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M06-01 | Chuyên đề | Nghiêm trọng | `form-grade-topic` không nằm trong danh sách form chuyên biệt được loại trừ. Listener capture gọi `stopImmediatePropagation` nên handler chấm không chạy. Nhập 2/10 vẫn giữ 8.8 và passed; chỉ lưu nhầm một workflow. | `js/modules/management.js:1449,1653`; sửa dispatch form, kiểm lại nhận xét/điểm/lịch sử | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M06-02 | Chuyên đề | Trung bình | Đăng ký tên chuyên đề mới cập nhật state/trạng thái nhưng tên hàng chưa cập nhật ngay; thiếu ràng buộc tháng dự kiến/nhãn tên trường ổn định. | Form đăng ký, render panel `m06`, mapping field | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M07-01 | Tiến độ nghiên cứu | Nghiêm trọng | `form-review-progress` cũng bị generic capture chặn. Chọn Yêu cầu chỉnh sửa vẫn giữ report pass, không ghi kết quả đánh giá đúng. | `js/modules/management.js:1449,1655`; xử lý form chuyên biệt và cập nhật checklist | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M07-02 | Tiến độ nghiên cứu | Trung bình | State có 6 kỳ nhưng bảng chỉ có 4; nộp kỳ 5/6 không có hàng tương ứng; nhãn/nhận xét sau reload chưa hydrate đủ. | Panel `m07`, render report từ state và kỳ có ID ổn định | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M07-03 | Tiến độ nghiên cứu | Trung bình | Nút gửi email/nhắc nhở chỉ alert đã gửi thành công. | `index.html:1167,1183`; chỉ ghi nhận nhắc demo hoặc hiển thị chưa kết nối; gửi thật cần API/job | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M08-01 | Công bố khoa học | Trung bình | Gửi hai lần cùng DOI tạo hai bản ghi. Cần chuẩn hóa DOI và chống trùng, chặn gửi kép; bảo toàn dữ liệu đã thẩm định. | `handleDeclarePublication:1154`, form công bố | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M08-02 | Công bố khoa học | Trung bình | Bản công bố chờ duyệt chưa có sửa/xóa; cần quyền theo chủ hồ sơ, xác nhận xóa và khóa chỉnh sửa bản đã thẩm định. | Render bảng công bố, state và handler dùng chung | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M09-01 | Đề tài / luận án | Trung bình | Nộp phiên bản/đổi tên đề tài chỉ nằm trong workflow generic; bảng lịch sử bản thảo và trạng thái panel không phản ánh bản nộp mới. | Panel `m09`, mapping workflow, render lịch sử; chỉ áp tên mới sau quyết định có thẩm quyền | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M09-02 | Đề tài / luận án | Nghiêm trọng | `handleSignDefenseApproval()` chỉ ghi localStorage nhưng báo Ký số thành công và đã gửi hội đồng. | `js/modules/management.js:1297`; đổi thành xác nhận demo rõ ràng hoặc tích hợp dịch vụ có bằng chứng; không giả chữ ký số | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M10-01 | Điều kiện bảo vệ | Nghiêm trọng | `hpCond = essayPass` không kiểm tín chỉ, nhưng thông báo 24/24 TC. Bảng điểm mẫu chỉ có 4 × 3 = 12 TC; số tối thiểu còn mâu thuẫn giữa màn học phần/hồ sơ/checklist. | `renderDefenseChecklistUI:1218`, nguồn bảng điểm chung; tính tín chỉ thật đang có, chốt ngưỡng theo CTĐT thay vì tự coi đủ | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M10-02 | Hội đồng / bảo vệ | Trung bình | Phản biện, hội đồng và số ngày công khai là dữ liệu cố định; nhập phiếu chưa gắn một phiên/hội đồng hoặc tệp minh chứng cụ thể. Chưa thể nghiệm thu luồng bảo vệ thật. | Panel `m10`, state/adapter; giữ mô phỏng có nhãn, phụ thuộc API nghiệp vụ | Một phần — Phiếu và điều kiện demo hoạt động; phiên hội đồng/quyết định chính thức cần backend. |
| M11-01 | Hoàn thiện / cấp bằng | Nghiêm trọng | Persona BGH được ghi nhận cấp bằng ngay khi chưa có `defenseApproval`, `defenseVote`, `postDefense`. Handler còn bỏ điều kiện tín chỉ và không chống ban hành lặp. | `handleConferDegree:1339`; kiểm đủ dữ liệu/điều kiện, idempotency; quyết định chính thức phải từ server | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M11-02 | Hoàn thiện / cấp bằng | Trung bình | Hồ sơ sau bảo vệ lưu generic, chưa nối với checklist; nhãn ký/xét cấp bằng không hydrate đầy đủ sau tải lại. | Panel `m11`, mapping form sau bảo vệ, render trạng thái | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M12-01 | Biến động học vụ | Trung bình | Yêu cầu mới chỉ ghi lịch sử generic, chưa thêm vào bảng biến động; chưa có chuỗi duyệt/quyết định và áp dụng thay đổi. | Panel `m12`, mapping yêu cầu; phân biệt tiếp nhận đơn với quyết định đã có hiệu lực | Một phần — Đơn mới hiển thị và lưu được; luồng ban hành quyết định cần backend/quy tắc thẩm quyền. |
| M13-01 | Tra cứu / báo cáo | Trung bình | `openDegreeLookup()` và nút mở console vẫn chuyển sang `public`, trong khi form đã tách sang `lookup`. Người dùng không thấy kết quả đang xử lý. | `js/modules/management.js:1436`, `index.html:1838` | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M13-02 | Tra cứu / báo cáo | Trung bình | Ba nút báo cáo truyền tên XLSX/PDF nhưng đều rơi vào cùng nhánh CSV chỉ số cố định. Không tổng hợp từ state hiện tại; tạo Blob URL chưa thu hồi trong handler này. | `handleExportReport:1366`; chọn đúng loại báo cáo, ghi đúng định dạng thực xuất, lấy dữ liệu hiện hành | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M14-01 | Phân quyền / nhật ký | Nhỏ | Tiêu đề/ma trận ghi 06 vai trò trong khi hệ thống có 07, thiếu đồng bộ với quyền thực tế. | Panel `m14`, ma trận lấy từ cấu hình quyền duy nhất | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| M14-02 | Phân quyền / nhật ký | Trung bình | CSV chỉ escape dấu nháy, chưa chặn giá trị mở đầu bằng ký tự công thức. Nhật ký/IP được tạo cục bộ nhưng UI mô tả giám sát thời gian thực, không thể coi là audit server bất biến. | `handleExportAuditLog:1403`, `addAuditLog`, panel `m14`; tái sử dụng serializer an toàn và ghi rõ nguồn demo | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |

**Các nút tải tệp đang chỉ alert** xuất hiện ở M01–M12. Xử lý chung theo SYS-10 và SYS-14: có tệp thật thì tải đúng quyền; chưa có tệp thì vô hiệu hóa có lý do hoặc báo chưa kết nối, không báo đã tải/xuất thành công. Không tạo PDF minh chứng hay email giả để lấp chức năng.

## 5. Backend/API và kiểm thử

Đường dẫn backend dưới đây là **bên trong ZIP**, chưa giải nén/ghi đè vào project.

| Mã | Mức độ | Vấn đề / giới hạn đã xác định | Xử lý cần thiết | Trạng thái cuối |
|---|---|---|---|---|
| BE-01 | Nghiêm trọng | `Controllers/AuthController.cs` luôn trả Success=true, user cố định và token placeholder; chưa kiểm DB/mật khẩu. `Program.cs` chưa cấu hình xác thực JWT hoặc `UseAuthentication`. | Backend phải cung cấp auth thật, phiên/người dùng hiện tại, quyền và logout phù hợp; frontend không thể dùng token này làm bằng chứng đã xác thực. | Chờ backend — Backend login còn trả user/token tạm; cần xác thực và phiên thật. |
| BE-02 | Nghiêm trọng | `Controllers/PublicController.cs` luôn trả IsValid=true và lặp lại code/name do người dùng nhập, không truy vấn sổ bằng. | Viết truy vấn/validation thật và nhánh không tìm thấy; chưa được gọi đây là xác thực sổ gốc. Phối hợp LOOKUP-01/02. | Chờ backend — Backend diploma luôn IsValid=true; cần truy vấn sổ gốc và nhánh không tìm thấy. |
| BE-03 | Trung bình | ZIP chỉ có hai action login/diploma. Thiếu API luận án công khai, CRUD học vụ, điểm, thông báo, upload/download, đăng ký/reset/logout; chưa thấy cấu hình CORS cho frontend khác origin. | Chốt endpoint/DTO và môi trường test. Mặc định backend ở 5035/7143 theo launchSettings chỉ là cấu hình trong mã, chưa phải server đã chạy. Không tự bịa API. | Chờ backend — Cần API học vụ/tệp/thông báo/công khai và môi trường test. |
| QA-01 | Trung bình | Test cũ đòi `main`, logout, CRUD, table-controls và route `js/config.js` — bản hiện tại không có/nạp khác. Kết quả cũ không phải bằng chứng hiện tại; test integration đang mock API. | Sau khi chốt entry point, chỉnh selector/interception đúng mã hiện tại, thêm regression cho các lỗi đã tái hiện; tách test mock với test backend thật. | Xong frontend/demo — Đã sửa và kiểm thử phần frontend/demo. |
| QA-02 | Trung bình | Firefox Playwright không khởi động (`spawn UNKNOWN`); chưa có Firefox/Chrome bản cài phổ thông trong các vị trí thông dụng đã kiểm. Safari thật cần macOS/iOS, môi trường này là Windows. Máy chưa có lệnh `dotnet`, chưa chạy được backend/database. | Giữ trạng thái chưa xác minh cho Firefox/Safari/backend; chạy tiếp khi có môi trường tương ứng. Chromium for Testing và WebKit không được báo thành Chrome/Safari thật đã đạt. | Một phần — Đã chạy Firefox portable; Safari thật và backend/database chưa có môi trường nghiệm thu. |

## 6. Bằng chứng mới của lần rà soát này

- [Kết quả JSON và SHA-256 nguồn](docs/AUDIT_RESULTS_2026-10-18.json): 19 quan sát chức năng, kiểm kê nguồn và hình học từng view/module. Các quan sát mô tả lỗi tái hiện, **không phải 19 test chức năng đã đạt**.
- Chromium 151.0.7922.34, Edge 155.0.4283.45 và WebKit 26.5: mỗi engine đo **10 view + 14 module × 4 viewport = 96 tổ hợp** ở 360/768/1024/1440px. Mỗi engine có 17 tổ hợp có body rộng hơn viewport; một số tổ hợp là cùng màn hình được đo ở view và module, có trường hợp chỉ lệch 1px. Chưa thấy vượt body ở 1024/1440 trong phép đo này; header/nội dung và tương tác vẫn cần kiểm tra sau sửa.
- Không ghi nhận pageerror ở lượt tải mới mặc định trên ba engine; dữ liệu localStorage thiếu trường cố ý gây lỗi đã được ghi riêng. Không có id trùng hoặc handler `DTMS_MANAGEMENT.*` bị thiếu ở trang chính. Cả 19 JS/CJS qua `node --check`.
- [Ảnh 360px](docs/audit-mobile-360-2026-10-18.png), [ảnh 1440px](docs/audit-desktop-1440-2026-10-18.png). Đây là bằng chứng trước sửa, không phải giao diện nghiệm thu.
- Tất cả thao tác thêm/sửa/xét cấp bằng và payload kiểm XSS được chạy trong browser context riêng rồi đóng; không dùng dữ liệu trình duyệt cá nhân, không gọi backend thật, không gửi email/tin nhắn.

## 7. Trình tự đã thực hiện và các phụ thuộc

| Bước | Việc thực hiện | File sẽ đụng tới | Cách xác nhận |
|---|---|---|---|
| Phiên 1 / nền tảng | Chốt entry point; sửa XSS, lưu trữ, dialog, form/table component, semantic | `index.html`, `js/core/*`, `js/modules/management.js`, `js/data.js`, `js/ui.js` khi tái sử dụng | Luồng nạp duy nhất, không pageerror, input không bị thực thi, lỗi lưu giữ được form |
| Phiên 1 / giao diện | Sửa grid/header/menu và phần lặp cần thiết; giữ palette/font và bố cục hiện có | `css/core/*`, `css/components/app-components.css`, `css/pages/*`, `pages/*.html` theo giải pháp route | 360/768/1024/1440px; bảng cuộn riêng, modal/nút/form không bị cắt |
| Phiên 2 / chức năng | Phiên demo/logout/quyền; CRUD, tìm/lọc/sort/page; sửa form capture; đồng bộ các workflow và checklist | Module quản lý và các feature nhỏ; markup liên quan | Kiểm theo từng vai trò, reload, dữ liệu sai/rỗng/trùng và lỗi lưu/API |
| Phiên 2 / API thật | Nối đúng hợp đồng đã xác nhận và server có dữ liệu tin cậy | Config, API client và feature/service tương ứng | Test backend thật, xác nhận 401/403/404/409/422 và upload thật khi được cung cấp |
| Kết phiên | Ghi file đã sửa, kiểm thử thực chạy, phần tồn đọng và quy ước | `PROGRESS.md`, `TODO.md`, tài liệu kiểm thử | Không đánh dấu hoàn thành các phần chưa có môi trường/API |

## 8. Checklist nghiệm thu dự kiến

- [ ] Từ đường dẫn trực tiếp vào đúng trang; Back/Forward/reload giữ ngữ cảnh hợp lý.
- [ ] Đăng nhập/đăng xuất đúng chế độ; sau thoát không thao tác quản lý; persona demo có nhãn rõ.
- [ ] NCS chỉ thấy hồ sơ được phép; NHD chỉ thao tác NCS được phân công; handler kiểm quyền.
- [ ] Mọi danh sách cần thiết có tìm/lọc/sort/page, thông tin số bản ghi và trạng thái rỗng.
- [ ] Form báo lỗi tiếng Việt rõ trường; không mất nội dung khi lỗi; gửi kép không tạo bản ghi kép.
- [ ] Điểm chuyên đề và kết quả tiến độ cập nhật thật; reload vẫn khớp; bản nộp mới chuyển chờ đánh giá.
- [ ] Định mức NHD không tăng vì gửi trùng, không tự giảm sau reload.
- [ ] Bảng điểm, dashboard và bảng kiểm dùng cùng dữ liệu; thiếu điều kiện không xét bảo vệ/cấp bằng.
- [ ] Tra cứu sai/không tìm thấy/schema lỗi không được báo văn bằng hợp lệ.
- [ ] Nút tải tạo đúng tệp; khi chưa có tệp/dịch vụ thì thông báo đúng thực tế.
- [ ] Không thực thi HTML từ tên tệp/tiêu đề; CSV không biến dữ liệu người nhập thành công thức.
- [ ] Không bị cắt nội dung ở 360/768/1024/1440px; menu, bàn phím, focus, modal hoạt động.
- [ ] Kiểm lại console, link/ảnh local và tiếng Việt; ghi riêng kết quả Chrome, Edge, Firefox, Safari thật.
- [ ] Chỉ ghi nhận API/backend đã đạt sau kiểm thử với server thật, dữ liệu và tài khoản phù hợp.


## 9. Kết quả bàn giao cuối

- Kiểm thử mới: **212/212 nhóm đạt**; 19 chức năng + 16 workflow/API mock + 18 hồi quy trên mỗi engine Chromium, Edge, Firefox, WebKit.
- Modal: **100 trường hợp/engine**, tổng 400; 25 modal × 4 viewport.
- Xem [báo cáo tổng hợp](docs/BAO_CAO_HOAN_THIEN_FRONTEND_2026-10-18.md), [kiểm thử](docs/TESTING.md) và [trạng thái máy đọc](docs/ISSUE_STATUS_2026-10-18.json).
- Chưa nghiệm thu backend thật/Safari thật; không coi những mục phụ thuộc đó là hoàn thành.

## 10. Lỗi bổ sung sau bàn giao

Mục dưới đây phát sinh từ ảnh phản hồi của người dùng, ghi riêng ngoài 64 mục audit ban đầu.

| Mã | Trang | Mức độ | Vấn đề | Trạng thái |
|---|---|---|---|---|
| UI-01 | Profile | Trung bình | Nhãn ba nút nghiệp vụ bị ép vào cột 30px; thiếu số thứ tự và tiêu đề nhóm, khối thông tin dàn ngang không hợp lý. | Xong — sửa markup, flex/responsive và bố cục theo ảnh tham chiếu; 288/288 kiểm thử Profile đạt. Xem `docs/TEST_PROFILE_LAYOUT_2026-10-18.json`. |
| UI-02 | Toàn bộ giao diện / kho mã | Trung bình | Nhãn thử nghiệm xuất hiện trên thanh điều hướng, hồ sơ, biểu mẫu, thông báo và tệp xuất; thiếu cấu hình kho mã và tài liệu giới thiệu phù hợp GitHub. | Xong phạm vi giao diện/kho mã — chuẩn hóa nội dung, phiên, ghi nhớ email, CSV/JSON và tài liệu/cấu hình. 216/216 nhóm chức năng, 288/288 trường hợp Profile đạt; kiểm source đạt. Chi tiết tại `docs/CHUAN_HOA_GITHUB_2026-10-18.md`. |
