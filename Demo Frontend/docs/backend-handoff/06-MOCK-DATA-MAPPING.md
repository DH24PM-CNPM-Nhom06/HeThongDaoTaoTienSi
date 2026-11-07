# Đối chiếu dữ liệu giả lập với dữ liệu thật

Không migrate seed thành dữ liệu thật tự động. Mỗi nhóm dưới đây chỉ rõ source/giá trị/query API/field/lưu hay tính/công thức/reload. **Số trong ví dụ API không chứng minh mock đúng.** Formula từ source được ghi là formula demo; quy định chưa có căn cứ luôn cần xác nhận.

## Bản đồ dữ liệu và công thức

| Nguồn hardcode | Giá trị hiện tại | Nguồn thật | API | Response fields | Lưu/tính | Formula/căn cứ | Reload |
|---|---|---|---|---|---|---|---|
| js/management.js:11–87 USERS_ROLE_STORE | 7người mẫu, email/phone/title/major/avatar | users/user_roles/units, candidate/supervisor | API-02 | id/name/title/unit/roles/activeRole/avatar/candidateId | Lưu trực tiếp thật; seed giả | Không coi 7 seed là users thật | Login/role/profile change |
| management.js:110–129 ROLE_DASHBOARDS | NCS68%; 18/24; 12ngày; deadline11/10 và18/10 | program/results/milestones/report_periods | API-07 | metrics, value, target, reason, priorityTasks, dueAt, daysRemaining | Computed, chuỗi mẫu hardcode | Progress tổng cần chốt; credits=sum kết quả pass theo program; daysRemaining theo lịch/múigiờ chốt | Mở/đổi role, mọi điểm/mốc/báo cáo và ngày hiện tại |
| ROLE_DASHBOARDS.NHD | 06NCS/03chờ/02report | assignments/workflow_reviews/progress_reports | API-07 | supervised Count, pending Review Count, pending Report Count | Computed | COUNT DISTINCT trong phạm vi và stage actor, không count sum toàn hệ thống | Phân công/nộp/duyệt |
| ROLE_DASHBOARDS.BM/KHOA/PDT/BGH/HĐ | BM18/4/3; Khoa42/5/3; PDT126/12/8; BGH126/3/8; HĐ2, 1/2, 1 | Candidates/units/tasks/defenses/members | API-07 | metrics/priorityTasks/quickActions | Computed | Count theo scope role; due upcoming window/công thức workload cần chốt | Mọi request/decision/assignment/review |
| index.html:368–410 m01 | 48total/39studying/5extended/4paused | candidates status/scope | API-11 | total/byStatus/scope/computedAt | Computed | Count DISTINCT; total theo tập trạng thái, có thể còn tốt nghiệp/thôi học | Hồ sơ/status/filter |
| index.html:415–495 | Bình, 18/06/1993, Nam, CCCD089093001234, phone/email/work/address; 412QĐ, start2023/end2026/max2029, còn13tháng | candidates+majors/cohorts/decision/program | API-09 | Tất cả personal/training fields, response API 09 | Lưu ngày/thông tin; remaining computed | Ngày/hạn theo lộ trình/QĐ; remaining 13 tháng tĩnh không đúng ngày 14/10/2026 | Mở hồ sơ/đổi candidate/profile/biến động |
| index498table | 3NCS:ENV01/AGR04/BUS02, name/major/cohort/NHD/status | candidates+relations | API-08 | items[id, code, name, major, cohort, supervisors, status], paging | Lưu/query tổng hợp | Không lấy row đầu mặc định là hồ sơ được quyền | Filter/page/sort/status/assignment |
| INITIAL_STATE.profile, management.js:410–416 | phone/email/workplace; monthsUsed36/max48 | candidates/training dates/rules | API-09/48 | Contact fields; trainingStart/standardEnd/maximumEnd/checklist | Lưu contact; months computed | JS months\|\|36/max\|\|48 có fallback, lại max 48 vs 6 năm HTML; cần chốt tính months/pause | Profile/hạn/date, không seedghiđè |
| leaveRequests seed và HTML561 | SeedĐN1082/06tháng/15-08-2026/PDT vsHTMLĐN2025-081/QĐ218 | academic_change_requests/reviews/decision/files | API-12 | request code/type/date/duration/reason/status/decision/attachments | Lưu request; duration computed | Renderer thay row HTML; thời gian chuẩn hóa start/end | Submit/review/decision |
| index616–632, 644–735 | 68/65, +3; 90TC=12+2+6+70; HK1–6/100/85/pending | program/plan/baseline/results | API-15/16 | blocks, milestones, actual/expected/delta/reviews | Lưu khung/mốc; percent computed | Delta=actual-expected nếu đã chốtcả 2; 68/65 không công thức từ source | Kế hoạch/mốc/kết quả/role |
| planStage INITIAL0/render815–868 | 0NHD/1BM/2PDT/3approved | training_plans/reviews | API-16/18 | status, nextActorRole, reviews, revision | Lưu transition | Source chứng minh 3 cấp nhưng không replacepolicy văn bản | Submit/review/revision |
| index751–833 +assign2366–2379 +seed417–423 | HTML quotaGS3/PGS2/TS1; JS4/3/3 vàcount2, 2, 1, 2, 2 | assignment+academic_rules | API-19/21 | activeCandidateCount/quotaLimit/remainingQuota/ruleId | Computed và rule lưu | Active count DISTINCTtheochính/phụ và lịch hiệu lực cần chốt; available=max-count sau policy | Assignment/end/change; scope |
| index856–965 | 12/12TC; GPA8.85/3.65; ENV8019, 8.8 → 8.86; ENV8028.5, 9 → 8.85; ENV8039, 8.5 → 8.65; ENV8049.5, 9 → 9.15; ENV809pending | course_results/weights/program | API-22 | Process/exam/final/letter/GPA 10/GPA 4/earned-required/status | Raw điểm lưu; total/GPA computed | final=0.3*process+0.7*exam có source; GPA creditweighted 4 course=8.8775 → 8.88 khác 8.85 UI; letter/GPA 4/cách làm trònchưa xác nhận | Score sync/registration/result/program |
| registeredCourses lúc handler902 | Set codeENV809, lưusau click | course_registrations/offering | API-22/23/24 | registrationId/offeringId/status/registerAllowed/cancelAllowed | Lưu relation | Đăng ký≠pass/credits | Toggle/reload |
| index974–1066 vàseedessay8.77/outlineĐãduyệt | Essay3điểm8.5/9/8.8; TB8.77; biên bản; outline5/5, QĐ289, giải trình02/05 | submission/eval/files/decision | API-27/29/30 | Scores/avg/result/title/date/comment/minutes/outline/explanation/vote/QĐ | Raw scores/evidence lưu, mean computed | JS mean=(s 1+s 2+s 3)/3, toFixed 2>=7; chốtthứtựxétđạt/làm tròn; handler bỏ comment | Submit/evaluate/review |
| topics seed vàindex1089–1154 | Seednames ĐTM/rủiro/LCA và8.8/8.5/9.1khácHTML9.0/8.8/9.2; 100%, 6TC/9.0tĩnh | topics/evaluations/program | API-31 | Ordinal/name/NHD/credits/date/score/status; summary | Raw topic/score lưu, mean/count computed | Mean seed 8.8; HTML mean 9.0, metrickhônghydrate; requiredCount 2–3 cần chốt; passedmọi 0–10 làlỗidemo | Register/evaluate/reload/checklist |
| progressReports seed1–6pass vsHTML1–4/form5–6/dashboard7 | Dates/summary/comments+18ngàyLêVănHải/email02người | report_periods/reports/reviews/notification | API-34/37/38/39 | Period/due/submitted/summary/comment/status/file/overdue/latest | Lưu report/review; overdue computed | Latest theo lịch/dates, không slice(-1); overdueDays positive khi chưa nộp quá hạn, cáchcalendar/chốt | Submit/review/time/job |
| publications seedpub01/pub02 vsindex1291–1331 | 2title/journal/doi/category/roleskhácHTML; seedscore1+.75=1.75; HTML2/2; authorfirstmặc định | pub/authors/reviews/files/rules | API-40/41/42 | All pub fields, verifiedCount, approvedScoreTotal, requiredCount/Score, eligible | Raw pub/reviews lưu, totals computed | Source sumscorewhereverified; >=.75 checklist không kiểm 2 bài; chốttác giả/đóng góp/chỉ mục/affiliation | Declare/review/edit evidence |
| index1335–1467/handler1184 | TitleVI/EN, QĐ289; v1/v2/v3, size14.2/15.6/16.1MB; 14%/APA100% | projects/versions/files/checkservice | API-43/45/46 | Versions/sizeBytes/note/hash/similarity status/percentage/report | Lưu version/metadata; provider percentage | Handler hiện chỉ unavailable; 14% còn HTML không khởi động dịch vụ; threshold 20 cần chốt | Upload/check status/role |
| defenseApproval=timestamp state | BadgeNHDđãký | approval/version/signatureevidence | API-47 | approvedBy/At, versionId, reviewFileId, signatureStatus | Lưu approval; chữ ký dịch vụ | Timestamp không ký số, không giữ khiđổiver theo policy | Sign/revoke/new version |
| renderDefenseChecklistUI1116–1182 | 6mục essay>=7, outline approved, 3topics, score>=.75, lastreportpass, 36<=48; label24/24 | Allprogram/results/rules/actualevidence | API-48 | Items, status, actual, required, evidence, reason, eligible | Computed | hpCond chỉ essay, bỏ credits; fallback 36/48; không foreign lang/seminar/signoff/similarity; rule cần chốt | Mọi evidence/score/deadline/period |
| index1498–1628/defenseVote | 2PBaccept, 30/30ngày01/12–31/12/2025, HĐ7, 9.4, 7/7; promptyes>=4 | defense/review/council/notice/votes | API-49/50 | Anonymizedreviews/publish date/elapsed/schedule/member/vote/result | Lưu evidence/votes, someaggregate computed | Sourceyes>=4/7 là demo; required public days/vote rule cần chốt; 30 ngàykhôngtừhardcode | Notice/reviews/defense/vote/time |
| index1633–1722/degreeConferred | TS-AGU-2026-089/SG-TS-2026-012/QĐ128; 3deposits/receipts/financecompleted | post/deposits/degree/decision | API-53/56/57 | Post/reviews/deposits/eligible/degree code/register/date/status | Lưu verified evidence/degree, eligibility computed | Handlerconferchỉ 6 check, didnotcheckvote/signoff/deposits; không append MASTER | Post/review/conferral/lookup |
| index1744–1799 | 4BDhistoryQĐ/status | academic_change_requests/reviews/decision | API-12 | Candidate/type/reason/effective/status/decision/files | Lưu query relation | Không workflow local metadata chung cho all role | Submit/review/QĐ |
| index1853–1925 | K2021/22/23/24=8/12/14/14total48; percent100/85/92/100; 91pub44/25/22; 48/27/25%; 2.4 | candidates/status/pubscope | API-59/60 | Counts/numerator/denominator/onTime/category/average/asOf/scope | Computed | %category=count/91*100: 48.35, 27.47, 24.18; 2.4 mẫu số unknown; onTime rule cần chốt | Filter/date/status/pub review |
| handleExportReport1264–1299 | CSV4NCS hoặc4chỉbáokiểm định; 3nútđều nhánhkiểm định | DB snapshot/template | API-61/62 | Job/file/MIME/errors/asOf/scope | Computed file fromstoredfacts | ReportNameASCIIkhôngchứatiến độ/NCS; không true pdf/xlsx | Mỗi export/filter/asOf |
| AUDIT_LOGS INITIALseed5 +addAuditLogIP172.16.14.88 | 5seedlog/timestampthiếtbị/IPgiả; CSV local | audit_events/server/trustedproxy | API-63/61 | Time, actor, role, action, target, IP, result, requestId | Serverlưuappend-only | IPkhôngclienttựđiền; audit before/afterredact | Mutation/refresh/export |
| app.js459–638 PERSONA_DATA | 85/62/45/70/90/30/55%/tasks | Nội dunggiới thiệu; thậtnếu nhóm yêu cầu | Không API; API-07 nếu scope chốt | Title/desc/workload/tasks | Mock tĩnh | Công thức workload không có, cần xác nhận | Persona/language |
| app.js639–742 ROADMAP_NODES/I18N_DICT | 6stage, 2articles/3topics/30days; labelsVIEN | Nộidungtĩnh chưaxác nhận | Không API nghiệp vụ | Num/title/details/items | Lưu content tĩnh | Không tính toán/transition; không bằng chứng quy định | Language/node |
| app.js743–796 THESES_LIST | 3publicthesesVI/EN, fileexample.com | Approvedpublicnotice/files | API-58/67 | title, candidateName, field, expectedDefenseDate, summaryUrl/fullTextUrl | Query from stored notice | 3 người mẫu không data thật; aliasmappingAPI 58 | Mở public/q/page/language/publish |
| app.js1255–1286 MASTER_DIPLOMA_REGISTER | 3record2025-089/2024-042/2023-015; register/date/QĐ | degree_recordsissued/masterregister | API-57 | Code/name/nameEn/major/register/date/decision/status | Lưu records server | Khớp chính xác AND cả 2 field; trùng tên server list; 2026 UI không seed 2025 | Lookup/new degree/revoke |
| app.js972–1040/contact/chat | Hotline098.765.4321/fanpage/FAQ/24-7 | Thôngtin cầnxác nhận hoặccontentlocal | Không API nghiệp vụ | Messages/configcontacts nếu yêu cầu | Mock/localFAQ | KeywordifelsekhôngAIservice; điều kiệnFAQkhôngpolicy | Click/language |
| config.js1–14 vàhome.js/api.jschưanạp | API_BASE_URLrỗng, timeout8000, routesrỗng | Deploymentconfigchốt | API-58clientstub | Path/contractadapter/status error | Cấu hình không nghiệp vụ | Unloadedbranchkhôngthựcthi; home cyber lookup mô phỏng không thuộc UI active | Tích hợp đợt sau |

