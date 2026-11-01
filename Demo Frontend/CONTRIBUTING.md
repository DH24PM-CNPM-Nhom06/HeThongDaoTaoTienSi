# Quy ước đóng góp

## Phát triển

1. Đọc README, PROGRESS và TODO trước khi sửa.
2. Chạy `node scripts/serve.cjs` và mở trang qua HTTP.
3. Giữ kiến trúc HTML/CSS/JavaScript hiện có; chỉ sửa phần liên quan đến yêu cầu.
4. Chạy `node scripts/check-source.cjs` và các bài kiểm trình duyệt liên quan trước khi gửi thay đổi.

## Đặt tên và tổ chức

- JavaScript dùng camelCase; CSS và `data-*` dùng kebab-case.
- Giữ ID phân hệ `m01`–`m14`, `panel-mXX`, `modal-*`, `form-*` và route hiện có.
- Sửa entry point đang được nạp theo [js/README.md](js/README.md); tránh sửa nhầm bản mã cũ.
- Tái sử dụng component, hàm validation, table control và modal đang có.
- Chuỗi hiển thị dùng tiếng Việt đầy đủ dấu, rõ hành động và hỗ trợ bản dịch khi có.
- Khi đổi cấu trúc dữ liệu, bổ sung migration và giữ dữ liệu đã lưu của người dùng.

## API và dữ liệu

Cấu hình môi trường theo [API-INTEGRATION.md](API-INTEGRATION.md). Không commit secret, mật khẩu, chuỗi kết nối hoặc bản sao dữ liệu người dùng. Không đưa tệp xuất cá nhân vào kho mã. Giữ rõ kết quả kiểm frontend, API mô phỏng và backend thực tế trong mô tả thay đổi.

## Nội dung thay đổi

Mô tả vấn đề, hành vi sau sửa, file liên quan và cách kiểm tra. Với giao diện, đính kèm ảnh desktop/mobile; với dữ liệu, kiểm tra thêm reload và lỗi lưu. Cập nhật PROGRESS/TODO khi hoàn thành một nhóm công việc.
