# Checklist triển khai Backend

P0: nền tảng/quyền/tính đúng nghiệp vụ. P1: hoàn thiện tích hợp/báo cáo/các scope bổ sung. Công việc có quy tắc chưa chốt không tự chọn số demo làm production. Các task hạ tầng/ACL/file/query có thể làm trước; chỉ mutation chính thức phụ thuộc quyết định.

## Backlog có phụ thuộc và nghiệm thu

| Công việc | Ưu tiên | Nội dung | Phụ thuộc | Phạm vi | Tiêu chí nghiệm thu |
|---|---|---|---|---|---|
| BE-01 | P0 | Chốt phạm vi/SRS/quy tắc | Không | Q-01–27; ghi quyết định/căn cứ/role/threshold | Không còn mâu thuẫn ảnh hưởng mutation đang triểnkhai; draft rule không pass |
| BE-02 | P0 | Auth và ACL theo đối tượng | BE-01 cho mô hình auth/scope | API-01–06, /me, 7 role/object scope, logout/reset/idempotency | NCS A không đọc/sửa/upload/download/export NCSB; NHD/HĐ chỉ được giao; role client không tăng quyền |
| BE-03 | P0 | Schema/migration/IDs/danh mục | BE-01/02 | 04; API-68; major/cohort/unit/program/version/FK | FK/range/unique đạt; seed test riêngkhôngdemo thật; aliasrole thống nhất |
| BE-04 | P0 | Kho tệp/upload/download/ACL | BE-02/03, Q-24 | API-64–67; scan/retention/private-public/hash | Binary thật, upload file giả/quá MB/traversal/fileothers bị chặn, public không tải file kín |
| BE-05 | P0 | Audit/outbox/concurrency | BE-02/03 | API-63; append-only, actor IP server, job/cooldown/retry | Mọi mutation commit có audit; không sửa/xóa; retry không quota/degree/mailtrùng |
| BE-06 | P0 | Hồ sơ/danh sách/summary | BE-02/03 | API-08–11/15; filter/sort/page/scope details | Từng row đúng ID, search/filter thật, total cùng scope; PIIẩn; reload giữ contact |
| BE-07 | P0 | Kế hoạch revision/3 cấp | BE-05/06, Q-03/04/14 | API-16–18; milestone/baseline/reviews | Sai bước 409, hai actorconcurrent 1 commit; revision không xóa approvals cũ |
| BE-08 | P0 | NHD/quota/assignment | BE-03/05/06, Q-05 | API-19–21; quotaatomic/QĐ/co check/history | Hai phân công cuối quota đồng thời không vượt; duplicate không tăng; main!=co |
| BE-09 | P0 | Học phần/điểm/registration | BE-03/05/06, Q-04/06 | API-22–26; grade source job/rules GPA | Score/GPA/creditđúng; chưa điểm null; đăng ký không pass; nguyên tắc ghi đèchốt |
| BE-10 | P0 | Tiểu luận/đề cương và topic | BE-04/05/09, Q-07/09 | API-27–33; comments/minutes/rosters/revisions | Bản mới không giữ pass cũ; score dưới rule fail; outline approve có server path |
| BE-11 | P0 | Lịch báo cáo/reviews/alerts | BE-04/05/07, Q-10/11 | API-34–39; period actual/re submit/outbox | Kỳ đến hạn chưa nộp cảnh báo; latest không mảng cuối; comment/nội dung/filepersist |
| BE-12 | P0 | Công bố/author/review/summary | BE-04/05, Q-08 | API-40–42; DOI unique/1-2cấp/rules | NCS không tự duyệt; ISSN/role đúng; pending không cộng score; countvsscorechốt |
| BE-13 | P0 | Đề tài/version/signoff/tương đồng | BE-04/05/08, Q-15/16 | API-43–47; version/hash/approval/provider async | Không ký số giả, không 14%fake, bytebản cũimmutable, check/report đúng version |
| BE-14 | P0 | Checklist và hồ sơ bảo vệ | BE-07–13, Q-17–20 | API-48/49/52; rule/evidence/notice/ACL | Credits/ngoại ngữ/seminar/evidence unknown không pass; public timestamp server; PB identity không NCS |
| BE-15 | P0 | Biểu quyết | BE-14, Q-19 | Chọn API 50 hoặc 51; roster/attendance/biên bản | Sai HĐ 403, mỗi phiếu đúng actor, quorum/threshold chốt; không nhập tổng bất kỳ |
| BE-16 | P0 | Biến động học vụ | BE-04/05/06/08, Q-12/13 | API-12–14; type payload/reviews/decisionapply | Submit không đổi hạn; QĐ cuốiatomicđổicandidate/title/assignment; history giữ |
| BE-17 | P0 | Sau bảo vệ/cấp bằng/sổ gốc | BE-14–16, Q-21 | API-53–57; verified deposits/decision/unique register | Chưa đạt bảo vệ/thiếu receipt không cấp; issuedpersist/lookup; doubleclick 1 bằng |
| BE-18 | P1 | Public theses/degreeprivacy | BE-04/14/17, Q-20/22 | API-57/58/67; paging/files/policy | Wrongcode/name/crosspair không verified; trùng tên list; revokedkhácvalid; publickhôngPII |
| BE-19 | P1 | Dashboard/report summary | BE-06–17, Q-14 | API-07/11/59/60; scope/formula/cache | 126/48 giải thích scope; percent/average mẫu số rõ; deadline cập nhật theo ngày |
| BE-20 | P1 | Report export/jobs | BE-04/05/19, Q-23 | API-61/62; templatesPDF/XLSX/CSV/ZIP; asOf | 3 nút 3 loại, đúngmagic/MIME, DB snapshot, ACL, formulaCSVsafe, missing evidence rõ |
| BE-21 | P1 | Nối frontend sau bàn giao | BE-02–20 | Nạp API client/adapter; hydrateform/rows; gỡmocktheođợt | Error/empty/loading/mất mạngđúng, không seed ghi đè; mobilecontrols, VI EN same ID |
| BE-22 | P1 | Khoảng trống quản trị/import/điều phối | BE-01/Q-26/18/19/15 | Chốt UI/contractimportNCS, program CRUD, seminar/PB/HĐ/QĐ/lock/admin | Cóinventory/UI/API/schematrace và quyền/rule, cần thì bổ sung cùngbộdocs; không đánhdone chỉ đọc table |