## Sổ từng giá trị leaf trong các dataset JavaScript

Mỗi dòng là một giá trị literal; chuỗi VI/EN là bản mô tả, không dữ liệu hai hồ sơ. Schema response thật xem03. Label/tasks/static mô tả giữ client; giá trị nghiệp vụ lấy API; role_modules chỉ là đối chiếu quyền demo, không auth server.

### USERS_ROLE_STORE — [js/management.js: 10](../../js/management.js#L10)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| NCS.id | usr_ncs | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.code | NCS | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.name | NCS. Nguyễn Văn Bình | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.title | Nghiên cứu sinh Khóa 2023 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.unit | Khoa Nông nghiệp - TNTN | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.major | Khoa học Môi trường (Mã: 9440301) | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.avatarText | NB | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.email | nvbinh_ncs@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NCS.phone | 0912.345.678 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.id | usr_nhd | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.code | NHD | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.name | GS.TS. Trần Văn Hướng | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.title | Người hướng dẫn khoa học chính | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.unit | Bộ môn Kỹ thuật Môi trường | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.major | Khoa học & Kỹ thuật Môi trường | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.avatarText | TH | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.email | tvhuong@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| NHD.phone | 0903.888.999 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.id | usr_bm | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.code | BM | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.name | TS. Lê Hoàng Nam | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.title | Trưởng Bộ môn Kỹ thuật Môi trường | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.unit | Khoa Nông nghiệp - TNTN | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.major | Quản lý Tài nguyên Nước | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.avatarText | LN | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.email | lhnam@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BM.phone | 0908.777.666 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.id | usr_khoa | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.code | KHOA | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.name | PGS.TS. Nguyễn Thị Kim | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.title | Phó Trưởng Khoa Nông nghiệp - TNTN | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.unit | Ban Chủ nhiệm Khoa NN-TNTN | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.major | Nông nghiệp Công nghệ cao | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.avatarText | NK | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.email | ntkim@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| KHOA.phone | 0918.555.444 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.id | usr_pdt | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.code | PDT | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.name | ThS. Phạm Minh Đăng | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.title | Chuyên viên QLĐT Sau Đại học | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.unit | Phòng Đào tạo Sau Đại học | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.major | Quản lý Giáo dục Đại học | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.avatarText | PĐ | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.email | pmdang_pdt@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| PDT.phone | 0296.384.6666 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.id | usr_bgh | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.code | BGH | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.name | PGS.TS. Võ Văn Thắng | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.title | Hiệu trưởng Trường ĐH An Giang | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.unit | Ban Giám hiệu Trường ĐH An Giang | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.major | Chủ tịch Hội đồng Khoa học | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.avatarText | VT | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.email | vvthang@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| BGH.phone | 0296.384.1111 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.id | usr_council | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.code | HOIDONG | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.name | PGS.TS. Nguyễn Minh Châu | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.title | Ủy viên Hội đồng đánh giá luận án | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.unit | Hội đồng đánh giá cấp Trường | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.major | Khoa học Môi trường | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.avatarText | MC | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.email | hoidong@agu.edu.vn | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |
| HOIDONG.phone | 0296.384.2222 | API-02 | user fields; identity thật từ phiên, seed không account DB | Lưu thật/seed mock | Login/profile/role |

### ROLE_MODULES — [js/management.js: 94](../../js/management.js#L94)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| NCS[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[1] | m02 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[2] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[3] | m04 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[4] | m05 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[5] | m06 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[6] | m07 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[7] | m08 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[8] | m09 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[9] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[10] | m11 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NCS[11] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[1] | m02 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[2] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[3] | m05 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[4] | m06 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[5] | m07 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[6] | m08 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[7] | m09 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[8] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[9] | m11 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| NHD[10] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[1] | m02 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[2] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[3] | m05 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[4] | m06 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[5] | m07 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[6] | m09 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[7] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BM[8] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[1] | m02 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[2] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[3] | m05 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[4] | m06 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[5] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[6] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| KHOA[7] | m13 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[1] | m02 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[2] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[3] | m04 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[4] | m05 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[5] | m06 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[6] | m07 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[7] | m08 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[8] | m09 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[9] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[10] | m11 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[11] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[12] | m13 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| PDT[13] | m14 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[0] | m01 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[1] | m03 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[2] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[3] | m11 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[4] | m12 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| BGH[5] | m13 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| HOIDONG[0] | m09 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |
| HOIDONG[1] | m10 | API-02 | allowedModules/permissions; chốtACL | Quyền server | Role/permschange |

### ROLE_DASHBOARDS — [js/management.js: 104](../../js/management.js#L104)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| NCS.stage | Giai đoạn nghiên cứu | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[0][0] | Tiến độ đào tạo | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[0][1] | 68% | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[1][0] | Tín chỉ đã đạt | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[1][1] | 18 / 24 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[2][0] | Báo cáo kỳ này | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[2][1] | Còn 12 ngày | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[0][0] | Nộp báo cáo tiến độ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[0][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[1][0] | Khai báo công bố khoa học | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[1][1] | m08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[2][0] | Xem kế hoạch đào tạo | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[2][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.queue | Báo cáo tiến độ học kỳ 7 cần nộp trước ngày 11/10/2026. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.deadline | Hoàn thiện bản thảo Chuyên đề 3 · 18/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.stage | Hướng dẫn và đánh giá NCS | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[0][0] | NCS đang hướng dẫn | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[0][1] | 06 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[1][0] | Hồ sơ chờ duyệt | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[1][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[2][0] | Báo cáo cần đánh giá | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[2][1] | 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[0][0] | Đánh giá báo cáo tiến độ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[0][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[1][0] | Duyệt kế hoạch đào tạo | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[1][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[2][0] | Thẩm định công bố khoa học | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[2][1] | m08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.queue | Có 2 báo cáo tiến độ và 1 kế hoạch đang chờ ý kiến của thầy. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.deadline | Đánh giá báo cáo của NCS Trần Minh Anh · 03/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.stage | Điều phối chuyên môn cấp Bộ môn | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[0][0] | NCS thuộc bộ môn | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[0][1] | 18 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[1][0] | Hồ sơ chờ xác nhận | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[1][1] | 04 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[2][0] | Mốc sắp đến hạn | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[2][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[0][0] | Xác nhận kế hoạch | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[0][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[1][0] | Theo dõi chuyên đề | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[1][1] | m06 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[2][0] | Rà soát tiến độ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[2][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.queue | 4 hồ sơ đào tạo cần rà soát và xác nhận ở cấp Bộ môn. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.deadline | Chốt danh sách đánh giá chuyên đề đợt tháng 10 · 06/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.stage | Điều hành đào tạo cấp Khoa | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[0][0] | NCS toàn Khoa | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[0][1] | 42 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[1][0] | Hồ sơ chờ thông qua | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[1][1] | 05 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[2][0] | Cảnh báo tiến độ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[2][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[0][0] | Rà soát hồ sơ NCS | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[0][1] | m01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[1][0] | Rà soát đề cương nghiên cứu | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[1][1] | m05 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[2][0] | Xem báo cáo tổng hợp | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.queue | 5 hồ sơ đề cương và luận án chờ Khoa xem xét. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.deadline | Phiên họp xét đề cương nghiên cứu · 08/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.stage | Quản lý đào tạo sau đại học | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[0][0] | NCS đang đào tạo | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[0][1] | 126 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[1][0] | Hồ sơ chờ thẩm định | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[1][1] | 12 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[2][0] | Đủ điều kiện bảo vệ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[2][1] | 08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[0][0] | Thẩm định hồ sơ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[0][1] | m01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[1][0] | Kiểm tra điều kiện bảo vệ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[1][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[2][0] | Lập báo cáo đào tạo | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.queue | 12 hồ sơ đang chờ thẩm định tại Phòng Đào tạo. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.deadline | Hoàn tất danh sách đủ điều kiện bảo vệ đợt 2 · 12/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.stage | Giám sát và phê duyệt cấp Trường | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[0][0] | NCS toàn Trường | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[0][1] | 126 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[1][0] | Quyết định chờ ký | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[1][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[2][0] | Hồ sơ bảo vệ | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[2][1] | 08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[0][0] | Xem hồ sơ trình ký | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[0][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[1][0] | Theo dõi cấp bằng | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[1][1] | m11 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[2][0] | Xem thống kê toàn Trường | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.queue | 3 quyết định hội đồng và bảo vệ đang trình ký. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.deadline | Ký quyết định thành lập Hội đồng · 05/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.stage | Đánh giá luận án được phân công | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[0][0] | Hồ sơ được giao | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[0][1] | 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[1][0] | Phiếu đánh giá đã gửi | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[1][1] | 01 / 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[2][0] | Phiên bảo vệ sắp tới | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[2][1] | 01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[0][0] | Xem luận án được phân công | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[0][1] | m09 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[1][0] | Nhập phiếu đánh giá | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[1][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.queue | Còn 1 phiếu nhận xét luận án chưa được gửi. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.deadline | Gửi nhận xét luận án NCS Lê Quốc Huy · 09/10/2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |

