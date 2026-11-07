# Báo cáo rà soát và hoàn thiện frontend DTMS

**Ngày bàn giao: 18/10/2026 · Phạm vi: frontend hiện có, 10 view, 14 phân hệ.**

[Bản PDF 6 trang](../output/pdf/BAO_CAO_HOAN_THIEN_FRONTEND_2026-10-18.pdf).

Đã thực hiện phần giao diện, responsive, chức năng và kiểm tra cuối của cả hai phiên trên nền HTML/CSS/JavaScript hiện có. Không thay framework hoặc dựng lại website. Kết quả là bản **frontend/demo đã sửa và kiểm thử**, chưa phải hệ thống nghiệp vụ thật có xác thực, database, tệp và quyết định do máy chủ cấp.

## 1. Kết quả chính

| Hạng mục | Kết quả |
|---|---|
| Backlog audit | 64 mục: 55 xong frontend/demo, 6 một phần, 3 chờ backend |
| Chức năng + workflow/API mock + hồi quy | **212/212 nhóm đạt**, 53 nhóm trên mỗi engine |
| Engine đã chạy | Chromium/Chrome for Testing 151.0.7922.34, Edge 155.0.4283.45, Firefox 153.0, WebKit 26.5 |
| Responsive | 360/768/1024/1440px theo yêu cầu; mở rộng 320/390/430/1366/1920px |
| Dialog | 25 modal × 4 viewport × 4 engine = **400 trường hợp đạt** |
| Cú pháp | 22 tệp JS/CJS được kiểm tra; không có lỗi cú pháp |
| Source thay đổi | 23 tệp HTML/CSS/JS/CJS sửa, 3 tệp JS/CJS thêm; tài liệu và kết quả kiểm thử ghi riêng |
| Bản sao trước sửa | `../../DTMS-backups/frontend-before-repair-20261018-112148.zip` |

Các con số test là nhóm kiểm tra client; API trong test được giả lập. WebKit không thay thế nghiệm thu Safari trên macOS/iOS. Chrome for Testing được ghi đúng tên, không coi là đã kiểm mọi bản Chrome phổ thông.

## 2. Phiên 1 — giao diện và nền tảng

Đã nối các tiện ích tốt có sẵn trong project vào entry point đang dùng và hợp nhất có chọn lọc phần xử lý quản lý; giữ trang Hồ sơ, Thông báo, Tra cứu và các form chấm mới. Bỏ 11 khai báo hàm trùng trong module đang chạy.

| File/nhóm file | Thay đổi |
|---|---|
| `index.html` | Main/skip link, đủ đường vào 10 view, hamburger/backdrop, phiên demo/đăng xuất, nhãn form, dialog CRUD/xác nhận/thông tin; bỏ submit giả và nút alert thành công |
| `css/responsive.css` | Bố cục mobile, header/dock, grid, bảng cuộn riêng, form/select trên WebKit, focus/hover, dialog và chế độ in |
| `js/core/app.js` | Toast dựng bằng text an toàn, router hash/Back/Forward, roadmap bằng nút nhận bàn phím, sửa nội dung mô tả sai trạng thái |
| `js/features/collections.js` | Component thẻ dùng chung: tìm không dấu, danh mục, sắp xếp, phân trang, số bản ghi và danh sách rỗng |
| `js/features/notifications.js` | Nối thông báo vào component danh sách; thời gian có datetime, lọc loại và sắp xếp ngày |
| `pages/*.html` | Chuyển các trang tách về route SPA chung; bỏ bản sao giao diện không nạp script, sửa đường vào ảnh/trang |

Giữ palette xanh đại học, font Be Vietnam Pro, ảnh campus và cấu trúc màn hình hiện có. Không có Figma/bản thiết kế cuối được cung cấp nên chưa có kết luận khớp thiết kế từng pixel. Một số style/onclick cũ vẫn được giữ khi đang chạy tốt; các thành phần lặp cần thiết đã được gom vào tiện ích dùng chung.

Ảnh sau sửa: [360px](final-360-chromium.png), [1440px](final-1440-chromium.png). Ảnh trước sửa và SHA-256 nguồn được giữ trong [audit ban đầu](AUDIT_RESULTS_2026-10-18.json).

## 3. Phiên 2 — chức năng

