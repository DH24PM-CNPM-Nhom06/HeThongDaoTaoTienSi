# PROGRESS — Bàn giao DTMS ngày 18/10/2026

Cập nhật mới nhất: đã chuẩn hóa nội dung giao diện và kho mã để đưa frontend lên GitHub; trước đó đã sửa bố cục thẻ nghiệp vụ Profile. Xem các mục cập nhật ở cuối file và `docs/CHUAN_HOA_GITHUB_2026-10-18.md`.

## Kết quả phiên 1 và phiên 2

Đã thực hiện các bước frontend của cả hai phiên trên 10 view và 14 phân hệ hiện có, giữ HTML/CSS/JS và thiết kế Academic Studio. **212/212 nhóm kiểm thử client đạt** trên Chromium, Edge, Firefox và WebKit; 400 trường hợp modal đạt.

Backlog 64 mục: **55 xong frontend/demo, 6 một phần, 3 chờ backend**. Đây là frontend/demo đã hoàn thiện, chưa phải bản nghiệp vụ sản xuất có xác thực/database/tệp/quyết định thật. Không đánh dấu các phụ thuộc chưa chạy được là xong.

Người dùng đã xem audit Bước 0 và yêu cầu tiếp tục tất cả các bước. Không cần xin duyệt lại các sửa frontend trong phạm vi đó.

## Đã hoàn thành

- Entry point duy nhất nạp đúng data/UI/core/features/module; hợp nhất các sửa tốt từ source cũ và giữ các form/view mới; bỏ 11 hàm trùng.
- Toast/HTML an toàn, CSV chống công thức; dữ liệu thiếu trường/hỏng không làm crash, có recovery; lỗi lưu rollback và giữ form.
- Schema 3 lưu hồ sơ và `workflowSubmissions` trong cùng khóa `DTMS_MANAGEMENT_APP_STATE_V2`. Nhập một chiều lịch sử từ `DTMS_WORKFLOW_SUBMISSIONS_V1`; không xóa dữ liệu cũ khi khởi động.
- Menu mobile, bảng cuộn riêng, form/select trên WebKit, focus/dialog/Tab/Escape, landmark/main/label và route hash/Back/Forward.
- Trang tách `pages/*.html` về SPA chung, không giữ bản sao markup thiếu script; ảnh campus và đường vào 10 view hoạt động.
- Phiên demo bằng email không mật khẩu, nhớ email, logout, kiểm quyền handler, scope NCS/NHD, CRUD hồ sơ, filter/sort/page dùng chung.
- Sửa form chấm chuyên đề/đánh giá tiến độ bị generic capture chặn; lưu điểm/nhận xét/lịch sử, có kiểm phạm vi NCS được phân công.
- Kế hoạch duyệt tuần tự, quota không reset/tăng lặp, phân công theo candidate ID; nộp lại tiểu luận chuyển chờ chấm.
- Hiển thị lại workflow, báo cáo 6 kỳ, đề cương, phiên bản luận án và đơn biến động. Không tự áp thay đổi khi chưa có quyết định.
- Checklist dùng 12 TC có thật trong bảng mẫu; chặn ghi nhận cấp bằng khi thiếu điều kiện/NHD/phiếu/hồ sơ, không tạo điểm giả.
- Ba CSV dùng nội dung và dữ liệu khác nhau; thống kê hiện tại từ state; nhật ký cục bộ được nhận diện đúng.
- Thông báo/luận án dùng component danh sách chung; tìm không dấu, lọc danh mục, sort/page, loading/error/empty/retry.
- Diploma đổi sang GET đúng path/DTO của ZIP; schema/mã/tên được kiểm, không chấp nhận object tùy ý. Khóa dịch vụ mặc định vì backend IsValid luôn true.
- Cập nhật README, source map, API contract, TODO, kết quả test, báo cáo Markdown và PDF 6 trang; đã render/xem đủ 6 trang, không có lỗi bố cục/font. Công cụ tái xuất: `scripts/build-report.py`.

