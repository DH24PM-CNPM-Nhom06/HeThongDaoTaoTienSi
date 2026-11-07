# Danh sách và hợp đồng API

## Quy ước chung áp dụng cho từng API

Toàn bộ endpoint dưới đây là **đề xuất**, chưa có server trong checkout. API-58 giữ /api/public/theses có trong config; mã client chưa được nạp. Không coi tên endpoint là bằng chứng triển khai.

Cookie phiên HttpOnly/Secure là phương án đề xuất. Chốt CORS allowlist, CSRF, TLS và tuổi phiên; nếu chọn Bearer phải thống nhất refresh/thu hồi. Backend kiểm phiên, quyền tác vụ, đơn vị, quan hệ phân công và trạng thái trên mọi request, kể cả download/export. Mở panel không đồng nghĩa quyền mutation.

ID opaque: candidateId → candidates.id; supervisorId → supervisors.id khác userId → users.id; periodId → report_periods.id; versionId → thesis_versions.id; fileId → files.id; decisionId → decisions.id. ncs-01/file-01 chỉ là ký hiệu minh họa. Production dùng UUID hoặc ID opaque thống nhất.

Ngày ISO YYYY-MM-DD; timestamp UTC ISO 8601. UI hiển thị Asia/Bangkok trong đợt bàn giao; múi giờ nghiệp vụ cần xác nhận. Enum không dịch, label ở frontend VI/EN. Chưa có dữ liệu dùng null/unknown kèm reason, không mặc định 0/đã đạt.

Success JSON có data và requestId. Danh sách data={items, page, pageSize, totalItems, totalPages}; page>=1; pageSize 1–100 mặc định 20 đề xuất; empty → items=[], totalItems=0, totalPages=0. GET mẫu là query, không body. sort=-field giảm dần, allowlist theo resource; filter/sort sai 422. q trim tối đa 200 ký tự đề xuất. Aggregate/detail không cần pagination.

POST mutation hỗ trợ Idempotency-Key: cùng key/payload trả kết quả cũ, khác payload 409. version optimistic lock/If-Match được chốt; version cũ 409. Transaction gồm nghiệp vụ, quota, review/history/audit và notification outbox; worker giao thông báo riêng. Lỗi email không giả rollback hồ sơ đã commit.

Không tin actorId, role, sourceIp, ownerId, submittedAt, reviewedAt, eligibility từ client. Suy từ phiên/server/quan hệ/rule. evaluatorId trong scores đối chiếu roster, không tự cấp quyền chấm. Người nhận thông báo từ NCS, NHD, đơn vị và bước được cấu hình, không email tùy ý.

HTTP: 200 đọc/cập nhật/hủy; 201 tạo; 202 job; 400 JSON hỏng; 401 thiếu/hết phiên; 403 thiếu quyền/scope; 404 ID không tồn tại (có thể dùng 404 cho ngoài scope); 409 trùng/sai transition/version; 422 thiếu/sai dữ liệu/điều kiện; 413 file quá lớn; 415 MIME sai; 429 giới hạn; 500 lỗi nội bộ; 503 tích hợp chưa sẵn. Không stacktrace/secrets.

Lỗi thống nhất:

~~~json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu chưa hợp lệ.",
    "fieldErrors": [
      {
        "field": "doi",
        "code": "INVALID_FORMAT",
        "message": "DOI chưa đúng định dạng."
      }
    ],
    "details": {
      "currentVersion": 2
    },
    "retryable": false
  },
  "requestId": "req-01"
}
~~~

Frontend giữ input khi lỗi, cập nhật thành công sau response; disable nút lúc gửi. Timeout/mất mạng không HTTP response; GET trạng thái trước retry cùng idempotency key. 8 giây/408 trong api.js là timeout client, không chứng minh server trả 408. Empty khác lỗi. Không nhân bản request/phiếu/bằng/email do nhấn hai lần.

## Bảng API toàn hệ thống

| API ID | Method | Endpoint | Chức năng | Request | Response | Vai trò |
|---|---|---|---|---|---|---|
| API-01 | POST | /api/auth/sessions | Đăng nhập | email, password, rememberMe | user, roles, activeRole, candidateId, expiresAt | Công khai |
| API-02 | GET | /api/me | Phiên và quyền | Không body | id, name, title, unitId, avatarText, roles, activeRole, candidateId, permissions, allowedModules | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-03 | PATCH | /api/me/active-role | Chọn vai trò đã được cấp | roleCode | activeRole, allowedModules, permissions | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-04 | DELETE | /api/auth/sessions/current | Đăng xuất còn thiếu UI | Không body | signedOut | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-05 | POST | /api/auth/password-reset-requests | Quên mật khẩu | email | message | Công khai |
| API-06 | POST | /api/auth/password-resets | Hoàn tất đặt lại mật khẩu | token, newPassword | reset | Công khai |
| API-07 | GET | /api/me/dashboard | Dashboard theo vai trò | academicYear | academicYear, stage, metrics, priorityTasks, quickActions, recentRequests, computedAt | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-08 | GET | /api/candidates | Danh sách NCS | q, status, cohortId, page, pageSize, sort | items, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-09 | GET | /api/candidates/{candidateId} | Hồ sơ chi tiết | Không body | id, code, fullName, birthDate, gender, identityNumberMasked, identityIssuedAt, phone, email, workplace, address, major, cohort, admissionDecision, studyMode, entryQualification, academicStatus, trainingStartDate, standardEndDate, maximumEndDate, remainingStandardDays, verifiedAt, version | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-10 | PATCH | /api/candidates/{candidateId}/contact | Sửa liên hệ | phone, email, workplace, version | id, phone, email, workplace, version | NCS chính mình; PDT có quyền |
| API-11 | GET | /api/candidates/summary | Thẻ thống kê hồ sơ | cohortId | total, byStatus, scope, computedAt | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-12 | GET | /api/candidates/{candidateId}/academic-changes | Lịch sử học vụ/biến động | type, page, pageSize, sort | items, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-13 | POST | /api/candidates/{candidateId}/academic-changes | Gửi yêu cầu thay đổi | type, reason, startDate, endDate, proposedSupervisorId, newTitleVi, newTitleEn, destinationUnitId, attachmentIds | id, code, type, status, submittedAt, nextActorRole, version | NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt |
| API-14 | POST | /api/academic-changes/{changeId}/reviews | Thẩm tra/ban hành biến động | action, comment, decisionId, version | id, status, candidateStatus, effectiveEndDate, version | KHOA, PDT, BGH theo bước; NHD góp ý nếu quy trình chốt |
| API-15 | GET | /api/candidates/{candidateId}/program | Khung CTĐT và miễn bổ sung | Không body | id, majorId, cohortId, entryQualification, totalCredits, blocks, supplementaryCourses, exemption, documentFileId | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-16 | GET | /api/candidates/{candidateId}/training-plan | Kế hoạch và đối chiếu | Không body | id, revision, status, actualProgressPercent, expectedProgressPercent, deltaPercent, milestones, reviews, version | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-17 | POST | /api/candidates/{candidateId}/training-plan/revisions | Lập/điều chỉnh/thêm mốc | milestoneId, semesterId, dueDate, content, expectedOutput, changeReason, baseRevision | id, revision, status, milestones, version | NCS |
| API-18 | POST | /api/training-plans/{planId}/reviews | Duyệt kế hoạch | action, comment, version | id, status, nextActorRole, version | NHD → BM → PDT; KHOA không có bước handler |
| API-19 | GET | /api/supervisors | Danh sách NHD và định mức | q, unitId, page, pageSize, sort | items, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-20 | GET | /api/supervisors/{supervisorId} | Chi tiết NHD | Không body | id, fullName, email, phone, academicTitle, degree, institution, researchAreas, profileFileId, publications, assignedCandidates | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-21 | POST | /api/candidates/{candidateId}/supervisor-assignments | Phân công NHD | mainSupervisorId, coSupervisorId, decisionId, effectiveDate | id, candidateId, mainSupervisorId, coSupervisorId, decisionId, status | PDT |
| API-22 | GET | /api/candidates/{candidateId}/courses | Học phần/điểm/tổng hợp | page, pageSize, sort | items, summary, page, pageSize, totalItems, totalPages | NCS, PDT theo ROLE_MODULES; vai trò khác cần chốt |
| API-23 | POST | /api/candidates/{candidateId}/course-registrations | Đăng ký học phần | courseOfferingId | id, courseOfferingId, status | NCS |
| API-24 | DELETE | /api/course-registrations/{registrationId} | Hủy đăng ký | Không body | id, status | NCS chính mình |
| API-25 | POST | /api/course-sync-jobs | Đồng bộ bảng điểm | candidateId, source | id, status | PDT |
| API-26 | GET | /api/course-sync-jobs/{jobId} | Kết quả đồng bộ | Không body | id, status, updatedRows, errors | PDT |
| API-27 | GET | /api/candidates/{candidateId}/research-submissions | Tiểu luận và đề cương | Không body | essay, outline | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-28 | POST | /api/candidates/{candidateId}/research-submissions | Nộp tiểu luận/đề cương | type, title, summary, researchObject, methodology, fileId, explanationFileId | id, type, revision, status, fileId, submittedAt | NCS |
| API-29 | POST | /api/research-submissions/{submissionId}/evaluations | Chấm tiểu luận | scores, comment, minutesFileId, version | id, averageScore, result, ruleId, version | NHD, BM được phân công |
| API-30 | POST | /api/research-submissions/{submissionId}/reviews | Thông qua đề cương | action, comment, minutesFileId, decisionId, version | id, status, version | BM, KHOA, PDT theo quyền cần chốt |
| API-31 | GET | /api/candidates/{candidateId}/doctoral-topics | Danh sách/tổng hợp chuyên đề | page, pageSize, sort | items, summary, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-32 | POST | /api/candidates/{candidateId}/doctoral-topics | Đăng ký chuyên đề | ordinal, title, supervisorId, expectedReportMonth, fileId | id, ordinal, title, status, score | NCS |
| API-33 | POST | /api/doctoral-topics/{topicId}/evaluations | Chấm chuyên đề | score, comment, minutesFileId, version | id, score, status, ruleId, version | NHD, BM được phân công |
| API-34 | GET | /api/candidates/{candidateId}/progress-reports | Báo cáo và lịch kỳ | page, pageSize, sort | items, availablePeriods, latestReportId, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-35 | POST | /api/candidates/{candidateId}/progress-reports | Nộp báo cáo | periodId, summary, difficulties, nextPlan, fileId | id, revision, status, submittedAt | NCS |
| API-36 | POST | /api/progress-reports/{reportId}/reviews | Đánh giá báo cáo | result, comment, version | id, status, reviewedAt, reviewedBy, version | NHD, BM theo bước cần chốt |
| API-37 | GET | /api/progress-alerts | Cảnh báo quá hạn | page, pageSize, sort | items, page, pageSize, totalItems, totalPages | NHD, BM, KHOA, PDT theo scope |
| API-38 | POST | /api/progress-reminders | Gửi nhắc hạn | alertIds, channel | jobId, status, recipientCount | NHD, PDT |
| API-39 | GET | /api/notification-jobs/{jobId} | Kết quả gửi nhắc | Không body | id, status, sentCount, failedCount, errors | Người tạo job có quyền |
| API-40 | GET | /api/candidates/{candidateId}/publications | Công bố và chuẩn đầu ra | page, pageSize, sort | items, summary, page, pageSize, totalItems, totalPages | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-41 | POST | /api/candidates/{candidateId}/publications | Khai báo công bố | title, journal, category, doi, issn, authorRole, affiliation, contributionPercent, fileIds | id, status, approvedScore, submittedAt | NCS |
| API-42 | POST | /api/publications/{publicationId}/reviews | Thẩm định công bố | action, approvedScore, comment, source, evidenceFileId, version | id, status, approvedScore, reviewedBy, version | NHD, PDT theo quy trình chốt |
| API-43 | GET | /api/candidates/{candidateId}/thesis | Đề tài và phiên bản luận án | Không body | id, project, versions, currentVersionId, defenseApproval, similarityCheck | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-44 | POST | /api/candidates/{candidateId}/thesis-versions | Nộp phiên bản luận án | stage, changeNote, fileId, baseVersionId | id, label, stage, fileId, locked, uploadedAt | NCS |
| API-45 | POST | /api/thesis-versions/{versionId}/similarity-checks | Yêu cầu kiểm tra tương đồng | Không body | id, status, provider, percentage | PDT |
| API-46 | GET | /api/similarity-checks/{checkId} | Kết quả tương đồng | Không body | id, status, versionId, percentage, reportFileId, checkedAt, threshold, ruleId | PDT; NCS/NHD theo hồ sơ |
| API-47 | POST | /api/thesis-versions/{versionId}/defense-approvals | NHD đồng ý bảo vệ | comment, reviewFileId, signatureEvidenceId, version | id, versionId, approvedAt, approvedBy, signatureStatus | NHD đang phân công |
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ | Không body | candidateId, eligible, passedCount, totalCount, items, ruleVersion, computedAt | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-49 | GET | /api/candidates/{candidateId}/defense | Hội đồng/phản biện/công khai/kết quả | Không body | id, status, seminar, independentReviews, publicNotice, scheduledAt, venue, council, voting | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-50 | POST | /api/defenses/{defenseId}/vote-results | Ghi tổng phiếu | yesVotes, totalVotes, minutesFileId, resolutionFileId, version | id, yesVotes, totalVotes, result, ruleId, version | HOIDONG được giao và quyền ghi tổng cần chốt |
| API-51 | POST | /api/defenses/{defenseId}/council-votes | Phiếu cá nhân (phương án thay thế) | vote, score, comment, fileId | id, submitted, submittedAt | HOIDONG được giao |
| API-52 | POST | /api/defenses/{defenseId}/public-notices | Đăng công khai luận án | summaryFileId, fullTextFileId, newContributionsFileId, scheduledDefenseAt | id, publishedAt, status | PDT cần chốt |
| API-53 | GET | /api/candidates/{candidateId}/graduation | Sau bảo vệ/lưu chiểu/bằng | Không body | postDefenseSubmission, deposits, checklist, degree, eligibleForConferral | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-54 | POST | /api/candidates/{candidateId}/post-defense-submissions | Nộp hồ sơ sau bảo vệ | thesisFileId, explanationFileId, deposits | id, status, submittedAt | NCS |
| API-55 | POST | /api/post-defense-submissions/{submissionId}/reviews | Xác nhận chỉnh sửa/lưu chiểu | action, comment, verifiedDepositIds, version | id, status, version | HOIDONG/PDT theo quyền cần chốt |
| API-56 | POST | /api/candidates/{candidateId}/degree-conferrals | Công nhận học vị/cấp bằng | decisionId, version | id, code, registerNumber, issuedAt, status, decisionId | BGH |
| API-57 | GET | /api/public/degrees | Tra cứu văn bằng | code, name, page, pageSize | items, page, pageSize, totalItems, totalPages | Công khai |
| API-58 | GET | /api/public/theses | Kho luận án công khai | q, majorId, page, pageSize, sort, lang | items, page, pageSize, totalItems, totalPages | Công khai |
| API-59 | GET | /api/reports/training-summary | Thống kê tiến độ | cohortId, majorId, unitId, asOf | totalCandidates, byCohort, computedAt, scope | PDT, KHOA, BGH |
| API-60 | GET | /api/reports/publication-summary | Thống kê công bố | year, unitId, supervisorId | totalVerifiedPublications, byCategory, distinctCandidateCount, publicationsPerCandidate, scope | PDT, KHOA, BGH |
| API-61 | POST | /api/report-exports | Xuất báo cáo/hồ sơ | reportType, format, filters, asOf | id, status, requestedAt | PDT, KHOA, BGH theo loại/scope; NCS hồ sơ mình; NHD cần chốt |
| API-62 | GET | /api/report-exports/{exportId} | Trạng thái/file xuất | Không body | id, status, fileId, fileName, mimeType, downloadUrl, expiresAt, errors | Người yêu cầu hoặc người được cấp quyền |
| API-63 | GET | /api/audit-events | Xem/làm mới nhật ký | actorId, action, from, to, page, pageSize, sort | items, page, pageSize, totalItems, totalPages | PDT có audit.read |
| API-64 | POST | /api/files | Upload tệp | purpose, candidateId, file | id, name, mimeType, sizeBytes, sha 256, scanStatus, uploadedAt | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-65 | GET | /api/files/{fileId} | Metadata tệp | Không body | id, name, mimeType, sizeBytes, scanStatus, purpose | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng | Không body | binary, headers | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-67 | GET | /api/public/files/{fileId}/content | Tải tệp đã công khai | Không body | binary, headers | Công khai |
| API-68 | GET | /api/reference-data | Danh mục select | types | majors, cohorts, semesters, changeTypes, publicationCategories | Người đăng nhập |