### ROLE_DASHBOARDS_EN — [js/management.js: 113](../../js/management.js#L113)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| NCS.stage | Research stage | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[0][0] | Training progress | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[0][1] | 68% | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[1][0] | Credits earned | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[1][1] | 18 / 24 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[2][0] | Current report | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.metrics[2][1] | Due in 12 days | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[0][0] | Submit progress report | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[0][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[1][0] | Declare publication | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[1][1] | m08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[2][0] | View study plan | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.actions[2][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.queue | Your semester 7 progress report is due on 11 Oct 2026. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NCS.deadline | Complete doctoral topic 3 draft · 18 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.stage | Supervision and candidate review | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[0][0] | Candidates supervised | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[0][1] | 06 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[1][0] | Pending reviews | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[1][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[2][0] | Reports to review | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.metrics[2][1] | 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[0][0] | Review progress reports | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[0][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[1][0] | Approve study plan | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[1][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[2][0] | Review publications | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.actions[2][1] | m08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.queue | Two progress reports and one study plan are awaiting your review. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| NHD.deadline | Review Tran Minh Anh's report · 03 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.stage | Department coordination | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[0][0] | Candidates in department | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[0][1] | 18 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[1][0] | Pending confirmations | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[1][1] | 04 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[2][0] | Upcoming milestones | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.metrics[2][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[0][0] | Confirm study plan | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[0][1] | m02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[1][0] | Track doctoral topics | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[1][1] | m06 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[2][0] | Review progress | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.actions[2][1] | m07 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.queue | Four academic records need department review. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BM.deadline | Confirm the October topic review list · 06 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.stage | Faculty-level academic management | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[0][0] | Candidates in faculty | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[0][1] | 42 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[1][0] | Pending approvals | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[1][1] | 05 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[2][0] | Progress alerts | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.metrics[2][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[0][0] | Review candidate files | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[0][1] | m01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[1][0] | Review research outlines | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[1][1] | m05 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[2][0] | View summary reports | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.queue | Five proposals and thesis records are awaiting faculty review. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| KHOA.deadline | Research proposal review meeting · 08 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.stage | Graduate academic affairs | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[0][0] | Active candidates | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[0][1] | 126 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[1][0] | Records awaiting review | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[1][1] | 12 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[2][0] | Eligible for defense | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.metrics[2][1] | 08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[0][0] | Review candidate records | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[0][1] | m01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[1][0] | Check defense requirements | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[1][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[2][0] | Create academic report | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.queue | Twelve records are awaiting Graduate Academic Affairs review. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| PDT.deadline | Finalize the defense eligibility list · 12 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.stage | University-level oversight and approval | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[0][0] | Candidates university-wide | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[0][1] | 126 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[1][0] | Decisions to sign | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[1][1] | 03 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[2][0] | Defense records | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.metrics[2][1] | 08 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[0][0] | Review decisions | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[0][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[1][0] | Track degree issuance | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[1][1] | m11 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[2][0] | View university reports | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.actions[2][1] | m13 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.queue | Three council and defense decisions are awaiting signature. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| BGH.deadline | Sign the council appointment decision · 05 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.stage | Assigned thesis reviews | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[0][0] | Assigned records | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[0][1] | 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[1][0] | Reviews submitted | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[1][1] | 01 / 02 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[2][0] | Upcoming defense sessions | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.metrics[2][1] | 01 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[0][0] | View assigned theses | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[0][1] | m09 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[1][0] | Enter evaluation | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.actions[1][1] | m10 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.queue | One thesis review is still outstanding. | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |
| HOIDONG.deadline | Submit the review for Le Quoc Huy · 09 Oct 2026 | API-07 | metrics/tasks/dueAt/stage/quickActions; labelsUI | Computed metrics/content | Role/mutation/date |

### INITIAL_STATE — [js/management.js: 411](../../js/management.js#L411)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| profile.phone | 0912.345.678 | API-09/48 | profile→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| profile.email | nvbinh_ncs@agu.edu.vn | API-09/48 | profile→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| profile.workplace | Khoa Nông nghiệp - TNTN | API-09/48 | profile→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| profile.monthsUsed | 36 | API-09/48 | profile→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| profile.maxMonths | 48 | API-09/48 | profile→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.GS.TS. Trần Văn Hướng.title | GS | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.GS.TS. Trần Văn Hướng.max | 4 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.GS.TS. Trần Văn Hướng.count | 2 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Lê Văn Tuấn.title | PGS | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Lê Văn Tuấn.max | 3 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Lê Văn Tuấn.count | 2 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Nguyễn Hải Nam.title | TS | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Nguyễn Hải Nam.max | 3 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Nguyễn Hải Nam.count | 1 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Nguyễn Thị Kim.title | PGS | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Nguyễn Thị Kim.max | 3 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.PGS.TS. Nguyễn Thị Kim.count | 2 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Lê Hoàng Nam.title | TS | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Lê Hoàng Nam.max | 3 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| advisorsQuota.TS. Lê Hoàng Nam.count | 2 | API-19 | advisorsQuota→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| planStage | 0 | API-16 | planStage→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| essayResult.avg | 8.77 | API-27/29 | essayResult→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| essayResult.s1 | 8.5 | API-27/29 | essayResult→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| essayResult.s2 | 9 | API-27/29 | essayResult→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| essayResult.s3 | 8.8 | API-27/29 | essayResult→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| essayResult.status | pass | API-27/29 | essayResult→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| outlineStatus | Đã duyệt | API-27/30 | outlineStatus→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[0].name | Chuyên đề 1: Tổng quan ĐTM vùng ĐBSCL | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[0].score | 8.8 | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[0].status | passed | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[1].name | Chuyên đề 2: Phương pháp đánh giá rủi ro độc chất | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[1].score | 8.5 | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[1].status | passed | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[2].name | Chuyên đề 3: Đánh giá vòng đời LCA | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[2].score | 9.1 | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| topics[2].status | passed | API-31 | topics→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].id | pub_01 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].title | Assessment of Microplastic Pollution in Mekong Delta Estuarine Waters | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].journal | Environmental Science & Technology | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].cat | Scopus Q1 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].authorRole | Tác giả chính (1st) | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].verified | True | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].score | 1 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[0].doi | 10.1016/j.envsci.2025.109 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].id | pub_02 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].title | Heavy Metal Accumulation in Sediment of An Giang Inland Waterways | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].journal | AGU Journal of Science | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].cat | Bài báo WoS/Scopus | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].authorRole | Tác giả chính (1st) | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].verified | True | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].score | 0.75 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| publications[1].doi | 10.1016/j.envsci.2025.202 | API-40 | publications→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].id | ĐN-1082 | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].type | Gia hạn học tập | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].duration | 06 tháng | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].reason | Hoàn thiện thu thập mẫu hiện trường | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].date | 15/08/2026 | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].status | Đã duyệt bởi PDT | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| leaveRequests[0].fileName | don_xin_gia_han_signed.pdf | API-12 | leaveRequests→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[0].period | 1 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[0].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[1].period | 2 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[1].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[2].period | 3 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[2].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[3].period | 4 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[3].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[4].period | 5 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[4].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[5].period | 6 | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| progressReports[5].status | pass | API-34 | progressReports→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].time | 29/09/2026 13:15:20 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].user | ThS. Phạm Minh Đăng | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].role | PDT | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].action | Thẩm định bài báo | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].target | Paper Scopus Q1 (Water Research) | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].ip | 172.16.10.45 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[0].status | Thành công | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].time | 29/09/2026 11:42:05 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].user | GS.TS. Trần Văn Hướng | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].role | NHD | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].action | Đánh giá Báo cáo tiến độ | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].target | Kỳ 6 - Đạt yêu cầu | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].ip | 172.16.12.18 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[1].status | Thành công | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].time | 29/09/2026 09:20:11 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].user | NCS. Nguyễn Văn Bình | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].role | NCS | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].action | Nộp bản thảo Chuyên đề 3 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].target | Chuyên đề 3: Đánh giá vòng đời LCA | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].ip | 115.78.22.90 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[2].status | Thành công | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].time | 28/09/2026 16:05:44 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].user | PGS.TS. Võ Văn Thắng | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].role | BGH | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].action | Ký Quyết định Hội đồng | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].target | HĐ Đánh giá Luận án TS-2026-089 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].ip | 172.16.1.10 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[3].status | Thành công | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].time | 28/09/2026 14:30:00 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].user | TS. Lê Hoàng Nam | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].role | BM | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].action | Nhập điểm Tiểu luận | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].target | Tiểu luận tổng quan: 8.77 điểm | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].ip | 172.16.15.22 | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |
| auditLogs[4].status | Thành công | API-63 | auditLogs→schema 03, không lấy seed làm server | Raw+computed theoM | Mutation đúng resource/reload |

### PERSONA_DATA — [js/app.js: 459](../../js/app.js#L459)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| VI.NCS.code | NCS | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.title | Nghiên cứu sinh | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.workload | 85 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.workloadText | 85% Tiến độ Học tập & Chuyên đề đã hoàn thành | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.desc | Chủ động xây dựng kế hoạch nghiên cứu, nộp học liệu, công bố bài báo khoa học và hoàn thành các chuyên đề tiến sĩ. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.tasks[0] | Lập kế hoạch đào tạo 3-4 năm và đăng ký mốc nghiên cứu | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.tasks[1] | Nộp Báo cáo Tiến độ định kỳ (6 tháng/lần) | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.tasks[2] | Cập nhật minh chứng công bố bài báo trên tạp chí WoS/Scopus/HĐGSCD | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NCS.tasks[3] | Đăng ký bảo vệ 03 Chuyên đề tiến sĩ và Luận án cấp cơ sở | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.code | NHD | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.title | Người hướng dẫn khoa học | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.workload | 62 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.workloadText | 62% Tiến độ Đánh giá & Phê duyệt | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.desc | Định hướng học thuật, thẩm định tiến độ nghiên cứu, xác nhận bài báo khoa học và viết bản nhận xét luận án. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.tasks[0] | Phê duyệt Kế hoạch nghiên cứu toàn khóa của NCS | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.tasks[1] | Đánh giá và xác nhận Báo cáo tiến độ 6 tháng/lần | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.tasks[2] | Xác nhận khối lượng đóng góp trong các bài báo công bố | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.NHD.tasks[3] | Viết Nhận xét Luận án cho phép NCS nộp hồ sơ bảo vệ | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.code | TBM | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.title | Trưởng Bộ môn | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.workload | 45 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.workloadText | 45% Công tác Đánh giá Chuyên môn Cấp cơ sở | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.desc | Tổ chức sinh hoạt khoa học, đánh giá chuyên đề tiến sĩ, tiểu luận tổng quan và bảo vệ cấp Đơn vị chuyên môn. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.tasks[0] | Tổ chức đánh giá 03 Chuyên đề tiến sĩ và Tiểu luận tổng quan | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.tasks[1] | Phân công Tiểu ban chuyên môn chấm điểm và lập biên bản | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.TBM.tasks[2] | Thẩm định hồ sơ bảo vệ luận án cấp Đơn vị chuyên môn | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.code | BCNK | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.title | Ban Chủ nhiệm Khoa | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.workload | 70 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.workloadText | 70% Hồ sơ Quản lý Đào tạo SĐH Khoa | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.desc | Quản lý chất lượng đào tạo sau đại học toàn Khoa, duyệt đề xuất chuyên môn và trình danh sách Hội đồng. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.tasks[0] | Phê duyệt kết quả chuyên đề tiến sĩ do Bộ môn trình | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.tasks[1] | Đề xuất danh sách các nhà khoa học tham gia Hội đồng Đánh giá | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BCNK.tasks[2] | Xác nhận điều kiện công bố khoa học & chuẩn đầu ra ngoại ngữ | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.code | PĐT | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.title | Phòng Đào tạo Sau Đại học | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.workload | 90 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.workloadText | 90% Tốc độ Xử lý Nghiệp vụ Hệ thống | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.desc | Đơn vị thường trực quản trị nghiệp vụ, thẩm định điều kiện pháp lý, gửi phản biện độc lập và hoàn thiện hồ sơ cấp bằng. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.tasks[0] | Thẩm định hồ sơ trúng tuyển và ban hành mã số NCS | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.tasks[1] | Gửi luận án lấy ý kiến 02 Phản biện độc lập theo quy định | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.PĐT.tasks[2] | Quản lý lưu chiểu Thư viện Quốc gia và lập Sổ gốc cấp bằng | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.code | BGH | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.title | Ban Giám hiệu | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.workload | 30 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.workloadText | 30% Thẩm quyền Phê duyệt Quyết định | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.desc | Ban hành các Quyết định chính thức trong toàn bộ quá trình đào tạo và công nhận học vị Tiến sĩ. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.tasks[0] | Ký Quyết định công nhận Nghiên cứu sinh chính thức | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.tasks[1] | Ký Quyết định thành lập Hội đồng Đánh giá Luận án cấp Trường | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.BGH.tasks[2] | Ký Quyết định công nhận học vị và cấp bằng Tiến sĩ | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.code | HĐ | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.title | Hội đồng Đánh giá & Phản biện | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.workload | 55 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.workloadText | 55% Tiến độ Đánh giá Phản biện Độc lập | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.desc | Các nhà khoa học uy tín nhận xét độc lập, đặt câu hỏi phản biện và đánh giá chất lượng luận án tại các phiên họp. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.tasks[0] | Viết Bản nhận xét Phản biện độc lập đánh giá đóng góp mới | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.tasks[1] | Đặt câu hỏi phản biện tại phiên bảo vệ chính thức | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| VI.HĐ.tasks[2] | Bỏ phiếu đánh giá và thông qua Biên bản Quyết nghị Hội đồng | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.code | NCS | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.title | PhD Candidate | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.workload | 85 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.workloadText | 85% Coursework & Topic Progress Completed | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.desc | Proactively formulate research plans, submit academic materials, publish papers, and complete doctoral topics. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.tasks[0] | Establish 3-4 year training plan and register research milestones | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.tasks[1] | Submit periodic progress reports (every 6 months) | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.tasks[2] | Update publication proofs in WoS/Scopus journals | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NCS.tasks[3] | Register defense for 3Doctoral Topics and Institutional Thesis | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.code | NHD | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.title | Scientific Supervisor | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.workload | 62 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.workloadText | 62% Evaluation & Approval Progress | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.desc | Provide academic guidance, review research progress, verify journal publications, and write thesis evaluation reports. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.tasks[0] | Approve PhD candidate's full-term research plan | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.tasks[1] | Evaluate and verify semi-annual progress reports | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.tasks[2] | Verify contribution proportion in published research papers | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.NHD.tasks[3] | Write thesis review authorizing candidate defense application | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.code | TBM | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.title | Department Chair | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.workload | 45 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.workloadText | 45% Departmental Academic Assessment | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.desc | Organize academic seminars, evaluate doctoral topics, literature reviews, and departmental defense sessions. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.tasks[0] | Organize assessment for 3Doctoral Topics & Overview Essay | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.tasks[1] | Assign specialized sub-committee for grading & minutes | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.TBM.tasks[2] | Verify thesis defense application at Departmental level | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.code | BCNK | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.title | Faculty Board | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.workload | 70 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.workloadText | 70% Postgraduate Operations Managed | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.desc | Manage postgraduate training quality faculty-wide, approve academic proposals, and submit committee lists. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.tasks[0] | Approve doctoral topic results submitted by Department | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.tasks[1] | Propose list of scientists for Evaluation Council | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BCNK.tasks[2] | Verify publication requirements & foreign language proficiency | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.code | PĐT | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.title | Postgraduate Academic Office | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.workload | 90 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.workloadText | 90% System Processing Speed | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.desc | Standing operational unit, inspecting legal conditions, dispatching independent reviews, and issuing degree records. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.tasks[0] | Verify admission records and issue candidate IDs | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.tasks[1] | Send thesis for 02 Independent Reviews as mandated | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.PĐT.tasks[2] | Manage National Library deposit and issue master degree register | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.code | BGH | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.title | University Directorate | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.workload | 30 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.workloadText | 30% Official Approval Authority | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.desc | Issue official Decisions across the training lifecycle and officially confer PhD degrees. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.tasks[0] | Sign Official Decision admitting PhD candidate | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.tasks[1] | Sign Decision establishing Institutional Evaluation Council | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.BGH.tasks[2] | Sign Decision conferring academic degree & PhD diploma | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.code | HĐ | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.title | Evaluation Council & Reviewers | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.workload | 55 | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.workloadText | 55% Independent Review Progress | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.desc | Prestigious scholars conducting independent reviews, raising defense questions, and evaluating thesis quality. | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.tasks[0] | Write Independent Review evaluating novel contributions | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.tasks[1] | Raise critical questions at official defense session | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |
| EN.HĐ.tasks[2] | Vote on evaluation and pass Council Resolution Minutes | KhôngAPI | workload/tasks giới thiệu, formula cần chốt | Tĩnh | Persona/language |