## Kiểm thử cuối

| Engine | Chức năng | Workflow/API mock | Hồi quy | Modal |
|---|---:|---:|---:|---:|
| Chromium 151.0.7922.34 | 19/19 | 16/16 | 18/18 | 100 |
| Edge 155.0.4283.45 | 19/19 | 16/16 | 18/18 | 100 |
| Firefox 153.0 portable | 19/19 | 16/16 | 18/18 | 100 |
| WebKit 26.5 Windows | 19/19 | 16/16 | 18/18 | 100 |

9 viewport: 320/360/390/430/768/1024/1366/1440/1920px. Regression modal: 25 × 360/768/1024/1440px. Không pageerror trong các luồng được kiểm; local assets/ảnh campus/id/handler/label/route được kiểm.

Nguồn: `docs/TEST_SUMMARY_2026-10-18.json`, `TEST_RESULTS_*`, `TEST_INTEGRATION_*`, `TEST_REGRESSIONS_*`, `TEST_MODAL_*`. API trong test là mock, không phải server thật. WebKit không phải Safari thật.

Firefox cache mặc định trên máy vẫn có lỗi khởi động, kể cả sau tải lại; đã chạy thành công bằng executable portable riêng. Lệnh thực chạy:

```powershell
$env:DTMS_FIREFOX_EXECUTABLE='C:\Users\Vinh\AppData\Local\Temp\dtms-browser-test\firefox-1538\firefox\firefox.exe'
node scripts/check-all.cjs chromium msedge firefox webkit
```

Nếu thư mục Temp bị dọn, cài lại browser test vào vị trí phù hợp và cập nhật biến trên. Không sửa hoặc dùng profile Firefox cá nhân.

## Các mục còn mở

- `BE-01`: login backend trả user/token tạm, chưa kiểm DB/JWT/phiên thật.
- `BE-02`: diploma backend luôn IsValid=true, chưa truy vấn sổ gốc.
- `BE-03`: chưa có API nghiệp vụ/upload/download/thông báo/công khai/báo cáo chính thức trong ZIP.
- `AUTH-02`: nhớ email/hỗ trợ xong; đăng ký/reset thật cần chính sách cấp tài khoản và API.
- `PUBLIC-01`, `LOOKUP-01`: client/adapter xong; API thật còn thiếu hoặc stub.
- `M10-02`, `M12-01`: phiếu/đơn demo có lưu/hiển thị; hội đồng, chuỗi thẩm quyền và quyết định chính thức cần backend.
- `QA-02`: đã bổ sung Firefox; Safari thật và backend/database thật chưa có môi trường.
- Nghiệp vụ thạc sĩ/tuyển sinh riêng chưa có model/API/quy tắc; không tự áp điều kiện tiến sĩ.
- Chưa có Figma/bản thiết kế cuối; giữ style hiện tại, chưa xác nhận pixel-perfect.
- Các mốc tín chỉ/quota/điểm/công bố/phiếu là quy tắc demo cần nhà trường chốt theo CTĐT.

## File và kiến trúc

23 tệp mã nguồn sửa và 3 tệp JS/CJS thêm được liệt kê đầy đủ ở `docs/CHANGESET_2026-10-18.json`.

- Shell: `index.html`; CSS theo thứ tự `css/app.css`, `css/management.css`, `css/responsive.css`.
- JS theo thứ tự: data → ui → config → api → collections → notifications/public-theses/degree-lookup/assistant → core/app → modules/management.
- `js/data.js`, `js/ui.js` được tái sử dụng, không phải thư viện mới. Source JS gốc và legacy được giữ, không nạp đồng thời với core/modules.
- Quản lý liên quan quyền/state/workflow ở `js/modules/management.js`; form chấm mới được giữ và nối đúng listener chuyên biệt.
- Config môi trường qua `DTMS_RUNTIME_CONFIG`; không hardcode máy chủ sống hoặc đưa secret vào frontend.
- `DEGREE_SERVICE_READY` mặc định false; không bật cho API stub.

