# Kiểm thử frontend DTMS — 18/10/2026

## Cập nhật sau chuẩn hóa GitHub

Kết quả mới nhất: **216/216 nhóm đạt** (20 chức năng + 16 workflow/API mô phỏng + 18 hồi quy trên mỗi engine Chromium/Edge/Firefox/WebKit), thêm **288/288 trường hợp Profile đạt**. Kiểm source: 24 tệp JavaScript, 12 trang HTML, 48 tham chiếu tài nguyên đạt.

Đã kiểm thêm nút Bàn làm việc, ẩn thông tin phiên sau kết thúc, nhớ email/reload, khóa email cũ và tên tệp CSV/JSON mới. Xem [kết quả tổng hợp](TEST_GITHUB_PREPARATION_2026-10-18.json) và [báo cáo thay đổi](CHUAN_HOA_GITHUB_2026-10-18.md). Kiểm backend/database và Safari thật vẫn cần môi trường tương ứng.

Lệnh kiểm source: `node scripts/check-source.cjs`. Bố cục Profile: `node scripts/check-profile-layout.cjs chromium msedge firefox webkit`. Cách chạy các suite khác giữ như hướng dẫn bên dưới.

## Kết quả bàn giao trước chuẩn hóa GitHub

**212/212 nhóm đạt**: 19 chức năng, 16 workflow/API giả lập và 18 hồi quy trên mỗi engine Chromium, Edge, Firefox, WebKit. **400 trường hợp modal đạt**: 25 modal × 4 viewport × 4 engine.

| Engine | Chức năng | Tích hợp client/mock | Hồi quy | Tổng |
|---|---:|---:|---:|---:|
| Chromium / Chrome for Testing 151.0.7922.34 | 19/19 | 16/16 | 18/18 | 53/53 |
| Edge 155.0.4283.45 | 19/19 | 16/16 | 18/18 | 53/53 |
| Firefox 153.0 portable | 19/19 | 16/16 | 18/18 | 53/53 |
| WebKit 26.5 Windows | 19/19 | 16/16 | 18/18 | 53/53 |

Lệnh cuối trả exit code 0. Các lượt phát hiện lỗi trước đó không được dùng làm kết quả cuối.

## Phạm vi

- HTML/id/handler/label/tài nguyên local và ảnh campus; redirect 10 trang tách.
- Phiên demo, logout/reload, scope và kiểm quyền handler.
- CRUD, mã/email trùng, tìm không dấu, filter rỗng, sort/page.
- Kế hoạch 3 cấp; quota/assign ID/chống lặp; học phần đăng ký/hủy.
- Điểm tiểu luận/chuyên đề, nhận xét, báo cáo 6 kỳ; nộp lại và duyệt đề cương.
- Công bố thêm/sửa/xóa/DOI/thẩm định; điều kiện chặn cấp bằng.
- 10 workflow lưu/hiện metadata, schema 3 và migration lịch sử cũ.
- Lỗi lưu rollback, JSON thiếu/hỏng/recovery; XSS tên tệp/tiêu đề, URL nguy hiểm.
- CSV/JSON tải được, ba nội dung báo cáo khác nhau và nguồn state hiện tại.
- Modal bàn phím/focus/Escape và geometry; menu mobile và Back/Forward.
- Luận án: thành công/rỗng/500/thử lại/JSON hỏng/schema sai/timeout/unsafe URL.
- Diploma: GET đúng method/query, hợp lệ/không tìm thấy/schema sai/không khớp/500/JSON lỗi và chặn gửi lặp.

Viewport rộng 320/360/390/430/768/1024/1366/1440/1920px, đi qua 10 view và 14 module. Regression modal đo 360/768/1024/1440px. Bảng được phép cuộn trong wrapper; body/root không vượt viewport quá sai số 1px.

## Chạy lại

Giữ server `node scripts/serve.cjs` đang chạy:

```powershell
$env:DTMS_FIREFOX_EXECUTABLE='C:\Users\Vinh\AppData\Local\Temp\dtms-browser-test\firefox-1538\firefox\firefox.exe'
node scripts/check-all.cjs chromium msedge firefox webkit
```

Biến Firefox là đường dẫn portable đã dùng thành công; thay nếu cài nơi khác. Cache mặc định trên máy vẫn bị lỗi activation context/spawn, không coi tải lại cache là đã sửa môi trường đó.

Có thể chạy riêng `check-frontend.cjs`, `check-integration.cjs`, `check-regressions.cjs`; chọn engine bằng `DTMS_BROWSER`, URL bằng `DTMS_URL`.

## Bằng chứng

- `TEST_SUMMARY_2026-10-18.json`: tổng hợp 12 suite.
- `TEST_RESULTS_*.json`, `TEST_INTEGRATION_*.json`, `TEST_REGRESSIONS_*.json`: từng nhóm.
- `TEST_MODAL_*.json`: kích thước 100 trường hợp mỗi engine.
- `final-360-chromium.png`, `final-1440-chromium.png`: ảnh bàn giao chính; có ảnh từng engine trong docs.
- `AUDIT_RESULTS_2026-10-18.json`: mốc trước sửa, được giữ nguyên.
- `CHANGESET_2026-10-18.json`: đối chiếu file source với audit trước sửa.

## Giới hạn

API trong test được chặn và trả fixture; không gọi API thật, gửi email hoặc ký số. Browser context riêng không dùng dữ liệu trình duyệt cá nhân. Không có pageerror trong các luồng đã chạy; điều này không phải bảo đảm mọi tổ hợp dữ liệu đều không có lỗi.

WebKit không phải Safari thật; Chrome for Testing không đại diện mọi bản Chrome. Chưa có macOS/iOS, backend/database/tài khoản test thật hoặc thiết bị vật lý để nghiệm thu. Không thêm điểm vào dữ liệu ứng dụng để làm luồng cấp bằng đạt điều kiện giả.