| Phân hệ/luồng | Kết quả đã triển khai |
|---|---|
| Phiên / quyền | Bỏ mật khẩu hardcoded; mở phiên bằng email demo, nhớ email, đăng xuất; chặn trang/handler sau thoát; 7 persona có kiểm quyền UI |
| M01 Hồ sơ | CRUD hồ sơ mới, chống trùng mã/email, validate liên hệ, giữ dữ liệu sau reload, scope NCS/NHD, xóa có xác nhận và sao lưu JSON |
| M02 Kế hoạch | Lưu nội dung/mốc và hiển thị lại; duyệt tuần tự NHD → BM → PDT; bản mới trở về chờ duyệt |
| M03 NHD | Quota không tự giảm sau reload; phân công không tăng vì gửi lặp; dùng ID hồ sơ, chặn NHD chính/phụ trùng và render định mức thống nhất |
| M04 Học phần | Đăng ký/hủy có lưu, handler kiểm quyền; tín chỉ/GPA lấy từ các hàng điểm; đồng bộ chưa có API không báo thành công |
| M05 Tiểu luận/đề cương | Nộp lại tiểu luận hủy kết quả Đạt cũ; chấm có điểm/nhận xét/người chấm; đề cương có duyệt demo và lịch sử bản nộp |
| M06 Chuyên đề | Sửa listener capture chặn form; điểm thấp không thành Đạt; lưu nhận xét và lịch sử; tên chuyên đề cập nhật ngay |
| M07 Tiến độ | Sửa form đánh giá, đủ 6 kỳ, kết luận/nhận xét được giữ sau reload; nhắc hạn được ghi rõ chưa gửi email |
| M08 Công bố | Chống trùng DOI, sửa/xóa bản chưa duyệt, khóa bản đã thẩm định, giới hạn vai trò thẩm định và nội dung render an toàn |
| M09 Luận án | Render phiên bản/metadata mới và yêu cầu đổi tên; xác nhận NHD ghi rõ demo, không giả ký số/Turnitin |
| M10 Bảo vệ | Checklist cộng tín chỉ thật đang có; 12 TC mẫu không bị tự coi thành 24; ghi nhận phiếu có quyền, không coi là hội đồng thật |
| M11 Cấp bằng | Chặn khi thiếu tín chỉ, bảng kiểm, NHD, phiếu và hồ sơ sau bảo vệ; chặn ghi nhận lặp; khôi phục nhãn từ state |
| M12 Biến động | Đơn mới được lưu và thêm vào bảng; phân biệt tiếp nhận đơn với quyết định đã có hiệu lực |
| M13 Báo cáo | Nút tra cứu mở đúng view; ba báo cáo CSV có nội dung khác nhau, dữ liệu hiện hành và tên đúng định dạng; thống kê lấy từ state |
| M14 Nhật ký | Ma trận 7 vai trò, nhật ký escape dữ liệu, CSV chống công thức, nhãn nguồn cục bộ; không giả audit server bất biến |
| Công khai / tra cứu | Tìm/lọc/sort/page, loading/lỗi/rỗng/thử lại; schema và URL được kiểm; tra cứu GET khớp DTO, mã và tên; object sai không thành văn bằng hợp lệ |

### An toàn dữ liệu và form

- Chặn XSS từ tên tệp/chuỗi HTML trong toast, danh sách và lịch sử; không ghép dữ liệu nhập vào JavaScript inline.
- Lỗi ghi bộ nhớ giữ input/modal, rollback state và không báo thành công giả; dữ liệu lỗi có recovery, trường thiếu được bổ sung an toàn.
- State schema 3 vẫn giữ khóa `DTMS_MANAGEMENT_APP_STATE_V2`. `workflowSubmissions` được lưu cùng hồ sơ để tránh ghi hai khóa không đồng bộ; lịch sử cũ được nhập một chiều và giữ bản gốc.
- Tệp kiểm phần mở rộng/dung lượng/rỗng tại client. Chưa có upload nội dung hoặc kiểm tệp phía server; không báo metadata là tệp đã tải lên.
- Modal hỗ trợ Tab/Shift+Tab/Escape, focus trap, trả focus và nội dung ẩn không nhận focus. Form có lỗi tiếng Việt theo trường và khóa gửi kép.

## 4. Bằng chứng kiểm thử

| Engine | Chức năng | Workflow/API mock | Hồi quy | Tổng | Modal |
|---|---:|---:|---:|---:|---:|
| Chromium | 19/19 | 16/16 | 18/18 | 53/53 | 100 |
| Edge | 19/19 | 16/16 | 18/18 | 53/53 | 100 |
| Firefox portable | 19/19 | 16/16 | 18/18 | 53/53 | 100 |
| WebKit Windows | 19/19 | 16/16 | 18/18 | 53/53 | 100 |

Đã kiểm luồng NCS → NHD → BM → PDT, chấm/duyệt/nộp lại, quyền Hội đồng/BGH và nhánh thiếu điều kiện. Không thêm điểm giả vào dữ liệu ứng dụng để vượt điều kiện cấp bằng. Luồng cấp bằng thật chưa thể nghiệm thu khi chưa có nguồn điểm/quyết định và backend.

Không ghi nhận pageerror trong các luồng được kiểm. Tài nguyên local, id/handler, ảnh campus, nhãn form và redirect của 10 trang tách được kiểm tra. Payload XSS và thao tác test chỉ chạy trong context riêng đã đóng; không sử dụng dữ liệu của trình duyệt cá nhân.

Bằng chứng máy đọc: [tổng hợp](TEST_SUMMARY_2026-10-18.json), `TEST_RESULTS_*.json`, `TEST_INTEGRATION_*.json`, `TEST_REGRESSIONS_*.json`, `TEST_MODAL_*.json`. Hướng dẫn lặp lại: [TESTING.md](TESTING.md).

