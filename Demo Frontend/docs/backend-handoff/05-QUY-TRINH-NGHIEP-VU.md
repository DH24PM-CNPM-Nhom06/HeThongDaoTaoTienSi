# Quy trình nghiệp vụ giữa nhiều vai trò

Phân biệt ba mức: **có handler cục bộ**, **chỉ sơ đồ/card tĩnh**, **đề xuất server cần chốt**. Tất cả chưa backend thật. Trạng thái tiếng Anh dưới đây là enum hợp đồng đề xuất; không xem là quy chế của trường.

Mọi chuyển bước phải kiểm quyền + quan hệ hồ sơ + revision/version + trạng thái trong transaction. Actor/time máy chủ, không tin role/action client để bỏ bước. Hai người duyệt đồng thời chỉ một commit; history không mất. Rejected/returned chỉ áp dụng sau nhóm chốt, không tự thêm cấp phê duyệt. Thông báo cho actor kế/chủ hồ sơ bằng outbox; queued khác sent.

## Kế hoạch học tập

Nguồn: management.js: 815–868. Mức bằng chứng: **Luồng có thực thi cục bộ**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| draft/điều chỉnh | NCS | Gửi revision | Đủ mốc/học kỳ/hạn | API-17 | awaiting_supervisor; giữ baseline cũ | training_plans/milestones/reviews; NHD hàng chờ | 422 thiếu, 409 baseline cũ |
| awaiting_supervisor | NHD được giao | Approve | Đúng bản/cấp | API-18 | awaiting_department | review actor/time; BM thông báo | 403 scope, 409 wrongstage |
| awaiting_department | BM đúng đơn vị | Approve | NHD đã duyệt bản đó | API-18 | awaiting_academic_affairs | review; PDT hàng chờ | 409 wrongstage |
| awaiting_academic_affairs | PDT | Approve | Các bước trước hợp lệ | API-18 | approved | review; NCS/NHD nhận kết quả | 409 version |
| approved | NCS | Điều chỉnh | Không sửa trực tiếp baseline | API-17 | revision mới → awaiting_supervisor | Giữ reviews bản cũ; NHD nhận lại | 409 basechanged |

KHOA thấy nút trong ACTION_ACCESS nhưng handler không có bước. Không thêm cấp Khoa. Reject/return/comment/thu hồi duyệt chưa có UI; chốt Q-03 trước thêm transition. Demo chỉ planStage 0–3, kế hoạch bảng HTML không được ghi.

## Công bố khoa học

Nguồn: index.html: 2489–2522; management.js: 1052–1113. Mức bằng chứng: **Mâu thuẫn giữa sơ đồ và handler**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| chưa khai báo | NCS | Submit | DOI/metadata/file hợp lệ | API-41 | submitted | publication+author+files; actor review theo quy trình chốt | 422 format/file, 409 DOI trùng |
| submitted | NHD | Xác nhận đóng góp | Phân công, không tự duyệt | API-42 | supervisor_confirmed nếu chọn 2 cấp | review/NCS/PDT; chưa tính chuẩn cuối | 403 selfreview, 409 stage |
| supervisor_confirmed | PDT | Verify/reject | Có chứng cứ chỉ mục/affiliation/đóng góp theo quy định chốt | API-42 | verified hoặc rejected | approvedscore/summary/checklist; NCS nhận | 422 score, 409 stage |

Bảng trên là phương án theo sơ đồ: cần Q-08 chốt. Handler hiện NHD hoặc PDT bất kỳ đều đánh verified trong 1 bước, không confirm riêng. Nếu giữ 1 bước thì bỏsupervisor_confirmed, không thêm phê duyệt giả. Sơ đồ 02 bài vàhandler 0.75 điểm chưa đồng nhất; không tự chọn điều kiện.

## Báo cáo tiến độ định kỳ

Nguồn: management.js: 987–1007, 1406–1414; index.html: 1159–1256. Mức bằng chứng: **Nộp/đánh giá mô phỏng, luồng BM chưa xác nhận**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| kỳ cần nộp | NCS | Submit report | Period thật/file clean, nội dung đủ | API-35 | submitted | revision report/files; NHD hàng chờ | 409 periodclosed, 422 file |
| submitted | NHD hoặc BM được giao | Đánh giá pass/revision_required/fail | Đúng report revision; comment nếu không đạt | API-36 | passed/revision_required/failed | review/time/comment; NCS nhận | 403 scope, 409 not Submitted |
| revision_required | NCS | Nộp lại | Theo thời hạn/cửa sổ được chốt | API-35 | revision mới submitted | Giữ kết quả cũ; review bản mới | 409 duplicate |
| đến hạn chưa nộp | NHD/PDT | Nhắc hạn | Alert thực, không cooldown | API-38/39 | queued → sent/failed (không đổi review status) | outbox/delivery+audit | 503 email, 409 cooldown |

