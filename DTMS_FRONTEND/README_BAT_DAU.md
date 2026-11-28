# DTMS — Frontend thử nghiệm tích hợp API (giữ thiết kế gốc)

## 1. Đây là gì?

Thư mục này được xây dựng từ `GithubRepo(2).zip` (mục `Demo Frontend`), không thay đổi thiết kế hiện có của trang chủ, bàn làm việc và các phân hệ DTMS. Phần thêm mới là **Kiểm tra API** trong thanh dock bên trái, để có thể gọi API backend trực tiếp từ trình duyệt.

- Danh mục dự phòng: **147 HTTP action**, lấy từ danh mục backend đã rà soát. Khi backend chạy Development, nút **Đọc Swagger** ưu tiên dùng `/swagger/v1/swagger.json` để lấy đúng các endpoint, tham số và schema body đang chạy.
- Gửi GET, POST, PUT, DELETE, và các phương thức khác nếu Swagger trả về; nhập path/query/JSON; hỗ trợ multipart/file khi Swagger mô tả và endpoint `/api/File/upload`; nhận status, JSON, hoặc tải file nhị phân.
- Chia sẻ `jwt_token` với giao diện quản lý cũ; có biểu mẫu đăng nhập trực tiếp, tự gắn Bearer và che các trường token/mật khẩu trong phần kết quả.
- **Không gửi yêu cầu ghi dữ liệu tự động**. Người dùng phải đánh dấu cho phép và xác nhận riêng trước các request POST/PUT/PATCH/DELETE.
- Đồng bộ các lỗi frontend có thể xác định: `NcsImport.Loi` (danh sách lỗi theo dòng), PUT NCS theo DTO cập nhật an toàn, xử lý đường tải tệp cũ `/uploads/...` thông qua API `File/legacy` và thông báo rõ API danh sách sai cấu trúc.

**Giới hạn trung thực:** Đây là bản frontend để **kiểm tra khả năng gọi đầy đủ endpoint** và dùng lại màn hình cũ. Chưa thể khẳng định toàn bộ 147 API đã được kiểm thử thực tế hoặc đã có form nghiệp vụ chuyên biệt trong từng phân hệ. Trình kiểm tra API là giao diện kỹ thuật để gọi các action còn chưa có form riêng. Các luồng phê duyệt nhiều bước vẫn cần test với CSDL an toàn.

## 2. Cách chạy trên Windows (2 cửa sổ)

Xem [README ở thư mục gốc](../README.md) để thiết lập kết nối MariaDB và khóa JWT trước khi chạy backend.

**Cửa sổ 1 — Backend** (tại thư mục chứa `DTMS.Api.csproj`):

```powershell
dotnet run --project .\DTMS.Api.csproj --launch-profile https
```

Xác nhận `https://localhost:7143/swagger` mở bình thường. Nếu trình duyệt báo chứng chỉ phát triển, chạy `dotnet dev-certs https --trust` rồi khởi động lại backend. Swagger chỉ xuất hiện khi backend chạy môi trường Development.

**Cửa sổ 2 — Frontend** (tại thư mục có `index.html`, `package.json`):

```powershell
node --version
npm start
```

**Không cần `npm install`** cho chế độ chạy cơ bản; project dùng Node để phục vụ file HTML/CSS/JS, không có thư viện frontend cần cài. Mở:

- `http://127.0.0.1:4173` — giao diện DTMS cũ
- `http://127.0.0.1:4173/#api-lab` — mục kiểm tra API

Nếu cổng 4173 bận, mở bằng:

```powershell
node .\scripts\serve.cjs 4174
```

và truy cập `http://127.0.0.1:4174/#api-lab`.

## 3. Cách thử một API

1. Trong trang DTMS, chọn **Kiểm tra API** ở dock bên trái.
2. Nhấn **Đọc Swagger**. Nếu backend chưa chạy, trang vẫn hiện danh mục 147 action tham khảo và báo không kết nối; chưa tính là API đã được kiểm thử.
3. Nhập tài khoản kiểm thử hợp lệ ở khung đăng nhập, bấm **Đăng nhập** (không gửi mật khẩu cho người khác). Với các API công khai như tra cứu văn bằng, có thể gọi khi chưa đăng nhập.
4. Tìm API, ví dụ `GET /api/Nghiencuusinhs` hoặc `GET /api/Profile/me`, bấm chọn rồi **Gửi yêu cầu**. Xem HTTP status và response.
5. Với endpoint có `{id}`, `{maNcs}`...: nhập tham số vào ô đường dẫn. Với endpoint có query: nhập ô tương ứng (nếu Swagger tải được) hoặc ô **Query bổ sung**, ví dụ `namHoc=2026-2027&hocKy=1`.
6. Với POST/PUT: kiểm tra mẫu JSON được tạo từ Swagger, sửa cho đúng dữ liệu; đánh dấu **Cho phép gửi request có thể ghi dữ liệu**, xác nhận một lần nữa, rồi gửi.
7. Với `POST /api/File/upload`: chọn tệp, nhập query `purpose=baocao&maNcs=TEST_NCS01`; backend sẽ kiểm tra quyền thực tế.