## Bản sao và môi trường

Workspace không có Git; không tạo commit hoặc git diff giả. Bản sao trước sửa:

`D:/Project/HeThongQuanLyHocVuHocVienSauDaiHoc-main/DTMS-backups/frontend-before-repair-20261018-112148.zip`

Audit trước sửa, SHA-256 và ảnh gốc ở `docs/AUDIT_RESULTS_2026-10-18.json`. ZIP backend gốc không bị thay đổi. Môi trường không có lệnh dotnet hoặc database test được cung cấp; không chạy backend thật.

Các báo cáo ngày 17/10 trong docs là lịch sử; không dùng làm bằng chứng cho bản mới.

## Quy ước và việc phiên sau làm

Giữ `m01`–`m14`, `panel-mXX`, `modal-*`, `form-*`; JS camelCase, CSS kebab-case, hook `data-*`. Dùng ID ổn định cho phân công và tên field có nghĩa; giữ migration khi đổi schema.

Phiên sau đọc file này, TODO và báo cáo rồi nối các API đã thật sự được cung cấp, kiểm phiên/quyền server và upload/fileId. Không cần audit lại từ đầu hoặc reset dữ liệu mẫu để né lỗi. Nếu sửa thêm, ghi file/hành vi/test thực chạy và cập nhật trạng thái từng mã TODO.

Chạy frontend: `node scripts/serve.cjs`, mở `http://127.0.0.1:4173`. Đọc checklist người dùng ở cuối báo cáo và TODO.

## Cập nhật giao diện Profile — 18/10/2026

- Nguyên nhân: markup nút chỉ có nhãn và mũi tên, trong khi CSS chia ba cột; nhãn bị đặt vào cột số thứ tự rộng 30px. Kiểm thử tràn trang trước đó không phát hiện chữ bị ép bên trong thẻ.
- `js/modules/management.js`: phục hồi ba thành phần số thứ tự, nhãn và mũi tên; thêm tiêu đề nhóm, số chức năng theo quyền, bố cục thông tin hai phần và mô tả vai trò ở đầu trang. Dashboard dùng `section` luôn hiển thị thay cho `details`, phù hợp trang Profile riêng và ảnh tham chiếu. Giữ dữ liệu, quyền và hành vi mở phân hệ hiện tại; không phục hồi số liệu hoặc hạn mẫu từ ảnh cũ.
- `css/pages/management-responsive.css`: thẻ dùng flex để tên được giãn và xuống dòng tự nhiên; danh sách tự chia cột ở desktop, một cột ở màn hình nhỏ. Nhãn ghi chú được xuống dòng. Flex cũng tránh lỗi tính chiều cao thẻ trong grid khi resize ở WebKit.
- `css/responsive.css`: bỏ hai rule dành cho summary thu gọn đã không còn sử dụng.
- `scripts/check-profile-layout.cjs`: bổ sung hồi quy kiểm chiều rộng nhãn, chiều cao thẻ, thứ tự các phần, tràn ngang và nhấn mở từng phân hệ. Chạy trong context riêng; kiểm cả HTTP và mở `index.html` trực tiếp qua `file://`.
- Ảnh kết quả: `docs/profile-fixed-1440.png`, `docs/profile-fixed-360.png`. Báo cáo bàn giao PDF trước đó là ảnh chụp trạng thái trước lần sửa này; không tái xuất trong lần sửa giao diện.
- Kết quả cuối: **288/288 trường hợp đạt**, 72 trên mỗi engine Chromium/Edge/Firefox/WebKit. Kiểm 360/768/1024/1440/1920px × 7 vai trò × VI/EN, thêm `file://` ở 360/1440px trên từng engine. Đã nhấn mọi nút nghiệp vụ theo từng vai trò ở 1440px và xem ảnh desktop/mobile. Không có `pageerror`; WebKit không thay thế nghiệm thu Safari thật. Nguồn: `docs/TEST_PROFILE_LAYOUT_2026-10-18.json`. Các số kiểm thử 212/212 phía trên thuộc đợt bàn giao trước, không phải toàn bộ bộ test được chạy lại trong lần sửa này.