Không mặc định thêm “đơn vị quản lý xác nhận” sau NHD khi nguồn chưa rõ. Q-10 chốt BM đánh giá cùng bước hay xác nhận riêng. Kỳ 7 dashboard khác form 5/6 và seed 6; phải dùng server lịch/kỳ đến hạn.

## Biến động học vụ, gia hạn, tạm dừng, đổi NHD/đề tài, chuyển/withdrawal

Nguồn: index.html: 2591–2633; management.js: 765–813, 1341–1440. Mức bằng chứng: **Sơ đồ 4 bước chưa có review handler**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| chưa có đơn | NCS; PDT xử lý hành chính nếu quyền chốt | Gửi change | Payload theo type/file clean | API-13 | submitted/faculty_review | request chưa đổi candidate; Khoa nhận | 422 conditionalfields |
| faculty_review | KHOA theo ủy quyền | Thẩm tra chuyên môn | Có ý kiến NHD/theo rule chốt | API-14 | academic_affairs_review | review; PDT nhận | 403, 409 stage |
| academic_affairs_review | PDT | Thẩm tra/dự thảo QĐ | Đủ căn cứ thời hạn/định mức | API-14 | awaiting_decision | review+decision draft; BGH nhận | 422 decision/evidence |
| awaiting_decision | BGH | Ban hành QĐ | QĐ/file ký hợp lệ | API-14 | approved → applyeffective | Transaction candidate/hạn/title/assignment/history; NCS/NHD/đơn vị nhận | 409 quota/date/version |
| bước đang thẩm tra | Actor đúng bước | Reject/return | Comment lý do | API-14 | rejected/returned (đề xuất) | Không đổi hồ sơ; NCS nhận | 422 comment required |

Bảng là đề xuất dựa modal, không khẳngđịnh đủ quy trình gốc. Q-12 chốt actor/ý kiến/reject/hiệu lực. NCS không tự buộc thôi học dùselect có option. Gia hạn/tạm dừng cần tính ngày/hạn theo policy, chưa phép cộng 6/12 thángmặcđịnh. m01/m03/m09/m12 cùng request, không trùng workflow.

## Tiểu luận, đề cương, chuyên đề

Nguồn: management.js: 923–985, 1341–1440; index.html: 974–1156. Mức bằng chứng: **Có demo nộp/chấm; đề cương duyệt còn thiếu**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| chưa nộp/revision | NCS | Nộp essay/outline | Type fields và file clean | API-28 | submitted | submission revision; BM/NHD hàng chờ | 422 files/fields |
| essay submitted | NHD/BM được giao | Chấm | 3 scores/evaluatorroster và biên bản | API-29 | passed/failed theo rule | mean/result/review+checklist; NCS nhận | 422 scores, 403 roster |
| outline submitted | Actor/chuyên môn cần chốt | Đánh giá/giải trình/phê duyệt | HĐ/nhận xét/chữ ký theo quy định chốt | API-30 | approved/revision_required | review/decision; NCS nhận | 409 explanation |
| đủ điều kiện đăng ký topic | NCS | Đăng ký | Program ordinal+file theoQ-09 | API-32 | submitted | topic revision; BM/NHD nhận | 409 year 1/duplicate |
| topic submitted | BM/NHD được giao | Chấm | Score và evidence theo rule | API-33 | passed/failed | evaluation/minutes/credits/checklist; NCS nhận | 422 score, 409 locked |

Ngưỡng 7 tiểu luận là code hiện hành, không xác nhận pháp lý. Topicpassedmọiscorelàlỗidemo. Hội đồng đề cương 5 người chỉ card tĩnh, quyền duyệt/chuyển tiếp năm1cầnQ-07/Q-09.

## Đề tài/bản thảo, tương đồng và sign-off

Nguồn: management.js: 1184–1210; index.html: 1335–1467. Mức bằng chứng: **Version metadata và sign-offdemo; dịch vụ chưa kết nối**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| thesis draft | NCS | Upload bản mới | PDF/note/đúng stage; không ghi đèfilelocked | API-44 | version mới | versions/files; NHD nhận nếu quy trình chốt | 409 base/locked, 415 file |
| version clean | PDT | Quét tương đồng | Provider được cấu hình | API-45/46 | queued → completed/failed | check hash/report; PDT/NHD theo quyền | 503 provider |
| version đang xem | NHD được giao | Đồngý bảo vệ | Review file/bản phù hợp | API-47 | approval active, signed hoặcnot_signed_digitally | signoff version+actor; NCS/PDT nhận | 409 staleversion |
| version đã chốt | Actorlock cần chốt | Khóa/thu hồi/đổi bản | ChốtQ-15 trước bổ sung API | Chưa contractmutationlock | locked/revoked tùyquy trình | Immutablefile/history | 409 locked nếu ghi đè |