## Bộ kiểm thử tích hợp bắt buộc

1. Auth: đúng/sai/hết phiên/logout, role chưa cấp, request HTTP trực tiếp bỏ UI hide. Mỗi role và mỗi quan hệ scope có ít nhất 1 case được/không được; test NCS A → B cả file/export/ID path.
2. Data: validateFK/range/unique, missing null khác 0, filter/sort/page/empty, total cùng scope. Re render VI/EN không đổi ID/kết quả.
3. Workflow: sai bước, revision cũ, 2 duyệt đồng thời, return/re submit sau khi được chốt. Idempotency cho nộp/assign/vote/conferral/export/reminder.
4. File: byte thật và hash/type; giả MIME/quá MB/tệprỗng/không clean/ngoài scope/missing object; public không tải phiếu kín. Close/cancel không submit hồ sơ.
5. Academic: điểm quanhngưỡng, làm tròn/GPA, đăng ký không tín chỉ, topic 0 không auto đạt, kỳ chưa nộp/overdue, approvedscore/count, deadline sau pause/extension.
6. Defense/degree: rule unknown không pass, version mới không dùng signoff/check cũ, sốphiếuvượtattendance, thiếu verified post/deposit, chốngdoubledegree; issued → lookup thật.
7. Failure: server 500/503/provider chưa cấu hình, mất mạng sau commit, timeoutclient, retry không nhân bản; outboxfailedkhôngđảotrạng thái hồ sơ đã commit. requestId/audit đủ truy vết.
8. Export: đúng CSV/PDF/XLSX theo nhãn, 3 typekhácnhau, DB snapshot/filter/scope, CSV escaping/formulainjection, thực tải file vàexpiredURL.

