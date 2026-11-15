# Tích hợp API DTMS — bản 18/10/2026

> **Bổ sung 14/11/2026 (Giai đoạn 1, theo DOCX hướng dẫn tích hợp backend phiên bản hiện tại 12/11/2026 + code backend `Backend_2`):**
> - `GET /api/public/theses` **đã có trong backend** (`PublicController`) và frontend đã ánh xạ field theo DOCX §10 (`title = tenDeTaiVn || tenDeTaiEn`, `candidate = hoTen`, `field = maNganh`, `date = ngayBaoVe`); hai link tóm tắt/toàn văn được ẩn vì API không trả. Đoạn "chưa tồn tại trong ZIP" bên dưới đã lỗi thời.
> - Tra cứu văn bằng `GET /api/Public/diploma` là API thật (truy vấn DB, không còn stub) nên `DEGREE_SERVICE_READY` đã bật `true` trong `index.html`. Kiểm chứng live với tài khoản test vẫn cần backend đang chạy.
> - Đã thêm: quên mật khẩu (`POST /api/Auth/quen-mat-khau`, modal trong `index.html` + trang mới `reset.html` gọi `POST /api/Auth/dat-lai-mat-khau`), duyệt đề tài PDT (`PUT /api/Detailuanans/{id}/duyet`), hồ sơ gửi đủ `coQuanCongTac` (`PUT /api/Profile/me`).
> - Các dòng "Hai action login/diploma còn là stub" và "Chưa có API: đăng ký học phần, yêu cầu học vụ…" bên dưới đã lỗi thời so với backend hiện tại; xem báo cáo phân tích `BAO-CAO-PHAN-TICH-TICH-HOP-DTMS.md` §4 để biết trạng thái mới nhất.

## Trạng thái thực tế

Backend DTMS.Api (ASP.NET Core, JWT) chạy tại `https://localhost:7143` khi phát triển (`dotnet dev-certs https --trust` một lần để trình duyệt tin chứng chỉ). Giao diện đã nối với các API sau; khi không có phiên đăng nhập thật (ví dụ đặt `API_BASE_URL` rỗng) giao diện giữ dữ liệu mẫu cục bộ.

| Chức năng | API |
|---|---|
| Đăng nhập | `POST /api/Auth/login` `{ Username, Password }` → `{ token, user: { hoTen, maVaiTro, roles } }`. Token lưu ở `localStorage["jwt_token"]`, gửi kèm `Authorization: Bearer`. Gặp 401 khi đang có token thì tự đăng xuất. |
| Nhiều vai trò | `user.roles` (ví dụ GV01 → `["BM","NHD"]`). Nhiều hơn một vai trò thì hiện bộ chọn vai trò; đổi vai trò không gọi lại API vì token đã chứa đủ quyền. |
| Hồ sơ NCS | `GET/PUT /api/Profile/me` (chỉ email và số điện thoại) |
| Kế hoạch đào tạo | `GET/POST /api/Kehoachhoctaps`, `PUT /{id}`, `PUT /{id}/duyet` `{ cap: NHD/TBM/PDT, trangThaiDuyet: 1/-1, ykien }` (BM trên giao diện = TBM ở backend; 409 khi chưa đến lượt duyệt) |
| Báo cáo tiến độ | `POST /api/File/upload?purpose=baocao` rồi `POST /api/Baocaotiendoes`; NHD đánh giá `PUT /{id}/nhanxet` |
| Công bố khoa học | `GET/POST /api/Congbokhoahocs`, `PUT /{id}`, `PUT /{id}/duyet` (NHD/PĐT) |
| Đề tài luận án | `GET/POST /api/Detailuanans`, `PUT /{id}` (tệp `purpose=luanan`, tối đa 50MB) |
| Minh chứng ngoại ngữ | `GET/POST /api/Chungchingoaingus`, `PUT /{id}`, `PUT /{id}/duyet` (PĐT; tệp `purpose=minhchung`) |
| Tra cứu văn bằng | `GET /api/Public/diploma` (bật bằng `DEGREE_SERVICE_READY: true` trong `index.html`) |

Chưa có API nên giữ thông báo "đang phát triển": đăng ký học phần, gửi yêu cầu học vụ, đề xuất đổi người hướng dẫn, nộp đơn xét tốt nghiệp. Vai trò KHOA và BGH không có tài khoản nên không xuất hiện trong bộ chọn khi đăng nhập thật.

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

Đăng nhập, quyền theo vai trò và phân quyền dữ liệu (NCS chỉ thấy dữ liệu của mình, NHD thấy NCS mình hướng dẫn) do backend kiểm tra từng request; vai trò hiển thị ở giao diện chỉ để chọn màn hình và nút thao tác. Chưa có API đăng xuất/me/đổi mật khẩu: đăng xuất chỉ xóa token ở trình duyệt.

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

