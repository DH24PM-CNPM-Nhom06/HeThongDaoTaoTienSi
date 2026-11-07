# Yêu cầu dữ liệu Backend

Checkout không có schema/migration/ERD/backend. **Toàn bộ bảng dưới đây là thiết kế đề xuất**, suy từ UI/handler và khoảng trống tài liệu; không nhận đã có PostgreSQL. Kiểu uuid/jsonb/timestamptz/inet là gợi ý thuận tiện nếu chọn PostgreSQL; framework/DB do nhóm quyết định.

Mỗi bảng (trừ việc nhóm muốn compositePK) có id: uuid PK server sinh, created_at: timestamptz NOT NULL. Bảng có thể sửa có updated_at: timestamptz, version: integer>=1; bảng lịch sử/audit giữ append-only. ! là NOT NULL, ? là nullable. Không harddelete quyết định/kết quả/bằng/file chứng cứ; chốt retention trước softdelete/ẩn.

Giá trị tổng hợp không lưu như nguồn độc lập: dashboard count, quota active count, tín chỉ đạt, GPA, phần trămtiến độ, ngày quá hạn, pub total, checklist. Nếu cache phải có ruleVersion, scope, asOf và cơ chế invalidation; không client tự nhập đạt.

## Quan hệ chính

~~~mermaid
erDiagram
 USERS ||--o{ USER_ROLES : duoc_cap
 USERS ||--o| CANDIDATES : ho_so
 CANDIDATES ||--o{ SUPERVISOR_ASSIGNMENTS : co
 SUPERVISORS ||--o{ SUPERVISOR_ASSIGNMENTS : huong_dan
 CANDIDATES ||--o{ TRAINING_PLANS : phien_ban
 TRAINING_PLANS ||--o{ PLAN_MILESTONES : moc
 CANDIDATES ||--o{ COURSE_REGISTRATIONS : dang_ky
 COURSE_REGISTRATIONS ||--o| COURSE_RESULTS : diem
 CANDIDATES ||--o{ RESEARCH_SUBMISSIONS : nop
 CANDIDATES ||--o{ DOCTORAL_TOPICS : chuyen_de
 CANDIDATES ||--o{ REPORT_PERIODS : lich
 REPORT_PERIODS ||--o{ PROGRESS_REPORTS : phien_ban
 CANDIDATES ||--o{ PUBLICATION_AUTHORS : tac_gia
 PUBLICATIONS ||--o{ PUBLICATION_AUTHORS : co
 CANDIDATES ||--o| THESES : luan_an
 THESES ||--o{ THESIS_VERSIONS : ban
 THESIS_VERSIONS ||--o{ DEFENSE_APPROVALS : dong_y
 CANDIDATES ||--o{ DEFENSES : bao_ve
 DEFENSES ||--o{ PUBLIC_NOTICES : cong_khai
 COUNCILS ||--o{ COUNCIL_MEMBERS : thanh_vien
 DEFENSES ||--o{ COUNCIL_VOTES : phieu
 CANDIDATES ||--o{ ACADEMIC_CHANGE_REQUESTS : bien_dong
 CANDIDATES ||--o| DEGREE_RECORDS : so_goc
 FILES ||--o{ FILE_LINKS : minh_chung
~~~

Các quan hệ 1 hồ sơ/user, 1 thesis/candidate, 1 bằng issued/candidate là baseline đề xuất cần chốt khi có nhiều chương trình/cấp lại. FK vòng thesis.current version triển khai insert/update 2 bước. Workflow/file link đa hình không có FK DB thật tới mọi bảng: chọntypedtables hoặc constraint/trigger; không coiJSONIDđã bảo đảm toàn vẹn.

## Danh sách bảng đề xuất

| Bảng | Mục đích | API |
|---|---|---|
| units | Cây đơn vị trường/khoa/bộ môn | API-02 |
| users | Tài khoản thật | API-01, API-02, API-05, API-06 |
| user_roles | Vai trò và phạm vi của tài khoản | API-01, API-02, API-03 |
| role_permissions | Quyền tác vụ/loại scope | API-02 |
| sessions | Phiên và role đang hoạt động | API-01, API-02, API-03, API-04, API-06 |
| password_reset_tokens | Token quên mật khẩu | API-05, API-06 |
| majors | Danh mục ngành | API-08, API-09, API-57, API-68 |
| cohorts | Khóa/đợt tuyển sinh | API-08, API-09, API-59, API-68 |
| semesters | Học kỳ có lịch thật | API-68 |
| decisions | Quyết định/văn bản có chứng cứ | API-09, API-12, API-14, API-15, API-21, API-27, API-30, API-56, API-57 |
| candidates | Hồ sơ NCS | API-07, API-08, API-09, API-10, API-11, API-14, API-37, API-48, API-56, API-57, API-58, API-59 |
| program_versions | CTĐT theo ngành/khóa/đầu vào | API-15 |
| program_requirements | Khối tín chỉ và điều kiện đầu ra | API-15, API-22, API-31, API-48 |
| candidate_programs | Gán lộ trình/miễn bổ sung | API-09, API-15 |
| supervisors | Nhà khoa học có thể ngoài trường | API-19, API-20, API-21 |
| supervisor_assignments | Quan hệ NCS–NHD và lịch sử | API-07, API-08, API-14, API-19, API-20, API-21, API-60 |
| training_plans | Phiên bản kế hoạch có duyệt | API-16, API-17, API-18, API-59 |
| plan_milestones | Mốc từng học kỳ | API-16, API-17 |
| workflow_reviews | Lịch sử ý kiến/chuyển bước chung | API-07, API-12, API-13, API-14, API-16, API-17, API-18, API-30, API-34, API-36, API-55 |
| courses | Danh mục học phần | API-22 |
| course_offerings | Mở học phần theo kỳ | API-22, API-23 |
| course_registrations | Đăng ký/hủy/lần học | API-22, API-23, API-24 |
| course_results | Điểm theo lần học/nguồn đồng bộ | API-15, API-22, API-25, API-48 |
| research_submissions | Tiểu luận/đề cương có phiên bản | API-27, API-28, API-29, API-30, API-48 |
| submission_evaluations | Điểm/chứng cứ đánh giá tiểu luận | API-27, API-29 |
| doctoral_topics | Chuyên đề có revision | API-31, API-32, API-33, API-48 |
| topic_evaluations | Điểm chuyên đề/biên bản | API-31, API-33 |
| report_periods | Kỳ báo cáo và deadline riêng | API-34, API-37 |
| progress_reports | Báo cáo tiến độ và các lần nộp | API-07, API-34, API-35, API-36, API-37, API-48 |
| publications | Bài báo/minh chứng cần thẩm định | API-20, API-40, API-41, API-42, API-48, API-60 |
| publication_authors | Liên kết bài báo–NCS và vai trò đóng góp | API-41, API-60 |
| publication_reviews | Thẩm định và nguồn chứng cứ | API-40, API-42, API-60 |
| research_projects | Đề tài song ngữ và quyết định hiệu lực | API-14, API-43, API-58 |
| theses | Luận án và bản hiện hành | API-43 |
| thesis_versions | Bản luận án không ghi đè | API-43, API-44 |
| similarity_checks | Job tương đồng gắn file hash | API-43, API-45, API-46 |
| defense_approvals | NHD đồng ý bản cụ thể | API-43, API-47 |
| defenses | Hồ sơ/phiên bảo vệ | API-49, API-50, API-52, API-53 |
| seminars | Sinh hoạt chuyên môn có biên bản (đề xuất thiếu UI) | API-49 |
| independent_reviews | Phản biện kín theo hồ sơ | API-49 |
| councils | Hội đồng và quyết định | API-49 |
| council_members | Thành viên/ủy nhiệm đánh giá | API-49 |
| council_votes | Phiếu riêng hoặc bằng chứng tổng theo mô hình chốt | API-49, API-50, API-51 |
| public_notices | Luận án đã duyệt công khai | API-49, API-52, API-58, API-67 |
| post_defense_submissions | Bản cuối/giải trình sau bảo vệ | API-53, API-54, API-55 |
| deposits | Biên nhận lưu chiểu theo nơi | API-53, API-54, API-55 |
| degree_records | Sổ gốc văn bằng | API-53, API-56, API-57 |
| academic_change_requests | Một nguồn cho m01/m03/m09/m12 | API-07, API-12, API-13, API-14, API-59 |
| files | Metadata và object storage | API-12, API-13, API-27, API-28, API-29, API-30, API-32, API-33, API-35, API-41, API-42, API-44, API-46, API-47, API-50, API-51, API-52, API-54, API-58, API-61, API-62, API-64, API-65, API-66, API-67 |
| file_links | Liên kết tệp–hồ sơ/loại chứng cứ | API-64, API-65, API-66 |
| academic_rules | Quy tắc học thuật có phiên bản/căn cứ | API-19, API-40, API-48, API-53, API-68 |
| integration_jobs | Đồng bộ điểm/dịch vụ ngoài | API-25, API-26, API-45 |
| export_jobs | Xuất file theo scope/filter/snapshot | API-61, API-62 |
| notification_outbox | Ý định gửi sau commit | API-05, API-13, API-18, API-21, API-28, API-35, API-36, API-38, API-39, API-41, API-42, API-47, API-54, API-56 |
| notification_deliveries | Kết quả gửi/cooldown | API-37, API-38, API-39 |
| audit_events | Nhật ký máy chủ bất biến | API-10, API-13, API-14, API-17, API-18, API-21, API-23, API-24, API-25, API-28, API-29, API-30, API-32, API-33, API-35, API-36, API-38, API-41, API-42, API-44, API-45, API-47, API-50, API-51, API-52, API-54, API-55, API-56, API-61, API-63, API-64, API-66 |

### units

Mục đích: Cây đơn vị trường/khoa/bộ môn. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| code | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| unit_type | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| parent_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: parent_id → units.id.

Ràng buộc: unique(code), không chu trình cây; unit_type university/faculty/department.

Trạng thái: Không có lifecycle riêng.

### users

Mục đích: Tài khoản thật. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| email | varchar(254) | Không | PK/FK/constraint mô tả dưới |
| password_hash | text | Không | PK/FK/constraint mô tả dưới |
| full_name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| unit_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: unit_id → units.id.

Ràng buộc: unique(lower(email)); không lưu mật khẩu plaintext.

Trạng thái: active, disabled, locked.

### user_roles

Mục đích: Vai trò và phạm vi của tài khoản. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| role_code | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| scope_unit_id | uuid | Có | PK/FK/constraint mô tả dưới |
| valid_from | timestamptz | Không | PK/FK/constraint mô tả dưới |
| valid_to | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: user_id → users.id; scope_unit_id → units.id.

Ràng buộc: unique(user, role, scope, cửa sổ hiệu lực); 7 enum chuẩn; không role do client tự cấp.

Trạng thái: Không có lifecycle riêng.

### role_permissions

Mục đích: Quyền tác vụ/loại scope. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| role_code | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| permission_key | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| scope_type | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: role_code liên kết rolecode chuẩn.

Ràng buộc: unique(role_code, permission_key, scope_type); không suy từ label ma trận HTML.

Trạng thái: Không có lifecycle riêng.

### sessions

Mục đích: Phiên và role đang hoạt động. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| token_hash | text | Không | PK/FK/constraint mô tả dưới |
| active_role | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| expires_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| revoked_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: user_id → users.id.

Ràng buộc: unique(token_hash), role thuộc user_roles hiệu lực; không plaintext token.

Trạng thái: active, expired, revoked (từ timestamp).

### password_reset_tokens

Mục đích: Token quên mật khẩu. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| token_hash | text | Không | PK/FK/constraint mô tả dưới |
| expires_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| used_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: user_id → users.id.

Ràng buộc: unique(token_hash); dùng một lần; không lộ tài khoản qua response.

Trạng thái: Không có lifecycle riêng.

### majors

Mục đích: Danh mục ngành. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| code | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| name_vi | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| name_en | varchar(255) | Có | PK/FK/constraint mô tả dưới |
| unit_id | uuid | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: unit_id → units.id.

Ràng buộc: unique(code); tên song ngữ nếu có.

Trạng thái: Không có lifecycle riêng.

### cohorts

Mục đích: Khóa/đợt tuyển sinh. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| year | smallint | Không | PK/FK/constraint mô tả dưới |
| intake | smallint | Không | PK/FK/constraint mô tả dưới |
| label | varchar(60) | Không | PK/FK/constraint mô tả dưới |
| start_date | date | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: Không FK ngoài unit nếu nhóm chốt.

Ràng buộc: unique(year, intake); intake>0.

Trạng thái: Không có lifecycle riêng.

### semesters

Mục đích: Học kỳ có lịch thật. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| cohort_id | uuid | Không | PK/FK/constraint mô tả dưới |
| ordinal | smallint | Không | PK/FK/constraint mô tả dưới |
| start_date | date | Không | PK/FK/constraint mô tả dưới |
| end_date | date | Không | PK/FK/constraint mô tả dưới |
| label | varchar(80) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: cohort_id → cohorts.id.

Ràng buộc: unique(cohort_id, ordinal), start<=end.

Trạng thái: Không có lifecycle riêng.

### decisions

Mục đích: Quyết định/văn bản có chứng cứ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| number | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| decision_type | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| issued_at | date | Không | PK/FK/constraint mô tả dưới |
| signed_by_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| signature_status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| effective_at | date | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: signed_by_user_id → users.id; file_id → files.id.

Ràng buộc: Unique(number, issued_at, issuer)theo quy tắc chốt; file clean; timestamp không chữ ký.

Trạng thái: draft, issued, revoked; signature unsigned/verified/failed.

### candidates

Mục đích: Hồ sơ NCS. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| code | varchar(60) | Không | PK/FK/constraint mô tả dưới |
| full_name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| birth_date | date | Có | PK/FK/constraint mô tả dưới |
| gender | varchar(20) | Có | PK/FK/constraint mô tả dưới |
| identity_number_encrypted | text | Có | PK/FK/constraint mô tả dưới |
| identity_issued_at | date | Có | PK/FK/constraint mô tả dưới |
| phone | varchar(30) | Có | PK/FK/constraint mô tả dưới |
| academic_email | varchar(254) | Có | PK/FK/constraint mô tả dưới |
| workplace | text | Có | PK/FK/constraint mô tả dưới |
| contact_address | text | Có | PK/FK/constraint mô tả dưới |
| major_id | uuid | Không | PK/FK/constraint mô tả dưới |
| cohort_id | uuid | Không | PK/FK/constraint mô tả dưới |
| unit_id | uuid | Không | PK/FK/constraint mô tả dưới |
| entry_qualification | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| study_mode | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| admission_decision_id | uuid | Không | PK/FK/constraint mô tả dưới |
| training_start_date | date | Không | PK/FK/constraint mô tả dưới |
| standard_end_date | date | Không | PK/FK/constraint mô tả dưới |
| maximum_end_date | date | Có | PK/FK/constraint mô tả dưới |
| academic_status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| verified_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: user_id → users.id; major_id → majors.id; cohort_id → cohorts.id; unit_id → units.id; admission_decision_id → decisions.id.

Ràng buộc: unique(code), unique(user_id)cho 1 hồ sơ nếu nhóm chốt; ngày hợp lệ; CCCD mã hóa/ẩnquyền; không lưu percent tổng.

Trạng thái: studying, extended, paused, defended, graduated, withdrawn, transferred; enum cần chốt.

### program_versions

Mục đích: CTĐT theo ngành/khóa/đầu vào. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| major_id | uuid | Không | PK/FK/constraint mô tả dưới |
| cohort_id | uuid | Có | PK/FK/constraint mô tả dưới |
| entry_qualification | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| total_credits | numeric(6, 2) | Không | PK/FK/constraint mô tả dưới |
| effective_from | date | Không | PK/FK/constraint mô tả dưới |
| effective_to | date | Có | PK/FK/constraint mô tả dưới |
| document_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: major_id → majors.id; cohort_id → cohorts.id; document_file_id → files.id.

Ràng buộc: Không sửa phiên bản đã dùng; không default 90 TC mọingành.

Trạng thái: draft, active, retired.

### program_requirements

Mục đích: Khối tín chỉ và điều kiện đầu ra. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| program_version_id | uuid | Không | PK/FK/constraint mô tả dưới |
| key | varchar(80) | Không | PK/FK/constraint mô tả dưới |
| required_credits | numeric(6, 2) | Có | PK/FK/constraint mô tả dưới |
| required_count | smallint | Có | PK/FK/constraint mô tả dưới |
| pass_threshold | numeric(5, 2) | Có | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: program_version_id → program_versions.id; rule_id → academic_rules.id.

Ràng buộc: unique(program, key); không đồng nhất requiredCredits/course 12 với 24 UI.

Trạng thái: Không có lifecycle riêng.

### candidate_programs

Mục đích: Gán lộ trình/miễn bổ sung. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| program_version_id | uuid | Không | PK/FK/constraint mô tả dưới |
| assigned_at | date | Không | PK/FK/constraint mô tả dưới |
| exemption_decision_id | uuid | Có | PK/FK/constraint mô tả dưới |
| exemption_reason | text | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; program_version_id → program_versions.id; exemption_decision_id → decisions.id.

Ràng buộc: Một chương trình hiệu lực/hồ sơ; giữ lịch sử chuyển; exemption có chứng cứ.

Trạng thái: Không có lifecycle riêng.

### supervisors

Mục đích: Nhà khoa học có thể ngoài trường. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| full_name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| academic_title | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| degree | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| institution | text | Không | PK/FK/constraint mô tả dưới |
| unit_id | uuid | Có | PK/FK/constraint mô tả dưới |
| research_areas | jsonb | Không | PK/FK/constraint mô tả dưới |
| email | varchar(254) | Có | PK/FK/constraint mô tả dưới |
| phone | varchar(30) | Có | PK/FK/constraint mô tả dưới |
| profile_file_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: user_id → users.id; unit_id → units.id; profile_file_id → files.id.

Ràng buộc: Không dùng tên làm PK; quota theo academic_rules, active Count tính từ assignment.

Trạng thái: Không có lifecycle riêng.

### supervisor_assignments

Mục đích: Quan hệ NCS–NHD và lịch sử. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| supervisor_id | uuid | Không | PK/FK/constraint mô tả dưới |
| assignment_role | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Không | PK/FK/constraint mô tả dưới |
| effective_from | date | Không | PK/FK/constraint mô tả dưới |
| effective_to | date | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; supervisor_id → supervisors.id; decision_id → decisions.id.

Ràng buộc: Không trùng main/co; uniqueactivecandidate/main; quota transaction; hết hiệu lực không xóa.

Trạng thái: proposed, active, ended.

### training_plans

Mục đích: Phiên bản kế hoạch có duyệt. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| baseline_revision | integer | Có | PK/FK/constraint mô tả dưới |
| status | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| change_reason | text | Có | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; baseline_revision tham chiếu revision cùng candidate.

Ràng buộc: unique(candidate_id, revision); bản duyệt bất biến; status không planStage số client.

Trạng thái: draft, awaiting_supervisor, awaiting_department, awaiting_academic_affairs, approved, returned, rejected; 2 status cuối cần chốt.

### plan_milestones

Mục đích: Mốc từng học kỳ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| training_plan_id | uuid | Không | PK/FK/constraint mô tả dưới |
| semester_id | uuid | Không | PK/FK/constraint mô tả dưới |
| content | text | Không | PK/FK/constraint mô tả dưới |
| due_date | date | Không | PK/FK/constraint mô tả dưới |
| expected_output | text | Không | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| evidence_ids | jsonb | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: training_plan_id → training_plans.id; semester_id → semesters.id.

Ràng buộc: Due thuộc lịch đã chốt; completionPercent tính theo evidence/rule không nhập tùyý.

Trạng thái: planned, in_progress, completed, overdue; overdue có thể tính.

### workflow_reviews

Mục đích: Lịch sử ý kiến/chuyển bước chung. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| resource_type | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| resource_id | uuid | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| stage_key | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| actor_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| actor_role | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| action | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| comment | text | Có | PK/FK/constraint mô tả dưới |
| reviewed_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: actor_user_id → users.id; decision_id → decisions.id; resource_id tùy type.

Ràng buộc: PolymorphicFK không được DB tự bảo đảm; triển khai typedlink hoặcconstraint/triggers; uniquecompletedstage/revision; append-only.

Trạng thái: approve, reject, return, confirm; không status toàn hồ sơ.

### courses

Mục đích: Danh mục học phần. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| code | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| credits | numeric(6, 2) | Không | PK/FK/constraint mô tả dưới |
| process_weight | numeric(5, 4) | Không | PK/FK/constraint mô tả dưới |
| exam_weight | numeric(5, 4) | Không | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: rule_id → academic_rules.id.

Ràng buộc: unique(code, revision nếu cần); credits>0; weightssum 1; 30/70 làví dụ.

Trạng thái: Không có lifecycle riêng.

### course_offerings

Mục đích: Mở học phần theo kỳ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| course_id | uuid | Không | PK/FK/constraint mô tả dưới |
| semester_id | uuid | Không | PK/FK/constraint mô tả dưới |
| lecturer_id | uuid | Có | PK/FK/constraint mô tả dưới |
| registration_open_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| registration_close_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| capacity | integer | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: course_id → courses.id; semester_id → semesters.id; lecturer_id → supervisors.id.

Ràng buộc: unique(course, semester, class group nếu có); capacity>=0; ngày hợp lệ.

Trạng thái: planned, open, closed, completed, cancelled.

### course_registrations

Mục đích: Đăng ký/hủy/lần học. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| offering_id | uuid | Không | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| registered_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| cancelled_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| attempt_no | smallint | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; offering_id → course_offerings.id.

Ràng buộc: unique(candidate, offering, attempt); không hủy đã chốtđiểm.

Trạng thái: registered, cancelled, completed.

### course_results

Mục đích: Điểm theo lần học/nguồn đồng bộ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| registration_id | uuid | Không | PK/FK/constraint mô tả dưới |
| process_score | numeric(4, 2) | Có | PK/FK/constraint mô tả dưới |
| exam_score | numeric(4, 2) | Có | PK/FK/constraint mô tả dưới |
| final_score | numeric(4, 2) | Có | PK/FK/constraint mô tả dưới |
| letter_grade | varchar(5) | Có | PK/FK/constraint mô tả dưới |
| gpa 4 | numeric(3, 2) | Có | PK/FK/constraint mô tả dưới |
| passed | boolean | Có | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Không | PK/FK/constraint mô tả dưới |
| source_job_id | uuid | Có | PK/FK/constraint mô tả dưới |
| finalized_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: registration_id → course_registrations.id; rule_id → academic_rules.id; source_job_id → integration_jobs.id.

Ràng buộc: unique(registration); scores 0–10, missing null; final/letter/GPA theo quy tắc.

Trạng thái: draft, finalized (từfinalized_at).

### research_submissions

Mục đích: Tiểu luận/đề cương có phiên bản. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| type | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| title | text | Không | PK/FK/constraint mô tả dưới |
| summary | text | Có | PK/FK/constraint mô tả dưới |
| research_object | text | Có | PK/FK/constraint mô tả dưới |
| methodology | text | Có | PK/FK/constraint mô tả dưới |
| file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| explanation_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| defense_date | date | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; file_id/explanation_file_id → files.id; decision_id → decisions.id.

Ràng buộc: unique(candidate, type, revision); conditionalrequiredtheotype; file clean.

Trạng thái: submitted, reviewing, revision_required, approved, passed, failed; type essay/outline.

### submission_evaluations

Mục đích: Điểm/chứng cứ đánh giá tiểu luận. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| submission_id | uuid | Không | PK/FK/constraint mô tả dưới |
| evaluator_id | uuid | Không | PK/FK/constraint mô tả dưới |
| score | numeric(4, 2) | Không | PK/FK/constraint mô tả dưới |
| comment | text | Có | PK/FK/constraint mô tả dưới |
| minutes_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: submission_id → research_submissions.id; evaluator_id → supervisors.id; minutes_file_id → files.id; rule_id → academic_rules.id.

Ràng buộc: unique(submission, evaluator); score 0–10; TB computed/cache có rule; không nhầmactor nhập với người chấm.

Trạng thái: Không có lifecycle riêng.

### doctoral_topics

Mục đích: Chuyên đề có revision. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| ordinal | smallint | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| title | text | Không | PK/FK/constraint mô tả dưới |
| credits | numeric(6, 2) | Không | PK/FK/constraint mô tả dưới |
| supervisor_id | uuid | Không | PK/FK/constraint mô tả dưới |
| expected_report_month | date | Có | PK/FK/constraint mô tả dưới |
| report_date | date | Có | PK/FK/constraint mô tả dưới |
| file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; supervisor_id → supervisors.id; file_id → files.id.

Ràng buộc: unique(candidate, ordinal, revision); ordinal trong program; tháng lưu ngày đầu/tháng hoặc YYYY-MM thống nhất.

Trạng thái: submitted, reviewing, passed, failed, revision_required.

### topic_evaluations

Mục đích: Điểm chuyên đề/biên bản. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| topic_id | uuid | Không | PK/FK/constraint mô tả dưới |
| score | numeric(4, 2) | Không | PK/FK/constraint mô tả dưới |
| comment | text | Có | PK/FK/constraint mô tả dưới |
| evaluator_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| minutes_file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Không | PK/FK/constraint mô tả dưới |
| evaluated_at | timestamptz | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: topic_id → doctoral_topics.id; evaluator_user_id → users.id; minutes_file_id → files.id; rule_id → academic_rules.id.

Ràng buộc: score 0–10; roster chi tiết có thể bổ sung sau chốt; passed server chỉ rule.

Trạng thái: Không có lifecycle riêng.

### report_periods

Mục đích: Kỳ báo cáo và deadline riêng. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| number | smallint | Không | PK/FK/constraint mô tả dưới |
| start_date | date | Không | PK/FK/constraint mô tả dưới |
| end_date | date | Không | PK/FK/constraint mô tả dưới |
| due_at | timestamptz | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id.

Ràng buộc: unique(candidate, number); lịch 6 tháng theo rule, không mặc định 6 kỳ cho mọihồ sơ.

Trạng thái: Không có lifecycle riêng.

### progress_reports

Mục đích: Báo cáo tiến độ và các lần nộp. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| period_id | uuid | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| summary | text | Không | PK/FK/constraint mô tả dưới |
| difficulties | text | Có | PK/FK/constraint mô tả dưới |
| next_plan | text | Không | PK/FK/constraint mô tả dưới |
| file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: period_id → report_periods.id; file_id → files.id.

Ràng buộc: unique(period, revision); latest theo time/revision, không index mảng; reviewởworkflow_reviews.

Trạng thái: submitted, reviewing, passed, revision_required, failed.

### publications

Mục đích: Bài báo/minh chứng cần thẩm định. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| title | text | Không | PK/FK/constraint mô tả dưới |
| journal | text | Không | PK/FK/constraint mô tả dưới |
| issn | varchar(20) | Có | PK/FK/constraint mô tả dưới |
| category | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| doi_normalized | varchar(255) | Có | PK/FK/constraint mô tả dưới |
| submitted_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| approved_score | numeric(6, 3) | Có | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: submitted_by_user_id → users.id; file qua file_links; candidate qua publication_authors.

Ràng buộc: DOI unique toàn hệ thống hay mỗi NCS cần chốt; score chỉ server duyệt; category theo enum.

Trạng thái: submitted, supervisor_confirmed, verified, rejected, revision_required; hai cấp cần chốt.

### publication_authors

Mục đích: Liên kết bài báo–NCS và vai trò đóng góp. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| publication_id | uuid | Không | PK/FK/constraint mô tả dưới |
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| author_role | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| affiliation | text | Có | PK/FK/constraint mô tả dưới |
| contribution_percent | numeric(5, 2) | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: publication_id → publications.id; candidate_id → candidates.id.

Ràng buộc: unique(publication, candidate); percent 0–100 nếu dùng; first/corresponding/co author; không firsthardcode.

Trạng thái: Không có lifecycle riêng.

### publication_reviews

Mục đích: Thẩm định và nguồn chứng cứ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| publication_id | uuid | Không | PK/FK/constraint mô tả dưới |
| reviewer_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| stage_key | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| action | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| approved_score | numeric(6, 3) | Có | PK/FK/constraint mô tả dưới |
| comment | text | Không | PK/FK/constraint mô tả dưới |
| source | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| evidence_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| reviewed_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: publication_id → publications.id; reviewer_user_id → users.id; evidence_file_id → files.id; rule_id → academic_rules.id.

Ràng buộc: Không selfreview; score theo rule; uniquecompletedstage/revisiontheochốt.

Trạng thái: confirm, verify, reject, return.

### research_projects

Mục đích: Đề tài song ngữ và quyết định hiệu lực. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| title_vi | text | Không | PK/FK/constraint mô tả dưới |
| title_en | text | Có | PK/FK/constraint mô tả dưới |
| field | text | Có | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Không | PK/FK/constraint mô tả dưới |
| effective_from | date | Không | PK/FK/constraint mô tả dưới |
| effective_to | date | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; decision_id → decisions.id.

Ràng buộc: Một đề tài hiệu lực/candidate; đổi tên qua change giữ lịch sử.

Trạng thái: Không có lifecycle riêng.

### theses

Mục đích: Luận án và bản hiện hành. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| project_id | uuid | Không | PK/FK/constraint mô tả dưới |
| current_version_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; project_id → research_projects.id; current_version_id → thesis_versions.id.

Ràng buộc: unique(candidate); current version thuộc chính thesis; FK vòng cần insert 2 bước.

Trạng thái: draft, submitted, under_review, defense_ready, defended, finalized.

### thesis_versions

Mục đích: Bản luận án không ghi đè. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| thesis_id | uuid | Không | PK/FK/constraint mô tả dưới |
| ordinal | integer | Không | PK/FK/constraint mô tả dưới |
| label | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| stage | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| change_note | text | Không | PK/FK/constraint mô tả dưới |
| uploaded_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| uploaded_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| locked_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| locked_by_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| lock_reason | text | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: thesis_id → theses.id; file_id → files.id; uploaded_by/locked_by → users.id.

Ràng buộc: unique(thesis, ordinal); fileimmutablekhi lock; label server sinh.

Trạng thái: draft/department/independent_review/school_defense/post_defense (stage); locked timestamp.

### similarity_checks

Mục đích: Job tương đồng gắn file hash. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| thesis_version_id | uuid | Không | PK/FK/constraint mô tả dưới |
| file_sha256 | varchar(64) | Không | PK/FK/constraint mô tả dưới |
| provider | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| external_job_id | text | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| percentage | numeric(5, 2) | Có | PK/FK/constraint mô tả dưới |
| report_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| checked_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| error_code | varchar(60) | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: thesis_version_id → thesis_versions.id; report_file_id → files.id.

Ràng buộc: percentage 0–100 chỉ completed; hash đúng version; không fake 14.

Trạng thái: not_configured, queued, running, completed, failed.

### defense_approvals

Mục đích: NHD đồng ý bản cụ thể. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| version_id | uuid | Không | PK/FK/constraint mô tả dưới |
| supervisor_id | uuid | Không | PK/FK/constraint mô tả dưới |
| actor_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| approved_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| comment | text | Không | PK/FK/constraint mô tả dưới |
| review_file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| signature_evidence_id | uuid | Có | PK/FK/constraint mô tả dưới |
| signature_status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| revoked_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: version_id → thesis_versions.id; supervisor_id → supervisors.id; actor_user_id → users.id; review_file_id → files.id.

Ràng buộc: Assignment đúng ngày; approvalgắnversionkhôngcảcandidate; signature chứng cứ thật.

Trạng thái: approved, revoked; signature not_signed_digitally/verified/failed.

### defenses

Mục đích: Hồ sơ/phiên bảo vệ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| version_id | uuid | Không | PK/FK/constraint mô tả dưới |
| council_id | uuid | Có | PK/FK/constraint mô tả dưới |
| scheduled_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| held_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| venue | text | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| yes_votes | smallint | Có | PK/FK/constraint mô tả dưới |
| total_votes | smallint | Có | PK/FK/constraint mô tả dưới |
| result | varchar(20) | Có | PK/FK/constraint mô tả dưới |
| average_score | numeric(4, 2) | Có | PK/FK/constraint mô tả dưới |
| minutes_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| resolution_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| rule_id | uuid | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; version_id → thesis_versions.id; council_id → councils.id; minutes/resolution → files.id; rule_id → academic_rules.id.

Ràng buộc: yes<=total<=attendance, không total 7 mặcđịnh; result theo rule.

Trạng thái: preparing, under_review, scheduled, held, passed, failed, completed.

### seminars

Mục đích: Sinh hoạt chuyên môn có biên bản (đề xuất thiếu UI). **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| defense_id | uuid | Không | PK/FK/constraint mô tả dưới |
| held_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| participant_roster | jsonb | Không | PK/FK/constraint mô tả dưới |
| conclusion | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| minutes_file_id | uuid | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: defense_id → defenses.id; minutes_file_id → files.id.

Ràng buộc: Cơ cấu/ngưỡng quyền chưa được văn bản gốc xác nhận; chốttrướcghi nhận.

Trạng thái: Không có lifecycle riêng.

### independent_reviews

Mục đích: Phản biện kín theo hồ sơ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| defense_id | uuid | Không | PK/FK/constraint mô tả dưới |
| code | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| reviewer_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| reviewer_identity_encrypted | text | Có | PK/FK/constraint mô tả dưới |
| sent_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| due_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| received_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| conclusion | varchar(30) | Có | PK/FK/constraint mô tả dưới |
| review_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: defense_id → defenses.id; reviewer_user_id → users.id; review_file_id → files.id.

Ràng buộc: ACLriêngkhôngNCSidentity/phiếu; 2 PB/30 ngày làm việc cần chốt.

Trạng thái: assigned, sent, received, revision_required, completed.

### councils

Mục đích: Hội đồng và quyết định. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| decision_id | uuid | Không | PK/FK/constraint mô tả dưới |
| council_type | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: decision_id → decisions.id.

Ràng buộc: Cơ cấu 5/7, 2/3 PB cần chốt; không tạo chỉ từ row HTML.

Trạng thái: proposed, appointed, closed.

### council_members

Mục đích: Thành viên/ủy nhiệm đánh giá. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| council_id | uuid | Không | PK/FK/constraint mô tả dưới |
| user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| supervisor_id | uuid | Có | PK/FK/constraint mô tả dưới |
| full_name | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| position | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| institution | text | Không | PK/FK/constraint mô tả dưới |
| academic_title | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| degree | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| present | boolean | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: council_id → councils.id; user_id → users.id; supervisor_id → supervisors.id.

Ràng buộc: unique(council, personidentity); quyền ghi tổng role bổ sung; tênsnapshotcho QĐ.

Trạng thái: Không có lifecycle riêng.

### council_votes

Mục đích: Phiếu riêng hoặc bằng chứng tổng theo mô hình chốt. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| defense_id | uuid | Không | PK/FK/constraint mô tả dưới |
| member_id | uuid | Có | PK/FK/constraint mô tả dưới |
| vote | varchar(20) | Có | PK/FK/constraint mô tả dưới |
| score | numeric(4, 2) | Có | PK/FK/constraint mô tả dưới |
| comment | text | Có | PK/FK/constraint mô tả dưới |
| file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| recorded_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| recorded_at | timestamptz | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: defense_id → defenses.id; member_id → council_members.id; file_id → files.id; recorded_by → users.id.

Ràng buộc: unique(defense, member)cho mô hình cá nhân; không cộng phiếu riêng+tổng; phiếu kín ACL.

Trạng thái: Không có lifecycle riêng.

### public_notices

Mục đích: Luận án đã duyệt công khai. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| defense_id | uuid | Không | PK/FK/constraint mô tả dưới |
| summary_file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| full_text_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| new_contributions_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| published_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| withdrawn_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| published_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: defense_id → defenses.id; files → files.id; published_by → users.id.

Ràng buộc: Chỉ file public được duyệt; thay files/hạn công khai cần chốt; timestamp server.

Trạng thái: draft, published, withdrawn.

### post_defense_submissions

Mục đích: Bản cuối/giải trình sau bảo vệ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| defense_id | uuid | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| thesis_file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| explanation_file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| status | varchar(30) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; defense_id → defenses.id; thesis/explanation → files.id.

Ràng buộc: unique(defense, revision); bảo vệ đạt trước nộp; review/quyền chốt.

Trạng thái: submitted, revision_required, approved, rejected.

### deposits

Mục đích: Biên nhận lưu chiểu theo nơi. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| post_defense_submission_id | uuid | Không | PK/FK/constraint mô tả dưới |
| institution | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| receipt_number | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| received_at | date | Không | PK/FK/constraint mô tả dưới |
| receipt_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| verified_by_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| verified_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: post_defense_submission_id → post_defense_submissions.id; receipt_file_id → files.id; verified_by → users.id.

Ràng buộc: unique(submission, institution); text tự khai không verified; 3 nơi cần chốt.

Trạng thái: declared, verified, rejected (từ review).

### degree_records

Mục đích: Sổ gốc văn bằng. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Không | PK/FK/constraint mô tả dưới |
| code | varchar(60) | Không | PK/FK/constraint mô tả dưới |
| register_number | varchar(60) | Không | PK/FK/constraint mô tả dưới |
| issued_at | date | Không | PK/FK/constraint mô tả dưới |
| name_vi_snapshot | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| name_en_snapshot | varchar(255) | Có | PK/FK/constraint mô tả dưới |
| major_vi_snapshot | varchar(255) | Không | PK/FK/constraint mô tả dưới |
| major_en_snapshot | varchar(255) | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| revoked_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; decision_id → decisions.id.

Ràng buộc: unique(code), unique(register_number), 1 degree issued/candidate theo quy định; sinhsốatomic; snapshotđểlýlịchđổi không đổi bằng.

Trạng thái: issued, revoked; replacement cần chốt.

### academic_change_requests

Mục đích: Một nguồn cho m01/m03/m09/m12. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| candidate_id | uuid | Không | PK/FK/constraint mô tả dưới |
| request_code | varchar(60) | Không | PK/FK/constraint mô tả dưới |
| type | varchar(30) | Không | PK/FK/constraint mô tả dưới |
| payload | jsonb | Không | PK/FK/constraint mô tả dưới |
| reason | text | Không | PK/FK/constraint mô tả dưới |
| submitted_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| submitted_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| status | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| decision_id | uuid | Có | PK/FK/constraint mô tả dưới |
| effective_at | date | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: candidate_id → candidates.id; submitted_by → users.id; decision_id → decisions.id; proposedSupervisorId trong payload → supervisors.id.

Ràng buộc: unique(code); typepayloadvalidatedFK bằng server/typedtables; không update hồ sơuntildecision.

Trạng thái: submitted, faculty_review, academic_affairs_review, awaiting_decision, approved, rejected, returned; transitioncần chốt.

### files

Mục đích: Metadata và object storage. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| owner_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| candidate_id | uuid | Có | PK/FK/constraint mô tả dưới |
| original_name | text | Không | PK/FK/constraint mô tả dưới |
| object_key | text | Không | PK/FK/constraint mô tả dưới |
| mime_type | varchar(150) | Không | PK/FK/constraint mô tả dưới |
| size_bytes | bigint | Không | PK/FK/constraint mô tả dưới |
| sha 256 | varchar(64) | Không | PK/FK/constraint mô tả dưới |
| purpose | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| visibility | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| scan_status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| retention_until | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: owner_user_id → users.id; candidate_id → candidates.id.

Ràng buộc: size>0; objectkeyprivateunique; filename không path; filelockedimmutable; noharddeletechứng cứ.

Trạng thái: pending, clean, quarantined, failed; visibility private/public.

### file_links

Mục đích: Liên kết tệp–hồ sơ/loại chứng cứ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| file_id | uuid | Không | PK/FK/constraint mô tả dưới |
| resource_type | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| resource_id | uuid | Không | PK/FK/constraint mô tả dưới |
| relation_key | varchar(50) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: file_id → files.id; resource_idtypedlinktheothựcthể.

Ràng buộc: Unique(file, resource, relation); polymorphicFKcầntypedtable/trigger; ACLsuýtừresource.

Trạng thái: Không có lifecycle riêng.

### academic_rules

Mục đích: Quy tắc học thuật có phiên bản/căn cứ. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| key | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| revision | integer | Không | PK/FK/constraint mô tả dưới |
| scope | jsonb | Không | PK/FK/constraint mô tả dưới |
| parameters | jsonb | Không | PK/FK/constraint mô tả dưới |
| source_document_file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| approved_by_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| approved_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| effective_from | date | Không | PK/FK/constraint mô tả dưới |
| effective_to | date | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: source_document_file_id → files.id; approved_by → users.id.

Ràng buộc: unique(key, revision, scope); draft không cho eligibility pass; JSONvalidatedschema.

Trạng thái: draft, approved, retired.

### integration_jobs

Mục đích: Đồng bộ điểm/dịch vụ ngoài. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| type | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| requested_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| candidate_id | uuid | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| input | jsonb | Không | PK/FK/constraint mô tả dưới |
| result | jsonb | Có | PK/FK/constraint mô tả dưới |
| error_code | varchar(60) | Có | PK/FK/constraint mô tả dưới |
| started_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| completed_at | timestamptz | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: requested_by → users.id; candidate_id → candidates.id.

Ràng buộc: Không secrets trong input/result; idemkeyunique; chỉreportcommittedrows.

Trạng thái: queued, running, completed, failed.

### export_jobs

Mục đích: Xuất file theo scope/filter/snapshot. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| requested_by_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| report_type | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| format | varchar(10) | Không | PK/FK/constraint mô tả dưới |
| filters | jsonb | Không | PK/FK/constraint mô tả dưới |
| as_of | timestamptz | Không | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| file_id | uuid | Có | PK/FK/constraint mô tả dưới |
| expires_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| errors | jsonb | Có | PK/FK/constraint mô tả dưới |

FK/quan hệ: requested_by → users.id; file_id → files.id.

Ràng buộc: Filter đúng scope; MIME đúng format; idempotency/chốngCSVformula.

Trạng thái: queued, running, completed, failed, expired.

### notification_outbox

Mục đích: Ý định gửi sau commit. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| event_key | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| resource_type | varchar(40) | Không | PK/FK/constraint mô tả dưới |
| resource_id | uuid | Không | PK/FK/constraint mô tả dưới |
| recipient_user_id | uuid | Không | PK/FK/constraint mô tả dưới |
| channel | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| payload | jsonb | Không | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |
| available_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| attempt_count | integer | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: recipient_user_id → users.id; resource_idtypedreference.

Ràng buộc: Uniqueevent/recipient/channel/chukỳđểchốnggửilặp; không email client.

Trạng thái: queued, processing, sent, failed.

### notification_deliveries

Mục đích: Kết quả gửi/cooldown. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| outbox_id | uuid | Không | PK/FK/constraint mô tả dưới |
| provider_message_id | text | Có | PK/FK/constraint mô tả dưới |
| sent_at | timestamptz | Có | PK/FK/constraint mô tả dưới |
| failure_code | varchar(60) | Có | PK/FK/constraint mô tả dưới |
| status | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: outbox_id → notification_outbox.id.

Ràng buộc: Logattemptkhông giả đã gửi; chốtTTL/cooldown.

Trạng thái: sent, failed, retrying.

### audit_events

Mục đích: Nhật ký máy chủ bất biến. **Đề xuất mới**, không schema hiện có.

PK: id uuid. Cột chungcreated_at; updated_at/version cho bảngmutable, theo quy ước trên.

| Cột | Kiểu đề xuất | Nullable | Ghi chú |
|---|---|---|---|
| actor_user_id | uuid | Có | PK/FK/constraint mô tả dưới |
| active_role | varchar(20) | Có | PK/FK/constraint mô tả dưới |
| action | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| entity_type | varchar(50) | Không | PK/FK/constraint mô tả dưới |
| entity_id | uuid | Có | PK/FK/constraint mô tả dưới |
| occurred_at | timestamptz | Không | PK/FK/constraint mô tả dưới |
| source_ip | inet | Có | PK/FK/constraint mô tả dưới |
| request_id | varchar(100) | Không | PK/FK/constraint mô tả dưới |
| before | jsonb | Có | PK/FK/constraint mô tả dưới |
| after | jsonb | Có | PK/FK/constraint mô tả dưới |
| result | varchar(20) | Không | PK/FK/constraint mô tả dưới |

FK/quan hệ: actor_user_id → users.id; entity_idtypedref nếu có.

Ràng buộc: Append-only role DB; không UPDATE/DELETE API; IPtrustedproxy; redactPII/secrets; chínhsáchretention được chốt.

Trạng thái: Không có lifecycle riêng.

## Nguồn dữ liệu trả UI

Hồ sơ API-09 dùng candidates+major/cohort/decision/program; plan API 16 cần milestones/reviews theo revision; NHD API 19 count assignment active và rule quota; courses API 22 lấy registration/results/rule program; essay/outline API 27 lấy submission latest+evaluation/files; topics API 31/periodsAPI 34 trả row và summary đồng nguồn; pub API 40 lấy author/review/evidence; thesis API 43 gắnversion/approval/check; defense API 49 dùng council/review/publicnotice/vote ACL; graduation API 53 cần post/deposits/degree; reports API 59/60 DISTINCTtheoscope; public API 57/58 chỉ bằng issued/notice published.

Index đề xuất: candidate(code, status, major/cohort/unit), assignment(supervisor, effective dates/status), plan(candidate, revision), result(registration), period(candidate, due_at), report(period, revision), publication(doi_normalized, status), degree(code/register/name snapshot), notice(status, published_at), audit(occurred_at, actor, entity), file link(resource). Query tìm kiếm/đếm cần kiểm cùng scope vàkhôngfullscanPIImột cách vô quyền.

Mọi external Id/jobID từ dịch vụ giữmapping, không dùng làm ID hồ sơ. Seed/demo không migrate thành dữ liệu thật tự động. Dữ liệu nhạy cảm/phiếu kín/CCCD được ACL và mã hóa phù hợp, keys không ở source frontend.