**Chú ý:** HTTP 400/401/403/404/409 có thể là phản hồi đúng khi nhập sai dữ liệu hoặc thiếu quyền. Gửi request thành công không có nghĩa nghiệp vụ đã được nghiệm thu.

## 4. Cấu hình địa chỉ API

Mặc định frontend và API Lab gọi `https://localhost:7143`.

Để thay địa chỉ mặc định dùng chung cho mọi màn hình, sửa `js/core/config.js`, dòng `API_BASE_URL`, hoặc định nghĩa `window.DTMS_RUNTIME_CONFIG.API_BASE_URL` trước khi tải `config.js` trong `index.html`.

Ô **Địa chỉ backend** trong trang API Lab thay đổi **chỉ ở API Lab**, không tự đổi cấu hình của 14 phân hệ cũ. Khi dùng bản backend khác, nên sửa cấu hình chung để tránh hai màn hình gọi hai server khác nhau. API Lab chỉ cho gửi token tới localhost hoặc hostname của server đã khai báo.

Trong Development, backend cho phép Swagger và API từ `http://127.0.0.1:4173` và `http://localhost:4173`. Nếu đổi cổng hoặc triển khai frontend ở tên miền khác, bổ sung origin tương ứng trong `Frontend:AllowedOrigins` của backend.

## 5. Kiểm tra không cần backend

```powershell
npm run check
node .\scripts\test-api-contracts.cjs
npm run check:api
npm ci
npm exec -- playwright install chromium
npm test
```

Bộ test trình duyệt tự chạy frontend và giả lập API. Dùng Node.js 20 trở lên. Sau khi có backend và MariaDB thử, chạy thêm các luồng tích hợp với tài khoản được cấp.

## 6. Giữ an toàn cho CSDL gốc

- Không chạy tạo, sửa, xóa, duyệt, bỏ phiếu, cấp bằng hoặc khóa điểm lên bản ghi chính thức chỉ để thử giao diện.
- Chỉ thử các phương thức ghi trên bản ghi TEST riêng và sau khi sao lưu CSDL. Trang API Lab **không** có chức năng hoàn tác mọi thao tác.
- Không đưa password, `jwt_token` hoặc secret vào file HTML, ảnh hoặc file gửi nhóm.
- Tránh lưu JWT thử nghiệm trong trình duyệt dùng chung; dùng nút **Xóa JWT** khi kết thúc.
- Nếu muốn nhóm frontend thử mà không cần động đến backend thật, hãy dùng CSDL test riêng hoặc chỉ thử các GET.

## 7. Những điểm cần kiểm thử trực tiếp sau khi mở trang

- API Lab có liệt kê endpoint và tải Swagger thành công.
- Đăng nhập đúng / sai, hết hạn JWT, quyền theo tài khoản.
- GET danh sách, GET chi tiết, trường nullable trong JSON.
- POST/PUT/DELETE trên bản ghi TEST riêng.
- Import NCS: backend trả `{loi:[{dong,loiNoiDung}]}` để hiển thị lỗi từng dòng.
- Chỉnh sửa NCS: gửi đúng 7 trường của `UpdateNghiencuusinhRequest`, không gửi mã tài khoản/hạn đào tạo.
- Upload PDF hợp lệ, tải file dưới quyền chủ sở hữu và chặn người không có quyền.
- Các luồng duyệt học vụ, hội đồng và cấp bằng **chưa được tuyên bố là hoàn tất** cho đến khi nhóm chạy kiểm thử nghiệp vụ thực tế.

## 8. Các file chỉnh sửa

- `index.html`: chỉ thêm một nút dock và một khu vực API Lab; các màn hình gốc giữ nguyên.
- `css/api-lab.css`: style bổ sung theo bảng màu cũ.
- `js/api-manifest.js`: danh mục 147 HTTP action từ mã nguồn tham khảo.
- `js/features/api-lab.js`: gọi Swagger và thực thi HTTP theo lựa chọn người dùng.
- `js/core/api.js`: sửa chuẩn hóa lỗi/danh sách/tải file cũ.
- `js/modules/management.js`: bật PUT NCS an toàn theo DTO mới.
- `scripts/check-api-lab.cjs`: tự kiểm tra danh mục và tích hợp frontend.

**Backend, SQL và thiết kế frontend gốc không bị ghi đè.** Đây là một thư mục độc lập dành cho bạn kiểm tra trước khi bàn giao nhóm frontend.
