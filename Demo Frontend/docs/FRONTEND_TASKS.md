# Tiến độ frontend

> Bảng lịch sử. Trạng thái hiện hành ngày 18/10/2026 ở `../PROGRESS.md` và `../TODO.md`; không dùng bảng dưới đây để xác nhận backend hoặc bản core/modules mới đã đạt.

| STT | Nhóm công việc | Công việc | Trạng thái | File liên quan |
|---|---|---|---|---|
| 1 | Kiểm kê | Đọc kiến trúc, 7 view, 14 module, nguồn dữ liệu | Xong | FRONTEND_AUDIT.md |
| 2 | Nền tảng | Bỏ 11 hàm trùng, lưu dữ liệu an toàn, validation | Xong | js/management.js, js/ui.js, js/data.js |
| 3 | Phiên / quyền | Demo không dùng mật khẩu, đăng xuất, chặn handler, 7 vai trò | Xong trong demo | js/management.js, index.html |
| 4 | Hồ sơ / công bố | CRUD và chống trùng mã/email/DOI; giữ hồ sơ mẫu | Xong trong demo | js/management.js |
| 5 | Workflow | Lưu/hiện 10 form, duyệt kế hoạch/đề cương, chấm điểm, điều kiện bảo vệ | Xong phần demo; quyết định thật cần backend | js/management.js |
| 6 | Danh sách | 15 bảng có tìm, lọc trạng thái, sắp xếp, phân trang, số bản ghi | Xong | js/ui.js |
| 7 | Giao diện | Mobile drawer, bảng cuộn, modal focus/Tab/Escape, upload và cảm ứng | Xong | css/responsive.css, js/ui.js |
| 8 | API | Nạp adapter luận án, loading/lỗi/rỗng/thử lại, bàn giao hợp đồng | Xong client; chưa có server thật | js/api.js, js/app.js, BACKEND_INTEGRATION.md |
| 9 | Kiểm thử | Tương tác, 9 chiều rộng, 3 engine chạy được và API mô phỏng | Xong: 105 nhóm + 69 modal/viewport; Firefox/Safari thật chưa xác minh | scripts, TESTING.md |
| 10 | Bàn giao | Báo cáo, hạn chế, hướng dẫn chạy và API | Xong | docs, README.md |

## Việc nhóm backend làm tiếp

| Ưu tiên | Công việc | Trạng thái |
|---|---|---|
| P0 | Auth/me/logout và quyền theo từng hồ sơ/đơn vị | Chưa có backend trong checkout |
| P0 | Database và CRUD NCS, chống trùng, transaction, version | Chưa có backend trong checkout |
| P1 | Upload/kho tệp và download có kiểm quyền | Hiện chỉ metadata local |
| P1 | Bảng điểm đầy đủ, quy tắc nghiệp vụ và phê duyệt có audit server | Hiện chỉ mô phỏng |
| P1 | API kế hoạch, báo cáo, công bố, luận án và thay đổi học vụ | Hiện localStorage |
| P2 | Email, Turnitin, nguồn WoS/Scopus, chữ ký số, sổ bằng và export chính thức | Chưa kết nối |
