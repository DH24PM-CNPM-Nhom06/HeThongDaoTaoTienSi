# DTMS – Dữ liệu minh họa cho kho luận án và thông báo chung

## Mục tiêu

Bản này kế thừa `DTMS_Frontend_M01_Form_HoSo_DaSua` (đã sửa form M01); giữ bố cục, CSS và toàn bộ module quản lý. Thêm **7 luận án giả định** và **8 thông báo giả định** trong `js/demo/sample-content.js`.

- **Không sửa backend, CSDL, hoặc hợp đồng API.**
- Không có yêu cầu POST/PUT/DELETE; dữ liệu demo không được gửi tới máy chủ, không lưu localStorage.
- Nội dung/tên người/ngày/đơn vị mang tính minh họa, không phải thông báo của trường hoặc hồ sơ luận án thật.
- Các luận án demo **không có liên kết PDF giả**.

## Chạy thử

1. Giải nén vào thư mục riêng.
2. Mở PowerShell trong thư mục này, chạy `npm start`.
3. Mở `http://127.0.0.1:4173/#public` và `http://127.0.0.1:4173/#notifications`.
4. Thử tìm tên luận án, lọc ngành, sắp xếp, phân trang; thử tìm thông báo, lọc loại, sắp xếp, phân trang.
5. Trong kho luận án, bấm **Xem dữ liệu từ API** để kiểm tra backend thật. Nếu dữ liệu API lỗi, thông báo lỗi sẽ hiện rõ (không giả làm dữ liệu thật); bấm **Xem dữ liệu minh họa** để quay lại.

## Sau khi có API thông báo / luận án hoàn chỉnh

- Thay nội dung demo bằng dữ liệu API; không đưa dữ liệu demo này vào SQL hoặc production.
- Khi bàn giao cho nhóm frontend, giữ nhãn minh họa cho đến khi nối dữ liệu thật.

## File thay đổi

- `index.html`: thanh trạng thái chế độ demo/API và nội dung giải thích.
- `js/demo/sample-content.js`: dữ liệu mẫu.
- `js/features/public-theses.js`: hiển thị mẫu mặc định, chuyển đổi API thật khi được yêu cầu.
- `js/features/notifications.js`: tạo thẻ thông báo từ dữ liệu demo và gắn nhãn.
- `css/pages/management-responsive.css`: một số kiểu hiển thị cho nhãn demo.

## Kiểm tra tĩnh

Chạy `npm run check` và `node scripts/test-api-contracts.cjs`. Sau đó có thể chạy `node scripts/test-demo-content.cjs`.
