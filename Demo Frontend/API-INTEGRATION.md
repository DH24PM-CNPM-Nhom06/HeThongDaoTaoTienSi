# Tích hợp API DTMS — bản 18/10/2026

## Trạng thái thực tế

ZIP có hai action ASP.NET Core: `POST /api/Auth/login` và `GET /api/Public/diploma`. Cả hai đang trả dữ liệu tạm, chưa xác thực DB. Không sử dụng token placeholder hoặc IsValid luôn true để công nhận người dùng/văn bằng.

Frontend thực thi các luồng quản lý học vụ với dữ liệu lưu ở trình duyệt. Kết nối backend/database cần được nghiệm thu trên môi trường triển khai.

## Cấu hình môi trường

Cấp cấu hình trước `js/core/config.js` (hoặc chỉnh giá trị mặc định tại file này):

```javascript
window.DTMS_RUNTIME_CONFIG = {
  API_BASE_URL: "https://api.example.edu.vn",
  API_TIMEOUT_MS: 8000,
  API_CREDENTIALS: "same-origin",
  DEGREE_SERVICE_READY: false,
  ENDPOINTS: {
    PUBLIC_THESES: "/api/public/theses",
    DEGREE_LOOKUP: "/api/Public/diploma"
  }
};
```

Địa chỉ trên chỉ là ví dụ, không phải máy chủ đã cung cấp. Không đưa mật khẩu/JWT secret/chuỗi kết nối vào frontend. Chỉ đặt `DEGREE_SERVICE_READY: true` sau khi backend bỏ stub, có truy vấn thật và được kiểm thử. Nếu dùng cookie khác origin, cấu hình credentials/CORS/CSRF tại server theo môi trường thật.

Cổng 5035/7143 trong launchSettings của ZIP chỉ là cấu hình source, chưa chứng minh API đang hoạt động.

## Diploma: hợp đồng đã có trong ZIP

`GET /api/Public/diploma?code=...&name=...` — gửi bằng URLSearchParams, yêu cầu cả hai trường.

```json
{
  "isValid": true,
  "message": "Đã tìm thấy bản ghi",
  "data": {
    "soHieuBang": "TS-TEST-001",
    "hoTen": "Nguyễn Văn Mẫu",
    "nganhDaoTao": "Ngành đào tạo",
    "soVaoSoGoc": "SG-TEST-001",
    "ngayCap": "2026-01-20"
  }
}
```

Không tìm thấy: `isValid:false,data:null` hoặc HTTP 404. Client kiểm flag boolean, đủ trường string, ngày hợp lệ và mã/tên khớp; object bất kỳ không được coi là văn bằng hợp lệ. Hỗ trợ tên trường camelCase và PascalCase của DTO ASP.NET. Không bóc `data` trước khi kiểm `isValid`.

API login trong ZIP thiếu kiểm mật khẩu, JWT có chữ ký, phiên/me/logout và quyền theo hồ sơ. Cơ chế truy cập UI hiện chọn hồ sơ theo email và vai trò; không thu hoặc lưu mật khẩu. Cần triển khai xác thực phía máy chủ trước khi quản lý tài khoản thực tế.

## Luận án: API còn cần backend triển khai

`GET /api/public/theses` chưa tồn tại trong ZIP. Client chấp nhận mảng, `{items:[]}`, `{data:[]}` hoặc `{data:{items:[]}}`.

Mỗi item: `title,candidate,field,date` là string không rỗng; `summaryUrl,fullUrl` là string tùy chọn. Ngày ISO hoặc dd/mm/yyyy. URL chỉ HTTP/HTTPS; đường dẫn tương đối resolve theo origin backend khi đã cấu hình.

Không cấu hình API: sử dụng 3 bản ghi trong danh mục khởi tạo, không có tệp tải giả. Danh mục này độc lập với dịch vụ xác minh văn bằng. Đã cấu hình nhưng lỗi HTTP/JSON/schema/timeout: báo lỗi, có thử lại, không tự thay bằng dữ liệu khởi tạo.

## Các API nghiệp vụ còn thiếu

| Nhóm | Cần cung cấp trước vận hành thật |
|---|---|
| Tài khoản | Login, me/phiên, logout, tài khoản do trường cấp hoặc đăng ký được phê duyệt, khôi phục mật khẩu |
| Hồ sơ / scope | CRUD theo ID, người học/NHD/đơn vị được cấp quyền, chống trùng và khóa phiên bản |
| Học vụ | CTĐT, điểm, học phần, kế hoạch, đánh giá, công bố và phê duyệt có kiểm quyền |
| Tệp | Upload multipart, fileId, kiểm nội dung/kích thước/quyền tải và lưu trữ server |
| Thay đổi / bảo vệ | Workflow thẩm quyền, quyết định, hội đồng, phiếu, lưu chiểu, cấp bằng có transaction |
| Công khai / báo cáo | Luận án, sổ gốc bằng, thông báo, thống kê và mẫu báo cáo chính thức |
| Tích hợp | Email/job trạng thái, chữ ký số, Turnitin và nguồn chỉ mục khi thực sự được cung cấp |

Không tự thêm endpoint giả rồi coi là tích hợp xong. Backend phải xác thực từng request; vai trò và điều kiện tính ở client hỗ trợ hiển thị và kiểm tra dữ liệu, không thay thế kiểm quyền phía máy chủ.

## Lỗi và kiểm thử

HTTP client có thông báo tiếng Việt cho 401/403/404/409/422, timeout, lỗi mạng/CORS và JSON không hợp lệ; lỗi chứa `status` và `fieldErrors` khi có. Chỉ cập nhật UI sau khi thao tác lưu/gọi API thành công.

Các test `check-integration.cjs` và `check-regressions.cjs` chặn request để kiểm response tốt/rỗng/lỗi/schema sai/timeout/URL nguy hiểm và diploma không khớp. Đây là test adapter với mock; chưa phải nghiệm thu server hoặc database.

