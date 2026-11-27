# DTMS – Modal xem chi tiết Thông báo chung

## Phạm vi
- Giữ nguyên giao diện gốc, 8 thông báo minh họa, ô tìm kiếm, lọc, sắp xếp, phân trang và các phần M01, Công khai, Kiểm tra API.
- Nhấn thẻ hoặc nút **Xem chi tiết** để mở cửa sổ modal. Hiển thị tiêu đề, loại, ngày đăng, đơn vị phụ trách, nội dung chi tiết (3 đoạn) và nhãn **Thông báo minh họa**.
- Đóng bằng nút X, nút Đóng thông báo, click vào nền tối hoặc phím Esc. Khi đóng tiêu điểm bàn phím được trả về nút đã nhấn.
- Không thêm bảng CSDL, không thay đổi controller và không gọi API thông báo. Dữ liệu chỉ có trong `js/demo/sample-content.js`.

## Chạy trên Windows
1. Giải nén ZIP vào thư mục riêng, không ghi đè bản frontend nhóm đang phát triển.
2. Mở PowerShell tại thư mục `DTMS_Frontend_Modal_ThongBao`.
3. Chạy `npm start`.
4. Mở `http://127.0.0.1:4173/#notifications` (nếu đang chạy cổng 4173, hãy dừng server cũ bằng Ctrl+C).
5. Nhấn `Ctrl+Shift+R` để tải mã mới nếu trình duyệt đang cache.

## Kiểm thử nhanh
1. Xác nhận đủ 8 thông báo. Nhấn **Xem chi tiết** ở thông báo đầu: modal phải hiện đúng tên/ngày/đơn vị và 3 đoạn nội dung.
2. Nhấn **X** rồi mở thông báo thứ hai: nội dung phải thay đổi tương ứng.
3. Thử **Esc**, nhấn vùng tối, nút **Đóng thông báo** để đóng.
4. Tìm từ khóa `báo cáo`, lọc theo loại, thử sắp xếp và phân trang, rồi mở modal: nội dung phải đúng thẻ vừa chọn.
5. Kiểm tra trên màn hình nhỏ: phần dài cuộn bên trong modal; nền không cuộn.
6. Thử thao tác phím Tab với các nút đóng và mở modal; sau khi đóng sẽ trở về nút Xem chi tiết.

## Các file thay đổi
- `js/features/notifications.js`: tạo và xử lý modal, nút xem chi tiết.
- `js/demo/sample-content.js`: thêm nội dung chi tiết minh họa cho 8 thông báo.
- `css/pages/management-responsive.css`: định dạng modal phù hợp giao diện DTMS.
- `scripts/test-notice-modal.cjs`: kiểm tra tự động tĩnh.

Không có thay đổi Backend, SQL, các endpoint hay dữ liệu thật. Khi cần thông báo chính thức có quản trị và lưu CSDL, phải thiết kế API riêng.