## Hợp đồng từng API

Mẫu minh họa schema; validation chung và riêng đều bắt buộc, không dựa validation HTML.

### API-01 — Đăng nhập

- Method/endpoint: **POST /api/auth/sessions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Công khai; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Xác thực mật khẩu băm tại server; tạo cookie phiên HttpOnly/Secure; rememberMe theo chính sách được duyệt. Không dùng mật khẩu demo.
- Bảng: users, user_roles, sessions. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| email | string hoặc null | Có | Email hợp lệ, trim; độ dài đã chốt | API-01: payload UI |
| password | string hoặc null | Có | Chính sách mật khẩu đã chốt; không log | API-01: payload UI |
| rememberMe | boolean | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-01: payload UI |

**Request mẫu:**

```json
{
  "email": "ncs@example.invalid",
  "password": "<mat-khau>",
  "rememberMe": false
}
```

**Response mẫu:**

```json
{
  "data": {
    "user": {
      "id": "usr-01",
      "name": "Nguyễn Văn Bình"
    },
    "roles": [
      "NCS"
    ],
    "activeRole": "NCS",
    "candidateId": "ncs-01",
    "expiresAt": "2026-10-14T10:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 401 INVALID_CREDENTIALS; 429 LOGIN_RATE_LIMIT

### API-02 — Phiên và quyền

- Method/endpoint: **GET /api/me**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Suy ra danh tính, đơn vị, scope từ phiên; mọi API kiểm quyền độc lập. Không cần API permissions thứ hai.
- Bảng: users, user_roles, role_permissions, units, sessions. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "usr-01",
    "name": "Nguyễn Văn Bình",
    "title": "NCS khóa2023",
    "unitId": "unit-01",
    "avatarText": "NB",
    "roles": [
      "NCS"
    ],
    "activeRole": "NCS",
    "candidateId": "ncs-01",
    "permissions": [
      "profile.read.own"
    ],
    "allowedModules": [
      "m01",
      "m02"
    ],
    "unitName": "Khoa Nông nghiệp - TNTN",
    "majorName": "Khoa học Môi trường",
    "email": "ncs@example.invalid",
    "phone": "0912345678"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-03 — Chọn vai trò đã được cấp

- Method/endpoint: **PATCH /api/me/active-role**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ role thuộc cùng tài khoản; không chuyển thành người mẫu khác. Tính lại phạm vi và dashboard.
- Bảng: user_roles, sessions. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| roleCode | string hoặc null | Có | Enumallowlist/quyền/transition | API-03: payload UI |

**Request mẫu:**

```json
{
  "roleCode": "NHD"
}
```

**Response mẫu:**

```json
{
  "data": {
    "activeRole": "NHD",
    "allowedModules": [
      "m01",
      "m02"
    ],
    "permissions": [
      "plan.review.assigned"
    ]
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 403 ROLE_NOT_ASSIGNED

### API-04 — Đăng xuất còn thiếu UI

- Method/endpoint: **DELETE /api/auth/sessions/current**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Thu hồi phiên và cookie; tích hợp sau cần bổ sung nút logout.
- Bảng: sessions. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Request mẫu:**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "signedOut": true
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-05 — Quên mật khẩu

- Method/endpoint: **POST /api/auth/password-reset-requests**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Công khai; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Phản hồi giống nhau dù email tồn tại; token một lần đã băm, hết hạn; email theo cấu hình. Liên kết hiện href=#.
- Bảng: users, password_reset_tokens, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| email | string hoặc null | Có | Email hợp lệ, trim; độ dài đã chốt | API-05: payload UI |

**Request mẫu:**

```json
{
  "email": "ncs@example.invalid"
}
```

**Response mẫu:**

```json
{
  "data": {
    "message": "Nếu tài khoản hợp lệ, hướng dẫn sẽ được gửi."
  },
  "requestId": "req-01"
}
```

**HTTP:** 202 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 429 RESET_RATE_LIMIT

### API-06 — Hoàn tất đặt lại mật khẩu

- Method/endpoint: **POST /api/auth/password-resets**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: Công khai; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kiểm token chưa dùng/chưa hết hạn, chính sách mật khẩu, đổi băm và thu hồi phiên. Chưa có màn hình hoàn tất.
- Bảng: users, password_reset_tokens, sessions. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| token | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-06: payload UI |
| newPassword | string hoặc null | Có | Chính sách mật khẩu đã chốt; không log | API-06: payload UI |

**Request mẫu:**

```json
{
  "token": "<token>",
  "newPassword": "<mat-khau-moi>"
}
```

**Response mẫu:**

```json
{
  "data": {
    "reset": true
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 TOKEN_INVALID

### API-07 — Dashboard theo vai trò

- Method/endpoint: **GET /api/me/dashboard**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Đếm DISTINCT theo scope actor. Tỷ lệ tổng chưa có công thức nên null; kỳ báo cáo từ lịch thực, không còn 12 ngày cố định.
- Bảng: candidates, supervisor_assignments, workflow_reviews, progress_reports, academic_change_requests. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| academicYear | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-07: query UI |

**Query mẫu (không body):**

```json
{
  "academicYear": "2026-2027"
}
```

**Response mẫu:**

```json
{
  "data": {
    "academicYear": "2026-2027",
    "stage": "Nghiên cứu",
    "metrics": [
      {
        "key": "earned_credits",
        "value": 18,
        "target": 24,
        "unit": "credit"
      },
      {
        "key": "training_progress",
        "value": null,
        "unit": "percent",
        "reason": "RULE_NOT_CONFIRMED"
      }
    ],
    "priorityTasks": [
      {
        "id": "task-01",
        "candidateId": "ncs-01",
        "type": "progress_report",
        "dueAt": "2026-10-11T16:59:59Z",
        "daysRemaining": -3
      }
    ],
    "quickActions": [
      {
        "moduleId": "m07",
        "permission": "progress.submit.own"
      }
    ],
    "recentRequests": [
      {
        "id": "req-01",
        "type": "outline",
        "status": "submitted",
        "submittedAt": "2026-10-14T03:00:00Z"
      }
    ],
    "computedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-08 — Danh sách NCS

- Method/endpoint: **GET /api/candidates**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: NCS chính mình; NHD theo phân công; BM/Khoa theo đơn vị; PDT/BGH theo quyền. Tìm CCCD cần quyền riêng, không trả CCCD trong bảng.
- Bảng: candidates, majors, cohorts, supervisor_assignments. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |
| status | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |
| cohortId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-08: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-08: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-08: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |

**Query mẫu (không body):**

```json
{
  "q": "Bình",
  "status": "studying",
  "cohortId": "cohort-23",
  "page": 1,
  "pageSize": 20,
  "sort": "code"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "ncs-01",
        "code": "NCS-2023-ENV01",
        "fullName": "Nguyễn Văn Bình",
        "major": {
          "id": "major-01",
          "name": "Khoa học Môi trường"
        },
        "cohort": {
          "id": "cohort-23",
          "label": "2023-Đ2"
        },
        "supervisors": [
          {
            "id": "sup-01",
            "name": "Trần Văn Hướng"
          }
        ],
        "academicStatus": "studying"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 INVALID_FILTER

### API-09 — Hồ sơ chi tiết

- Method/endpoint: **GET /api/candidates/{candidateId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Ẩn trường nhạy cảm; thời hạn lấy từ chương trình/đầu vào và quyết định. Xác thực hồ sơ phải có chứng cứ, không badge tĩnh.
- Bảng: candidates, majors, cohorts, decisions, candidate_programs. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "ncs-01",
    "code": "NCS-2023-ENV01",
    "fullName": "Nguyễn Văn Bình",
    "birthDate": "1993-06-18",
    "gender": "male",
    "identityNumberMasked": "********1234",
    "identityIssuedAt": "2021-03-12",
    "phone": "0912345678",
    "email": "ncs@example.invalid",
    "workplace": "Viện nghiên cứu",
    "address": "An Giang",
    "major": {
      "id": "major-01",
      "code": "9440301",
      "name": "Khoa học Môi trường"
    },
    "cohort": {
      "id": "cohort-23",
      "year": 2023,
      "intake": 2
    },
    "admissionDecision": {
      "id": "dec-01",
      "number": "412/QĐ-ĐHAG",
      "signedAt": "2023-10-15"
    },
    "studyMode": "full_time",
    "entryQualification": "master_same_major",
    "academicStatus": "studying",
    "trainingStartDate": "2023-10-15",
    "standardEndDate": "2026-10-15",
    "maximumEndDate": null,
    "remainingStandardDays": 1,
    "verifiedAt": null,
    "version": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-10 — Sửa liên hệ

- Method/endpoint: **PATCH /api/candidates/{candidateId}/contact**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS chính mình; PDT có quyền; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ sửa 3 trường form; mã/họ tên/status không thuộc payload. Chốt email học thuật có tách email đăng nhập.
- Bảng: candidates, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| phone | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-10: payload UI |
| email | string hoặc null | Có | Email hợp lệ, trim; độ dài đã chốt | API-10: payload UI |
| workplace | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-10: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-10: payload UI |

**Request mẫu:**

```json
{
  "phone": "0912345678",
  "email": "ncs@example.invalid",
  "workplace": "Viện nghiên cứu",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "ncs-01",
    "phone": "0912345678",
    "email": "ncs@example.invalid",
    "workplace": "Viện nghiên cứu",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 VERSION_CONFLICT; 422 INVALID_EMAIL

### API-11 — Thẻ thống kê hồ sơ

- Method/endpoint: **GET /api/candidates/summary**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Cùng phạm vi/filter với danh sách; tổng gồm mọi trạng thái trong tập lọc, không mặc định ba nhóm đủ.
- Bảng: candidates. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| cohortId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-11: query UI |

**Query mẫu (không body):**

```json
{
  "cohortId": "cohort-23"
}
```

**Response mẫu:**

```json
{
  "data": {
    "total": 48,
    "byStatus": {
      "studying": 39,
      "extended": 5,
      "paused": 4
    },
    "scope": {
      "unitId": "unit-01"
    },
    "computedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-12 — Lịch sử học vụ/biến động

- Method/endpoint: **GET /api/candidates/{candidateId}/academic-changes**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: m01/m12 dùng chung thực thể, khác bộ lọc; liên kết file và quyết định theo ID.
- Bảng: academic_change_requests, workflow_reviews, files, decisions. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| type | string hoặc null | Tùy filter | Enumallowlist/quyền/transition | API-12: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-12: query UI |

**Query mẫu (không body):**

```json
{
  "type": "extension",
  "page": 1,
  "pageSize": 20,
  "sort": "-submittedAt"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "chg-01",
        "code": "ĐN-1082",
        "type": "extension",
        "startDate": "2026-10-15",
        "endDate": "2027-04-15",
        "durationMonths": 6,
        "reason": "Hoàn thiện dữ liệu",
        "submittedAt": "2026-10-14T03:00:00Z",
        "status": "submitted",
        "decision": null,
        "attachments": [
          {
            "id": "file-01",
            "name": "don.pdf"
          }
        ]
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-13 — Gửi yêu cầu thay đổi

- Method/endpoint: **POST /api/candidates/{candidateId}/academic-changes**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: type extension, pause, supervisor_change, title_change, transfer, withdrawal; validation theo loại; chưa đổi hồ sơ khi nộp. NCS không tự ban hành buộc thôi học. Mẫu next Actor KHOA theo nhãn demo, cần chốt.
- Bảng: academic_change_requests, files, workflow_reviews, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| type | string hoặc null | Có | Enumallowlist/quyền/transition | API-13: payload UI |
| reason | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-13: payload UI |
| startDate | date ISO | Có | ISOdate thật; range theo lịch | API-13: payload UI |
| endDate | date ISO | Có | ISOdate thật; range theo lịch | API-13: payload UI |
| proposedSupervisorId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-13: payload UI |
| newTitleVi | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-13: payload UI |
| newTitleEn | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-13: payload UI |
| destinationUnitId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-13: payload UI |
| attachmentIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-13: payload UI |

**Request mẫu:**

```json
{
  "type": "extension",
  "reason": "Hoàn thiện dữ liệu",
  "startDate": "2026-10-15",
  "endDate": "2027-04-15",
  "proposedSupervisorId": null,
  "newTitleVi": null,
  "newTitleEn": null,
  "destinationUnitId": null,
  "attachmentIds": [
    "file-01"
  ]
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "chg-01",
    "code": "BD-2026-001",
    "type": "extension",
    "status": "submitted",
    "submittedAt": "2026-10-14T03:00:00Z",
    "nextActorRole": "KHOA",
    "version": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 DUPLICATE_PENDING_REQUEST; 422 INVALID_DATE_RANGE

### API-14 — Thẩm tra/ban hành biến động

- Method/endpoint: **POST /api/academic-changes/{changeId}/reviews**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: KHOA, PDT, BGH theo bước; NHD góp ý nếu quy trình chốt; kiểm thêm scope.
- Path: change Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ quyết định cuối mới đổi hạn/status/assignment/title trong transaction; reject/return có lý do. Chưa có nút review trong demo.
- Bảng: academic_change_requests, workflow_reviews, candidates, supervisor_assignments, research_projects, decisions, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-14: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-14: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-14: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-14: payload UI |

**Request mẫu:**

```json
{
  "action": "approve",
  "comment": "Đủ điều kiện",
  "decisionId": "dec-02",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "chg-01",
    "status": "approved",
    "candidateStatus": "extended",
    "effectiveEndDate": "2027-04-15",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 INVALID_TRANSITION; 422 DECISION_REQUIRED

### API-15 — Khung CTĐT và miễn bổ sung

- Method/endpoint: **GET /api/candidates/{candidateId}/program**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chọn phiên bản theo ngành/khóa/đầu vào; 90 TC chỉ ví dụ, không áp dụng mọi NCS. Miễn bổ sung phải có quyết định.
- Bảng: program_versions, program_requirements, candidate_programs, course_results, decisions. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "pv-01",
    "majorId": "major-01",
    "cohortId": "cohort-23",
    "entryQualification": "master_same_major",
    "totalCredits": 90,
    "blocks": [
      {
        "key": "coursework",
        "requiredCredits": 12,
        "earnedCredits": 12
      },
      {
        "key": "essay",
        "requiredCredits": 2,
        "earnedCredits": 2
      },
      {
        "key": "topics",
        "requiredCredits": 6,
        "earnedCredits": 6
      },
      {
        "key": "thesis",
        "requiredCredits": 70,
        "earnedCredits": 0
      }
    ],
    "supplementaryCourses": [],
    "exemption": {
      "reason": "Thạc sĩ đúng ngành",
      "decisionId": "dec-01"
    },
    "documentFileId": "file-program"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-16 — Kế hoạch và đối chiếu

- Method/endpoint: **GET /api/candidates/{candidateId}/training-plan**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Đối chiếu baseline đã duyệt; giữ revision; công thức chưa xác nhận trả null/reason, không 68/65 mặc định.
- Bảng: training_plans, plan_milestones, workflow_reviews. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "plan-01",
    "revision": 1,
    "status": "awaiting_supervisor",
    "actualProgressPercent": null,
    "expectedProgressPercent": null,
    "deltaPercent": null,
    "milestones": [
      {
        "id": "mile-01",
        "semesterId": "sem-04",
        "content": "Bảo vệ chuyên đề",
        "dueDate": "2026-10-18",
        "expectedOutput": "Biên bản",
        "status": "pending",
        "completionPercent": null
      }
    ],
    "reviews": [],
    "version": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-17 — Lập/điều chỉnh/thêm mốc

- Method/endpoint: **POST /api/candidates/{candidateId}/training-plan/revisions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Một mốc trong form; milestoneId phân biệt sửa/thêm. Tạo revision, giữ bản cũ, duyệt lại; changeReason là field đề xuất chưa có ô riêng.
- Bảng: training_plans, plan_milestones, workflow_reviews, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| milestoneId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-17: payload UI |
| semesterId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-17: payload UI |
| dueDate | date ISO | Có | ISOdate thật; range theo lịch | API-17: payload UI |
| content | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| expectedOutput | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| changeReason | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| baseRevision | integer | Có | Integer>=1; khớp version/revision | API-17: payload UI |

**Request mẫu:**

```json
{
  "milestoneId": null,
  "semesterId": "sem-04",
  "dueDate": "2026-10-18",
  "content": "Hoàn thành thực nghiệm",
  "expectedOutput": "Báo cáo chuyên đề",
  "changeReason": "Điều chỉnh tiến độ",
  "baseRevision": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "plan-01",
    "revision": 2,
    "status": "awaiting_supervisor",
    "milestones": [
      {
        "id": "mile-02",
        "semesterId": "sem-04",
        "dueDate": "2026-10-18"
      }
    ],
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 BASE_REVISION_CHANGED

### API-18 — Duyệt kế hoạch

- Method/endpoint: **POST /api/training-plans/{planId}/reviews**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD → BM → PDT; KHOA không có bước handler; kiểm thêm scope.
- Path: plan Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kiểm đúng bước và phân công; actor/time từ server, ghi ý kiến và revision. Reject/return là đề xuất cần chốt. KHOA thấy nút UI nhưng không được vượt bước.
- Bảng: training_plans, workflow_reviews, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-18: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-18: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-18: payload UI |

**Request mẫu:**

```json
{
  "action": "approve",
  "comment": "Đồng ý kế hoạch",
  "version": 2
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "plan-01",
    "status": "awaiting_department",
    "nextActorRole": "BM",
    "version": 3
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 WRONG_REVIEW_STAGE

### API-19 — Danh sách NHD và định mức

- Method/endpoint: **GET /api/supervisors**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Đếm assignment còn hiệu lực; quota cần chốt vì HTML 3/2/1 khác JS 4/3/3. Unknown không cho phân công mù.
- Bảng: supervisors, supervisor_assignments, academic_rules. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-19: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |

**Query mẫu (không body):**

```json
{
  "q": "Hướng",
  "unitId": "unit-01",
  "page": 1,
  "pageSize": 20,
  "sort": "name"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "sup-01",
        "fullName": "Trần Văn Hướng",
        "academicTitle": "GS",
        "degree": "TS",
        "institution": "ĐH An Giang",
        "researchAreas": [
          "Môi trường"
        ],
        "activeCandidateCount": 2,
        "quotaLimit": null,
        "remainingQuota": null,
        "quotaRuleId": null
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-20 — Chi tiết NHD

- Method/endpoint: **GET /api/supervisors/{supervisorId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: supervisorId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chi tiết hiện chỉ alert; trả hồ sơ/công trình/danh sách NCS theo quyền. Không suy có CRUD NHD.
- Bảng: supervisors, supervisor_assignments, publications. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "sup-01",
    "fullName": "Trần Văn Hướng",
    "email": "supervisor@example.invalid",
    "phone": "0903888999",
    "academicTitle": "GS",
    "degree": "TS",
    "institution": "ĐH An Giang",
    "researchAreas": [
      "Môi trường"
    ],
    "profileFileId": null,
    "publications": [],
    "assignedCandidates": [
      {
        "id": "ncs-01",
        "code": "NCS-2023-ENV01"
      }
    ]
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-21 — Phân công NHD

- Method/endpoint: **POST /api/candidates/{candidateId}/supervisor-assignments**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Cấmmain=co; khóa/giao dịch kiểm quota chống cạnh tr anh; không tăng count lần 2 khi gửi lại. Lưu quan hệ và QĐ thật thay vì chỉ tăng count.
- Bảng: supervisor_assignments, supervisors, decisions, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| mainSupervisorId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| coSupervisorId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| effectiveDate | date ISO | Có | ISOdate thật; range theo lịch | API-21: payload UI |

**Request mẫu:**

```json
{
  "mainSupervisorId": "sup-01",
  "coSupervisorId": "sup-02",
  "decisionId": "dec-03",
  "effectiveDate": "2026-10-14"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "assign-01",
    "candidateId": "ncs-01",
    "mainSupervisorId": "sup-01",
    "coSupervisorId": "sup-02",
    "decisionId": "dec-03",
    "status": "active"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 QUOTA_EXCEEDED; 409 DUPLICATE_ASSIGNMENT; 422 SAME_SUPERVISOR

### API-22 — Học phần/điểm/tổng hợp

- Method/endpoint: **GET /api/candidates/{candidateId}/courses**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, PDT theo ROLE_MODULES; vai trò khác cần chốt; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Điểm theo trọng số phiên bản course, GPA theo quy tắc chốt; không copy 3.65 hệ 4 HTML. Đăng ký chưa có điểm không được tín chỉ đạt.
- Bảng: courses, course_offerings, course_registrations, course_results, program_requirements. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-22: query UI |

**Query mẫu (không body):**

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "code"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "course-01",
        "offeringId": "off-01",
        "code": "ENV801",
        "name": "Phương pháp nghiên cứu",
        "credits": 3,
        "lecturerName": "Trần Văn Hướng",
        "registrationId": "reg-01",
        "registrationStatus": "completed",
        "processScore": 9,
        "examScore": 8.8,
        "finalScore": 8.86,
        "letterGrade": "A",
        "passed": true,
        "registerAllowed": false,
        "cancelAllowed": false
      }
    ],
    "summary": {
      "earnedCredits": 12,
      "requiredCredits": 12,
      "gpa10": 8.88,
      "gpa4": null,
      "completed": true
    },
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-23 — Đăng ký học phần

- Method/endpoint: **POST /api/candidates/{candidateId}/course-registrations**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kiểm kỳ mở, tiên quyết, chỗ trống, lộ trình, unique; quy tắc này chưa có trong demo cần chốt.
- Bảng: course_registrations, course_offerings, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| courseOfferingId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-23: payload UI |

**Request mẫu:**

```json
{
  "courseOfferingId": "off-env809"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "reg-02",
    "courseOfferingId": "off-env809",
    "status": "registered"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 ALREADY_REGISTERED; 409 REGISTRATION_CLOSED

### API-24 — Hủy đăng ký

- Method/endpoint: **DELETE /api/course-registrations/{registrationId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS chính mình; kiểm thêm scope.
- Path: registrationId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ trong cửa sổ hủy và chưa chốt điểm; giữ lịch sử, không xóa kết quả.
- Bảng: course_registrations, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Request mẫu:**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "reg-02",
    "status": "cancelled"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 CANCELLATION_CLOSED

### API-25 — Đồng bộ bảng điểm

- Method/endpoint: **POST /api/course-sync-jobs**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Nút hiện alert; nguồn điểm chưa có kết nối; jobstaging/map mã/checkconflict, không tự ghi đè điểm đã xác nhận.
- Bảng: integration_jobs, course_results, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| candidateId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-25: payload UI |
| source | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-25: payload UI |

**Request mẫu:**

```json
{
  "candidateId": "ncs-01",
  "source": "graduate_training"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "sync-01",
    "status": "queued"
  },
  "requestId": "req-01"
}
```

**HTTP:** 202 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 503 GRADE_SOURCE_UNAVAILABLE

### API-26 — Kết quả đồng bộ

- Method/endpoint: **GET /api/course-sync-jobs/{jobId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT; kiểm thêm scope.
- Path: jobId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Trả queued/running/completed/failed vàlỗi dòng; chỉ đếm updatedRows đã commit.
- Bảng: integration_jobs. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "sync-01",
    "status": "completed",
    "updatedRows": 4,
    "errors": []
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-27 — Tiểu luận và đề cương

- Method/endpoint: **GET /api/candidates/{candidateId}/research-submissions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Bản mới nhất và kết quả có nguồn; giải trình/biên bản/QĐ bằng ID; không gọi ký số chỉ từ timestamp.
- Bảng: research_submissions, submission_evaluations, files, decisions. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "essay": {
      "id": "essay-01",
      "title": "Tổng quan xử lý nước thải",
      "summary": "Tổng quan tài liệu",
      "status": "passed",
      "defenseDate": "2024-02-15",
      "scores": [
        {
          "evaluatorId": "sup-01",
          "evaluatorName": "Trần Văn Hướng",
          "score": 8.5
        },
        {
          "evaluatorId": "sup-02",
          "evaluatorName": "Lê Hoàng Nam",
          "score": 9
        },
        {
          "evaluatorId": "sup-03",
          "evaluatorName": "Nguyễn Hải Nam",
          "score": 8.8
        }
      ],
      "averageScore": 8.77,
      "reviewComment": "Đạt",
      "minutesFileId": "file-minutes",
      "fileId": "file-essay",
      "minutesNumber": "BB-TL01/ĐHAG",
      "signatureStatus": "not_verified"
    },
    "outline": {
      "id": "outline-01",
      "title": "Đề cương nghiên cứu",
      "researchObject": "Nước thải",
      "methodology": "Thực nghiệm",
      "status": "approved",
      "committeeSize": 5,
      "yesVotes": 5,
      "explanationFileId": "file-explanation",
      "decisionId": "dec-01",
      "fileId": "file-outline",
      "explanationSubmittedAt": "2024-05-02T03:00:00Z",
      "explanationStatus": "accepted",
      "decision": {
        "id": "dec-01",
        "number": "289/QĐ-ĐHAG",
        "issuedAt": "2024-05-20"
      }
    }
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-28 — Nộp tiểu luận/đề cương

- Method/endpoint: **POST /api/candidates/{candidateId}/research-submissions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: type essay cần title, summary, file; outline cần title, object, methodology, file và giải trình theo quy tắc chốt. Demo bắt 2 file kể cả lần đầu.
- Bảng: research_submissions, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| type | string hoặc null | Có | Enumallowlist/quyền/transition | API-28: payload UI |
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| summary | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| researchObject | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| methodology | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |
| explanationFileId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |

**Request mẫu:**

```json
{
  "type": "outline",
  "title": "Đề cương nghiên cứu",
  "summary": null,
  "researchObject": "Nước thải",
  "methodology": "Thực nghiệm",
  "fileId": "file-outline",
  "explanationFileId": "file-explanation"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "outline-02",
    "type": "outline",
    "revision": 2,
    "status": "submitted",
    "fileId": "file-outline",
    "submittedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 REQUIRED_ATTACHMENT_MISSING

### API-29 — Chấm tiểu luận

- Method/endpoint: **POST /api/research-submissions/{submissionId}/evaluations**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, BM được phân công; kiểm thêm scope.
- Path: submission Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Điểm 0–10, 3 evaluator khác nhau/được giao; server tính mean và threshold đã chốt. Demo mean.toFixed 2>=7; cần chốt xét trước/sau làm tròn.
- Bảng: submission_evaluations, research_submissions, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| scores | array<object> | Có | 3 evaluator khác nhau thuộc roster; mỗi score 0–10 | API-29: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-29: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-29: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-29: payload UI |

**Request mẫu:**

```json
{
  "scores": [
    {
      "evaluatorId": "sup-01",
      "score": 8.5
    },
    {
      "evaluatorId": "sup-02",
      "score": 9
    },
    {
      "evaluatorId": "sup-03",
      "score": 8.8
    }
  ],
  "comment": "Tổng quan đầy đủ",
  "minutesFileId": "file-minutes",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "eval-01",
    "averageScore": 8.77,
    "result": "pass",
    "ruleId": "rule-essay",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 INVALID_SCORE; 409 SUBMISSION_NOT_READY

### API-30 — Thông qua đề cương

- Method/endpoint: **POST /api/research-submissions/{submissionId}/reviews**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: BM, KHOA, PDT theo quyền cần chốt; kiểm thêm scope.
- Path: submission Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chưa cóhandler đưa outlineStatus từ Chờ duyệt về Đã duyệt; chốt hội đồng/quyền và điều kiện giải trình.
- Bảng: research_submissions, workflow_reviews, files, decisions, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-30: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-30: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-30: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-30: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-30: payload UI |

**Request mẫu:**

```json
{
  "action": "approve",
  "comment": "Đã tiếp thu",
  "minutesFileId": "file-minutes",
  "decisionId": "dec-04",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "outline-02",
    "status": "approved",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 EXPLANATION_NOT_ACCEPTED

### API-31 — Danh sách/tổng hợp chuyên đề

- Method/endpoint: **GET /api/candidates/{candidateId}/doctoral-topics**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: RequiredCount từ program, không mặc định 3 khi UI 2–3; chỉ kết quả duyệt được tích lũy.
- Bảng: doctoral_topics, topic_evaluations, program_requirements. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-31: query UI |

**Query mẫu (không body):**

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "ordinal"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "topic-01",
        "ordinal": 1,
        "title": "Tổng quan ĐTM",
        "credits": 2,
        "supervisorId": "sup-01",
        "reportDate": "2024-08-12",
        "score": 8.8,
        "status": "passed",
        "fileId": "file-topic",
        "minutesFileId": "file-minutes",
        "supervisor": {
          "id": "sup-01",
          "name": "Trần Văn Hướng",
          "institution": "ĐH An Giang"
        }
      }
    ],
    "summary": {
      "requiredCount": null,
      "passedCount": 1,
      "requiredCredits": 6,
      "earnedCredits": 2,
      "averageScore": 8.8,
      "completionPercent": null
    },
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-32 — Đăng ký chuyên đề

- Method/endpoint: **POST /api/candidates/{candidateId}/doctoral-topics**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chuyên đề thuộc program, uniqueordinal; cập nhật bản đã đạt phải tạo revision. Điều kiện năm 1 chưa cóhandler, cần chốt.
- Bảng: doctoral_topics, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| ordinal | integer | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| supervisorId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-32: payload UI |
| expectedReportMonth | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-32: payload UI |

**Request mẫu:**

```json
{
  "ordinal": 3,
  "title": "Đánh giá vòng đời LCA",
  "supervisorId": "sup-01",
  "expectedReportMonth": "2026-12",
  "fileId": "file-topic"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "topic-03",
    "ordinal": 3,
    "title": "Đánh giá vòng đời LCA",
    "status": "submitted",
    "score": null
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 TOPIC_EXISTS; 409 YEAR1_REQUIREMENTS_NOT_MET

### API-33 — Chấm chuyên đề

- Method/endpoint: **POST /api/doctoral-topics/{topicId}/evaluations**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, BM được phân công; kiểm thêm scope.
- Path: topic Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Score 0–10; server xét threshold đã chốt. Demo passed kể cả 0 làlỗi, mô hình tiểu ban cần xác nhận.
- Bảng: topic_evaluations, doctoral_topics, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| score | decimal | Có | Số hữu hạn 0–10; ngưỡng đạt theo rule | API-33: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-33: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-33: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-33: payload UI |

**Request mẫu:**

```json
{
  "score": 8.5,
  "comment": "Đạt yêu cầu",
  "minutesFileId": "file-minutes",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "topic-03",
    "score": 8.5,
    "status": "passed",
    "ruleId": "rule-topic",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 INVALID_SCORE; 409 ALREADY_FINALIZED

### API-34 — Báo cáo và lịch kỳ

- Method/endpoint: **GET /api/candidates/{candidateId}/progress-reports**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kỳ từ lịch đào tạo đã duyệt, không mảng slice cuối. Phải thấy cả kỳ đến hạn chưa có báo cáo.
- Bảng: report_periods, progress_reports, workflow_reviews. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-34: query UI |

**Query mẫu (không body):**

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "periodNumber"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "report-01",
        "periodId": "period-01",
        "periodNumber": 1,
        "startDate": "2023-10-15",
        "endDate": "2024-04-15",
        "dueAt": "2024-04-15T16:59:59Z",
        "submittedAt": "2024-04-10T03:00:00Z",
        "summary": "Hoàn thành học phần",
        "difficulties": null,
        "nextPlan": "Thực nghiệm",
        "status": "passed",
        "reviewComment": "Hoàn thành tốt",
        "fileId": "file-report",
        "reviews": [
          {
            "id": "review-01",
            "actorName": "Trần Văn Hướng",
            "role": "NHD",
            "result": "pass",
            "comment": "Hoàn thành tốt",
            "reviewedAt": "2024-04-11T03:00:00Z"
          }
        ]
      }
    ],
    "availablePeriods": [
      {
        "id": "period-07",
        "number": 7,
        "dueAt": "2026-10-11T16:59:59Z"
      }
    ],
    "latestReportId": "report-01",
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-35 — Nộp báo cáo

- Method/endpoint: **POST /api/candidates/{candidateId}/progress-reports**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Ngày server; mọi field/file thật; re submit tạo revision và hủy kết luận bản cũkhỏi latest.
- Bảng: progress_reports, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| periodId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-35: payload UI |
| summary | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| difficulties | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| nextPlan | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-35: payload UI |

**Request mẫu:**

```json
{
  "periodId": "period-07",
  "summary": "Đã thu thập mẫu",
  "difficulties": "Thiếu vật tư",
  "nextPlan": "Hoàn thiện bản thảo",
  "fileId": "file-report"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "report-07",
    "revision": 1,
    "status": "submitted",
    "submittedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 PERIOD_CLOSED; 409 DUPLICATE_REPORT

### API-36 — Đánh giá báo cáo

- Method/endpoint: **POST /api/progress-reports/{reportId}/reviews**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, BM theo bước cần chốt; kiểm thêm scope.
- Path: report Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Pass/revision_required/failtheotừđiển; không đạt cần lý do. Demokhôngtách ý kiến NHD và xác nhận BM, không tự thêm bước.
- Bảng: progress_reports, workflow_reviews, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| result | string hoặc null | Có | Enumallowlist/quyền/transition | API-36: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-36: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-36: payload UI |

**Request mẫu:**

```json
{
  "result": "pass",
  "comment": "Đạt tiến độ",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "report-07",
    "status": "passed",
    "reviewedAt": "2026-10-14T04:00:00Z",
    "reviewedBy": "usr-02",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 REPORT_NOT_SUBMITTED

### API-37 — Cảnh báo quá hạn

- Method/endpoint: **GET /api/progress-alerts**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, BM, KHOA, PDT theo scope; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Overdue từ hạn/tình trạng nộp, ngày nghiệp vụ server; chốt cách tính ngày nghỉ.
- Bảng: report_periods, progress_reports, candidates, notification_deliveries. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-37: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-37: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-37: query UI |

**Query mẫu (không body):**

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "-overdueDays"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "alert-01",
        "candidateId": "ncs-02",
        "candidateName": "Lê Văn Hải",
        "periodId": "period-04",
        "dueAt": "2026-09-26T16:59:59Z",
        "overdueDays": 18,
        "supervisorIds": [
          "sup-01"
        ],
        "lastReminderAt": null
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-38 — Gửi nhắc hạn

- Method/endpoint: **POST /api/progress-reminders**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, PDT; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Server lấy NCS/NHD/email, kiểm cooldown/chưa nộp, không tin recipient client. queued khác sent.
- Bảng: notification_outbox, notification_deliveries, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| alertIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-38: payload UI |
| channel | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-38: payload UI |

**Request mẫu:**

```json
{
  "alertIds": [
    "alert-01"
  ],
  "channel": "email"
}
```

**Response mẫu:**

```json
{
  "data": {
    "jobId": "notify-01",
    "status": "queued",
    "recipientCount": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 202 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 REMINDER_COOLDOWN; 503 EMAIL_NOT_CONFIGURED

### API-39 — Kết quả gửi nhắc

- Method/endpoint: **GET /api/notification-jobs/{jobId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Người tạo job có quyền; kiểm thêm scope.
- Path: jobId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Queued/running/completed/failed; chỉ sent khi dịch vụ xác nhận, có retry/cooldown tr ánh lặp.
- Bảng: notification_outbox, notification_deliveries. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "notify-01",
    "status": "completed",
    "sentCount": 2,
    "failedCount": 0,
    "errors": []
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-40 — Công bố và chuẩn đầu ra

- Method/endpoint: **GET /api/candidates/{candidateId}/publications**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Cộng bài đã duyệt cuối; chốtđiểmvàsố lượng là hai điều kiệntáchbiệt; không badge 2/2 tĩnh.
- Bảng: publications, publication_reviews, academic_rules. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-40: query UI |

**Query mẫu (không body):**

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "-submittedAt"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "pub-01",
        "title": "Nghiên cứu môi trường",
        "journal": "Tạp chí khoa học",
        "issn": "0944-1344",
        "category": "wos_q1",
        "doi": "10.1234/example",
        "authorRole": "first",
        "status": "verified",
        "approvedScore": 0.75,
        "fileIds": [
          "file-pub"
        ],
        "canReview": false
      }
    ],
    "summary": {
      "verifiedCount": 1,
      "requiredCount": null,
      "approvedScoreTotal": 0.75,
      "requiredScore": null,
      "eligible": null
    },
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-41 — Khai báo công bố

- Method/endpoint: **POST /api/candidates/{candidateId}/publications**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: DOI chuẩn hóa/unique trong hồ sơ; chốtsharebài nhiều người trước unique toàn trường. ISSN UI có nhưnghandlerbỏ; role/affiliation/contribution cần UI bổ sung, không tự gán first.
- Bảng: publications, publication_authors, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| journal | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| category | string hoặc null | Có | Enumallowlist/quyền/transition | API-41: payload UI |
| doi | string hoặc null | Có | ^10\.\d{4, 9}/\S+; chuẩn hóa; unique theo policy | API-41: payload UI |
| issn | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| authorRole | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| affiliation | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| contributionPercent | integer | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-41: payload UI |
| fileIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-41: payload UI |

**Request mẫu:**

```json
{
  "title": "Nghiên cứu môi trường",
  "journal": "Tạp chí khoa học",
  "category": "wos_q1",
  "doi": "10.1234/example",
  "issn": "0944-1344",
  "authorRole": "first",
  "affiliation": "An Giang University",
  "contributionPercent": 50,
  "fileIds": [
    "file-pub"
  ]
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "pub-02",
    "status": "submitted",
    "approvedScore": null,
    "submittedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 DUPLICATE_DOI; 422 INVALID_DOI

### API-42 — Thẩm định công bố

- Method/endpoint: **POST /api/publications/{publicationId}/reviews**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD, PDT theo quy trình chốt; kiểm thêm scope.
- Path: publication Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chặn NCS/tự duyệt kể cả user nhiều role; demo một bước NHD/PDT khác sơ đồ hai cấp. Không tự nhận kết nối WoS/Scopuskhinhậpscorethủcông.
- Bảng: publication_reviews, publications, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-42: payload UI |
| approvedScore | decimal | Có | 0–1 theo demo; phạm vi thực cần chốt | API-42: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-42: payload UI |
| source | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-42: payload UI |
| evidenceFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-42: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-42: payload UI |

**Request mẫu:**

```json
{
  "action": "verify",
  "approvedScore": 0.75,
  "comment": "Minh chứng hợp lệ",
  "source": "manual_evidence",
  "evidenceFileId": "file-evidence",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "pub-02",
    "status": "verified",
    "approvedScore": 0.75,
    "reviewedBy": "usr-03",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 403 SELF_REVIEW_FORBIDDEN; 409 WRONG_STAGE; 422 INVALID_PUBLICATION_SCORE

### API-43 — Đề tài và phiên bản luận án

- Method/endpoint: **GET /api/candidates/{candidateId}/thesis**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Không trả ký số/tương đồng khi chưa có chứng cứ; HĐ chỉ version được giao; title/versions từ DB.
- Bảng: research_projects, theses, thesis_versions, similarity_checks, defense_approvals. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "thesis-01",
    "project": {
      "id": "project-01",
      "titleVi": "Tên luận án",
      "titleEn": "Thesis title",
      "decisionId": "dec-01",
      "field": "Môi trường",
      "mainSupervisorId": "sup-01",
      "mainSupervisor": {
        "id": "sup-01",
        "name": "Trần Văn Hướng",
        "institution": "ĐH An Giang"
      },
      "decision": {
        "id": "dec-01",
        "number": "289/QĐ-ĐHAG",
        "issuedAt": "2024-05-20"
      }
    },
    "versions": [
      {
        "id": "ver-01",
        "label": "v3.0",
        "stage": "school_defense",
        "uploadedAt": "2026-01-10T03:00:00Z",
        "sizeBytes": 16882074,
        "changeNote": "Bản chính",
        "fileId": "file-thesis",
        "locked": false,
        "fileName": "luan-an-v3.0.pdf"
      }
    ],
    "currentVersionId": "ver-01",
    "defenseApproval": null,
    "similarityCheck": {
      "status": "not_configured",
      "percentage": null
    }
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-44 — Nộp phiên bản luận án

- Method/endpoint: **POST /api/candidates/{candidateId}/thesis-versions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Label sinh server, giữbytebản cũ, kiểm PDF. Chốt signoff mất hiệu lực khi đổi bản; khóa bản cũkhôngđồngnghĩacấmtạobản mới.
- Bảng: thesis_versions, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| stage | string hoặc null | Có | Enumallowlist/quyền/transition | API-44: payload UI |
| changeNote | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-44: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-44: payload UI |
| baseVersionId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-44: payload UI |

**Request mẫu:**

```json
{
  "stage": "school_defense",
  "changeNote": "Tiếp thu góp ý",
  "fileId": "file-thesis",
  "baseVersionId": "ver-01"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "ver-02",
    "label": "v3.1",
    "stage": "school_defense",
    "fileId": "file-thesis",
    "locked": false,
    "uploadedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 VERSION_LOCKED; 409 BASE_VERSION_CHANGED

### API-45 — Yêu cầu kiểm tra tương đồng

- Method/endpoint: **POST /api/thesis-versions/{versionId}/similarity-checks**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT; kiểm thêm scope.
- Path: versionId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Dịch vụ chưa cấu hình 503; report/phần trăm gắnfilehashđúngversion, không đồng nhất phần trămtươngđồngvớikếtluậnđạovăn.
- Bảng: similarity_checks, integration_jobs, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Request mẫu:**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "sim-01",
    "status": "queued",
    "provider": "configured_provider",
    "percentage": null
  },
  "requestId": "req-01"
}
```

**HTTP:** 202 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 503 SIMILARITY_PROVIDER_NOT_CONFIGURED

### API-46 — Kết quả tương đồng

- Method/endpoint: **GET /api/similarity-checks/{checkId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT; NCS/NHD theo hồ sơ; kiểm thêm scope.
- Path: check Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Queued/running/failed/completed; 14 chỉvídụschema. Ngưỡng 20 trong UI chưa được văn bản gốc xác nhận.
- Bảng: similarity_checks, files. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "sim-01",
    "status": "completed",
    "versionId": "ver-02",
    "percentage": 14,
    "reportFileId": "file-sim",
    "checkedAt": "2026-10-14T04:00:00Z",
    "threshold": null,
    "ruleId": null
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-47 — NHD đồng ý bảo vệ

- Method/endpoint: **POST /api/thesis-versions/{versionId}/defense-approvals**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NHD đang phân công; kiểm thêm scope.
- Path: versionId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Xác nhận tài khoản timestamp không là ký số; gắnreview/version chính xác. Chứng thư/dịch vụ ký sốriêngcần chốt.
- Bảng: defense_approvals, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-47: payload UI |
| reviewFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-47: payload UI |
| signatureEvidenceId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-47: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-47: payload UI |

**Request mẫu:**

```json
{
  "comment": "Đồng ý cho bảo vệ",
  "reviewFileId": "file-review",
  "signatureEvidenceId": null,
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "signoff-01",
    "versionId": "ver-02",
    "approvedAt": "2026-10-14T04:00:00Z",
    "approvedBy": "usr-02",
    "signatureStatus": "not_signed_digitally"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 STALE_THESIS_VERSION

### API-48 — Checklist bảo vệ

- Method/endpoint: **GET /api/candidates/{candidateId}/defense-eligibility**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kiểm học phần, essay, outline, topics, pub, progress, duration; ngoại ngữ/seminar/signoff/similarity theo rule đã duyệt. Chưa chốt rule/thiếu bằng chứng unknown, không tự đạt.
- Bảng: program_requirements, course_results, research_submissions, doctoral_topics, publications, progress_reports, candidates, academic_rules. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "candidateId": "ncs-01",
    "eligible": false,
    "passedCount": 1,
    "totalCount": 2,
    "items": [
      {
        "key": "coursework",
        "status": "pass",
        "actual": 12,
        "required": 12,
        "evidenceIds": [
          "result-01"
        ]
      },
      {
        "key": "publications",
        "status": "unknown",
        "actual": 0.75,
        "required": null,
        "reason": "RULE_NOT_CONFIRMED"
      }
    ],
    "ruleVersion": "draft",
    "computedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-49 — Hội đồng/phản biện/công khai/kết quả

- Method/endpoint: **GET /api/candidates/{candidateId}/defense**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Ẩnidentity/phiếu phản biện kín/phiếu cá nhân theo actor. Các bước tổ chức hiện chỉ nội dung tĩnh, không suycóCRUD.
- Bảng: defenses, seminars, independent_reviews, public_notices, councils, council_members, council_votes. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "def-01",
    "status": "scheduled",
    "seminar": {
      "status": "not_recorded",
      "minutesFileId": null
    },
    "independentReviews": [
      {
        "id": "ir-01",
        "code": "PB-ĐL-01",
        "reviewerLabel": "Chuyên gia được bảo mật",
        "receivedAt": "2025-11-25",
        "conclusion": "approve"
      }
    ],
    "publicNotice": {
      "publishedAt": "2025-12-01T00:00:00Z",
      "elapsedDays": 30,
      "requiredDays": null,
      "summaryFileId": "file-summary"
    },
    "scheduledAt": "2026-01-15T01:00:00Z",
    "venue": "Hội trường A",
    "council": {
      "id": "council-01",
      "decisionId": "dec-01",
      "members": [
        {
          "id": "member-01",
          "name": "Tên thành viên",
          "position": "chair",
          "degree": "TS",
          "institution": "ĐH An Giang"
        }
      ]
    },
    "voting": {
      "yesVotes": null,
      "totalVotes": 7,
      "result": null,
      "averageScore": null,
      "resolutionFileId": null
    }
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-50 — Ghi tổng phiếu

- Method/endpoint: **POST /api/defenses/{defenseId}/vote-results**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: HOIDONG được giao và quyền ghi tổng cần chốt; kiểm thêm scope.
- Path: defense Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Không mọi ủy viên tự thay toàn bộ phiếu; kiểm số người dự, chứng cứ, vai trò thư ký/chủ tịch. >=4/7 chỉ quy tắc demo cần chốt.
- Bảng: defenses, council_votes, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| yesVotes | integer | Có | Integer; 0<=yes<=total<=số người dự | API-50: payload UI |
| totalVotes | integer | Có | Integer; 0<=yes<=total<=số người dự | API-50: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-50: payload UI |
| resolutionFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-50: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-50: payload UI |

**Request mẫu:**

```json
{
  "yesVotes": 7,
  "totalVotes": 7,
  "minutesFileId": "file-minutes",
  "resolutionFileId": "file-resolution",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "def-01",
    "yesVotes": 7,
    "totalVotes": 7,
    "result": "passed",
    "ruleId": "rule-vote",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 VOTES_EXCEED_ATTENDANCE; 409 DEFENSE_NOT_HELD

### API-51 — Phiếu cá nhân (phương án thay thế)

- Method/endpoint: **POST /api/defenses/{defenseId}/council-votes**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: HOIDONG được giao; kiểm thêm scope.
- Path: defense Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Một phiếu/member/phiên; actor từ phiên. Chốtphiếu kín/sửa/tổng hợp; chọn thay mô hình prompt tổng, không cộngdồnhai API. Chưa UI.
- Bảng: council_votes, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| vote | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-51: payload UI |
| score | decimal | Có | Số hữu hạn 0–10; ngưỡng đạt theo rule | API-51: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-51: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-51: payload UI |

**Request mẫu:**

```json
{
  "vote": "approve",
  "score": 9.4,
  "comment": "Đạt yêu cầu",
  "fileId": "file-vote"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "vote-01",
    "submitted": true,
    "submittedAt": "2026-10-14T04:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 ALREADY_VOTED

### API-52 — Đăng công khai luận án

- Method/endpoint: **POST /api/defenses/{defenseId}/public-notices**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: PDT cần chốt; kiểm thêm scope.
- Path: defense Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ tài liệu được duyệt; timestamp server; chốtthaytệpcólạitínhhạn 30 ngày không; không file phản biện kín. Chưa UI đăng.
- Bảng: public_notices, files, defenses, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| summaryFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| fullTextFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| newContributionsFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| scheduledDefenseAt | timestamp ISO | Có | Type/độ dài/allowlist; không HTML tùy ý | API-52: payload UI |

**Request mẫu:**

```json
{
  "summaryFileId": "file-summary",
  "fullTextFileId": "file-full",
  "newContributionsFileId": "file-contribution",
  "scheduledDefenseAt": "2026-11-15T01:00:00Z"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "notice-01",
    "publishedAt": "2026-10-14T03:00:00Z",
    "status": "published"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 NOT_APPROVED_FOR_PUBLICATION

### API-53 — Sau bảo vệ/lưu chiểu/bằng

- Method/endpoint: **GET /api/candidates/{candidateId}/graduation**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Tốt nghiệp khác checklist bảo vệ; kiểm kết quả bảo vệ/chỉnh sửa/lưu chiểu/tài chính/hồ sơ theo rule chốt.
- Bảng: post_defense_submissions, deposits, degree_records, defenses, academic_rules. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "postDefenseSubmission": {
      "id": "post-01",
      "status": "submitted",
      "thesisFileId": "file-final",
      "explanationFileId": "file-explanation"
    },
    "deposits": [
      {
        "institution": "agu_library",
        "receiptNumber": "BN-TV089/2026",
        "receivedAt": "2026-01-20",
        "receiptFileId": "file-receipt",
        "verified": false
      }
    ],
    "checklist": [
      {
        "key": "defense_passed",
        "status": "unknown",
        "evidenceId": null
      },
      {
        "key": "deposit",
        "status": "pending"
      }
    ],
    "degree": null,
    "eligibleForConferral": false
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-54 — Nộp hồ sơ sau bảo vệ

- Method/endpoint: **POST /api/candidates/{candidateId}/post-defense-submissions**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: 2 PDF bắt buộc demo; biên nhận demo chỉ text, hợp đồngtáchsố/ngày/file. Nơi lưu chiểu thứ 3 chưa có form, cần chốt.
- Bảng: post_defense_submissions, deposits, files, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| thesisFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-54: payload UI |
| explanationFileId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-54: payload UI |
| deposits | array<object> | Có | Type/độ dài/allowlist; không HTML tùy ý | API-54: payload UI |

**Request mẫu:**

```json
{
  "thesisFileId": "file-final",
  "explanationFileId": "file-explanation",
  "deposits": [
    {
      "institution": "agu_library",
      "receiptNumber": "BN-TV089/2026",
      "receivedAt": "2026-01-20",
      "receiptFileId": "file-receipt"
    },
    {
      "institution": "national_library",
      "receiptNumber": "NL-892/NLV",
      "receivedAt": "2026-01-25",
      "receiptFileId": "file-receipt-2"
    }
  ]
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "post-02",
    "status": "submitted",
    "submittedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 DEFENSE_NOT_PASSED; 422 DEPOSIT_EVIDENCE_REQUIRED

### API-55 — Xác nhận chỉnh sửa/lưu chiểu

- Method/endpoint: **POST /api/post-defense-submissions/{submissionId}/reviews**.
- Trạng thái: Cần chốt UI/quy trình thiếu.
- Vai trò: HOIDONG/PDT theo quyền cần chốt; kiểm thêm scope.
- Path: submission Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chủ tịch/thư ký nếu rule chốt; PDT xác thực biên nhận, không tự khai làm chứng cứ. Chưa UI.
- Bảng: post_defense_submissions, deposits, workflow_reviews, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-55: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-55: payload UI |
| verifiedDepositIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-55: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-55: payload UI |

**Request mẫu:**

```json
{
  "action": "approve",
  "comment": "Đã hoàn thiện",
  "verifiedDepositIds": [
    "deposit-01"
  ],
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "post-02",
    "status": "approved",
    "version": 2
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 REQUIRED_SIGNATURE_MISSING

### API-56 — Công nhận học vị/cấp bằng

- Method/endpoint: **POST /api/candidates/{candidateId}/degree-conferrals**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: BGH; kiểm thêm scope.
- Path: candidateId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Kiểm graduation/bảo vệ thực/QĐ ký hợp lệ; sinh mã số sổunique trong transaction. Demo chỉ 6 điều kiện và QĐ 128, không cập nhật register.
- Bảng: degree_records, decisions, candidates, audit_events, notification_outbox. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-56: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-56: payload UI |

**Request mẫu:**

```json
{
  "decisionId": "dec-degree",
  "version": 1
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "degree-01",
    "code": "TS-AGU-2026-089",
    "registerNumber": "SG-TS-2026-012",
    "issuedAt": "2026-10-14",
    "status": "issued",
    "decisionId": "dec-degree"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 409 REQUIREMENTS_NOT_MET; 409 DEGREE_ALREADY_ISSUED

### API-57 — Tra cứu văn bằng

- Method/endpoint: **GET /api/public/degrees**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Công khai; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Ít nhất code/name; cả 2 phải cùng bản ghi. Demo khớp chính xác không phân biệt hoa thường; trùng tên trả list, không find đầu tiên. Empty 200 items=[]; revoked không verified.
- Bảng: degree_records, candidates, majors, decisions. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| code | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| name | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |

**Query mẫu (không body):**

```json
{
  "code": "TS-AGU-2026-089",
  "name": "Nguyễn Văn Bình",
  "page": 1,
  "pageSize": 20
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "code": "TS-AGU-2026-089",
        "name": "Nguyễn Văn Bình",
        "nameEn": "Nguyen Van Binh",
        "major": "Khoa học Môi trường",
        "majorEn": "Environmental Science",
        "registerNumber": "SG-TS-2026-012",
        "issueDate": "2026-10-14",
        "decisionNumber": "128/QĐ-ĐHAG",
        "status": "issued",
        "verificationSource": "master_register"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 LOOKUP_QUERY_REQUIRED; 429 RATE_LIMIT

### API-58 — Kho luận án công khai

- Method/endpoint: **GET /api/public/theses**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Công khai; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Path có trong config nhưng api.js/home.jschưanạp. Adaptercontractitems/candidateName/expectedDefenseDate/fullTextUrl khác app.js mẫu candidate/date/fullUrl.
- Bảng: public_notices, files, research_projects, candidates. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| majorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-58: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| lang | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |

**Query mẫu (không body):**

```json
{
  "q": "Môi trường",
  "majorId": "major-01",
  "page": 1,
  "pageSize": 20,
  "sort": "-expectedDefenseDate",
  "lang": "vi"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "notice-01",
        "title": "Tên luận án",
        "candidateName": "Nguyễn Văn Bình",
        "field": "Khoa học Môi trường",
        "expectedDefenseDate": "2026-11-15",
        "publishedAt": "2026-10-14T03:00:00Z",
        "summaryUrl": "https://dtms.example.invalid/api/public/files/file-summary/content",
        "fullTextUrl": null
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-59 — Thống kê tiến độ

- Method/endpoint: **GET /api/reports/training-summary**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT, KHOA, BGH; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Địnhnghĩatronghạntừdeadlineđã duyệt; DISTINCTvàcùng scope/filter; 126 dashboard khác 48 table cần làm rõ.
- Bảng: candidates, cohorts, academic_change_requests, training_plans. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| cohortId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| majorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| asOf | date ISO | Tùy filter | ISOdate thật; range theo lịch | API-59: query UI |

**Query mẫu (không body):**

```json
{
  "cohortId": "cohort-23",
  "majorId": "major-01",
  "unitId": "unit-01",
  "asOf": "2026-10-14"
}
```

**Response mẫu:**

```json
{
  "data": {
    "totalCandidates": 48,
    "byCohort": [
      {
        "cohortId": "cohort-23",
        "label": "K2023",
        "candidateCount": 14,
        "onTimeCount": 13,
        "onTimePercent": 92.86,
        "extendedCount": 1
      }
    ],
    "computedAt": "2026-10-14T03:00:00Z",
    "scope": {
      "unitId": "unit-01"
    }
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-60 — Thống kê công bố

- Method/endpoint: **GET /api/reports/publication-summary**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT, KHOA, BGH; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Cùng bài đồng tác giả không đếm trùng toàn trường; theo NCS/NHD chốtmẫu số/quy tắcchia sẻ. 2.4 UI không có căn cứ.
- Bảng: publications, publication_authors, publication_reviews, supervisor_assignments. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| year | integer | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-60: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-60: query UI |
| supervisorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-60: query UI |

**Query mẫu (không body):**

```json
{
  "year": 2026,
  "unitId": "unit-01",
  "supervisorId": "sup-01"
}
```

**Response mẫu:**

```json
{
  "data": {
    "totalVerifiedPublications": 91,
    "byCategory": [
      {
        "category": "wos_q1_q2",
        "count": 44,
        "percentage": 48.35
      }
    ],
    "distinctCandidateCount": 38,
    "publicationsPerCandidate": 2.39,
    "scope": {
      "unitId": "unit-01"
    }
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-61 — Xuất báo cáo/hồ sơ

- Method/endpoint: **POST /api/report-exports**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT, KHOA, BGH theo loại/scope; NCS hồ sơ mình; NHD cần chốt; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chung reportType candidate_record/training_progress/accreditation/public_disclosure/topic_minutes/audit_log. ACL từng loại; filetừsnapshot DB không CSVhardcode; template kiểm định cần chốt.
- Bảng: export_jobs, files, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| reportType | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| format | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| filters | object | Có | Type/độ dài/allowlist; không HTML tùy ý | API-61: payload UI |
| asOf | date ISO | Có | ISOdate thật; range theo lịch | API-61: payload UI |

**Request mẫu:**

```json
{
  "reportType": "candidate_record",
  "format": "pdf",
  "filters": {
    "candidateId": "ncs-01"
  },
  "asOf": "2026-10-14"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "export-01",
    "status": "queued",
    "requestedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 202 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 FORMAT_NOT_SUPPORTED; 409 TEMPLATE_NOT_CONFIGURED

### API-62 — Trạng thái/file xuất

- Method/endpoint: **GET /api/report-exports/{exportId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Người yêu cầu hoặc người được cấp quyền; kiểm thêm scope.
- Path: export Id; IDopaque bắt buộc khi có.
- Nghiệp vụ: Queued/running/completed/failed; file đúng format, tải thật; hết hạn lấy URL mới theo quyền.
- Bảng: export_jobs, files. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "export-01",
    "status": "completed",
    "fileId": "file-export",
    "fileName": "HoSo_NCS.pdf",
    "mimeType": "application/pdf",
    "downloadUrl": "https://dtms.example.invalid/api/files/file-export/content",
    "expiresAt": "2026-10-14T05:00:00Z",
    "errors": []
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-63 — Xem/làm mới nhật ký

- Method/endpoint: **GET /api/audit-events**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: PDT có audit.read; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Append-only; actor/IP/time server/trustedproxy; không API sửa/xóa; không mật khẩu/token/stacktrace. Exportchungreporttypeaudit_log.
- Bảng: audit_events. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| actorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-63: query UI |
| action | string hoặc null | Tùy filter | Enumallowlist/quyền/transition | API-63: query UI |
| from | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |
| to | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-63: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-63: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |

**Query mẫu (không body):**

```json
{
  "actorId": "usr-01",
  "action": "plan.approved",
  "from": "2026-10-01T00:00:00Z",
  "to": "2026-10-14T23:59:59Z",
  "page": 1,
  "pageSize": 50,
  "sort": "-occurredAt"
}
```

**Response mẫu:**

```json
{
  "data": {
    "items": [
      {
        "id": "audit-01",
        "occurredAt": "2026-10-14T03:00:00Z",
        "actorId": "usr-02",
        "actorName": "Người hướng dẫn",
        "activeRole": "NHD",
        "action": "plan.approved",
        "entityType": "training_plan",
        "entityId": "plan-01",
        "summary": "Duyệt cấp NHD",
        "sourceIp": "192.0.2.1",
        "result": "success",
        "requestId": "req-01"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 422 INVALID_TIME_RANGE

### API-64 — Upload tệp

- Method/endpoint: **POST /api/files**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: multipart/form-data; ownerphiên; candidate/purpose đúng scope; magicbytes/MIME/extension/size/quét file; pending/quarantine không cho attach. Không lộ objectkey.
- Bảng: files, file_links, audit_events. Mutation ghi actor/time/version server, audit và outbox theo bước.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| purpose | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-64: payload UI |
| candidateId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-64: payload UI |
| file | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-64: payload UI |

**Multipart fields, không JSON upload:**

```json
{
  "purpose": "progress_report",
  "candidateId": "ncs-01",
  "file": "<binary multipart>"
}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "file-01",
    "name": "bao-cao.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 102400,
    "sha256": "<hash>",
    "scanStatus": "pending",
    "uploadedAt": "2026-10-14T03:00:00Z"
  },
  "requestId": "req-01"
}
```

**HTTP:** 201 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 413 FILE_TOO_LARGE; 415 UNSUPPORTED_FILE; 422 FILE_SCAN_FAILED

### API-65 — Metadata tệp

- Method/endpoint: **GET /api/files/{fileId}**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: fileId; IDopaque bắt buộc khi có.
- Nghiệp vụ: ACL hồ sơ/file; chỉ clean cho attach, pending/failed/quarantine minh bạch.
- Bảng: files, file_links. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "data": {
    "id": "file-01",
    "name": "bao-cao.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 102400,
    "scanStatus": "clean",
    "purpose": "progress_report"
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

### API-66 — Tải/xem tệp riêng

- Method/endpoint: **GET /api/files/{fileId}/content**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; kiểm thêm scope.
- Path: fileId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Response binary không bọc JSON; ACLmọilầntải; signed URL TTL nếu chọn; phản biệnkínACLriêng.
- Bảng: files, file_links, audit_events. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "binary": "<bytes>",
  "headers": {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=\"bao-cao.pdf\""
  }
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 404 FILE_NOT_FOUND; 410 FILE_UNAVAILABLE

### API-67 — Tải tệp đã công khai

- Method/endpoint: **GET /api/public/files/{fileId}/content**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Công khai; kiểm thêm scope.
- Path: fileId; IDopaque bắt buộc khi có.
- Nghiệp vụ: Chỉ notice published+visibilitypublic; không đoánIDtải fileriêng; không example.com.
- Bảng: files, public_notices. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| Không body | — | — | Path/phiên hợp lệ | Server |

**Query mẫu (không body):**

```json
{}
```

**Response mẫu:**

```json
{
  "binary": "<bytes>",
  "headers": {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline; filename=\"tom-tat.pdf\""
  }
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. 404 PUBLIC_FILE_NOT_AVAILABLE

### API-68 — Danh mục select

- Method/endpoint: **GET /api/reference-data**.
- Trạng thái: Cần Backend triển khai.
- Vai trò: Người đăng nhập; kiểm thêm scope.
- Path: Không có; IDopaque bắt buộc khi có.
- Nghiệp vụ: Mãbềnvững; học kỳ theo candidate/role; NHD dùng API 19, kỳ report API 34, không duplicate list.
- Bảng: majors, cohorts, semesters, academic_rules. GET không đổi nghiệp vụ.

**Đầu vào:**

| Field | Kiểu | Bắt buộc | Validation | Nguồn |
|---|---|---|---|---|
| types | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-68: query UI |

**Query mẫu (không body):**

```json
{
  "types": "majors,cohorts,semesters,change_types,publication_categories"
}
```

**Response mẫu:**

```json
{
  "data": {
    "majors": [
      {
        "id": "major-01",
        "code": "9440301",
        "name": "Khoa học Môi trường"
      }
    ],
    "cohorts": [
      {
        "id": "cohort-23",
        "label": "2023-Đ2"
      }
    ],
    "semesters": [
      {
        "id": "sem-04",
        "label": "HK4",
        "startDate": "2025-04-01",
        "endDate": "2025-10-01"
      }
    ],
    "changeTypes": [
      "extension",
      "pause"
    ],
    "publicationCategories": [
      "wos_q1",
      "scopus_q2"
    ]
  },
  "requestId": "req-01"
}
```

**HTTP:** 200 thành công; 401/403 khi cần phiên, 404 path không tồn tại, 400/422 sai dữ liệu, 409 trùng/version/transition cho mutation, 429/500/503 theo quy ước. List rỗng trả 200.

## Upload/download riêng

API-64 multipart/form-data gồm binary file, purpose, candidateId; owner từ phiên. Chuỗi binary trong mẫu không phải byte thật. Server kiểm extension/MIME/magic bytes/size/tệp rỗng/scan; accept HTML không đủ. File pending/quarantined không attach; ngoài scope 403/404. Không lộ object key/path traversal.

Accept hiện có: đơn gia hạn/tạm dừng(.pdf, .doc, .docx); publication PDF; đổi NHD PDF; essay PDF; outline PDF+explanationPDF; topic(.pdf, .doc, .docx); progress PDF; đổi tên PDF; thesis PDF; post-defense2PDF; biến động PDF. Giới hạn MB/số tệp/antivirus/TTL file chưa gắn/hạn lưu cần chốt, không tự bịa 20 MB. File chốt/ban hành không clean up như tệp tạm.

API-66/67 trả binary thực với Content-Type/Content-Disposition UTF-8, không bọc JSON. ACL mọi lần tải; signed URL nếu dùng cần TTL; phản biện kín ACL riêng. Public chỉ notice published, không đoánID tải file riêng. Object mất trả file unavailable, không báo thành công từ metadata.

## Dùng chung và tương thích

- m01 gia hạn, m03 đổi NHD, m09 đổi tên, m12 biến động dùngAPI-13/14 theo type.
- Phôi m11, quicklookupm13/public lookup dùngAPI-57; 3D là render card, không endpoint chứng nhận riêng.
- File sẵnAPI-66; xuất hồ sơ/báo cáo/sổ topic/audit dùngAPI-61/62 theo reportType.
- /me trả permissions, không API permissions trùng.
- API-50 tổng phiếu/API-51 phiếu cá nhân là hai phương án cần chốt; không cộng đồng thời.
- API-58 path có config nhưng adapter app.js candidate/date/fullUrl → candidateName/expectedDefenseDate/fullTextUrl; home.js normalizeTheses nhận array/data không items và chưa nạp. Không chỉ điềnAPI_BASE_URL là xong.

CRUD tài khoản/CTĐT, import NCS, seminar, lập HĐ, giao PB, lockbảnthảo thiếu UI/quy tắc; chốt 08 rồi bổ sungmutationcontract riêng. Chatbot demo không yêu cầuLLM/lưu chat.

## Payload có điều kiện theo loại chức năng

Các trường dưới đây bổ sung mẫu uni on để Backend không suy mọifield đều bắt buộc. Nguồn actor, owner, status, time vẫn từ phiên/server. FileID phải clean, đúng scope/purpose.

| API/loại | Field bắt buộc từ frontend | Field server suy/tính | Điều kiện/cần chốt |
|---|---|---|---|
| API-13 extension/pause | type, reason, startDate, endDate, attachmentIds | candidate, actor, durationMonths, hạn hiện hành, status | Ngày đầu<=ngày cuối; ngưỡng/lần/tổng và trừ thời gian theoQ 13 |
| API-13 supervisor_change | type, reason, changeSubtype, attachmentIds; proposedSupervisorId khi đổi/bổ sung | NHD cũ/assignment hiệu lực, quota, snapshot | changeSubtype=replace_main/add_co/remove_co; remove cần assignmentId thay vì ép chọn NHD mới |
| API-13 title_change | type, reason, newTitleVi, newTitleEn, attachmentIds | Tên/QĐ cũ, snapshot, actor | VI/EN là 2 ôrequired UI; thời điểm áp dụng chỉ sau QĐ cuối |
| API-13 transfer | type, reason, destinationUnitId, destinationMajorId, effectiveDate, attachmentIds | Đơn vị/ngành cũ, lộ trình đã gán | Formgenericthiếuôriêng; chốt thay đổi program/tínchỉtheoQ 12 |
| API-13 withdrawal | type, reason, attachmentIds, withdrawalKind (sau cần chốt) | Actor PDT/NCS theo quyền, decision/status | Tựnguyện và buộc thôi học khác nghiệp vụ; không NCS tự ban hành |
| API-28 essay | type=essay, title, summary, fileId | revision, status, submittedAt | Không require object/methodology/explanation |
| API-28 outline | type=outline, title, researchObject, methodology, fileId | revision, status, submittedAt | explanationFileId bắt buộc khi nàoQ 07; demo bắt 2 filemọilần |
| API-41 publication | title, journal, category, fileIds; DOItheochínhsáchQ 08 | id, status, score chưa duyệt, actor/time | issn/role/affiliation/contribution cần chốt; không firsthardcode |
| API-54 post_defense | thesisFileId, explanationFileId; deposits institution/receiptNumber/receivedAt/file | verified=false cho tự khai, time, status | Biên nhận file/ngày/nơi thứ 3 theoQ 21; UI hiện chỉ text 2 nơi |
| API-61 export | reportType, format, filters theo quyền | requester, scope, snapshot/job/file | candidate_record thêm candidateId; topic_minutes candidateId/topic IDs; reports unit/cohort/date; audit filter actor/from/to |
| API-57 lookup | Tối thiểu code hoặc name | Kết quả query master register | Cả 2 phải cùng record; trùng tên list; không thấy items=[] |
| API-64 upload | purpose, candidateId nếu tệp thuộc NCS, filebinary | owner/size/hash/scan/time | candidateId không tự cho quyền; file chữ ký/QĐ scope theo entity |

Các payload có cấu trúc mảng/object (scores, deposits, filters, fileIds) phải validate từng phần tử, không chỉ kiểm array tồn tại. evaluatorId cần thuộc tiểu ban, candidate/program/periodID cùng hồ sơ. comments bắt buộc khi reject/return/fail; approval comment theo chính sách đã chốt.

Tên API và payload đề xuất có thể điều chỉnh sau quyết định nhóm, nhưng phải cập nhật đồng bộ frontendcontract/schema/transition; không triển khai cả hai phương án trùng mục đích.

## Các khóa dashboard theo vai trò (API-07)

Mỗi metric trả key,value,target nếu có,unit và reason nếu chưa tính được. Giá trị từ cùng scope của tài khoản;label do frontend dịch. Mẫu JSON ở trên chỉ minh họa vài metric,Backend phải cung cấp đủ tập đang hiển thị:

| Vai trò | Metric key bắt buộc | Nguồn và phép tính |
|---|---|---|
| NCS | training_progress,earned_credits,current_report_days_remaining | Tiến độ theo rule đã chốt;tín chỉ từ kết quả đạt;ngày tới hạn từ report_periods |
| NHD | supervised_candidate_count,pending_review_count,pending_report_count | Assignment hiệu lực;hàng chờ đúng actor/stage;report submitted cần nhận xét |
| BM | department_candidate_count,pending_confirmation_count,upcoming_milestone_count | Phạm vi bộ môn;review cần BM;window sắp hạn cần chốt |
| KHOA | faculty_candidate_count,pending_faculty_review_count,progress_alert_count | Phạm vi khoa;hàng chờ Khoa;cảnh báo tiến độ thật |
| PDT | active_candidate_count,pending_appraisal_count,defense_eligible_count | Phạm vi được cấp;hàng chờ thẩm định;checklist thật và rule đủ |
| BGH | university_candidate_count,pending_decision_count,defense_record_count | Phạm vi trường;QĐ trình ký;hồ sơ bảo vệ trong scope |
| HOIDONG | assigned_defense_count,submitted_vote_count,upcoming_defense_count | Hội đồng/phân công thật;phiếu của actor/tổng hồ sơ được giao;phiên sắp tới |

target ở submitted_vote_count là tổng số phiếu actor phải nộp. Không lấy1/2 của seed làm dữ liệu thật. Trường stage,academicYear,priorityTasks[dueAt,type,candidateId,id,status],quickActions[moduleId,permission] vàrecentRequests[type,status,submittedAt,id] cũng phải trả từ scope thật. Nếu dùng task để chuyển tới bản ghi cụ thể,thêm resourceType/resourceId và kiểm ACL trước tải chi tiết.

Các trường mới trong response mẫu nhằm giữ đủ cột UI: thông tin đơn vị/chuyên ngành của /me;tên từng người chấm,biên bản và giải trình đề cương;tên NHD chuyên đề;reviewer/comment/time báo cáo;QĐ/tên NHD và tên tệp trong luận án. Không buộc frontend suy tên người khác từ tài khoản đang đăng nhập.

Static route /candidates/summary phải được phân biệt với /candidates/{candidateId};không parse từ summary thành ID hồ sơ. Backend chọn thứ tự route hoặc matcher phù hợp.
