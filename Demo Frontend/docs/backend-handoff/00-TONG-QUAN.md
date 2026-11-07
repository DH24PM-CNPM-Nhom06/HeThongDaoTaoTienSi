# Tổng quan bàn giao Backend DTMS

Ngày khảo sát: **14/10/2026 (Asia/Bangkok)**. Phạm vi gồm toàn bộ thư mục Demo Frontend và README trong thư mục cha. Đây là phân tích tĩnh mã nguồn và tài liệu có trong checkout; đợt này chưa chạy kiểm thử trình duyệt hoặc API Backend. Không sửa frontend, không reset hoặc thay đổi dữ liệu demo.

## Kết quả kiểm kê trước khi đặc tả

**7 vai trò thực thi; 14 phân hệ quản lý; 7 màn hình cấp cao; 20 modal quản lý; 1 Hologram Inspector; 1 popup chat; 16 form; 15 bảng; 258 phần tử điều khiển HTML tĩnh, gồm171 nút, 91 phần tử có onclick và 13 ô chọn tệp; 60 nhóm chức năng được đặc tả.**

258 được đếm mỗi phần tử một lần nếu là button/a/input/select/textarea hoặc có onclick/role=button. Các ô ứng dụng chỉ có data-switch-view và thành phần tạo bằng JavaScript được kiểm kê riêng trong 01. 60 là nhóm hành vi, không phải số nút. Không có phân trang đang hoạt động.

## Kiến trúc hiện tại và mục tiêu tích hợp

Frontend dùng HTML/CSS/JavaScript thuần trong một index.html. Checkout không có package.json, framework build, Backend, cơ sở dữ liệu hoặc migration. README nêu Next.js/Flutter/NestJS/Spring Boot/PostgreSQL/Redis như định hướng phân công của nhóm, không phải công nghệ đã triển khai trong gói này.

index.html: 3131–3133 chỉ nạp **config.js→app.js→management.js**. api.js có fetch/getPublicTheses, home.js có tích hợp giao diện cũ, nhưng cả hai **không được nạp**. API_BASE_URL và route login/degreeLookup đang rỗng. /api/public/theses là tên trong cấu hình; chưa có bằng chứng máy chủ hoặc endpoint sống.

~~~mermaid
flowchart LR
 UI[7 view và14 panel] --> APP[app.js: điều hướng và dữ liệu công khai mẫu]
 UI --> MG[management.js: quyền và trạng thái demo]
 MG --> LS[localStorage: state và metadata tệp]
 MG --> SS[sessionStorage: vai trò demo]
 UI -. Tích hợp đề xuất .-> API[Backend: xác thực và nghiệp vụ]
 API --> DB[CSDL và lịch sử]
 API --> FILE[Kho tệp và ACL]
 API --> JOB[Jobs xuất file và thông báo]
~~~

Các tài khoản mẫu dùng chung trạng thái trong một trình duyệt. Đổi vai trò đổi cả người mẫu, khác với tài khoản thật được cấp nhiều quyền. localStorage không phải cơ sở dữ liệu thật; tên và metadata tệp không phải nội dung đã upload lên máy chủ. Các phần cần Backend gồm xác thực, quyền theo đối tượng, transaction, kho tệp, thông báo, tích hợp ký số/tương đồng và audit bất biến.

management.js có nhiều hàm khai báo trùng trong cùng IIFE: applyRolePermissions, renderRoleDashboard, login, notify, addAuditLog, renderAuditLogTable, switchRole, switchModuleTab, openModal, closeModal, initModalListeners. Bản khai báo sau có hiệu lực. Vì vậy đoạn ẩn hàng NCS/NHD ở dòng 205 bị bản 504 thay thế; không kết luận dữ liệu đã được cách ly từ đoạn đầu.

## Quy ước bằng chứng

