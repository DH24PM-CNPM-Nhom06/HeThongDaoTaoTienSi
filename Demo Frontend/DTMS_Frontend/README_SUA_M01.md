# DTMS – Bản frontend kiểm tra M01 (giữ giao diện cũ)

Bản này tách riêng khỏi frontend gốc của nhóm. Không thay đổi bất kỳ file Backend, SQL hoặc dữ liệu MariaDB nào.

## 1. Những điểm đã sửa

- **NCS (ví dụ NCS01):** nút `+ Thêm NCS` được ẩn vì backend không cấp quyền POST `/api/NcsImport` cho NCS. NCS vẫn xem được hồ sơ; cửa sổ xem ở trạng thái chỉ đọc. NCS có thể thay đổi **email, số điện thoại, cơ quan công tác** bằng nút `Cập nhật thông tin cá nhân` → PUT `/api/Profile/me`.
- **ADMIN/PDT:** nút `+ Thêm NCS` hiển thị và form nhập có thể thao tác. Tạo mới dùng POST `/api/NcsImport` (tạo tài khoản và hồ sơ), sửa hồ sơ đào tạo dùng PUT `/api/Nghiencuusinhs/{maNcs}`. Form chỉ mở những trường thật sự được backend phép thay đổi; không tự động sửa `MaNguoiDung`, hạn đào tạo hoặc trạng thái học vụ.
- **Form cập nhật cá nhân:** điền cả họ tên và mã NCS đang đăng nhập vào hai ô chỉ đọc (trước đây mã NCS để trống). Các ô email, số điện thoại, nơi công tác có nền trắng và nhập được.
- **Thẻ hồ sơ NCS:** họ tên và liên hệ từ GET `/api/Profile/me`; ngành, ngày sinh, giới tính, quyết định, năm tuyển sinh, đối tượng và hạn đào tạo từ GET `/api/Nghiencuusinhs`; người hướng dẫn chính từ phân công GET `/api/Phanconghuongdans` khi có quyền truy cập. Không tự điền dữ liệu giả.
- **Thông tin không có trong API/CSDL hiện tại:** CCCD, địa chỉ liên hệ. Giao diện ghi rõ `Chưa có trường dữ liệu trong API`. Cần thống nhất thay đổi backend/schema nếu muốn người dùng nhập và lưu hai trường này.
- **ADMIN:** bổ sung nhận diện vai trò ADMIN vốn chưa có trong giao diện frontend tham chiếu.
- **Giao diện:** giữ bố cục/màu sắc gốc; phân biệt trực quan ô sửa được (nền trắng) và ô chỉ đọc (nền xám nhạt).

## 2. Chạy thử

1. Giữ backend chạy ở `https://localhost:7143` với DB mà bạn chủ động chọn.
2. Giải nén file ZIP vào một thư mục mới. Không ghi đè lên thư mục frontend của nhóm.
3. Mở PowerShell tại thư mục có `package.json` và chạy `npm start`.
4. Mở `http://127.0.0.1:4173/#management`.
5. Nhấn `Ctrl + Shift + R` để tránh tải lại JS/CSS cũ từ cache.

## 3. Kiểm thử phân quyền và giao diện

### A. Tài khoản NCS01 (không thay đổi dữ liệu)

- Đăng nhập NCS01; M01: không xuất hiện `+ Thêm NCS`.
- `Xem` trong bảng: mã, họ tên, ngành, ngày sinh, giới tính, quyết định, hạn đào tạo phải điền từ API; các ô nghiệp vụ chỉ đọc.
- Bấm `Cập nhật thông tin cá nhân`: họ tên, mã NCS được điền nhưng không sửa được; email, số điện thoại và nơi công tác có thể gõ. Bấm `Hủy bỏ` để kiểm tra trước khi lưu.
- Kiểm tra thẻ M01: email, SĐT, nơi công tác, hạn chuẩn, hạn tối đa, người hướng dẫn chính (nếu backend cung cấp dữ liệu phân công).
- CCCD/địa chỉ liên hệ ghi rõ chưa có trường dữ liệu trong API. Đây không phải lỗi lấy dữ liệu.

### B. Tài khoản PDT hoặc ADMIN

- Đăng nhập vai trò PDT/ADMIN; M01 có nút `+ Thêm NCS`.
- Mở `+ Thêm NCS` và thử gõ mã NCS, họ tên, mã ngành, ngày sinh, ngày nhập học, số quyết định, hai mốc hạn, tên đăng nhập, email và mật khẩu tạm. Thử trước mà **không bấm Lưu**.
- Ngành có gợi ý từ GET `/api/Nganhdaotaos`; khóa tuyển sinh tự tính từ `Ngày nhập học`.
- Bấm `Xem / Sửa` hồ sơ có sẵn: có thể nhập ở họ tên, ngành, ngày sinh, giới tính, đối tượng, số QĐ, ngày nhập học. Các trường mã NCS, hạn đào tạo, trạng thái, tài khoản chỉ đọc.
- Chỉ dùng dữ liệu TEST nếu bạn quyết định bấm lưu; việc tạo/sửa sẽ ghi dữ liệu thật vào backend.

### C. Kiểm thử lưu thực tế (chỉ khi đã sao lưu CSDL)

- Dùng tài khoản NCS TEST, thay đổi một thông tin liên lạc có thể khôi phục. Quan sát DevTools → Network → PUT `/api/Profile/me` trả 200 và GET `/api/Profile/me` sau tải lại phản ánh thay đổi.
- Với PDT/ADMIN, tạo một NCS TEST có mã và tài khoản hoàn toàn mới; quan sát POST `/api/NcsImport` thành công; khi sửa, PUT `/api/Nghiencuusinhs/{maNcs}` trả 204. Không dùng NCS01 hoặc hồ sơ gốc để thử ghi.

## 4. Giới hạn cần biết

1. Frontend **không thể tự ghi/sửa** CCCD/địa chỉ liên hệ vì backend chưa có trường DTO/cột CSDL tương ứng. Không sửa chỉ phía frontend rồi thông báo đã lưu.
2. API GET `/api/Nghiencuusinhs` cố ý không trả email/SĐT của NCS khác. Form quản trị không tự suy đoán những trường này từ mã NCS. Nếu quản trị viên cần xem/sửa liên hệ NCS khác, phải bổ sung API quản trị có phân quyền và DTO rõ ràng.
3. Mật khẩu tạm, tài khoản liên kết và hạn đào tạo không thể sửa bằng PUT NCS; phải dùng nghiệp vụ/endpoint được phân quyền phù hợp.
4. Không kiểm thử runtime backend thật ở môi trường này; đã chạy kiểm tra tĩnh và kiểm thử hợp đồng API giả lập.

## 5. Kiểm tra kỹ thuật

```powershell
npm run check
node scripts/test-api-contracts.cjs
node scripts/test-ncs-ui-static.cjs
```