Không cólock handler/UI. Lockcũcóthể vẫn cho nộp bản mới; phải chốt. Sign-off không timestamp ký số. APA 100%/không đạo văn không tựsuy từ Turnitin percentage.

## Điều phối bảo vệ và công khai

Nguồn: index.html: 2530–2588, 1471–1628. Mức bằng chứng: **Sơ đồ tĩnh, không mutation tổ chức**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| preparing | BM/KHOA theo quyền cần chốt | Seminar đơn vị | Cơ cấu/biên bản quy định chốt | Chưa API ghi; đọcAPI-49 | seminar kết luận | seminars/minutes | Chưa xác nhận scope |
| hồ sơ đủ chứng cứ | PDT | Kiểm điều kiện | Rules đã duyệt, dữ liệu thật | API-48 | eligible true/false/unknown | Không tự chuyển chỉ GET | Rules unknown không pass |
| thẩm định | PDT/chuyên gia được giao | Giao/nhận PB kín | Quyền/ẩnidentity/hạn cần chốt | Chưa API mutation; đọcAPI-49 | reviews sent/received | independent_reviews/files | 403 secrecy, deadline chưa chốt |
| dự thảo HĐ | KHOA/PDT/BGH theo quyền cần chốt | Lập/ban hành HĐ | Cơ cấu cần chốt/QĐ ký thật | Chưa API mutation; đọcAPI-49 | appointed | council/members/decision | Không mặc định 7/2 PB |
| luận án cho phép public | PDT cần chốt | Công khai | Chỉ file public, đúng approved version | API-52 | published | notice/server publishedAt; API-58 hiển thị | 409 not Approved |
| đủ hạn và điều kiện tổ chức | HĐ được giao | Bảo vệ/phiếu | Attendance và ngưỡng chốt | API-50 hoặc 51 | passed/failed | vote/minutes/resolution; NCS/PDT nhận | 409 notHeld, 422 votes |

Đây là mappingnội dung, không tự thêm bước duyệt. Q-16–20 phải chốt điều kiện ngoại ngữ/seminar/phản biện/cơ cấu/ngưỡng/công khai. Cácmutationchưacontractphảiđượcđặc tả trong đợt scope bổ sung; không suy đã có từ menu.

## Hoàn thiện sau bảo vệ → lưu chiểu → cấp bằng → tra cứu

Nguồn: management.js: 1237–1262; index.html: 1633–1722, 2984–3016. Mức bằng chứng: **Nộp metadata/cấp bằng demo; review/chứng cứ còn thiếu**.

| Trạng thái đầu | Actor | Hành động | Điều kiện | API | Trạng thái/kết quả | Bảng/Thông báo | Thất bại |
|---|---|---|---|---|---|---|---|
| defense passed | NCS | Nộp chỉnh sửa/giải trình/biên nhận | 2 PDF và receipt evidence | API-54 | submitted | post/deposits; HĐ/PDT theo quyền nhận | 409 defense Not Passed |
| submitted | Chủ tịch/thư ký/PDT theo quyền cần chốt | Xác nhận | Chứng cứ/chữ ký/lưu chiểu thực | API-55 | approved | reviews/deposits verified | 409 sign/evidence |
| graduation eligible | BGH | Công nhận học vị | Defense result/approved post/deposit/finance/QĐ theo rule chốt | API-56 | issued/candidategraduated | Unique degree/sổ/QĐ/audit; NCS/PDT nhận | 409 requirements/duplicate |
| degree issued | Khách/NCS | Tra cứu | Code/name cùng record | API-57 | Đọc không mutation | Public fields an toàn | 422 query/empty không verified |

Handlerconferdemo không kiểm defenseVote/signoff/post/deposit; không đưa vào sổ gốc JS. Backend bắt buộc cùng nguồn issued cho UI/public lookup. Hạn 30 ngày UI khác 3–6 tháng báo cáo, cầnQ-21.

## Quy tắc liên thông cần giữ

Điểm/rule/program/file/revision thay đổi phải vô hiệu hóa cache summary/checklist. Không dùng label đạt cũ cho hồ sơ mới. Grade changes/outline/topic/pub/report/deadline cập nhật GET eligibility; eligibility không là lệnh cho phép bảo vệ nếu còn bước pháp lý chưa xác nhận. Checklist tốt nghiệp riêng, không tái dùng chỉ sáu mục bảo vệ.

Các bước thiếu form/handler được ghi rõ, không dựng endpoint “đã tồn tại”. Nếu nhóm chọn làm cả quản trị quy trình, phải bổ sung UI/API tạo roster, hội đồng, quyết định, seminar/phản biện/lịch và khóa bản thảo theo văn bản gốc. Tài liệu hiện tách khoảng trống để tr ánh triển khai theo đoán.