## Chuẩn hóa giao diện và chuẩn bị GitHub — 18/10/2026

- Bỏ banner thử nghiệm và các nhãn tương ứng khỏi giao diện chính, hồ sơ, form, bảng kiểm, trạng thái, toast và báo cáo. Nút trên thanh điều hướng là Bàn làm việc; khi đã kết thúc phiên là Truy cập hệ thống.
- Sửa hành vi mở bàn làm việc; ẩn thông tin người dùng/nút đổi vai trò khi kết thúc phiên. Chuyển khôi phục dữ liệu vào M14 và giữ xác nhận, kiểm quyền. Hộp truy cập dùng email hồ sơ, bỏ trường mật khẩu bị vô hiệu hóa; chưa thay cơ chế hiện tại bằng xác thực server.
- Khóa ghi nhớ email mới: `dtms-remembered-email`. Vẫn đọc khóa cũ khi chưa có khóa mới; API reset cũ được giữ làm alias. Dữ liệu học vụ và lịch sử người dùng không bị reset hoặc viết lại để sửa cách diễn đạt.
- Báo cáo CSV giữ tên nghiệp vụ; bản sao dùng `DTMS_Backup.json`. Dịch vụ chưa khả dụng báo trạng thái ngắn gọn, hướng dẫn cấu hình chuyển về tài liệu kỹ thuật.
- Cập nhật `index.html`, `css/responsive.css`, `js/modules/management.js`, `js/core/app.js`, `js/core/api.js`, `js/data.js`, ba feature assistant/public-theses/degree-lookup; README, API-INTEGRATION, bản đồ source và tài liệu backend.
- Thêm `.gitignore`, `.gitattributes`, `package.json`, `CONTRIBUTING.md`, `scripts/check-source.cjs`. Ghi file thay đổi tại `docs/CHUAN_HOA_GITHUB_2026-10-18.md`; ảnh dùng trong README tại `docs/screenshots/`.
- Bản sao trước chỉnh: `D:/Project/HeThongQuanLyHocVuHocVienSauDaiHoc-main/DTMS-backups/frontend-before-github-polish-20261018-122957.zip`.
- Giả định phạm vi: chuẩn hóa frontend và kho mã hiện có. Chưa nhận URL backend đang chạy để tích hợp; các phụ thuộc BE-01/BE-02/BE-03 giữ trạng thái chờ theo TODO. Việc bỏ nhãn thử nghiệm không xác nhận DB, mật khẩu, upload, email hoặc chữ ký số đã hoạt động.
- Kết quả sau chuẩn hóa: **216/216 nhóm đạt** (20 chức năng + 16 workflow/API mô phỏng + 18 hồi quy trên mỗi engine), **288/288 trường hợp Profile đạt** trên Chromium/Edge/Firefox/WebKit. Check source: 24 tệp JS, 12 trang HTML, 48 tham chiếu local đạt. Đã kiểm thêm mở bàn làm việc, kết thúc phiên, nhớ email/reload và đọc khóa cũ; xem lại ảnh desktop/mobile.
- Nguồn kết quả hiện tại: `docs/TEST_GITHUB_PREPARATION_2026-10-18.json`. Lượt kiểm có nội dung mong đợi cũ đã được cập nhật theo copy mới; API mock dùng timeout 8 giây ở ca bình thường và 150ms riêng ca timeout. Đã chạy lại các lượt lỗi; frontend test đóng browser cả khi lỗi và chờ DOMContentLoaded để tránh phụ thuộc font ngoài.
- Lệnh `node scripts/check-source.cjs`, `node scripts/check-all.cjs ...`, các suite riêng và `check-profile-layout.cjs` đã được thực thi bằng Node. Máy agent không có lệnh npm; các script npm là tiện ích tương đương được khai báo cho máy đã cài npm, không có phụ thuộc runtime mới.
