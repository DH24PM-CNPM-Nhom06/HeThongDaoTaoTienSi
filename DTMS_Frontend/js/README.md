# Bản đồ source DTMS

## Entry point duy nhất

`index.html` chứa shell và 10 view. Các HTML trong `pages/` chuyển về route tương ứng; không sao chép màn quản lý hoặc duy trì JS riêng.

## JavaScript theo thứ tự nạp

1. `js/data.js`: đọc/ghi JSON an toàn, preferences, recovery và CSV chống công thức.
2. `js/ui.js`: validation, bảng, focus/modal, menu mobile và kéo thả.
3. `js/core/config.js`, `js/core/api.js`: cấu hình môi trường, HTTP/JSON/timeout và hợp đồng diploma.
4. `js/features/collections.js`: tìm/lọc/sort/page cho danh sách thẻ.
5. `js/features/notifications.js`, `public-theses.js`, `degree-lookup.js`, `assistant.js`: từng feature độc lập.
6. `js/core/app.js`: router hash/history, bản dịch, toast an toàn, vai trò giới thiệu và roadmap.
7. `js/modules/management.js`: state schema 3, phiên làm việc cục bộ, quyền, CRUD và 14 nghiệp vụ; chứa các form chấm điểm mới.

Không nạp đồng thời các bản `js/app.js`, `management.js`, `config.js`, `api.js` ở thư mục JS gốc: đó là source cũ được giữ để tham chiếu. `home.js` và `legacy/` cũng không thuộc entry đang chạy.

## CSS

- `css/app.css`: import tokens, layout, component và breakpoint cơ bản.
- `css/management.css`: import style và breakpoint của trang quản lý.
- `css/responsive.css`: override cuối cho shell, drawer, bảng, form, dialog và print; phải nạp sau hai entry trên.

Không sửa nhầm CSS legacy hoặc đưa bản CSS khác lên sau override này.

## State và naming

Khóa `DTMS_MANAGEMENT_APP_STATE_V2` được giữ để tương thích; thuộc tính `schemaVersion` hiện là 3. `workflowSubmissions` nằm trong cùng state với hồ sơ. Không reset dữ liệu để né schema lỗi.

Giữ `m01`–`m14`, `panel-mXX`, `modal-*`, `form-*`; camelCase trong JS, kebab-case cho class CSS và `data-*`. Phân công mới dùng candidate ID; dữ liệu phân công cũ theo tên được ánh xạ khi đọc.

Các file báo cáo ngày 17/10 là lịch sử. Bản bàn giao hiện tại ở `PROGRESS.md`, `TODO.md` và báo cáo ngày 18/10/2026.