- **Hiện tại:** hành vi từ markup và handler có hiệu lực; chưa xác nhận bằng kiểm thử trình duyệt trong đợt này.
- **Mock:** HTML, mảng JavaScript, localStorage và metadata tệp. CSV có thể tải thật nhưng vẫn chứa dữ liệu giả.
- **Cần Backend triển khai:** API, schema, ACL và logic máy chủ đề xuất; chưa có trong checkout.
- **Cần xác nhận:** quy định, công thức, actor hoặc chuyển bước thiếu căn cứ hoặc mâu thuẫn. Nhãn thông tư trên giao diện không xác nhận hiệu lực pháp lý.

## Vai trò và phạm vi đề xuất

| Role | Tên | PanelROLE_MODULES | Scope server đề xuất |
|---|---|---|---|
| NCS | Nghiên cứu sinh | m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12 | Hồ sơ mình |
| NHD | Người hướng dẫn | m01, m02, m03, m05, m06, m07, m08, m09, m10, m11, m12 | NCS phân công |
| BM | Trưởng Bộ môn | m01, m02, m03, m05, m06, m07, m09, m10, m12 | Bộ môn phụ trách |
| KHOA | Ban Chủ nhiệm Khoa | m01, m02, m03, m05, m06, m10, m12, m13 | Khoa phụ trách |
| PDT | Phòng Đào tạo | m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14 | Nghiệp vụ/đơn vị được cấp |
| BGH | Ban Giám hiệu | m01, m03, m10, m11, m12, m13 | Thẩm quyền trường |
| HOIDONG | Hội đồng đánh giá | m09, m10 | Luận án/hội đồng được giao |

Phạm vi cụ thể cần nhóm xác nhận. Quyền mở phân hệ khác quyền thêm/sửa/duyệt. Backend kiểm phiên, quyền tác vụ, quan hệ hồ sơ và trạng thái trên mọi request, kể cả download/export. ACTION_ACCESS/MODAL_ACCESS chỉ ẩn nút; một số handler thiếu kiểm quyền trực tiếp.

Mã persona TBM/BCNK/PĐT/HĐ ánh xạ BM/KHOA/PDT/HOIDONG, không tạo thêm bốn vai trò. Ma trận m14 chỉ ghi 6 vai trò và thiếu HĐ. Không tìm thấy ADMIN hoặc CRUD tài khoản/quyền. Reset demo dành PDT không đồng nghĩa quyền xóa dữ liệu production.

## Đối chiếu tài liệu trong checkout

extracted_doc.txt là báo cáo ngày 30/09/2026 đối chiếu 45 FR. SRS gốc “phân tích thiết kế 01.docx”, Use Case và ERD không có trong phạm vi đã quét. Báo cáo được dùng làm manh mối và truy vết khoảng trống, không thay thế tài liệu gốc.

Mã hiện tại đã thay đổi so với báo cáo: có 7 vai trò, localStorage, ô chọn tệp, ngưỡng tiểu luận 7, quota JavaScript 4/3/3, duyệt kế hoạch NHD→BM→PDT, chặn NCS tự thẩm định, CSV download và sổ bằng mẫu 3 bản khớp chính xác. Turnitin hiện báo chưa kết nối. Những nhận xét cũ như “tải lại mất hết”, “NCS tự duyệt”, “mọi nhập đều xác thực” không còn đúng với handler hiện hành; các phần Backend và chứng cứ thật vẫn còn thiếu.

## Cách đọc và triển khai

01 kiểm kê giao diện và vị trí source; 02 chứa 60 nhóm đặc tả A–H; 03 có 68 hợp đồng API đề xuất (gồm phương án cần chốt); 04 đề xuất 56 thực thể; 05 mô tả chuyển bước; 06 đối chiếu từng nhóm và literal mock; 07 có 22 công việc và truy vết 45 FR; 08 có 27 câu hỏi cần chốt.

Mẫu JSON chỉ minh họa schema; ID ncs-01/file-01 không phải dữ liệu thật. Quy tắc chưa cấu hình trả null/unknown kèm reason và không tự cho đạt. Giao diện còn thiếu cần bổ sung ở đợt tích hợp sau; bộ tài liệu này không thay source.