### ROADMAP_NODES — [js/app.js: 639](../../js/app.js#L639)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| VI[0].num | 01 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].title | Công nhận NCS | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].tag | Khởi tạo | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].desc | Trúng tuyển, cấp mã số NCS & mở hồ sơ số | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].details | Tiếp nhận hồ sơ sau trúng tuyển, phát hành quyết định công nhận Nghiên cứu sinh và mở tài khoản hệ thống DTMS. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].items[0] | Quyết định công nhận NCS | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].items[1] | Tài khoản làm việc số | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[0].items[2] | Hồ sơ trúng tuyển hợp lệ | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].num | 02 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].title | Lập Kế hoạch | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].tag | Định hướng | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].desc | Lập kế hoạch 3-4 năm & thống nhất với NHD | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].details | Xây dựng kế hoạch nghiên cứu toàn khóa, danh mục môn học bổ sung và ký xác nhận với Người hướng dẫn khoa học. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].items[0] | Kế hoạch đào tạo toàn khóa | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].items[1] | Biên bản thống nhất NHD | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[1].items[2] | Lộ trình thực nghiệm | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].num | 03 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].title | Học tập & Chuyên đề | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].tag | Học phần | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].desc | Hoàn thành các môn học & 03 Chuyên đề TS | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].details | Hoàn thành các học phần tiến sĩ nâng cao, tiểu luận tổng quan và bảo vệ 03 chuyên đề tiến sĩ bắt buộc. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].items[0] | Bảng điểm học phần tiến sĩ | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].items[1] | 03 Báo cáo Chuyên đề tiến sĩ | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[2].items[2] | Tiểu luận tổng quan | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].num | 04 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].title | Nghiên cứu & Công bố | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].tag | Công bố | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].desc | Công bố tối thiểu 02 bài báo ISI/Scopus | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].details | Thực hiện đề tài, nộp báo cáo tiến độ 6 tháng/lần và công bố kết quả trên các tạp chí khoa học chuyên ngành uy tín. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].items[0] | Minh chứng bài báo WoS/Scopus/HĐGSCD | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].items[1] | Báo cáo tiến độ 6 tháng | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[3].items[2] | Xác nhận của NHD | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].num | 05 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].title | Đánh giá Luận án | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].tag | Thẩm định | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].desc | Phản biện độc lập & bảo vệ cấp Trường | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].details | Thẩm định điều kiện, nhận xét phản biện độc lập, công khai luận án FR-BV05 và tổ chức bảo vệ chính thức. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].items[0] | Bản nhận xét phản biện độc lập | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].items[1] | Công khai 30 ngày trên cổng | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[4].items[2] | Biên bản Hội đồng đánh giá | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].num | 06 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].title | Tốt nghiệp & Cấp bằng | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].tag | Hoàn tất | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].desc | Lưu chiểu TVQG & cấp bằng Tiến sĩ | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].details | Nộp lưu chiểu Thư viện Quốc gia, ký quyết định công nhận học vị và cấp văn bằng Tiến sĩ chính thức. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].items[0] | Xác nhận lưu chiểu Thư viện Quốc gia | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].items[1] | Quyết định công nhận học vị Tiến sĩ | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| VI[5].items[2] | Bằng Tiến sĩ & Sổ gốc | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].num | 01 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].title | Candidate Admission | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].tag | Initiation | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].desc | Admission, Candidate ID assignment & Digital Profile | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].details | Receive post-admission records, issue official Candidate Recognition Decision, and create DTMS system account. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].items[0] | Candidate Recognition Decision | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].items[1] | Digital Workspace Account | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[0].items[2] | Verified Admission Profile | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].num | 02 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].title | Training Plan | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].tag | Orientation | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].desc | Formulate 3-4 year plan & sign with Supervisor | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].details | Develop full-term research plan, supplementary course list, and obtain signature confirmation from Scientific Supervisor. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].items[0] | Full-term Training Plan | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].items[1] | Supervisor Agreement Minutes | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[1].items[2] | Experimental Roadmap | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].num | 03 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].title | Coursework & Topics | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].tag | Modules | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].desc | Complete courses & 03Doctoral Topics | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].details | Complete advanced doctoral course modules, literature review essay, and defend 03 compulsory doctoral topics. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].items[0] | Doctoral Course Transcript | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].items[1] | 03Doctoral Topic Reports | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[2].items[2] | Literature Overview Essay | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].num | 04 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].title | Research & Publication | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].tag | Publication | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].desc | Publish at least 02 WoS/Scopus articles | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].details | Execute research project, submit semi-annual progress reports, and publish findings in prestigious peer-reviewed journals. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].items[0] | WoS/Scopus Journal Proofs | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].items[1] | Semi-annual Progress Report | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[3].items[2] | Supervisor Verification | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].num | 05 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].title | Thesis Evaluation | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].tag | Appraisal | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].desc | Independent peer review & Institutional defense | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].details | Inspect eligibility, process 02 independent reviews, publish thesis on portal (FR-BV05), and hold official defense. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].items[0] | Independent Peer Review Reports | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].items[1] | 30-day Public Portal Notice | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[4].items[2] | Council Evaluation Minutes | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].num | 06 | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].title | Graduation & Degree | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].tag | Completion | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].desc | National Library deposit & PhD degree conferral | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].details | Deposit final thesis to National Library of Vietnam, sign degree conferral decision, and issue official PhD diploma. | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].items[0] | National Library Deposit Receipt | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].items[1] | PhD Degree Conferral Decision | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |
| EN[5].items[2] | Official PhD Diploma & Register | KhôngAPI | 6 stage mô tả, không transition | Tĩnh | Node/language |

### THESES_LIST — [js/app.js: 743](../../js/app.js#L743)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| VI[0].title | Nghiên cứu giải pháp sinh học xử lý nước thải chăn nuôi lợn quy mô trang trại tại vùng ĐBSCL | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[0].candidate | NCS. Trần Văn Bình | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[0].field | Khoa học Môi trường | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[0].date | 25/11/2025 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[0].summaryUrl | https://example.com/summary1.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[0].fullUrl | https://example.com/fulltext1.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].title | Đánh giá tính đa dạng sinh học và đề xuất giải pháp bảo tồn loài lúa hoạ (Oryza rufipogon) tại An Giang | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].candidate | NCS. Lê Thị Mai | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].field | Trồng trọt | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].date | 10/12/2025 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].summaryUrl | https://example.com/summary2.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[1].fullUrl | https://example.com/fulltext2.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].title | Tác động của chuyển đổi số đến hiệu quả hoạt động kinh doanh của các doanh nghiệp vừa và nhỏ vùng ĐBSCL | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].candidate | NCS. Phạm Quốc Cường | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].field | Quản trị Kinh doanh | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].date | 18/01/2026 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].summaryUrl | https://example.com/summary3.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| VI[2].fullUrl | https://example.com/fulltext3.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].title | Research on biological solutions for farm-scale piggery wastewater treatment in the Mekong Delta | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].candidate | PhD Cand. Tran Van Binh | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].field | Environmental Science | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].date | 25/11/2025 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].summaryUrl | https://example.com/summary1.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[0].fullUrl | https://example.com/fulltext1.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].title | Assessing biodiversity and proposing conservation measures for wild rice (Oryza rufipogon) in An Giang | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].candidate | PhD Cand. Le Thi Mai | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].field | Agronomy | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].date | 10/12/2025 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].summaryUrl | https://example.com/summary2.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[1].fullUrl | https://example.com/fulltext2.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].title | Impact of digital transformation on business performance of SMEs in the Mekong Delta region | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].candidate | PhD Cand. Pham Quoc Cuong | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].field | Business Administration | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].date | 18/01/2026 | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].summaryUrl | https://example.com/summary3.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |
| EN[2].fullUrl | https://example.com/fulltext3.pdf | API-58/67 | title, candidate→candidateName, date→expectedDefenseDate, fullUrl→fullTextUrl | Notice query | Public/q/publish |

### MASTER_DIPLOMA_REGISTER — [js/app.js: 1255](../../js/app.js#L1255)

| Leafpath | Literal hiện tại | API | Field/nguồn thay thế | Lưu/tính | Reload |
|---|---|---|---|---|---|
| [0].code | TS-AGU-2025-089 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].name | Nguyễn Văn Bình | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].nameEn | Nguyen Van Binh | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].major | Khoa học Môi trường | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].majorEn | Environmental Science | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].registerNo | SG-TS-2025-012 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].issueDate | 20/01/2026 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [0].decisionNo | 128/QĐ-ĐHAG | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].code | TS-AGU-2024-042 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].name | Trần Thị Mai | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].nameEn | Tran Thi Mai | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].major | Quản lý Tài nguyên Nước | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].majorEn | Water Resources Management | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].registerNo | SG-TS-2024-088 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].issueDate | 15/11/2024 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [1].decisionNo | 410/QĐ-ĐHAG | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].code | TS-AGU-2023-015 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].name | Lê Hoàng Nam | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].nameEn | Le Hoang Nam | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].major | Nông nghiệp Công nghệ cao | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].majorEn | High-Tech Agriculture | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].registerNo | SG-TS-2023-031 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].issueDate | 10/09/2023 | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |
| [2].decisionNo | 205/QĐ-ĐHAG | API-57 | Master register fields→schema 57 | Stored record | Lookup/conferral/revoke |