Các test trên là yêu cầu QA tương lai, không tuyên bố đã chạy API backend. Đợt tài liệu chỉ kiểm source coverage/hash/crossreference/JSON.

## Đối chiếu 45 FR của báo cáo đính trong source

“Đánh giá cũ” giữ nguyên để truy vết, không đồng nghĩa hiện trạng. Dùng CN/API/BE để phânchia việc; FR thiếu UI cần BE 22 trước chốt mutationcontract.

| FR | Ưu tiên gốc | Yêu cầu báo cáo | Đánh giá cũ | Truy vếtCN/BE/Q |
|---|---|---|---|---|
| FR-HS01 | MUST | Tiếp nhận và import danh sách NCS trúng tuyển | Thiếu | CN-45/CN-59; BE-22 |
| FR-HS02 | MUST | Phân loại đối tượng đầu vào và gán lộ trình | Thiếu | CN-11/CN-14; BE-03/22 |
| FR-HS03 | MUST | Quản lý thông tin lý lịch khoa học của NCS | Mô phỏng | CN-11 |
| FR-HS04 | MUST | Quản lý trạng thái học vụ và cảnh báo | Một phần | CN-10/CN-11/CN-29 |
| FR-HS05 | MUST | Quản lý hồ sơ gia hạn và điều chỉnh thông tin | Mô phỏng | CN-12/CN-50 |
| FR-CT01 | MUST | Quản lý danh mục CTĐT tiến sĩ theo ngành/khóa | Một phần | CN-14; BE-22 |
| FR-CT02 | MUST | Lập kế hoạch học tập và nghiên cứu toàn khóa | Mô phỏng | CN-15 |
| FR-CT03 | MUST | Phê duyệt kế hoạch học tập nhiều cấp | Sai quy trình | CN-16 |
| FR-CT04 | SHOULD | Điều chỉnh kế hoạch học tập, nghiên cứu | Mô phỏng | CN-15 |
| FR-CT05 | MUST | Đối chiếu tiến độ thực tế với kế hoạch gốc | Một phần | CN-14/CN-08 |
| FR-HD01 | MUST | Quản lý hồ sơ lý lịch khoa học NHD | Một phần | CN-17; BE-22 |
| FR-HD02 | MUST | Kiểm soát định mức hướng dẫn tự động | Sai quy tắc | CN-18 |
| FR-HD03 | MUST | Phân công và ban hành QĐ cử NHD | Mô phỏng | CN-18 |
| FR-HD04 | MUST | Thay đổi hoặc bổ sung người hướng dẫn | Mô phỏng | CN-19 |
| FR-HD05 | MUST | Cổng thông tin dành cho NHD | Một phần | CN-08/CN-16/CN-31 |
| FR-HP01 | MUST | Đăng ký học phần và theo dõi điểm số | Mô phỏng | CN-20/CN-21/CN-22 |
| FR-HP02 | MUST | Quản lý nộp và đánh giá Tiểu luận tổng quan | Sai quy tắc | CN-23/CN-24 |
| FR-HP03 | MUST | Quản lý nộp và xét duyệt Đề cương nghiên cứu | Mô phỏng | CN-25 |
| FR-HP04 | MUST | Quản lý bản giải trình chỉnh sửa đề cương | Mô phỏng | CN-25 |
| FR-HP05 | MUST | Kiểm soát điều kiện chuyển tiếp học vụ năm 1 | Thiếu | CN-27/CN-41; Q-09 |
| FR-CD01 | MUST | Đăng ký và quản lý 2-3 Chuyên đề tiến sĩ | Mô phỏng | CN-26/CN-27 |
| FR-CD02 | MUST | Đánh giá Chuyên đề tiến sĩ | Sai quy tắc | CN-28 |
| FR-CD03 | MUST | Nộp Báo cáo tiến độ định kỳ 6 tháng/lần | Mô phỏng | CN-29/CN-30 |
| FR-CD04 | MUST | Đánh giá Báo cáo tiến độ của NHD và Bộ môn | Mô phỏng | CN-31 |
| FR-CD05 | MUST | Thẩm định tiêu chuẩn công bố khoa học | Sai quy tắc | CN-33/CN-34 |
| FR-LA01 | MUST | Quản lý đề tài và thay đổi tên đề tài luận án | Mô phỏng | CN-36/CN-37 |
| FR-LA02 | MUST | Quản lý các phiên bản bản thảo Luận án tiến sĩ | Mô phỏng | CN-38 |
| FR-LA03 | MUST | Quản lý xác nhận đồng ý cho bảo vệ của NHD | Mô phỏng | CN-40 |
| FR-LA04 | MUST | Kiểm tra trùng lặp trích dẫn và cam đoan | Mô phỏng | CN-39 |
| FR-LA05 | MUST | Khóa bản thảo phục vụ thẩm định và bảo vệ | Thiếu | CN-36; BE-22/Q-15 |
| FR-BV01 | MUST | Quản lý Trình luận án tại Đơn vị chuyên môn | Một phần | CN-44/CN-45; BE-22/Q-18 |
| FR-BV02 | MUST | Kiểm tra tự động Bảng kiểm điều kiện bảo vệ (Checklist) | Sai quy tắc | CN-41 |
| FR-BV03 | MUST | Quản lý quy trình Phản biện độc lập luận án | Một phần | CN-42/CN-45; BE-22 |
| FR-BV04 | MUST | Thành lập Hội đồng đánh giá luận án cấp Trường | Một phần | CN-42/CN-45; BE-22 |
| FR-BV05 | MUST | Công khai Tóm tắt luận án trên Cổng thông tin | Mô phỏng | CN-45/CN-57 |
| FR-BV06 | MUST | Quản lý hoàn thiện sau bảo vệ, lưu chiểu và cấp bằng | Mô phỏng | CN-46/CN-47/CN-48 |
| FR-TD01 | MUST | Quản lý thay đổi người hướng dẫn | Mô phỏng | CN-19/CN-50 |
| FR-TD02 | MUST | Quản lý thay đổi tên đề tài luận án | Mô phỏng | CN-37/CN-50 |
| FR-TD03 | MUST | Quản lý tạm dừng học tập / Nghỉ học tạm thời | Mô phỏng | CN-12/CN-50 |
| FR-TD04 | MUST | Quản lý chuyển cơ sở đào tạo / Buộc thôi học | Một phần | CN-50/CN-51; BE-22 |
| FR-BC01 | MUST | Cổng tra cứu văn bằng tiến sĩ công khai | Sai chức năng | CN-49/CN-58 |
| FR-BC02 | MUST | Báo cáo thống kê tiến độ đào tạo NCS theo ngành/khóa | Mô phỏng | CN-52/CN-53 |
| FR-BC03 | SHOULD | Thống kê năng suất công bố khoa học của NCS và NHD | Một phần | CN-33/CN-52 |
| FR-BC04 | MUST | Kết xuất hồ sơ phục vụ kiểm định chất lượng giáo dục | Mô phỏng | CN-13/CN-53 |
| FR-BC05 | MUST | Ghi nhật ký hệ thống bất biến (Audit Trail Log) | Sai chức năng | CN-54 |

## Tiêu chí bàn giao tích hợp

Mỗi CN có API trả đủ fields/enum/lỗi/permission; mọi mutationpersist/truy cập thiết bị khác; mock không dùng trả response. Danh sách/controlnhỏ/render dynamic map đủ; file thật/tải thật/export đúng định dạng; unknown thiếu quy tắc không pass; quyết địnhQđượcghi căn cứ và cập nhật đồng bộdocs. Backend có thểchiaBEtasks, nhưng không tuyênbốnghiệmthu 45 FR nếu các UI/quản trị điều phối còn thiếu.
