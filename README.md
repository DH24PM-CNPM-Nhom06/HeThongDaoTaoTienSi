# HeThongQuanLyHocVuHocVienSauDaiHoc

## Chạy bằng Docker

Yêu cầu Docker Engine và Docker Compose v2:

1. Tạo file cấu hình cục bộ từ mẫu: `Copy-Item .env.example .env` (PowerShell).
2. Sửa các mật khẩu và `JWT_KEY` trong `.env`; không dùng giá trị mẫu trên môi trường thật.
3. Chạy `docker compose up --build -d`.
4. Mở giao diện tại `http://localhost:4173`; API được gọi qua proxy cùng origin. API cũng được publish ở `http://localhost:8080`.

Compose chạy frontend Nginx, backend ASP.NET Core, MariaDB 11.4 và lưu dữ liệu database/tệp upload trong Docker volumes. Cấu hình `.env` không được commit.

Repo hiện không chứa file SQL hoặc EF migrations để tạo schema và dữ liệu ban đầu. MariaDB trong Compose khởi tạo database rỗng; cần nạp schema/seed tương thích trước khi sử dụng API nghiệp vụ. Không xóa volume database khi cần giữ dữ liệu.

GitHub Actions build backend/frontend, chạy kiểm tra frontend và build thử hai Docker image trên push/PR. Khi push lên nhánh mặc định hoặc tag `v*`, workflow publish image lên GitHub Container Registry (GHCR). Compose mặc định build source tại máy; để dùng image GHCR, đăng nhập `ghcr.io`, đặt `IMAGE_NAMESPACE=<owner>/<repository>` trong `.env`, sau đó chạy `docker compose pull` và `docker compose up -d --no-build`. Workflow publish image tự động, nhưng việc triển khai lên máy chủ cần được cấu hình riêng theo nhà cung cấp hosting.

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
Chịu trách nhiệm xây dựng giao diện người dùng web (Next.js) hoặc ứng dụng di động (Flutter) đảm bảo đồng bộ UI/UX theo Design System chung.
### Backend Developers
Chịu trách nhiệm xây dựng API, xử lý nghiệp vụ cốt lõi (Business Logic) bằng NestJS hoặc Spring Boot theo kiến trúc Clean Architecture / Modular Monolith.

###  DevOps / Cloud Engineer
Chịu trách nhiệm cấu hình hạ tầng, thiết lập quy trình CI/CD (GitHub Actions), container hóa dịch vụ với Docker và quản lý môi trường triển khai.

### QA / Security & Data Specialist
Chịu trách nhiệm viết Unit/Integration Tests, kiểm tra bảo mật, chuẩn hóa dữ liệu, thiết lập cơ sở dữ liệu (PostgreSQL/Redis) và kiểm soát chất lượng mã nguồn trước khi tạo Pull Request.