## Dữ liệu HTML theo từng block/bảng

Mỗi block dưới là literal HTML đọc toàn văn; bảng bao gồm header và từng giá trị row, không bỏ hàng phụ. Dữ liệu bị renderer thay được xác định trongM/02; không coi hai lớp HTML/seed là hai nguồn thật. Field response dùng schema của API ghi bên cạnh; formula theoM. Các form default/readonly cũng là mock, kiểm kê ở cuối.

| Source | Block/vịtrí | Literal hiển thị | API/response nguồn | Lưu/tính/reload |
|---|---|---|---|---|
| [index.html:116](../../index.html#L116) | h1/home | Hệ điều hành Đào tạo Tiến sĩ Số | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:142](../../index.html#L142) | div/home | 14 Phân hệ Nghiệp vụ 06 Vai trò RBAC 100% Chuyển đổi số 24/7 Tra cứu Phôi bằng | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:143](../../index.html#L143) | div/home | 14 Phân hệ Nghiệp vụ | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:147](../../index.html#L147) | div/home | 06 Vai trò RBAC | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:151](../../index.html#L151) | div/home | 100% Chuyển đổi số | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:155](../../index.html#L155) | div/home | 24/7 Tra cứu Phôi bằng | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:178](../../index.html#L178) | h3/home | Truy cập Nhanh các Phân hệ Chuyên biệt: | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:243](../../index.html#L243) | h2/management | Trung Tâm Quản Lý Đào Tạo Nghiên Cứu Sinh (14 Phân Hệ) | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:372](../../index.html#L372) | div/panel-m01 | 48 Tổng số Nghiên cứu sinh | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:382](../../index.html#L382) | div/panel-m01 | 39 Đang học bình thường | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:392](../../index.html#L392) | div/panel-m01 | 05 Đang gia hạn (6-12 tháng) | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:402](../../index.html#L402) | div/panel-m01 | 04 Tạm dừng / Bảo lưu | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:418](../../index.html#L418) | h3/panel-m01 | 1. Thông tin Cá nhân Nghiên cứu sinh | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:422](../../index.html#L422) | span/panel-m01 | Dữ liệu đã xác thực | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:458](../../index.html#L458) | h3/panel-m01 | 2. Hồ sơ Đào tạo & Trạng thái Học vụ | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:462](../../index.html#L462) | span/panel-m01 | Đang học tập | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:498](../../index.html#L498) | table/panel-m01 | Mã NCS Họ và tên Ngành đào tạo Khóa NHD Khoa học Trạng thái học vụ Thao tác NCS-2023-ENV01 NCS. Nguyễn Văn Bình Khoa học Môi trường 2023-Đ2 GS.TS. Trần Văn Hướng Đang học bình thường Xem & Sửa NCS-2022-AGR04 NCS. Lê Thị Mai Trồng trọt nâng cao 2022-Đ1 PGS.TS. Nguyễn Thị Kim Gia hạn 06 tháng Xem & Sửa NCS-2021-BUS02 NCS. Phạm Quốc Cường Quản trị Kinh doanh 2021-Đ2 PGS.TS. Trần Đình Lâm Đã bảo vệ luận án Xem & Sửa | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:517](../../index.html#L517) | span/panel-m01 | Đang học bình thường | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:528](../../index.html#L528) | span/panel-m01 | Gia hạn 06 tháng | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:539](../../index.html#L539) | span/panel-m01 | Đã bảo vệ luận án | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:551](../../index.html#L551) | h3/panel-m01 | 3. Lịch sử Đơn Xin Gia hạn / Tạm dừng Học tập | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:561](../../index.html#L561) | table/panel-m01 | Mã đơn Loại học vụ Thời gian đề xuất Lý do đề nghị Ngày nộp Tình trạng phê duyệt Minh chứng ĐN-2025-081 Gia hạn học tập 06 tháng (Đến 15/04/2027) Đang hoàn thiện phản biện bài báo quốc tế WoS Q1 14/09/2025 Đã duyệt (QĐ 218/QĐ-ĐHAG) 📄 File đơn | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:576](../../index.html#L576) | span/panel-m01 | Gia hạn học tập | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:580](../../index.html#L580) | span/panel-m01 | Đã duyệt (QĐ 218/QĐ-ĐHAG) | API-08/09/11/12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:595](../../index.html#L595) | h3/panel-m02 | Khung Chương Trình & Kế Hoạch Đào Tạo Toàn Khóa | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:616](../../index.html#L616) | h4/panel-m02 | Tiến độ đạt 68% / 65% kế hoạch chuẩn (+3% Vượt tiến độ) | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:619](../../index.html#L619) | span/panel-m02 | Đã duyệt bởi NHD & PĐT | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:641](../../index.html#L641) | h3/panel-m02 | Khối lượng Chương trình Đào tạo (90 Tín chỉ) | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:644](../../index.html#L644) | table/panel-m02 | Khối kiến thức Số tín chỉ Trạng thái Học phần chung & chuyên ngành 12 TC Hoàn thành 12/12 Tiểu luận tổng quan 02 TC Đạt (8.77 điểm) 03 Chuyên đề Tiến sĩ 06 TC Hoàn thành 3/3 Nghiên cứu & Luận án Tiến sĩ 70 TC Đang thực hiện | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:656](../../index.html#L656) | span/panel-m02 | Hoàn thành 12/12 | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:661](../../index.html#L661) | span/panel-m02 | Đạt (8.77 điểm) | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:666](../../index.html#L666) | span/panel-m02 | Hoàn thành 3/3 | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:671](../../index.html#L671) | span/panel-m02 | Đang thực hiện | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:680](../../index.html#L680) | h3/panel-m02 | Kế hoạch Chi tiết theo Học kỳ | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:684](../../index.html#L684) | table/panel-m02 | Học kỳ Nội dung trọng tâm Hạn mốc Kết quả HK 1 Hoàn thành học phần nâng cao & Tiểu luận 03/2024 Đạt 100% HK 2 Bảo vệ Đề cương & Chuyên đề 1 09/2024 Đạt 100% HK 3 Bảo vệ Chuyên đề 2 & Nộp bài báo 1 03/2025 Đạt 100% HK 4 Chuyên đề 3 & Xuất bản Scopus Q1 09/2025 Đang thực hiện (85%) HK 5 Trình Bộ môn & Phản biện độc lập 03/2026 Kế hoạch HK 6 Bảo vệ Luận án cấp Trường & Cấp bằng 09/2026 Kế hoạch | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:698](../../index.html#L698) | span/panel-m02 | Đạt 100% | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:704](../../index.html#L704) | span/panel-m02 | Đạt 100% | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:710](../../index.html#L710) | span/panel-m02 | Đạt 100% | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:716](../../index.html#L716) | span/panel-m02 | Đang thực hiện (85%) | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:722](../../index.html#L722) | span/panel-m02 | Kế hoạch | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:728](../../index.html#L728) | span/panel-m02 | Kế hoạch | API-15/16 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:741](../../index.html#L741) | h3/panel-m03 | Quản Lý Người Hướng Dẫn Khoa Học & Định Mức | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:756](../../index.html#L756) | div/panel-m03 | GS: Max 3 NCS Giáo sư hướng dẫn độc lập | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:765](../../index.html#L765) | div/panel-m03 | PGS: Max 2 NCS Phó Giáo sư hướng dẫn chính | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:774](../../index.html#L774) | div/panel-m03 | TS: Max 1 NCS Tiến sĩ (trên 3 năm thâm niên) | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:787](../../index.html#L787) | table/panel-m03 | Họ và tên NHD Học hàm / Học vị Cơ quan / Đơn vị Hướng nghiên cứu chuyên sâu Số NCS đang hướng dẫn Kiểm tra định mức TT18 Thao tác GS.TS. Trần Văn Hướng Giáo sư · Tiến sĩ Khoa Nông nghiệp - TNTN (Trường ĐHAG) Công nghệ xử lý nước & sinh thái vùng lũ 2 / 3 NCS Hợp lệ (Còn 1 chỉ tiêu) Chi tiết PGS.TS. Lê Văn Tuấn Phó Giáo sư · Tiến sĩ Trường ĐH Khoa học Tự nhiên ĐHQG-HCM Hóa học Môi trường & Màng sinh học 2 / 2 NCS Đạt ngưỡng định mức Chi tiết TS. Nguyễn Hải Nam Tiến sĩ (5 năm kinh nghiệm) Viện Môi trường & Tài nguyên ĐHQG-HCM Kinh tế tuần hoàn trong nông nghiệp 1 / 1 NCS Đạt ngưỡng định mức Chi tiết | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:806](../../index.html#L806) | span/panel-m03 | Hợp lệ (Còn 1 chỉ tiêu) | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:817](../../index.html#L817) | span/panel-m03 | Đạt ngưỡng định mức | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:828](../../index.html#L828) | span/panel-m03 | Đạt ngưỡng định mức | API-19/20 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:842](../../index.html#L842) | h3/panel-m04 | Quản Lý Học Phần, Điểm Số & Học Phần Bổ Sung | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:854](../../index.html#L854) | div/panel-m04 | 12 / 12 TC Tín chỉ học phần tích lũy | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:863](../../index.html#L863) | div/panel-m04 | 8.85 / 10 Điểm trung bình GPA (Hệ 4: 3.65) | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:872](../../index.html#L872) | div/panel-m04 | ĐẠT CHUẨN Điều kiện hoàn thành học phần | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:885](../../index.html#L885) | table/panel-m04 | Mã HP Tên học phần Số TC Giảng viên giảng dạy Quá trình (30%) Thi (70%) Tổng kết Điểm chữ Trạng thái / Đăng ký ENV801 Phương pháp nghiên cứu khoa học nâng cao 3 TC GS.TS. Trần Văn Hướng 9.0 8.8 8.86 A Đã hoàn thành ENV802 Độc học môi trường và an toàn sinh thái 3 TC PGS.TS. Lê Văn Tuấn 8.5 9.0 8.85 A Đã hoàn thành ENV803 Quản lý chất thải rắn & công nghệ tuần hoàn 3 TC TS. Nguyễn Hải Nam 9.0 8.5 8.65 B+ Đã hoàn thành ENV804 Mô hình hóa các quá trình môi trường 3 TC TS. Lê Hoàng Nam 9.5 9.0 9.15 A+ Đã hoàn thành ENV809 Chuyên đề chọn lọc: Kinh tế sinh thái ĐBSCL (Tự chọn) 3 TC PGS.TS. Nguyễn Thị Kim - - - - + Đăng ký | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:909](../../index.html#L909) | span/panel-m04 | Đã hoàn thành | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:920](../../index.html#L920) | span/panel-m04 | Đã hoàn thành | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:931](../../index.html#L931) | span/panel-m04 | Đã hoàn thành | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:942](../../index.html#L942) | span/panel-m04 | Đã hoàn thành | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:964](../../index.html#L964) | h3/panel-m04 | Học Phần Bổ Sung (Dành cho NCS học chuyển tiếp hoặc ngành gần) | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:965](../../index.html#L965) | span/panel-m04 | Miễn trừ (Đúng chuyên ngành Thạc sĩ) | API-22/15 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:977](../../index.html#L977) | h3/panel-m05 | Quản Lý Tiểu Luận Tổng Quan & Đề Cương Nghiên Cứu | API-27 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:997](../../index.html#L997) | h3/panel-m05 | 1. Tiểu luận Tổng quan (Literature Review) | API-27 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:998](../../index.html#L998) | span/panel-m05 | Đã bảo vệ (Đạt) | API-27 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1038](../../index.html#L1038) | h3/panel-m05 | 2. Đề cương Chi tiết & Bản Giải trình Chỉnh sửa | API-27 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1039](../../index.html#L1039) | span/panel-m05 | Đã thông qua chính thức | API-27 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1074](../../index.html#L1074) | h3/panel-m06 | Quản Lý 02 – 03 Chuyên Đề Tiến Sĩ Bắt Buộc | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1089](../../index.html#L1089) | table/panel-m06 | Chuyên đề Tên chuyên đề tiến sĩ Số TC Cán bộ hướng dẫn / phụ trách Ngày báo cáo Điểm TB Trạng thái Thao tác Chuyên đề 1 Đánh giá hiện trạng ô nhiễm nguồn nước mặt nông thôn ĐBSCL do chăn nuôi 2 TC GS.TS. Trần Văn Hướng 12/08/2024 9.0/10 Đã đánh giá (Đạt) ✎ Chấm điểm Biên bản Chuyên đề 2 Ứng dụng công nghệ màng sinh học và thực vật thủy sinh xử lý nước thải 2 TC PGS.TS. Lê Văn Tuấn 15/01/2025 8.8/10 Đã đánh giá (Đạt) ✎ Chấm điểm Biên bản Chuyên đề 3 Đánh giá vòng đời (LCA) và hiệu quả kinh tế - kỹ thuật của mô hình xử lý 2 TC TS. Nguyễn Hải Nam20/06/2025 9.2/10 Đã đánh giá (Đạt) ✎ Chấm điểm Biên bản | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1110](../../index.html#L1110) | span/panel-m06 | Đã đánh giá (Đạt) | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1123](../../index.html#L1123) | span/panel-m06 | Đã đánh giá (Đạt) | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1136](../../index.html#L1136) | span/panel-m06 | Đã đánh giá (Đạt) | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1151](../../index.html#L1151) | h4/panel-m06 | Hoàn thành 100% Khối lượng 03 Chuyên đề Tiến sĩ | API-31 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1162](../../index.html#L1162) | h3/panel-m07 | Quản Lý Báo Cáo Tiến Độ (6 Tháng / Lần) & Cảnh Báo Quá Hạn | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1193](../../index.html#L1193) | table/panel-m07 | Kỳ báo cáo Giai đoạn thực hiện Khối lượng công việc chính Ngày nộp báo cáo NHD Đánh giá Nhận xét của NHD Thao tác Kỳ 1 10/2023 – 04/2024 Học phần tiến sĩ & Thu thập mẫu ban đầu 10/04/2024 Đạt tiến độ NCS chủ động, hoàn thành tốt các môn học nâng cao. Đạt File Kỳ 2 04/2024 – 10/2024 Bảo vệ đề cương & Vận hành mô hình lab 1 08/10/2024 Đạt tiến độ Số liệu thí nghiệm đạt độ tin cậy, hoàn thành CĐ 1. Đạt File Kỳ 3 10/2024 – 04/2025 Phân tích hóa lý, viết bản thảo bài báo quốc tế 1 12/04/2025 Đạt tiến độ Bài báo 1 đã nộp vào tạp chí Water Research (Scopus Q1). Đạt File Kỳ 4 04/2025 – 10/2025 Đánh giá mô hình thực địa & Viết bài báo 2 25/09/2025 Đạt tiến độ Đã hoàn thành phân tích LCA, chuẩn bị viết toàn văn luận án. Đạt File | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1211](../../index.html#L1211) | span/panel-m07 | Đạt tiến độ | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1223](../../index.html#L1223) | span/panel-m07 | Đạt tiến độ | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1235](../../index.html#L1235) | span/panel-m07 | Đạt tiến độ | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1247](../../index.html#L1247) | span/panel-m07 | Đạt tiến độ | API-34/37 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1263](../../index.html#L1263) | h3/panel-m08 | Quản Lý Công Bố Khoa Học (WoS/Scopus) & Thẩm Định Chuẩn Đầu Ra | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1281](../../index.html#L1281) | h4/panel-m08 | Đạt 2 / 2 bài báo chuẩn quốc tế (01 WoS Q1 + 01 Scopus Q2) — ĐẠT 100% CHUẨN ĐẦU RA | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1285](../../index.html#L1285) | span/panel-m08 | ✓ ĐỦ ĐIỀU KIỆN CÔNG BỐ ĐỂ BẢO VỆ | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1291](../../index.html#L1291) | table/panel-m08 | Tên bài báo khoa học & DOI Tên tạp chí & ISSN Phân loại tạp chí Vai trò tác giả Tình trạng thẩm định (PĐT) Thao tác Performance of integrated bio-filter and constructed wetland for piggery wastewater treatment in the Mekong Delta DOI: 10.1016/j.envsci.2025.109824 Environmental Science & Pollution Research ISSN: 0944-1344 WoS (SCIE) · Q1 Tác giả chính (1st Author) Đã thẩm định hợp lệ 📄 Minh chứng Life cycle assessment of decentralized domestic and livestock wastewater solutions in rural Southwest Vietnam DOI: 10.1016/j.jclepro.2025.141201 Journal of Cleaner Production ISSN: 0959-6526 Scopus · Q2 Tác giả liên hệ (Corresponding) Đã thẩm định hợp lệ 📄 Minh chứng | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1309](../../index.html#L1309) | span/panel-m08 | WoS (SCIE) · Q1 | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1311](../../index.html#L1311) | span/panel-m08 | Đã thẩm định hợp lệ | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1322](../../index.html#L1322) | span/panel-m08 | Scopus · Q2 | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1324](../../index.html#L1324) | span/panel-m08 | Đã thẩm định hợp lệ | API-40 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1338](../../index.html#L1338) | h3/panel-m09 | Quản Lý Tên Đề Tài, Các Phiên Bản Luận Án & Kiểm Tra Trùng Lặp Turnitin | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1358](../../index.html#L1358) | h3/panel-m09 | 1. Thông tin Đề tài Luận án Tiến sĩ | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1359](../../index.html#L1359) | span/panel-m09 | NHD Đã Ký Đồng Ý Bảo Vệ | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1387](../../index.html#L1387) | h3/panel-m09 | 2. Kiểm tra Trùng lặp Turnitin & Định dạng Trích dẫn | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1396](../../index.html#L1396) | span/panel-m09 | ✓ 14% Trùng lặp (Ngưỡng cho phép < 20%) - ĐẠT TIÊU CHUẨN | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1423](../../index.html#L1423) | h3/panel-m09 | 3. Quản Lý Các Phiên Bản Toàn Văn Luận Án (Version Control) | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1428](../../index.html#L1428) | table/panel-m09 | Phiên bản Giai đoạn nộp Ngày upload Dung lượng Ghi chú điều chỉnh Thao tác v1.0 Bản thảo trình Bộ môn 15/10/2025 14.2 MB (PDF) Bản thảo phục vụ sinh hoạt chuyên môn Bộ môn Tải về v2.0 Bản gửi Phản biện độc lập 15/11/2025 15.6 MB (PDF) Bản đã tiếp thu ý kiến của Bộ môn gửi 02 Phản biện độc lập Tải về v3.0 Bản bảo vệ chính thức cấp Trường 10/01/2026 16.1 MB (PDF) Bản in chính thức phục vụ Hội đồng Đánh giá luận án Tải bản chính | API-43/46/47 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1474](../../index.html#L1474) | h3/panel-m10 | Quản Lý Bảo Vệ Luận Án Cấp Trường (Hội Đồng & Phản Biện Độc Lập) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1498](../../index.html#L1498) | h3/panel-m10 | 1. Quản lý 02 Phản Biện Độc Lập Kín | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1499](../../index.html#L1499) | span/panel-m10 | 2/2 Bản nhận xét Đạt | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1503](../../index.html#L1503) | table/panel-m10 | Mã phản biện Chuyên gia / Đơn vị Ngày nhận xét Kết luận PB-ĐL-01 Chuyên gia ngoài trường (ĐHQG-HCM) 25/11/2025 Đồng ý cho bảo vệ PB-ĐL-02 Chuyên gia đầu ngành (ĐH Cần Thơ) 28/11/2025 Đồng ý cho bảo vệ | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1517](../../index.html#L1517) | span/panel-m10 | Đồng ý cho bảo vệ | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1523](../../index.html#L1523) | span/panel-m10 | Đồng ý cho bảo vệ | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1533](../../index.html#L1533) | h3/panel-m10 | 2. Công Khai 30 Ngày & Kết Quả Bỏ Phiếu | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1534](../../index.html#L1534) | span/panel-m10 | 7/7 Phiếu Tán Thành (100% Xuất Sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1559](../../index.html#L1559) | h3/panel-m10 | 3. Danh Sách Hội Đồng Đánh Giá Luận Án Cấp Trường (07 Thành viên theo TT18) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1566](../../index.html#L1566) | table/panel-m10 | Vai trò Hội đồng Họ và tên Học hàm / Học vị Cơ quan công tác Đánh giá bỏ phiếu Chủ tịch PGS.TS. Võ Văn Thắng Phó Giáo sư · Tiến sĩ Trường Đại học An Giang Tán thành (Xuất sắc) Phản biện 1 PGS.TS. Trần Đình Lâm Phó Giáo sư · Tiến sĩ Trường ĐH Bách Khoa ĐHQG-HCM Tán thành (Xuất sắc) Phản biện 2 PGS.TS. Nguyễn Văn Toàn Phó Giáo sư · Tiến sĩ Trường Đại học Cần Thơ Tán thành (Đạt) Phản biện 3 TS. Hoàng Minh Quân Tiến sĩ Viện Môi trường ĐHQG-HCM Tán thành (Xuất sắc) Thư ký TS. Lê Hoàng Nam Tiến sĩ Trường Đại học An Giang Tán thành (Xuất sắc) Ủy viên TS. Vũ Đức Toàn Tiến sĩ Trường ĐH Bách Khoa ĐHQG-HCM Tán thành (Đạt) Ủy viên PGS.TS. Nguyễn Thị Kim Phó Giáo sư · Tiến sĩ Trường Đại học An Giang Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1582](../../index.html#L1582) | span/panel-m10 | Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1589](../../index.html#L1589) | span/panel-m10 | Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1596](../../index.html#L1596) | span/panel-m10 | Tán thành (Đạt) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1603](../../index.html#L1603) | span/panel-m10 | Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1610](../../index.html#L1610) | span/panel-m10 | Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1617](../../index.html#L1617) | span/panel-m10 | Tán thành (Đạt) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1624](../../index.html#L1624) | span/panel-m10 | Tán thành (Xuất sắc) | API-48/49 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1636](../../index.html#L1636) | h3/panel-m11 | Hoàn Thiện Sau Bảo Vệ, Hồ Sơ Lưu Chiểu & Cấp Bằng Tiến Sĩ | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1657](../../index.html#L1657) | h4/panel-m11 | Công Nhận Học Vị & Cấp Bằng Tiến Sĩ cho NCS. Nguyễn Văn Bình | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1665](../../index.html#L1665) | span/panel-m11 | Đã Ban Hành Quyết Định & Cấp Bằng Số | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1674](../../index.html#L1674) | h3/panel-m11 | 1. Hồ sơ Nộp Lưu Chiểu Bắt Buộc | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1675](../../index.html#L1675) | span/panel-m11 | Đã hoàn tất lưu chiểu | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1699](../../index.html#L1699) | h3/panel-m11 | 2. Checklist Điều Kiện Tốt Nghiệp | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1700](../../index.html#L1700) | span/panel-m11 | Đủ điều kiện cấp bằng | API-53/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1729](../../index.html#L1729) | h3/panel-m12 | Quản Lý Các Thay Đổi & Xử Lý Biến Động Học Vụ | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1744](../../index.html#L1744) | table/panel-m12 | Mã biến động NCS thực hiện Loại biến động Nội dung chi tiết thay đổi Ngày đề xuất Quyết định phê duyệt Trạng thái Thao tác BD-2025-01 NCS. Lê Thị Mai Gia hạn thời gian Gia hạn thêm06 tháng để hoàn thiện công bố quốc tế 12/03/2025 QĐ số 118/QĐ-ĐHAG Đã ban hành QĐ Xem QĐ BD-2024-04 NCS. Nguyễn Văn Bình Đổi tên đề tài Bổ sung cụm từ "và thu hồi năng lượng tái tạo" vào tên đề tài 15/04/2024 QĐ số 289/QĐ-ĐHAG Đã phê duyệt Biên bản BD-2024-09 NCS. Trần Hoàng Nam Tạm dừng học tập Tạm dừng 01 học kỳ vì lý do sức khỏe và điều trị y tế 20/09/2024 QĐ số 402/QĐ-ĐHAG Đã tiếp nhận lại Chi tiết BD-2023-02 NCS. Phạm Văn Hùng Buộc thôi học Quá thời hạn đào tạo tối đa 06 năm không hoàn thành luận án 10/11/2023 QĐ số 512/QĐ-ĐHAG Đã thôi học Xem QĐ | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1761](../../index.html#L1761) | span/panel-m12 | Gia hạn thời gian | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1765](../../index.html#L1765) | span/panel-m12 | Đã ban hành QĐ | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1771](../../index.html#L1771) | span/panel-m12 | Đổi tên đề tài | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1775](../../index.html#L1775) | span/panel-m12 | Đã phê duyệt | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1781](../../index.html#L1781) | span/panel-m12 | Tạm dừng học tập | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1785](../../index.html#L1785) | span/panel-m12 | Đã tiếp nhận lại | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1791](../../index.html#L1791) | span/panel-m12 | Buộc thôi học | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1795](../../index.html#L1795) | span/panel-m12 | Đã thôi học | API-12 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1807](../../index.html#L1807) | h3/panel-m13 | Tra Cứu Văn Bằng, Thống Kê Tiến Độ & Xuất Hồ Sơ Kiểm Định | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1826](../../index.html#L1826) | h3/panel-m13 | 1. Công cụ Tra cứu Văn bằng Tiến sĩ Số | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1853](../../index.html#L1853) | h3/panel-m13 | 2. Thống Kê Tiến Độ Nghiên Cứu Sinh Theo Khóa | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1854](../../index.html#L1854) | span/panel-m13 | Tổng 48 NCS | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1895](../../index.html#L1895) | h3/panel-m13 | 3. Thống Kê Công Bố Khoa Học Toàn Trường | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1896](../../index.html#L1896) | span/panel-m13 | 91 Bài báo | API-59/60/57 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1932](../../index.html#L1932) | h3/panel-m14 | Ma Trận Phân Quyền 06 Vai Trò (RBAC) & Nhật Ký Hoạt Động (Audit Log) | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1948](../../index.html#L1948) | h3/panel-m14 | 1. Ma Trận Phân Quyền Theo 06 Vai Trò (Role-Based Access Control) | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1953](../../index.html#L1953) | table/panel-m14 | Vai trò chức năng Hồ sơ & Kế hoạch Học phần & Điểm Chuyên đề & Báo cáo Bài báo & Minh chứng Bảo vệ Luận án Cấp Bằng & Quyết định NCS (Nghiên cứu sinh) Xem / Tạo đơn Đăng ký / Xem Nộp bản thảo Khai báo / Upload Nộp luận án Tra cứu / Nhận bằng NHD (Người hướng dẫn) Duyệt kế hoạch Xem điểm Đánh giá Đạt/Không Xác nhận bài báo Ký số cho bảo vệ Xem hồ sơ BM (Trưởng Bộ môn) Xem hồ sơ Xem kết quả Tổ chức chấm CĐ Thẩm tra nội dung Thông qua cấp BM Xem quyết nghị Khoa (Ban Chủ nhiệm Khoa) Duyệt đơn gia hạn Quản lý toàn khoa Phê duyệt kết quả Xác nhận điều kiện Đề xuất Hội đồng Theo dõi cấp bằng PĐT (Phòng Đào tạo SĐH) Quản trị toàn bộ Quản lý tín chỉ Lưu trữ biên bản Thẩm định WoS Phản biện độc lập Quản lý Sổ gốc BGH (Ban Giám hiệu) Ký QĐ trúng tuyển Giám sát chất lượng Xem báo cáo Xem thống kê Ký QĐ Hội đồng Ký QĐ Cấp Bằng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1968](../../index.html#L1968) | span/panel-m14 | Xem / Tạo đơn | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1969](../../index.html#L1969) | span/panel-m14 | Đăng ký / Xem | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1970](../../index.html#L1970) | span/panel-m14 | Nộp bản thảo | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1971](../../index.html#L1971) | span/panel-m14 | Khai báo / Upload | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1972](../../index.html#L1972) | span/panel-m14 | Nộp luận án | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1973](../../index.html#L1973) | span/panel-m14 | Tra cứu / Nhận bằng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1977](../../index.html#L1977) | span/panel-m14 | Duyệt kế hoạch | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1978](../../index.html#L1978) | span/panel-m14 | Xem điểm | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1979](../../index.html#L1979) | span/panel-m14 | Đánh giá Đạt/Không | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1980](../../index.html#L1980) | span/panel-m14 | Xác nhận bài báo | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1981](../../index.html#L1981) | span/panel-m14 | Ký số cho bảo vệ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1982](../../index.html#L1982) | span/panel-m14 | Xem hồ sơ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1986](../../index.html#L1986) | span/panel-m14 | Xem hồ sơ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1987](../../index.html#L1987) | span/panel-m14 | Xem kết quả | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1988](../../index.html#L1988) | span/panel-m14 | Tổ chức chấm CĐ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1989](../../index.html#L1989) | span/panel-m14 | Thẩm tra nội dung | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1990](../../index.html#L1990) | span/panel-m14 | Thông qua cấp BM | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1991](../../index.html#L1991) | span/panel-m14 | Xem quyết nghị | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1995](../../index.html#L1995) | span/panel-m14 | Duyệt đơn gia hạn | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1996](../../index.html#L1996) | span/panel-m14 | Quản lý toàn khoa | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1997](../../index.html#L1997) | span/panel-m14 | Phê duyệt kết quả | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1998](../../index.html#L1998) | span/panel-m14 | Xác nhận điều kiện | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:1999](../../index.html#L1999) | span/panel-m14 | Đề xuất Hội đồng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2000](../../index.html#L2000) | span/panel-m14 | Theo dõi cấp bằng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2004](../../index.html#L2004) | span/panel-m14 | Quản trị toàn bộ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2005](../../index.html#L2005) | span/panel-m14 | Quản lý tín chỉ | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2006](../../index.html#L2006) | span/panel-m14 | Lưu trữ biên bản | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2007](../../index.html#L2007) | span/panel-m14 | Thẩm định WoS | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2008](../../index.html#L2008) | span/panel-m14 | Phản biện độc lập | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2009](../../index.html#L2009) | span/panel-m14 | Quản lý Sổ gốc | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2013](../../index.html#L2013) | span/panel-m14 | Ký QĐ trúng tuyển | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2014](../../index.html#L2014) | span/panel-m14 | Giám sát chất lượng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2015](../../index.html#L2015) | span/panel-m14 | Xem báo cáo | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2016](../../index.html#L2016) | span/panel-m14 | Xem thống kê | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2017](../../index.html#L2017) | span/panel-m14 | Ký QĐ Hội đồng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2018](../../index.html#L2018) | span/panel-m14 | Ký QĐ Cấp Bằng | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2028](../../index.html#L2028) | h3/panel-m14 | 2. Nhật Ký Hoạt Động Hệ Thống Thời Gian Thực (System Audit Log) | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2035](../../index.html#L2035) | table/panel-m14 | Thời gian Người thực hiện Vai trò Hành động Đối tượng tác động Địa chỉ IP Trạng thái | API-02/63 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2061](../../index.html#L2061) | h2/roles | Đối tượng & Bàn làm việc 07 Vai trò | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2075](../../index.html#L2075) | h2/roadmap | Quy trình Lộ trình 06 Giai đoạn | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2087](../../index.html#L2087) | h2/public | Dịch vụ Công khai & Tra cứu | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2093](../../index.html#L2093) | h3/public | 1. Kho Luận án Tiến sĩ Công khai | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2103](../../index.html#L2103) | h3/public | 2. Console Tra cứu Phôi bằng Tiến sĩ 3D | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2129](../../index.html#L2129) | h2/citations | Văn bản & Căn cứ Pháp lý | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2153](../../index.html#L2153) | h2/about | Giới thiệu Hệ thống DTMS | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2159](../../index.html#L2159) | h3/about | Mục tiêu Số hóa Tập trung | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2167](../../index.html#L2167) | h3/about | Hạ tầng ĐHQG-HCM Standard | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2188](../../index.html#L2188) | h3/modal-role-switcher | ⇄ Bàn Làm Việc Phân Quyền (RBAC Role Switcher) | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2244](../../index.html#L2244) | h3/modal-login | Đăng Nhập Cổng DTMS Academic OS | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2275](../../index.html#L2275) | h3/modal-edit-profile | Cập Nhật Thông Tin Cá Nhân Nghiên Cứu Sinh | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2313](../../index.html#L2313) | h3/modal-leave-request | Đơn Xin Gia Hạn / Tạm Dừng Học Tập | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2352](../../index.html#L2352) | h3/modal-assign-supervisor | Phân Công Người Hướng Dẫn Khoa Học | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2396](../../index.html#L2396) | h3/modal-grade-essay | Đánh Giá & Nhập Điểm Tiểu Luận Tổng Quan | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2430](../../index.html#L2430) | h3/modal-declare-pub | Khai Báo Bài Báo Khoa Học & Upload Minh Chứng (WoS/Scopus) | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2482](../../index.html#L2482) | h3/modal-workflow-pub | Sơ Đồ Phân Tích Thiết Kế: Quy Trình Thẩm Định Công Bố Khoa Học | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2533](../../index.html#L2533) | h3/modal-workflow-defense | Sơ Đồ Phân Tích Thiết Kế: Quy Trình 6 Bước Bảo Vệ Luận Án Cấp Trường | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2594](../../index.html#L2594) | h3/modal-workflow-changes | Sơ Đồ Phân Tích Thiết Kế (1): Quy Trình Xử Lý Biến Động & Thôi Học | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2639](../../index.html#L2639) | h3/modal-edit-plan | Lập / Điều Chỉnh Kế Hoạch Đào Tạo Toàn Khóa | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2677](../../index.html#L2677) | h3/modal-change-supervisor | Đề Xuất Thay Đổi / Bổ Sung Người Hướng Dẫn | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2727](../../index.html#L2727) | h3/modal-submit-essay | Nộp Toàn Văn Tiểu Luận Tổng Quan | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2759](../../index.html#L2759) | h3/modal-submit-outline | Nộp Bản Đề Cương Chi Tiết & Bản Giải Trình Chỉnh Sửa | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2805](../../index.html#L2805) | h3/modal-register-topic | Đăng Ký Chuyên Đề Tiến Sĩ Mới | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2856](../../index.html#L2856) | h3/modal-submit-progress | Nộp Báo Cáo Tiến Độ Nghiên Cứu Định Kỳ (6 Tháng / Lần) | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2905](../../index.html#L2905) | h3/modal-change-topic-title | Đề Xuất Điều Chỉnh Tên Đề Tài Luận Án Tiến Sĩ | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2945](../../index.html#L2945) | h3/modal-upload-thesis-version | Upload Phiên Bản Luận Án Tiến Sĩ Mới | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:2981](../../index.html#L2981) | h3/modal-submit-post-defense | Nộp Luận Án Hoàn Thiện Sau Bảo Vệ & Hồ Sơ Lưu Chiểu | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |
| [index.html:3023](../../index.html#L3023) | h3/modal-create-change-request | Tạo Đơn / Yêu Cầu Thay Đổi Biến Động Học Vụ | Nội dung/label tĩnh hoặc form theo 02 | Các metrics computed, raw fields stored; theoM. Reload resource khi mutation; label không API |

## Field form default/options và dữ liệu chưa được handler đọc

### modal-login ([index.html: 2247](../../index.html#L2247))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| login-username | 2250 | nvbinh_ncs@agu.edu.vn | required HTML | CN-02→inputs/API ở 02; không string option làm ID |
| login-password | 2254 | agu2026 | required HTML | CN-02→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2260 |  | theo handler | CN-02→inputs/API ở 02; không string option làm ID |

### modal-edit-profile ([index.html: 2278](../../index.html#L2278))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2282 | Nguyễn Văn Bình | readonly | CN-11→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2286 | NCS-2023-ENV01 | readonly | CN-11→inputs/API ở 02; không string option làm ID |
| profile-phone-input | 2290 | 0912.345.678 | required HTML | CN-11→inputs/API ở 02; không string option làm ID |
| profile-email-input | 2294 | nvbinh_ncs@agu.edu.vn | required HTML | CN-11→inputs/API ở 02; không string option làm ID |
| profile-workplace-input | 2298 | Viện Nghiên cứu Biến đổi Khí hậu ĐBSCL | required HTML | CN-11→inputs/API ở 02; không string option làm ID |

### modal-leave-request ([index.html: 2316](../../index.html#L2316))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| leave-type-select | 2319 | Gia hạn thời gian đào tạo (Tối đa 12 tháng/lần) Tạm dừng học tập (Nghỉ học tạm thời / Bảo lưu) | required HTML | CN-12→inputs/API ở 02; không string option làm ID |
| leave-duration-input | 2326 | Ví dụ: 06 tháng (từ 15/10/2026 đến 15/04/2027) | required HTML | CN-12→inputs/API ở 02; không string option làm ID |
| leave-reason-input | 2330 | Nêu rõ lý do học thuật / công tác / sức khỏe và cam kết hoàn thành... | required HTML | CN-12→inputs/API ở 02; không string option làm ID |
| leave-file-input | 2335 | .pdf,.doc,.docx | theo handler | CN-12→inputs/API ở 02; không string option làm ID |

### modal-assign-supervisor ([index.html: 2355](../../index.html#L2355))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| assign-ncs-select | 2358 | NCS. Nguyễn Văn Bình (Khoa học Môi trường K2023) NCS. Lê Thị Mai (Trồng trọt K2022) NCS. Trần Quốc Huy (Khoa học Môi trường K2024) | theo handler | CN-18→inputs/API ở 02; không string option làm ID |
| assign-nhd-main-select | 2366 | GS.TS. Trần Văn Hướng (Đang hướng dẫn 2/3 - Còn 1 chỉ tiêu) PGS.TS. Lê Văn Tuấn (Đang hướng dẫn 2/2) TS. Nguyễn Hải Nam (Đang hướng dẫn 1/1) | theo handler | CN-18→inputs/API ở 02; không string option làm ID |
| assign-nhd-sub-select | 2374 | Không có NHD phụ PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) | theo handler | CN-18→inputs/API ở 02; không string option làm ID |
| assign-decision-input | 2382 | 450/QĐ-ĐHAG | required HTML | CN-18→inputs/API ở 02; không string option làm ID |

### modal-grade-essay ([index.html: 2399](../../index.html#L2399))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| essay-score-1 | 2403 | 8.5 | required HTML | CN-24→inputs/API ở 02; không string option làm ID |
| essay-score-2 | 2407 | 9.0 | required HTML | CN-24→inputs/API ở 02; không string option làm ID |
| essay-score-3 | 2411 | 8.8 | required HTML | CN-24→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2416 | Tiểu luận tổng quan cập nhật đầy đủ các công trình nghiên cứu trong và ngoài nước trong 5 năm gần đây, phương pháp luận rõ ràng, đề tài có tính cấp thiết cao. | theo handler | CN-24→inputs/API ở 02; không string option làm ID |

### modal-declare-pub ([index.html: 2433](../../index.html#L2433))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| pub-title-input | 2437 | Nhập tên bài báo tiếng Anh hoặc tiếng Việt... | required HTML | CN-33→inputs/API ở 02; không string option làm ID |
| pub-journal-input | 2441 | Ví dụ: Water Science and Technology | required HTML | CN-33→inputs/API ở 02; không string option làm ID |
| pub-cat-select | 2445 | WoS (SCIE / SSCI) · Q1 WoS (SCIE / SSCI) · Q2 Scopus · Q2 Scopus · Q3 / Q4 Tạp chí uy tín thuộc danh mục HĐGSNN (>= 0.75đ) | required HTML | CN-33→inputs/API ở 02; không string option làm ID |
| pub-doi-input | 2455 | 10.1016/j.envsci.2025.109... | theo handler | CN-33→inputs/API ở 02; không string option làm ID |
| Ôvôdanh5 | 2459 | 0944-1344 | theo handler | CN-33→inputs/API ở 02; không string option làm ID |
| pub-file-input | 2464 | .pdf | theo handler | CN-33→inputs/API ở 02; không string option làm ID |

### modal-edit-plan ([index.html: 2642](../../index.html#L2642))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2646 | Học kỳ 4 (04/2025 - 10/2025) Học kỳ 5 (10/2025 - 04/2026) Học kỳ 6 (04/2026 - 10/2026) | required HTML | CN-15→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2654 | 30/09/2025 | required HTML | CN-15→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2658 | Hoàn thành thí nghiệm thực địa giai đoạn 2, bảo vệ Chuyên đề tiến sĩ 3 và hoàn thiện bài báo gửi tạp chí quốc tế Q1. | required HTML | CN-15→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2662 | 01 Bản thảo bài báo ISI/Scopus + 01 Báo cáo Chuyên đề 3 | required HTML | CN-15→inputs/API ở 02; không string option làm ID |

### modal-change-supervisor ([index.html: 2680](../../index.html#L2680))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2683 | Thay đổi Người hướng dẫn chính Bổ sung thêm Người hướng dẫn 2 (Đồng hướng dẫn) Rút tên Người hướng dẫn phụ | required HTML | CN-19→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2692 | GS.TS. Trần Văn Hướng | readonly | CN-19→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2696 | PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) PGS.TS. Nguyễn Thị Kim (ĐH An Giang) | required HTML | CN-19→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2705 | Nêu rõ lý do học thuật, sức khỏe hoặc điều chỉnh chuyên sâu phạm vi đề tài... | required HTML | CN-19→inputs/API ở 02; không string option làm ID |
| Ôvôdanh5 | 2710 | .pdf | theo handler | CN-19→inputs/API ở 02; không string option làm ID |

### modal-submit-essay ([index.html: 2730](../../index.html#L2730))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2733 | Tổng quan các giải pháp sinh học xử lý nước thải chăn nuôi lợn tại vùng Mekong | required HTML | CN-23→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2737 | Tiểu luận phân tích và tổng hợp 68 công trình nghiên cứu về công nghệ màng sinh học, thực vật thủy sinh và giải pháp kinh tế tuần hoàn trong xử lý nước thải chăn nuôi lợn quy mô trang trại... | required HTML | CN-23→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2742 | .pdf | theo handler | CN-23→inputs/API ở 02; không string option làm ID |

### modal-submit-outline ([index.html: 2762](../../index.html#L2762))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2765 | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn và thu hồi năng lượng tái tạo tại vùng ĐBSCL | required HTML | CN-25→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2770 | Nước thải chăn nuôi lợn tại An Giang & Cần Thơ | required HTML | CN-25→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2774 | Thực nghiệm mô hình lab, màng bio-carrier và phân tích LCA | required HTML | CN-25→inputs/API ở 02; không string option làm ID |
| outline-file-input | 2780 | .pdf | theo handler | CN-25→inputs/API ở 02; không string option làm ID |
| outline-explanation-file-input | 2788 | .pdf | theo handler | CN-25→inputs/API ở 02; không string option làm ID |

### modal-register-topic ([index.html: 2808](../../index.html#L2808))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2811 | Chuyên đề 1 (2 Tín chỉ) Chuyên đề 2 (2 Tín chỉ) Chuyên đề 3 (2 Tín chỉ) | required HTML | CN-27→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2819 | Nhập tên chuyên đề chuyên sâu... | required HTML | CN-27→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2824 | GS.TS. Trần Văn Hướng PGS.TS. Lê Văn Tuấn TS. Nguyễn Hải Nam TS. Lê Hoàng Nam | required HTML | CN-27→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2833 | Tháng / Năm (Ví dụ: 12/2025) | required HTML | CN-27→inputs/API ở 02; không string option làm ID |
| Ôvôdanh5 | 2839 | .pdf,.doc,.docx | theo handler | CN-27→inputs/API ở 02; không string option làm ID |

### modal-submit-progress ([index.html: 2859](../../index.html#L2859))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2863 | Kỳ 5 (10/2025 - 04/2026) Kỳ 6 (04/2026 - 10/2026) | required HTML | CN-30→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2870 | 29/09/2026 | readonly | CN-30→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2874 | Đã hoàn thành toàn bộ thí nghiệm tại hiện trường An Giang và thu thập 120 mẫu nước thải; đã công bố thành công 01 bài báo trên Tạp chí WoS Q1; đang tiến hành viết chương 3 và chương 4 của bản thảo luận án. | required HTML | CN-30→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2878 | Cần thêm hóa chất tinh khiết phân tích HPLC tại phòng thí nghiệm trung tâm. | theo handler | CN-30→inputs/API ở 02; không string option làm ID |
| Ôvôdanh5 | 2882 | Hoàn thiện toàn văn bản thảo luận án để gửi Bộ môn và NHD duyệt trước ngày 15/02/2027. | required HTML | CN-30→inputs/API ở 02; không string option làm ID |
| progress-file-input | 2887 | .pdf | theo handler | CN-30→inputs/API ở 02; không string option làm ID |

### modal-change-topic-title ([index.html: 2908](../../index.html#L2908))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2911 | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn tại vùng ĐBSCL | readonly | CN-37→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2915 | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn và thu hồi năng lượng tái tạo tại vùng Đồng bằng sông Cửu Long | required HTML | CN-37→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 2919 | Research on integrated biotechnological solutions for piggery wastewater treatment and renewable energy recovery in the Mekong Delta region | required HTML | CN-37→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 2923 | Bổ sung phần thu hồi năng lượng sinh học nhằm phản ánh chính xác kết quả thực nghiệm và tăng tính ứng dụng thực tiễn của luận án. | required HTML | CN-37→inputs/API ở 02; không string option làm ID |
| change-title-file-input | 2928 | .pdf | theo handler | CN-37→inputs/API ở 02; không string option làm ID |

### modal-upload-thesis-version ([index.html: 2948](../../index.html#L2948))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 2951 | v3.1 - Bản chỉnh sửa hoàn thiện sau bảo vệ chính thức v3.0 - Bản bảo vệ chính thức cấp Trường v2.0 - Bản gửi Phản biện độc lập | required HTML | CN-38→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 2959 | Mô tả tóm tắt nội dung chỉnh sửa so với phiên bản trước... | required HTML | CN-38→inputs/API ở 02; không string option làm ID |
| thesis-file-input | 2964 | .pdf | theo handler | CN-38→inputs/API ở 02; không string option làm ID |

### modal-submit-post-defense ([index.html: 2984](../../index.html#L2984))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| post-defense-thesis-file | 2989 | .pdf | theo handler | CN-47→inputs/API ở 02; không string option làm ID |
| post-defense-explanation-file | 2997 | .pdf | theo handler | CN-47→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 3004 | BN-TV089/2026 (Ngày: 20/01/2026) | required HTML | CN-47→inputs/API ở 02; không string option làm ID |
| Ôvôdanh4 | 3008 | NL-892/NLV (Ngày: 25/01/2026) | required HTML | CN-47→inputs/API ở 02; không string option làm ID |

### modal-create-change-request ([index.html: 3026](../../index.html#L3026))

| Field | Dòng | Default/options/placeholder | Ràng buộc UI | Nguồn/API thật |
|---|---|---|---|---|
| Ôvôdanh1 | 3029 | Thay đổi / Bổ sung Người hướng dẫn khoa học Thay đổi tên đề tài nghiên cứu Xin tạm dừng học tập / Nghỉ học tạm thời Gia hạn thời gian đào tạo (6 - 12 tháng) Chuyển cơ sở đào tạo / Chuyển ngành Xử lý buộc thôi học (do quá hạn tối đa hoặc vi phạm) | required HTML | CN-50→inputs/API ở 02; không string option làm ID |
| Ôvôdanh2 | 3040 | Trình bày lý do, thời gian, cơ sở thực hiện... | required HTML | CN-50→inputs/API ở 02; không string option làm ID |
| Ôvôdanh3 | 3045 | .pdf | theo handler | CN-50→inputs/API ở 02; không string option làm ID |

ISSN input của khai báo có UI nhưng specialized handler bỏ; comment tiểu luận có UI nhưng specialized handler bỏ; rememberMe không đọc. Generic form thu cả readonly và field_N, đó chỉ format lưu cục bộ, không contractserver. File metadata chỉ name/size/type, không nội dung server. Thời gian server/actor được suy lại khi tích hợp.

Mọi số tĩnh trênbar/badge/card không có công thức được coi mock; không đổi thành quy tắc học thuật chỉ vì nhãn thông tư. Cache invalidation gắnmutation và ngày hiện tại, không chỉ đổi DOM rồi reload lại mất.