## Sổ file khảo sát

| File | Byte | SHA-256 tại khảo sát |
|---|---|---|
| extracted_doc.txt | 13715 | f 9 f 966 d 0 f 7 fca 9167 c 116 a 54895 b 8 c 564346 f 3 f 054227 a 2 e 8100 a 1 c 43 a 82 c 584 |
| index.html | 193789 | 6 ec 6 dd 24 a 53 c 9 caa 6 f 0 d 5 ab 188323 f 73228528 c 4939 e 3858164679535 e 6942 d 5 |
| css\app.css | 22576 | 24 df 2517 d 9 e 456 a 672310 f 161 db 6 e 458 fd 2 e 34 a 6844 e 7 ba 73 f 8 f 954 e 2250 ad 17 |
| css\home.css | 22374 | 1 aa 1900774 ee 018 ab 40 b 8667888838 ff 78209509 eb 0 ed 288 f 93 ad 43 c 9425 b 887 |
| css\management.css | 19854 | 433 d 8 d 1 ffaf 4 aa 232732329 a 8211 b 466519 f 70 c 7822 f 95 f 02 a 4 dad 6550 e 91700 |
| css\responsive.css | 2764 | c 911 aa 081572 f 88424 d 36846 aa 376 f 5 a 3 f 3 a 41 f 1 ad 3 ce 32 fe 5569 f 43 b 8 f 0 a 61 e |
| css\style.css | 12696 | 66507 ea 7 e 61 ed 716835 cff 78 ed 6 a 117 b 0 cfbe 448223 f 2 b 4758 df 0 f 557 dec 6455 |
| js\api.js | 1322 | c 8 ccaa 39 a 379 f 189 b 8 f 387201 ccd 19 a 24 a 93 d 7 d 894 c 494 f 0963680 a 8968 ba 0 d 3 |
| js\app.js | 100022 | 1590 fa 935 ef 90 c 6 cab 7 dbf 435 dea 78 cb 0914926735 f 1 f 860 b 0 b 99 e 491 af 39 ab 8 |
| js\config.js | 382 | 4905708 bc 0 a 3 ffbb 093 e 49739 b 5 e 28 e 7 b 6401 c 53 ceb 12 a 32 dc 7 f 75 ffdf 6 a 2928 |
| js\home.js | 10864 | 989089592259 fcc 628 cb 6 d 3 bfa 42 d 64526 ee 0 c 17 d 69 b 1 c 3270535432 bbae 8 fdf |
| js\management.js | 89399 | 045491 cf 2 fabb 0 f 7 a 08 c 1 b 78 dda 2 b 99 bb 1087 f 647 cea 7 e 67 d 0289 be 7 b 8 c 7 cedf |
| assets\icons\favicon.svg | 257 | 97545 dacf 2 b 23 a 7 d 1 ea 1 cc 75 bd 41 f 28408 e 9 b 6 b 88 deeef 0954 a 037 db 38 bb 54 ee |
| assets\images\agu-campus.png | 520258 | 7 a 7465 ac 29384 dde 40 acb 9 f 81 a 5 cd 53974 c 8 d 005 e 260701 fb 086 c 2 e 3 eeb 3513 d |


## Kết quả rà soát bộ tài liệu

Đã kiểm tra đủ 9 tệp, 60 nhóm A–H với 9 bước, 68 API, 258 control, 16 form, 56 thực thể, 22 công việc, 27 câu hỏi và 45 FR có truy vết. Cả 239 khối JSON đều hợp lệ; liên kết nội bộ và số dòng source tồn tại. SHA-256 của 14 tệp gốc khớp lần khảo sát, không thay mã hoặc dữ liệu demo. Đây là kiểm tra tài liệu và mã nguồn, không phải kiểm thử Backend hoặc trình duyệt.