## 5. Phần chưa nghiệm thu thật

| Mục | Trạng thái và lý do |
|---|---|
| BE-01 | Login backend luôn trả user/token tạm, thiếu xác thực/phiên/quyền thật. Không sửa backend trong ZIP ở tác vụ frontend này. |
| BE-02 | Diploma backend luôn IsValid=true. Client mặc định khóa dịch vụ; chỉ bật khi có truy vấn sổ gốc và nhánh không tìm thấy. |
| BE-03 | ZIP chưa có API học vụ, tệp, thông báo, luận án công khai, workflow và export chính thức. Chưa có server/database sống để nghiệm thu. |
| AUTH-02 | Nhớ email/hỗ trợ đã làm; đăng ký tài khoản và reset mật khẩu thật cần API/chính sách cấp tài khoản của trường. |
| PUBLIC-01 / LOOKUP-01 | Phần client và adapter hoàn tất; dữ liệu thật phụ thuộc các API còn thiếu hoặc còn stub. |
| M10-02 / M12-01 | Phiếu/đơn demo hoạt động; thành lập hội đồng, thẩm quyền phê duyệt và quyết định chính thức chưa có nguồn dữ liệu/quy tắc server. |
| QA-02 | Firefox đã chạy qua binary portable. Safari thật trên macOS/iOS và kiểm thử backend thật chưa có môi trường. |
| Thạc sĩ / tuyển sinh | Source hiện có là tiến sĩ; chưa có model/API/quy tắc riêng cho chương trình thạc sĩ và luồng dự tuyển. Không tự áp điều kiện tiến sĩ hoặc tạo nghiệp vụ giả. |
| Thiết kế cuối | Chưa có Figma/bản chuẩn cuối; đã giữ thiết kế hiện có và kiểm ảnh thực tế. |

Trạng thái chi tiết từng mã được ghi trong [TODO.md](../TODO.md) và [ISSUE_STATUS](ISSUE_STATUS_2026-10-18.json). Không đánh dấu những phần phụ thuộc trên là đã hoàn tất đầu cuối.

## 6. File thay đổi và quy ước

Danh sách chính xác 23 file frontend/test sửa và 3 file JS/CJS thêm ở [CHANGESET](CHANGESET_2026-10-18.json). Công cụ xuất báo cáo riêng: `scripts/build-report.py`; báo cáo PDF đã được render và xem đủ 6 trang. Các file đang nạp được mô tả trong [bản đồ source](../js/README.md); không nạp đồng thời JS core/modules và các bản cũ ở thư mục JS gốc.

Giữ `m01`–`m14`, `panel-mXX`, `modal-*`, `form-*`; JS camelCase, CSS kebab-case, hook `data-*`. Các trường workflow mới dùng tên có nghĩa. Không tự reset localStorage khi đổi schema; không đưa mật khẩu/token/chuỗi kết nối vào frontend.

## 7. Checklist người dùng tự nghiệm thu

- [ ] Chạy `node scripts/serve.cjs`; mở trang và thử menu ở 360/768/1024/1440px.
- [ ] Mở phiên NCS/NHD/PDT, đăng xuất, tải lại và thử quay vào quản lý sau thoát.
- [ ] Thêm/sửa/xóa một hồ sơ mới; thử mã/email trùng, tìm không dấu, lọc rỗng và chuyển trang.
- [ ] Nộp kế hoạch rồi duyệt NHD → BM → PDT; thử duyệt sai vai trò/thứ tự.
- [ ] Phân công trùng rồi tải lại; quota không tăng lặp hoặc tự giảm.
- [ ] Chấm chuyên đề điểm thấp; đánh giá báo cáo cần sửa; tải lại để kiểm điểm/nhận xét.
- [ ] Nộp lại tiểu luận/đề cương; bản mới ở trạng thái chờ đánh giá/duyệt.
- [ ] Khai báo công bố, thử DOI trùng, tệp sai, sửa/xóa bản chờ và khóa bản đã duyệt.
- [ ] Kiểm bảng điểm 12 TC mẫu và bảng kiểm; cấp bằng phải bị chặn khi thiếu điều kiện.
- [ ] Thử ba báo cáo CSV, sao lưu JSON và bàn phím modal; các tệp tải được đúng định dạng.
- [ ] Tra cứu khi backend chưa sẵn sàng không được báo văn bằng hợp lệ.
- [ ] Khi có backend thật: chạy lại xác thực, scope, upload, lỗi HTTP và luồng quyết định; nghiệm thu thêm Safari thật.

## 8. Bàn giao tiếp theo

Phần tiếp theo cần backend/test environment và xác nhận quy tắc, không cần kiểm kê lại frontend từ đầu. Đọc [PROGRESS.md](../PROGRESS.md), các mục còn mở trong TODO và [hợp đồng API](../API-INTEGRATION.md) trước khi nối dữ liệu thật. Giữ chế độ demo được nhận diện rõ cho đến khi hoàn thành xác thực và các API nghiệp vụ.
