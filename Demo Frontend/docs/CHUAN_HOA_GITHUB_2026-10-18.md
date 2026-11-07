# Chuẩn hóa giao diện và kho mã DTMS — 18/10/2026

Đã chuẩn hóa nội dung giao diện theo thuật ngữ học vụ và chuẩn bị các tệp cần thiết để đưa frontend lên GitHub. Giữ kiến trúc HTML/CSS/JavaScript và các luồng nghiệp vụ hiện có.

## Thay đổi giao diện

- Bỏ banner thử nghiệm bên dưới thanh điều hướng.
- Nút đầu trang mở Bàn làm việc; khi kết thúc phiên, nút chuyển thành Truy cập hệ thống. Thông tin người dùng và nút đổi vai trò được ẩn sau khi kết thúc phiên.
- Chuẩn hóa tiêu đề, biểu mẫu, trạng thái hồ sơ, thông báo, bảng kiểm, nhật ký và các nhãn VI/EN liên quan.
- Hộp truy cập dùng email để chọn hồ sơ; bỏ trường mật khẩu bị vô hiệu hóa. Việc xác thực phía máy chủ được mô tả trong tài liệu tích hợp.
- Chuyển thao tác khôi phục dữ liệu vào phân hệ quản trị M14. Giữ kiểm quyền và hộp xác nhận trước khi thay thế dữ liệu.
- Báo cáo CSV giữ tên báo cáo được chọn; bản sao dữ liệu có tên `DTMS_Backup.json`.
- Dịch vụ chưa khả dụng dùng thông báo hỗ trợ ngắn gọn. Tình trạng tích hợp và hướng cấu hình được ghi trong tài liệu kỹ thuật.

## Tệp liên quan

| Tệp | Nội dung |
|---|---|
| `index.html` | Thanh điều hướng, hộp truy cập, nhãn học vụ, khôi phục dữ liệu trong M14 |
| `css/responsive.css` | Bỏ style dành cho banner đã gỡ |
| `js/modules/management.js` | Nội dung động, nút bàn làm việc, trạng thái phiên, ghi nhớ email và tên tệp xuất |
| `js/core/app.js` | Bản dịch cho nội dung mới |
| `js/core/api.js`, `js/features/degree-lookup.js` | Thông báo dịch vụ và lỗi kết nối |
| `js/features/public-theses.js`, `js/features/assistant.js`, `js/data.js` | Nội dung danh mục, hướng dẫn và thông báo khôi phục |
| `README.md`, `CONTRIBUTING.md`, `js/README.md` | Mô tả dự án, cách chạy, kiểm tra và quy ước |
| `.gitignore`, `.gitattributes`, `package.json` | Quy tắc loại trừ tệp cục bộ, xuống dòng và lệnh chạy/kiểm tra |
| `scripts/check-source.cjs` | Kiểm tra cú pháp JavaScript, tài nguyên HTML và cấu hình package bằng Node.js |
| `scripts/check-frontend.cjs` | Kiểm thêm nút bàn làm việc, kết thúc phiên, email đã nhớ và tương thích khóa cũ |
| `scripts/check-regressions.cjs`, `scripts/check-integration.cjs` | Cập nhật tên tệp/nội dung mong đợi; timeout ngắn chỉ áp dụng bài kiểm timeout |
| `API-INTEGRATION.md`, `docs/BACKEND_INTEGRATION.md` | Ghi đúng cơ chế truy cập, lưu trữ và trạng thái API |
| `PROGRESS.md`, `TODO.md` | Nhật ký công việc và mục bổ sung sau bàn giao |

## Tương thích dữ liệu

Giữ state schema 3 và các khóa hồ sơ hiện có. Ghi nhớ email dùng khóa mới `dtms-remembered-email`; vẫn đọc `dtms-demo-email` từ bản cũ, chuyển sang khóa mới khi người dùng tiếp tục phiên. API `resetDemoData` cũ còn là alias để tương thích; giao diện gọi `resetWorkspaceData`.

Không sửa nội dung bản ghi do người dùng nhập hoặc nhật ký đã lưu để thay thế từ ngữ trong lịch sử. Các báo cáo có ngày tháng trước lần chỉnh này được giữ làm lịch sử kiểm tra.

## Trạng thái tích hợp

Frontend hiện lưu dữ liệu nghiệp vụ trên thiết bị. Truy cập bằng email/vai trò là cơ chế chọn hồ sơ cục bộ; xác thực mật khẩu và kiểm quyền server cần API tương ứng. Tệp mới lưu metadata. Upload/download nội dung, email, chữ ký số, Turnitin và database cần backend. Các thay đổi về trình bày không thay thế việc tích hợp những dịch vụ này.

Bản sao trước sửa nằm ngoài kho mã tại `DTMS-backups/frontend-before-github-polish-20261018-122957.zip` trong thư mục cha của frontend.

## Kiểm tra sau chuẩn hóa

| Engine | Chức năng | Workflow/API mô phỏng | Hồi quy | Bố cục Profile |
|---|---:|---:|---:|---:|
| Chromium | 20/20 | 16/16 | 18/18 | 72/72 |
| Edge | 20/20 | 16/16 | 18/18 | 72/72 |
| Firefox | 20/20 | 16/16 | 18/18 | 72/72 |
| WebKit | 20/20 | 16/16 | 18/18 | 72/72 |

Tổng cộng **216/216 nhóm kiểm tra chức năng** và **288/288 trường hợp bố cục Profile** đạt. Kiểm tra source đạt 24 tệp JavaScript, 12 trang HTML và 48 tham chiếu tài nguyên cục bộ. Các luồng được kiểm không có JavaScript runtime error. WebKit không thay thế nghiệm thu Safari thật.

Nguồn: [kết quả tổng hợp](TEST_GITHUB_PREPARATION_2026-10-18.json), `TEST_RESULTS_*`, `TEST_INTEGRATION_*`, `TEST_REGRESSIONS_*` và `TEST_PROFILE_LAYOUT_2026-10-18.json`. Các lượt chưa hoàn tất hoặc dùng thông báo mong đợi cũ đã được chạy lại; bảng trên dùng kết quả cuối đã đạt. Kiểm thử chức năng chờ DOMContentLoaded để không phụ thuộc thời điểm tải font từ bên ngoài; tiến trình trình duyệt được đóng cả khi kiểm tra gặp lỗi.

Ảnh đã xem lại: [desktop](screenshots/profile-desktop.png), [mobile](screenshots/profile-mobile.png). README sử dụng các ảnh này.
