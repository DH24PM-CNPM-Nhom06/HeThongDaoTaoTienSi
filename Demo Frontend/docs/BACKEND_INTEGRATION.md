# Bàn giao backend sau sửa frontend — 18/10/2026

Hợp đồng và cấu hình hiện hành: [API-INTEGRATION.md](../API-INTEGRATION.md). Đây là tài liệu nguồn duy nhất cho endpoint mà client đang gọi.

- Đã đối chiếu Project-Backend.zip, không ghi đè hoặc sửa source backend trong ZIP.
- Hai action login/diploma còn là stub; backend cần bỏ response cố định, kiểm DB, xác thực, quyền và CORS.
- Client đã đổi diploma sang GET đúng đường dẫn/DTO, nhưng khóa dịch vụ mặc định để tránh xác nhận bằng giả từ stub.
- Các mutation học vụ, workflow và metadata tệp hiện lưu localStorage schema 3, có validation/rollback; không phải transaction trên database.
- `workflowSubmissions` đã chuyển vào cùng state chính. Khi tích hợp API, map các field có nghĩa sang DTO/fileId; không gửi metadata như thể tệp đã upload.
- Phân công dùng candidate ID; quyền theo hồ sơ cục bộ không thay thế quan hệ ID và phạm vi truy cập phía máy chủ.
- Các mốc tín chỉ, điểm, công bố, quota và phiếu trong UI là tham số mặc định cần nhà trường xác nhận theo CTĐT trước khi triển khai.
- Cần cung cấp môi trường test, tài khoản theo vai trò, dữ liệu không nhạy cảm và quy tắc nghiệp vụ trước nghiệm thu luồng thật.

Xem [báo cáo](BAO_CAO_HOAN_THIEN_FRONTEND_2026-10-18.md), [TODO](../TODO.md), [PROGRESS](../PROGRESS.md) để biết phần đã sửa và các phụ thuộc còn mở.
