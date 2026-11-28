# Hướng dẫn chạy toàn bộ dự án DTMS

Dự án chạy bằng Docker Compose gồm frontend, API .NET và MariaDB. Docker tự build frontend/backend và khởi tạo DB từ SQL seed; máy thành viên không cần cài Node.js, .NET SDK hoặc MariaDB riêng.

## 1. Chuẩn bị máy

- Cài Git và Docker Desktop.
- Mở Docker Desktop, chờ trạng thái **Engine running**.
- Thành viên cần được cấp quyền clone repo của nhóm.

## 2. Clone repo

Mở PowerShell tại nơi muốn lưu dự án và chạy:

```powershell
git clone <địa-chỉ-repo-của-nhóm>
cd <tên-thư-mục-repo>
```

Repo cần có các thành phần sau để launcher chạy được:

- `docker-compose.yml`, `.env.example`, `START_DTMS.bat`, `start.ps1`
- Thư mục `DTMS_FRONTEND` và `DTMS_BACKEND`
- `DTMS_BACKUP/DTMS_DuLieuGoc_Va_KiemThu.sql`
- Thư mục `DTMS_UPLOADS` (được giữ bằng `.gitkeep`)

Tệp SQL là thành phần cần thiết để tạo schema và dữ liệu ban đầu cho DB. Các ZIP/PDF backup khác không cần để chạy dự án và bị Git bỏ qua mặc định.

## 3. Khởi động frontend, backend và DB

Tại thư mục gốc repo, nhấp đúp `START_DTMS.bat` hoặc chạy:

```powershell
.\START_DTMS.bat
```

Launcher kiểm tra Docker Engine, tạo cấu hình riêng cho máy nếu chưa có, sau đó chạy `docker compose --env-file .env.local up --build -d`. Lần đầu sẽ tải image và build các dịch vụ; các lần sau dùng lại cấu hình và dữ liệu hiện có.

Khi hoàn tất, PowerShell hiển thị trạng thái container cùng URL truy cập. Mặc định:

- Frontend: <http://localhost:4174>
- Swagger/API: <http://localhost:8080/swagger>
- MariaDB trên máy host: `localhost:3307` (nếu launcher đổi cổng, xem `MARIADB_HOST_PORT` trong `.env.local`)
- Kết nối giữa các container: hostname `db`, cổng `3306`

Nếu cổng mặc định đang bận trong lần chạy đầu, launcher chọn cổng trống kế tiếp và ghi vào `.env.local`; hãy dùng URL mà launcher in ra.

## 4. Cấu hình riêng từng máy và `.env.local`

`.env.example` là mẫu dùng chung, không chứa mật khẩu. Khi chạy lần đầu:

1. Nếu đã có `.env.local`, launcher giữ nguyên các giá trị ở đó.
2. Nếu chưa có `.env.local` nhưng có `.env`, launcher dùng lại cấu hình `.env` hiện có.
3. Nếu cả hai chưa có, launcher tạo `.env.local` từ `.env.example`, sinh mật khẩu MariaDB và JWT key ngẫu nhiên riêng cho máy đó, đồng thời chọn các cổng trống.

Không dùng mật khẩu đăng nhập Windows và không gửi `.env` hoặc `.env.local` cho thành viên khác. Hai file này được Git bỏ qua; các `.dockerignore` cũng loại file môi trường khỏi build context. Docker Compose không tự đọc `.env.local`, vì vậy hãy khởi động qua `START_DTMS.bat` hoặc luôn dùng tùy chọn `--env-file .env.local`.

Giữ `.env.local` ổn định khi DB volume còn dùng. Nếu mất cả `.env.local` lẫn `.env` trong khi volume DB đã tồn tại, launcher sẽ dừng để tránh sinh mật khẩu mới không khớp với DB cũ. Hãy khôi phục file cấu hình cũ từ bản sao lưu.

## 5. Kiểm tra trạng thái và xem log

Các lệnh dưới đây chạy tại thư mục gốc repo:

```powershell
docker compose --env-file .env.local ps
docker compose --env-file .env.local logs -f frontend backend db
```

Nhấn `Ctrl+C` để thoát phần xem log; các container vẫn tiếp tục chạy.

## 6. Dừng và khởi động lại

Dừng container nhưng giữ DB và tệp tải lên:

```powershell
docker compose --env-file .env.local down
```

Khởi động lại bằng `START_DTMS.bat`. Dữ liệu MariaDB nằm trong Docker volume `hethongdaotaotiensi_dtms_db_data`; tệp tải lên nằm trong thư mục `DTMS_UPLOADS` trên máy host.

## 7. Khởi tạo lại DB

MariaDB chỉ nạp `DTMS_BACKUP/DTMS_DuLieuGoc_Va_KiemThu.sql` khi volume mới được tạo. Sửa file SQL rồi chạy lại Compose sẽ không ghi đè DB hiện tại.

Muốn xóa DB hiện tại và nạp lại SQL từ đầu, chạy lệnh sau **chỉ khi chấp nhận mất dữ liệu DB trong Docker volume**:

```powershell
docker compose --env-file .env.local down -v
```

Sau đó chạy `START_DTMS.bat` để tạo DB mới. Lệnh này không xóa tệp trong `DTMS_UPLOADS`.

## 8. Xử lý lỗi thường gặp

- **Docker CLI không tìm thấy hoặc Engine chưa chạy:** mở Docker Desktop, chờ **Engine running**, rồi chạy lại `START_DTMS.bat`.
- **Thiếu SQL seed:** kiểm tra repo clone có `DTMS_BACKUP/DTMS_DuLieuGoc_Va_KiemThu.sql`; file này phải được commit cùng dự án.
- **Cổng bị chiếm:** lần chạy đầu launcher tự chọn cổng khác. Khi đó dùng URL được in trong PowerShell. Cổng đã chọn được lưu trong `.env.local`.
- **API không kết nối DB:** giữ nguyên mật khẩu trong `.env.local`; xem log bằng `docker compose --env-file .env.local logs backend db`.
- **Swagger không mở:** kiểm tra backend đang chạy bằng lệnh `ps`, rồi xem log backend. Compose mặc định bật môi trường Development và Swagger.
- **Muốn dùng cấu hình khác:** sửa `.env.local`, không sửa `.env.example`; sau đó chạy lại `START_DTMS.bat`.

## Tên project và container

Compose project ID là `hethongdaotaotiensi` (Docker Compose yêu cầu chữ thường). Các container có tiền tố `HeThongDaoTaoTienSi`: `HeThongDaoTaoTienSi-frontend`, `HeThongDaoTaoTienSi-backend` và `HeThongDaoTaoTienSi-db`.
