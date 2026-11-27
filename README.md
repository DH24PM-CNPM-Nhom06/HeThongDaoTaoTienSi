# HeThongQuanLyHocVuHocVienSauDaiHoc

## Chạy DTMS cục bộ

- API ASP.NET Core .NET 10 nằm trong [Backend/DTMS.Api](Backend/DTMS.Api), sử dụng MariaDB.
- Giao diện HTML/CSS/JavaScript đang tích hợp nằm trong [DTMS_Frontend](DTMS_Frontend). Dùng Node.js 20 trở lên để chạy bộ kiểm thử Playwright.
- [Demo Frontend](Demo%20Frontend) chứa bản demo và tài liệu bàn giao trước đây.

### Backend

Cài .NET 10 SDK, chuẩn bị một cơ sở dữ liệu MariaDB có schema DTMS và tài khoản thử do nhóm phụ trách dữ liệu cấp. Cấu hình kết nối và khóa JWT trong phiên PowerShell chạy backend. Dùng khóa JWT ngẫu nhiên dài ít nhất 32 byte.

```powershell
$env:ConnectionStrings__DefaultConnection = 'Server=127.0.0.1;Port=3306;Database=dtms_dev;User ID=dtms_dev;Password=<MAT_KHAU_MARIADB>'
$env:Jwt__Key = '<KHOA_JWT_CUC_BO>'
dotnet dev-certs https --trust
dotnet run --project .\Backend\DTMS.Api\DTMS.Api\DTMS.Api.csproj --launch-profile https
```

Swagger chạy ở `https://localhost:7143/swagger` trong môi trường Development. CORS cho phép `http://127.0.0.1:4173` và `http://localhost:4173` trong môi trường này. Với frontend chạy ở origin khác, cấu hình từng origin qua `Frontend__AllowedOrigins__0`, `Frontend__AllowedOrigins__1` hoặc thiết lập mảng `Frontend:AllowedOrigins` ở môi trường triển khai. Mỗi origin gồm giao thức, hostname và cổng nếu có.

### Frontend và kiểm thử

Mở PowerShell thứ hai tại thư mục gốc.

```powershell
cd .\DTMS_Frontend
npm.cmd start
```

Mở `http://127.0.0.1:4173`. Trong **Kiểm tra API**, bấm **Đọc Swagger** để xác nhận giao diện nhận danh mục từ backend.

Chạy kiểm thử trong thư mục `DTMS_Frontend`. Bộ test trình duyệt tự mở một cổng cục bộ và giả lập API.

```powershell
npm.cmd ci
npm.cmd exec -- playwright install chromium
npm.cmd run check
npm.cmd run check:api
node .\scripts\test-api-contracts.cjs
npm.cmd test
```

Có thể dùng Chrome đã cài bằng `npm.cmd test -- chrome`. Kết quả và ảnh kiểm thử nằm trong `DTMS_Frontend/test-results/`. Khi kiểm tra nghiệp vụ với API thật, dùng MariaDB riêng và tài khoản thử cho từng vai trò.

## CI/CD

GitHub Actions chạy kiểm tra và build backend .NET, kiểm tra giao diện và build hai Docker image trên mỗi lần push; pull request vào `main` cũng được kiểm tra. Push lên `main` hoặc tag dạng `v*` sẽ publish image lên GitHub Container Registry:

- `ghcr.io/dh24pm-cnpm-nhom06/hethongdaotaotiensi/backend:<main|tag>`
- `ghcr.io/dh24pm-cnpm-nhom06/hethongdaotaotiensi/frontend:<main|tag>`

Frontend Nginx proxy `/api` và `/swagger` tới dịch vụ `backend:8080`; khi chạy container, đặt frontend và backend trên cùng Docker network. Backend cần được cấu hình kết nối tới MariaDB riêng.

## 1. Thông tin nhóm

- Tên nhóm: Nhóm 06
- Dự án: Hệ thống quản lý học vụ học viên sau đại học

## 2. Thành viên

| STT | Họ và tên | MSSV | Vai trò |
|---|---|---|
| 1 | Lâm Hoàng Chí Hậu   | DPM235417 | Product Owner / Team Lead       |
| 2 | Nguyễn Phan Thế Huy | DPM235425 | Backend Developers              |
| 3 | Mai Hoàng Khang     | DPM235427 | Backend Developers              |
| 4 | Nguyễn Tấn Thành    | DPM235518 | Frontend / Mobile Developers    |
| 5 | Trần Quang Vinh     | DPM235499 | Frontend / Mobile Developers    |
| 6 | Trần Lê Hửu Lý      | DPM235447 | QA / Security & Data Specialist |
| 7 | Nguyễn Ngô Thanh Tân| DPM235475 | DevOps / Cloud Engineer         |

## 3. Phân công nhiệm vụ

### Product Owner / Team Lead (Trưởng nhóm)
Chịu trách nhiệm quản lý backlog, làm cầu nối trao đổi với Giảng viên và các nhóm khác, điều phối tiến độ công việc và phân chia task trong Sprint.
### Frontend / Mobile Developers
Chịu trách nhiệm xây dựng và tích hợp giao diện web DTMS.
### Backend Developers
Chịu trách nhiệm xây dựng API ASP.NET Core và xử lý nghiệp vụ cốt lõi.

###  DevOps / Cloud Engineer
Chịu trách nhiệm cấu hình hạ tầng, thiết lập quy trình CI/CD (GitHub Actions), container hóa dịch vụ với Docker và quản lý môi trường triển khai.

### QA / Security & Data Specialist
Chịu trách nhiệm viết kiểm thử, kiểm tra bảo mật, chuẩn hóa dữ liệu MariaDB và kiểm soát chất lượng mã nguồn trước khi tạo Pull Request.


