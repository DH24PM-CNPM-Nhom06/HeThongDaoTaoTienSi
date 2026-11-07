# Đặc tả chi tiết chức năng

60 nhóm hành vi bao phủ kiểm kê 01, mỗi nhóm có A–H. Hợp đồng API đầy đủ ở 03. Field giao diện vô danh cần tên contract ổn định; field_N chỉ là định dạng lưu cục bộ. Chức năng thuần giao diện không tạo API nghiệp vụ giả.

## CN-01 — Điều hướng dock, ô ứng dụng và tab

### A. Thông tin

- Phân hệ/trang: Khung trong index.html.
- Nút/thao tác: 7 dock, 6 launch-tile, 14 tab.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/app.js: 846](../../js/app.js#L846) `initViewRouter`; [js/management.js: 680](../../js/management.js#L680) `switchModuleTab`.
- Hiện tại: **Đổi class/scroll; initManagement tự mở management với NCS dù chưa login; canAccessView chỉ kiểm view tồn tại.**

### B. Hành vi

Bấm dock/tile đổi view; tab kiểm ROLE_MODULES rồi đổi panel. Tích hợp tải phiên trước, sau đó gọi API đọc từng panel.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật allowedModules, permissions; dữ liệu panel theo chức năng riêng.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-02 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn role_permissions, sessions, units, user_roles, users.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-02 | GET | /api/me | Phiên và quyền; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-02:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không có endpoint chuyển tab; server bảo vệ mọi API dữ liệu.

Bảng: role_permissions, sessions, units, user_roles, users. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

allowedModules, permissions; dữ liệu panel theo chức năng riêng. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Mọi đường vào cùng màn hình có cùng quyền; không tự tạo phiên NCS. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-02 — Đăng nhập, ghi nhớ và quên mật khẩu

### A. Thông tin

- Phân hệ/trang: Tài khoản trong index.html.
- Nút/thao tác: Topbar; form-login; checkbox; link Quên mật khẩu.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/management.js: 573](../../js/management.js#L573) `login`; index.html: 2240–2268.
- Hiện tại: **7 email mẫu/mật khẩu agu2026; dtms-role; checkbox không đọc, link href=#; switchRole gây tải lại trang.**

### B. Hành vi

Mở modal nhập email/password, rememberMe; POST login → /me. Quên mật khẩu cần UI bổ sung cho reset request và hoàn tất.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật user, role thực, scope, expiresAt; thông báo lỗi không lộ tài khoản.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-login và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: email, password, rememberMe, token, newPassword. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-01, API-02, API-05, API-06 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: notification_outbox, password_reset_tokens, role_permissions, sessions, units, user_roles, users. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| email | string hoặc null | Có | Email hợp lệ, trim; độ dài đã chốt | API-01: payload UI |
| password | string hoặc null | Có | Chính sách mật khẩu đã chốt; không log | API-01: payload UI |
| rememberMe | boolean | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-01: payload UI |
| token | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-06: payload UI |
| newPassword | string hoặc null | Có | Chính sách mật khẩu đã chốt; không log | API-06: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2250 | input login-username | email/Có | nvbinh_ncs@agu.edu.vn | Đọc thực tế ởHiện tại; chưa gửi server |
| 2254 | input login-password | password/Có | agu2026 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2260 | input (không name/id) | checkbox/Không | | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-01 | POST | /api/auth/sessions | Đăng nhập; Công khai |
| API-02 | GET | /api/me | Phiên và quyền; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-05 | POST | /api/auth/password-reset-requests | Quên mật khẩu; Công khai |
| API-06 | POST | /api/auth/password-resets | Hoàn tất đặt lại mật khẩu; Công khai |

Mẫu request API-01:

```json
{
  "email": "ncs@example.invalid",
  "password": "<mat-khau>",
  "rememberMe": false
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 401 INVALID_CREDENTIALS; 429 LOGIN_RATE_LIMIT. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Actor lấy từ phiên, không role client; reset token một lần.

Bảng: notification_outbox, password_reset_tokens, role_permissions, sessions, units, user_roles, users. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

user, role thực, scope, expiresAt; thông báo lỗi không lộ tài khoản. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Sai mật khẩu 401; reload giữ phiên đúng; rememberMe có ý nghĩa được chốt. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-03 — Đổi vai trò và cập nhật thẻ người dùng

### A. Thông tin

- Phân hệ/trang: Tài khoản trong index.html.
- Nút/thao tác: Badge, Đổi vai trò, cardactive-user, 7 thẻ modal.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/management.js: 645](../../js/management.js#L645) `switchRole`.
- Hiện tại: **Đổi cả danh tính sang tài khoản mẫu; sessionStorage và reload. Persona trang roles không đổi phiên.**

### B. Hành vi

Chọn role đã được cấp cho cùng tài khoản → PATCHactive-role → /me/dashboard và dữ liệu scope mới.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Name, title, unit, avatarText, role, menu, tác vụ.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-role-switcher và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: roleCode, academicYear. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-03, API-02, API-07 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, candidates, progress_reports, role_permissions, sessions, supervisor_assignments, units, user_roles, users, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| roleCode | string hoặc null | Có | Enumallowlist/quyền/transition | API-03: payload UI |
| academicYear | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-07: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-03 | PATCH | /api/me/active-role | Chọn vai trò đã được cấp; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-02 | GET | /api/me | Phiên và quyền; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-07 | GET | /api/me/dashboard | Dashboard theo vai trò; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu request API-03:

```json
{
  "roleCode": "NHD"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 403 ROLE_NOT_ASSIGNED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không nhận role để tăng quyền hoặc chọn userId khác.

Bảng: academic_change_requests, candidates, progress_reports, role_permissions, sessions, supervisor_assignments, units, user_roles, users, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Name, title, unit, avatarText, role, menu, tác vụ. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Role chưa cấp 403; không giữ dữ liệu scope trước. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-04 — Đăng xuất còn thiếu

### A. Thông tin

- Phân hệ/trang: Tài khoản trong index.html.
- Nút/thao tác: Không nút/handler.
- Vai trò: Người đăng nhập; scope ở 00.
- File/hàm: Quét index.html và js/*.js.
- Hiện tại: **Chưa có UI hoặc logout handler.**

### B. Hành vi

Tích hợp sau thêm nút → DELETE session → xóa UI dữ liệu nhạy cảm, về public.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật signedOut và giao diện khách.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-04 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: sessions. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-04 | DELETE | /api/auth/sessions/current | Đăng xuất còn thiếu UI; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu request API-04:

```json
{}
```

Mẫu response:

```json
{
  "data": {
    "signedOut": true
  },
  "requestId": "req-01"
}
```

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không coi đổi role hoặc xóa sessionStorage là logout server.

Bảng: sessions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

signedOut và giao diện khách. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Phiên cũ không truy cập API sau logout. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-05 — Tìm kiếm lệnh nhanh

### A. Thông tin

- Phân hệ/trang: Khung trong index.html.
- Nút/thao tác: Header input + Enter.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/management.js: 1550](../../js/management.js#L1550) `initQuickCommandSearch`.
- Hiện tại: **Modulekeywords → tab, không tìm dữ liệu; không matchmặc địnhm01; toast chuyển dù bị chặn.**

### B. Hành vi

Nhập từ khóa → Enter → mở module phù hợp nếu có quyền; API đọc thuộc panel.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Không bịa API tìm toàn hệ thống khi chưa có màn kết quả.

### F. Đầu ra

Không bảng kết quả hồ sơ; moduleId client. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Không khớp/sai quyền báo đúng, không giả kết quả search. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-06 — Đổi ngôn ngữ VI/EN

### A. Thông tin

- Phân hệ/trang: Khung trong index.html.
- Nút/thao tác: data-lang-btn.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/app.js: 860](../../js/app.js#L860) `applyLanguage`.
- Hiện tại: **Lưu dtms-language, dịch DOM và render lại persona/roadmap/mock theses/dashboard.**

### B. Hành vi

Toggle ngôn ngữ tại client; dữ liệu nghiệp vụ cùng ID; titleVI/EN lấy từ thesis/public.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Không lưu trạng thái bằng chuỗi dịch, không dịch dữ liệu người thành bản mới.

### F. Đầu ra

Label VI/EN; enum và ID không đổi. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

VI/EN cùng quyền/điểm/hồ sơ. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-07 — Mở/đóng modal và chọn/upload tệp

### A. Thông tin

- Phân hệ/trang: Khung trong index.html.
- Nút/thao tác: X, Hủy, backdrop, label upload.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/management.js: 722](../../js/management.js#L722) `initModalListeners`; [js/management.js: 1446](../../js/management.js#L1446) `initFileUploadListeners`; [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`.
- Hiện tại: **20 mgmt modal+Hologram+chat; file thật được chọn nhưng chỉ tên/size/type lưu. Generic capture stopImmediatePropagation chặn onsubmit toast inline.**

### B. Hành vi

Mở form đúng quyền → chọn file → upload bytes → metadata clean → gửi fileId theo API form. X/Hủy/backdrop không gửi.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật fileId/name/size/MIME/hash/scanStatus; lỗi giữ form.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: purpose, candidateId, file. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-64, API-65 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, file_links, files. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| purpose | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-64: payload UI |
| candidateId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-64: payload UI |
| file | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-64: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-64 | POST | /api/files | Upload tệp; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-65 | GET | /api/files/{fileId} | Metadata tệp; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu request API-64:

```json
{
  "purpose": "progress_report",
  "candidateId": "ncs-01",
  "file": "<binary multipart>"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 413 FILE_TOO_LARGE; 415 UNSUPPORTED_FILE; 422 FILE_SCAN_FAILED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Accept HTML chỉ gợi ý; filetemp dọn theo TTL; không API cho đóng modal.

Bảng: audit_events, file_links, files. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

fileId/name/size/MIME/hash/scanStatus; lỗi giữ form. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

13 ô file upload byte thật; cancel không tạo bản ghi. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-08 — Dashboard theo 7 vai trò

### A. Thông tin

- Phân hệ/trang: Dashboard trong index.html.
- Nút/thao tác: 3 metric/role, priority, deadline, shortcut, recentrequests.
- Vai trò: NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG; scope ở 00.
- File/hàm: [js/management.js: 534](../../js/management.js#L534) `renderRoleDashboard`; js/management.js: 110–129.
- Hiện tại: **21 metric tĩnh; năm học 2026–2027; recent 5 workflow localStorage không scope role.**

### B. Hành vi

Mở workspace/đổi role → GET dashboard; shortcut chỉ mở module; mutation xong reload metrics/recent.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Stage, 21 nhómmetric theo role, task/dueAt/daysRemaining, scope, academicYear, computedAt.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: academicYear. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-07 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_change_requests, candidates, progress_reports, supervisor_assignments, workflow_reviews.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| academicYear | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-07: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-07 | GET | /api/me/dashboard | Dashboard theo vai trò; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-07:

```json
{
  "academicYear": "2026-2027"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Công thức tiến độ chưa có thì null; hàng chờ theo actor thật.

Bảng: academic_change_requests, candidates, progress_reports, supervisor_assignments, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Stage, 21 nhómmetric theo role, task/dueAt/daysRemaining, scope, academicYear, computedAt. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Ngày hiện tại 14/10 không còn 12 ngày trước hạn 11/10. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-09 — Khôi phục dữ liệu demo

### A. Thông tin

- Phân hệ/trang: Quản trị demo trong index.html.
- Nút/thao tác: Topbar reset hidden nếu không PDT.
- Vai trò: PDT trên UI; scope ở 00.
- File/hàm: [js/management.js: 490](../../js/management.js#L490) `resetDemoData`.
- Hiện tại: **Xóa 2 khóa state/workflows, reload; giữ role/language.**

### B. Hành vi

Reset dữ liệu cục bộ demo; không API xóa dữ liệu thật.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Không ánhxạresetthànhDELETEproduction.

### F. Đầu ra

Seed mẫu trên thiết bị. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Không đổi DB/kho tệp server. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-10 — Danh sách NCS, tìm kiếm, lọc

### A. Thông tin

- Phân hệ/trang: m01 trong index.html.
- Nút/thao tác: ÔsearchCCCD/tên/mã, select status, 3 hàng Xem&Sửa.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 343–548; [js/management.js: 504](../../js/management.js#L504) `applyRolePermissions`.
- Hiện tại: **3 hàng tĩnh; search/select không listener. Hàm quyền sau dòng 504 bỏ đoạn ẩnrow NCS/NHD của bản trước. 2 nút row 530/541 chỉ alert.**

### B. Hành vi

GET list+summary; filter → page 1; row → GET candidate đúng ID. Pagination/sort là API yêu cầu, chưa control HTML.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Code, name, major, cohort, NHD, status; thẻ total/studying/extended/paused, pages.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: q, status, cohortId, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-08, API-09, API-11 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidate_programs, candidates, cohorts, decisions, majors, supervisor_assignments.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |
| status | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |
| cohortId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-08: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-08: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-08: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-08: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-08 | GET | /api/candidates | Danh sách NCS; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-09 | GET | /api/candidates/{candidateId} | Hồ sơ chi tiết; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-11 | GET | /api/candidates/summary | Thẻ thống kê hồ sơ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-08:

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

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 INVALID_FILTER. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Backend scope server, chỉẩnCSS không đủ.

Bảng: candidate_programs, candidates, cohorts, decisions, majors, supervisor_assignments. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Code, name, major, cohort, NHD, status; thẻ total/studying/extended/paused, pages. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Từng row mở đúng hồ sơ; lọc thật, empty/permission đúng. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-11 — Hồ sơ và cập nhật liên hệ

### A. Thông tin

- Phân hệ/trang: m01 trong index.html.
- Nút/thao tác: Cập nhật cá nhân, Xem&Sửa Bình, Lưu.
- Vai trò: NCS, PDT cho sửa; đọc theo scope; scope ở 00.
- File/hàm: [js/management.js: 740](../../js/management.js#L740) `handleUpdateProfile`; index.html: 415–495.
- Hiện tại: **Lưu phone/email/workplace localStorage+DOM; init không hydrate sau reload nên UI lạihardcode. Họ tên/mã readonly.**

### B. Hành vi

GET profile → hydrateform → 3 field → PATCH → update card/table/form, audit.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Toàn bộ trường cá nhân/đào tạo API-09; 3 field sửa/version.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-edit-profile và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: phone, email, workplace, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-09, API-10 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, candidate_programs, candidates, cohorts, decisions, majors. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| phone | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-10: payload UI |
| email | string hoặc null | Có | Email hợp lệ, trim; độ dài đã chốt | API-10: payload UI |
| workplace | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-10: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-10: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2282 | input (không name/id) | text/Không | Nguyễn Văn Bình | Readonly/server tự lấy |
| 2286 | input (không name/id) | text/Không | NCS-2023-ENV01 | Readonly/server tự lấy |
| 2290 | input profile-phone-input | text/Có | 0912.345.678 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2294 | input profile-email-input | email/Có | nvbinh_ncs@agu.edu.vn | Đọc thực tế ởHiện tại; chưa gửi server |
| 2298 | input profile-workplace-input | text/Có | Viện Nghiên cứu Biến đổi Khí hậu ĐBSCL | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-09 | GET | /api/candidates/{candidateId} | Hồ sơ chi tiết; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-10 | PATCH | /api/candidates/{candidateId}/contact | Sửa liên hệ; NCS chính mình; PDT có quyền |

Mẫu request API-10:

```json
{
  "phone": "0912345678",
  "email": "ncs@example.invalid",
  "workplace": "Viện nghiên cứu",
  "version": 1
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 VERSION_CONFLICT; 422 INVALID_EMAIL. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Email/SĐT chuẩn hóa, workplace độ dài; không sửa status bằng form.

Bảng: audit_events, candidate_programs, candidates, cohorts, decisions, majors. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Toàn bộ trường cá nhân/đào tạo API-09; 3 field sửa/version. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Reload giữ giá trị thật; 409 giữ form. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-12 — Nộp đơn gia hạn/tạm dừng

### A. Thông tin

- Phân hệ/trang: m01 trong index.html.
- Nút/thao tác: Đơn xin gia hạn, +đơn, Gửi.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 765](../../js/management.js#L765) `handleSubmitLeaveRequest`.
- Hiện tại: **File bắt buộc; ĐN random; duration text; tên file; chờ Khoa; không tính hạn/duyệt.**

### B. Hành vi

Chọn loại, start/end, reason, file → upload → POST change → refresh m01/m12/dashboard; deadline chỉ đổi sau QĐ.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Mã, id, type, duration/date, reason, status, next Actor, attachments.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-leave-request và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, reason, startDate, endDate, proposedSupervisorId, newTitleVi, newTitleEn, destinationUnitId, attachmentIds, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-13, API-12 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, decisions, files, notification_outbox, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
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
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-12: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2319 | select leave-type-select | select/Có | Gia hạn thời gian đào tạo (Tối đa 12 tháng/lần) Tạm dừng học tập (Nghỉ học tạm thời / Bảo lưu) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2326 | input leave-duration-input | text/Có | Ví dụ: 06 tháng (từ 15/10/2026 đến 15/04/2027) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2330 | textarea leave-reason-input | textarea/Có | Nêu rõ lý do học thuật / công tác / sức khỏe và cam kết hoàn thành... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2335 | input leave-file-input | file/Không | .pdf, .doc, .docx | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-13 | POST | /api/candidates/{candidateId}/academic-changes | Gửi yêu cầu thay đổi; NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt |
| API-12 | GET | /api/candidates/{candidateId}/academic-changes | Lịch sử học vụ/biến động; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-13:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DUPLICATE_PENDING_REQUEST; 422 INVALID_DATE_RANGE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Táchdurationtextthànhdates; 12 tháng/lần là nhãn cần chốt.

Bảng: academic_change_requests, audit_events, decisions, files, notification_outbox, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Mã, id, type, duration/date, reason, status, next Actor, attachments. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Bytefile thật; submit không tự gia hạn. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-13 — Tải hồ sơ và từng tài liệu riêng

### A. Thông tin

- Phân hệ/trang: m01–m12 trong index.html.
- Nút/thao tác: PDF hồ sơ, File đơn, khung CTĐT, essay/minutes/outline/topic/report/version/QĐ/nghị quyết/giấy TV.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 364, 582, 605, 1030–1064, 1081–1139, 1215–1251, 1446–1462, 1484, 1560, 1691–1692, 1766–1796.
- Hiện tại: **Hầu hết alert; File đơn renderer cũngalerttên; Minh chứng pub HTML bị renderer thay mất.**

### B. Hành vi

File có sẵn → GET content; hồ sơ tổng hợp/sổ topic → export job → poll → download. File missing hiển thị chưa có.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Binary, MIME, name; manifest/nội dung thiếu cho bộ hồ sơ.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: reportType, format, filters, asOf. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-66, API-61, API-62 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, export_jobs, file_links, files. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| reportType | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| format | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| filters | object | Có | Type/độ dài/allowlist; không HTML tùy ý | API-61: payload UI |
| asOf | date ISO | Có | ISOdate thật; range theo lịch | API-61: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-61 | POST | /api/report-exports | Xuất báo cáo/hồ sơ; PDT, KHOA, BGH theo loại/scope; NCS hồ sơ mình; NHD cần chốt |
| API-62 | GET | /api/report-exports/{exportId} | Trạng thái/file xuất; Người yêu cầu hoặc người được cấp quyền |

Mẫu request API-61:

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

Mẫu response:

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

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 FORMAT_NOT_SUPPORTED; 409 TEMPLATE_NOT_CONFIGURED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

File ACL theo hồ sơ; không lấy filename làm objectkey; phản biện kín ACL riêng.

Bảng: audit_events, export_jobs, file_links, files. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Binary, MIME, name; manifest/nội dung thiếu cho bộ hồ sơ. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Mỗi nút tải đúng byte hoặc báo chưa có, không alert đã tải. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-14 — Khung chương trình/kế hoạch học kỳ

### A. Thông tin

- Phân hệ/trang: m02 trong index.html.
- Nút/thao tác: 90 TC, 68/65%, 6 HK.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 592–735; [js/management.js: 815](../../js/management.js#L815) `renderPlanStatusUI`.
- Hiện tại: **Content và progress tĩnh; badge planStage thật cục bộ; 12 TCm02 khác 24 dashboard/checklist.**

### B. Hành vi

GET program+plan → block credits/milestones/progress/review status.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Total/blockrequired-earned/exemption, file khung; milestone/actual-expected-delta/reviews.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-15, API-16 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidate_programs, course_results, decisions, plan_milestones, program_requirements, program_versions, training_plans, workflow_reviews.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-15 | GET | /api/candidates/{candidateId}/program | Khung CTĐT và miễn bổ sung; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-16 | GET | /api/candidates/{candidateId}/training-plan | Kế hoạch và đối chiếu; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-15:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Baseline bản duyệt, công thức chưa có không cộng% tùy ý.

Bảng: candidate_programs, course_results, decisions, plan_milestones, program_requirements, program_versions, training_plans, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Total/blockrequired-earned/exemption, file khung; milestone/actual-expected-delta/reviews. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Các số cùng program/rule, không tự hiện miễn trừ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-15 — Lập/điều chỉnh kế hoạch và thêm mốc

### A. Thông tin

- Phân hệ/trang: m02 trong index.html.
- Nút/thao tác: Lập/Điều chỉnh, +Thêm mốc, Gửi.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2642–2670.
- Hiện tại: **Genericvaluesfield_N, 100 workflow; reset planStage 0, không sửa bảng mốc.**

### B. Hành vi

Chọn HK, due, content, expectedOutput → POST revision; milestoneId phân biệt thêm/sửa; reload plan.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Revision/milestone, status await NHD, reviews.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-edit-plan và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: milestoneId, semesterId, dueDate, content, expectedOutput, changeReason, baseRevision. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-17, API-16 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, plan_milestones, training_plans, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| milestoneId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-17: payload UI |
| semesterId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-17: payload UI |
| dueDate | date ISO | Có | ISOdate thật; range theo lịch | API-17: payload UI |
| content | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| expectedOutput | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| changeReason | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-17: payload UI |
| baseRevision | integer | Có | Integer>=1; khớp version/revision | API-17: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2646 | select (không name/id) | select/Có | Học kỳ 4 (04/2025 - 10/2025) Học kỳ 5 (10/2025 - 04/2026) Học kỳ 6 (04/2026 - 10/2026) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2654 | input (không name/id) | text/Có | 30/09/2025 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2658 | textarea (không name/id) | textarea/Có | Hoàn thành thí nghiệm thực địa giai đoạn 2, bảo vệ Chuyên đề tiến sĩ 3 và hoàn thiện bài báo gửi tạp chí quốc tế Q 1. | Đọc thực tế ởHiện tại; chưa gửi server |
| 2662 | input (không name/id) | text/Có | 01 Bản thảo bài báo ISI/Scopus + 01 Báo cáo Chuyên đề 3 | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-17 | POST | /api/candidates/{candidateId}/training-plan/revisions | Lập/điều chỉnh/thêm mốc; NCS |
| API-16 | GET | /api/candidates/{candidateId}/training-plan | Kế hoạch và đối chiếu; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-17:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 BASE_REVISION_CHANGED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

ChangeReason đềxuấtô mới; giữ baseline/lịch sử.

Bảng: audit_events, plan_milestones, training_plans, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Revision/milestone, status await NHD, reviews. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Mốc đã lưu hiện sau reload, NHD có hàng chờ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-16 — Duyệt kế hoạch NHD → BM → PDT

### A. Thông tin

- Phân hệ/trang: m02 trong index.html.
- Nút/thao tác: Phê duyệt.
- Vai trò: NHD, BM, PDT; KHOA thấy nút nhưng không bước; scope ở 00.
- File/hàm: [js/management.js: 835](../../js/management.js#L835) `handleApprovePlan`.
- Hiện tại: **Stage 0 → 1 → 2 → 3 cục bộ; KHOArơivàochưađúngluồng; không reject/comment UI.**

### B. Hành vi

Bấm đúng bước → POST review → transaction → next Actor → badge/time line/dashboard.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Status/next Actor/reviewer/time/comment/revision/version.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: action, comment, version, academicYear. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-18, API-16, API-07 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, candidates, notification_outbox, plan_milestones, progress_reports, supervisor_assignments, training_plans, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-18: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-18: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-18: payload UI |
| academicYear | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-07: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-18 | POST | /api/training-plans/{planId}/reviews | Duyệt kế hoạch; NHD → BM → PDT; KHOA không có bước handler |
| API-16 | GET | /api/candidates/{candidateId}/training-plan | Kế hoạch và đối chiếu; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-07 | GET | /api/me/dashboard | Dashboard theo vai trò; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu request API-18:

```json
{
  "action": "approve",
  "comment": "Đồng ý kế hoạch",
  "version": 2
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 WRONG_REVIEW_STAGE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chỉ NHD được giao/BM-PDT scope; reject/return cần chốt.

Bảng: academic_change_requests, audit_events, candidates, notification_outbox, plan_milestones, progress_reports, supervisor_assignments, training_plans, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Status/next Actor/reviewer/time/comment/revision/version. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Sai bước 409/sai hồ sơ 403; duyệt đồng thời chỉ 1 commit. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-17 — Danh sách và hồ sơ NHD

### A. Thông tin

- Phân hệ/trang: m03 trong index.html.
- Nút/thao tác: 3 thẻ quota, bảng, Chi tiết.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 738–834.
- Hiện tại: **HTML max 3/2/1 khác seed 4/3/3; table/select quota không refresh; Chi tiết alert.**

### B. Hành vi

GET supervisors → title/institution/research/count/quota; Chi tiết GET ID.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật CV/publications/assignedcandidates/quotaRuleId.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: q, unitId, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-19, API-20 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_rules, publications, supervisor_assignments, supervisors.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-19: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-19 | GET | /api/supervisors | Danh sách NHD và định mức; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-20 | GET | /api/supervisors/{supervisorId} | Chi tiết NHD; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-19:

```json
{
  "q": "Hướng",
  "unitId": "unit-01",
  "page": 1,
  "pageSize": 20,
  "sort": "name"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Unknown quota phải chốt, không label option thành rule.

Bảng: academic_rules, publications, supervisor_assignments, supervisors. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

CV/publications/assignedcandidates/quotaRuleId. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Phân công xongcounttrue; không lộ NCS ngoài scope. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-18 — Phân công NHD chính/phụ

### A. Thông tin

- Phân hệ/trang: m03 trong index.html.
- Nút/thao tác: Phân công/Ban hành quyết định.
- Vai trò: PDT; scope ở 00.
- File/hàm: [js/management.js: 870](../../js/management.js#L870) `handleAssignSupervisor`.
- Hiện tại: **Set bỏ tên trùng, rồi tăng count; không lưu assignment/QĐ thật; handlerkhông guard role trực tiếp.**

### B. Hành vi

Chọn candidate/main/co/QĐ → POST assignment → reload list/profile/quota.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Assignment ID, main/co, effective date, decision, status, count.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-assign-supervisor và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: mainSupervisorId, coSupervisorId, decisionId, effectiveDate, q, unitId, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-21, API-19, API-09 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidate_programs, candidates, cohorts, decisions, majors, notification_outbox, supervisor_assignments, supervisors. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| mainSupervisorId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| coSupervisorId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-21: payload UI |
| effectiveDate | date ISO | Có | ISOdate thật; range theo lịch | API-21: payload UI |
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-19: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-19: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-19: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2358 | select assign-ncs-select | select/Không | NCS. Nguyễn Văn Bình (Khoa học Môi trường K 2023) NCS. Lê Thị Mai (Trồng trọt K 2022) NCS. Trần Quốc Huy (Khoa học Môi trường K 2024) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2366 | select assign-nhd-main-select | select/Không | GS.TS. Trần Văn Hướng (Đang hướng dẫn 2/3 - Còn 1 chỉ tiêu) PGS.TS. Lê Văn Tuấn (Đang hướng dẫn 2/2) TS. Nguyễn Hải Nam (Đang hướng dẫn 1/1) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2374 | select assign-nhd-sub-select | select/Không | Không có NHD phụ PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2382 | input assign-decision-input | text/Có | 450/QĐ-ĐHAG | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-21 | POST | /api/candidates/{candidateId}/supervisor-assignments | Phân công NHD; PDT |
| API-19 | GET | /api/supervisors | Danh sách NHD và định mức; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-09 | GET | /api/candidates/{candidateId} | Hồ sơ chi tiết; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-21:

```json
{
  "mainSupervisorId": "sup-01",
  "coSupervisorId": "sup-02",
  "decisionId": "dec-03",
  "effectiveDate": "2026-10-14"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 QUOTA_EXCEEDED; 409 DUPLICATE_ASSIGNMENT; 422 SAME_SUPERVISOR. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Cấmmain=co; QĐ verified; khóa quota, cấp gửi lại không tăng.

Bảng: academic_rules, audit_events, candidate_programs, candidates, cohorts, decisions, majors, notification_outbox, supervisor_assignments, supervisors. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Assignment ID, main/co, effective date, decision, status, count. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Duplicate/đồng thời không vượt quota; quan hệ xuất hiện hồ sơ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-19 — Đổi/bổ sung/rút NHD

### A. Thông tin

- Phân hệ/trang: m03, m12 trong index.html.
- Nút/thao tác: Đề xuất đổi NHD, 3 sub type, new NHD, reason, file.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2680–2720.
- Hiện tại: **Metadata workflow, không assignment/quota; readonlyNHDoldhardcode.**

### B. Hành vi

POST change type=supervisor_change; ý kiến/QĐ sau chốt; chỉ cuối đổi assignment hiệu lực.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Old/proposed supervisor, status/history/decision.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-change-supervisor và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, reason, startDate, endDate, proposedSupervisorId, newTitleVi, newTitleEn, destinationUnitId, attachmentIds, action, comment, decisionId, version, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-13, API-14, API-12 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, candidates, decisions, files, notification_outbox, research_projects, supervisor_assignments, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
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
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-14: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-14: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-14: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-14: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-12: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2683 | select (không name/id) | select/Có | Thay đổi Người hướng dẫn chính Bổ sung thêm Người hướng dẫn 2 (Đồng hướng dẫn) Rút tên Người hướng dẫn phụ | Đọc thực tế ởHiện tại; chưa gửi server |
| 2692 | input (không name/id) | text/Không | GS.TS. Trần Văn Hướng | Readonly/server tự lấy |
| 2696 | select (không name/id) | select/Có | PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) PGS.TS. Nguyễn Thị Kim (ĐH An Giang) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2705 | textarea (không name/id) | textarea/Có | Nêu rõ lý do học thuật, sức khỏe hoặc điều chỉnh chuyên sâu phạm vi đề tài... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2710 | input (không name/id) | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-13 | POST | /api/candidates/{candidateId}/academic-changes | Gửi yêu cầu thay đổi; NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt |
| API-14 | POST | /api/academic-changes/{changeId}/reviews | Thẩm tra/ban hành biến động; KHOA, PDT, BGH theo bước; NHD góp ý nếu quy trình chốt |
| API-12 | GET | /api/candidates/{candidateId}/academic-changes | Lịch sử học vụ/biến động; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-13:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DUPLICATE_PENDING_REQUEST; 422 INVALID_DATE_RANGE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chốtgóp ýold/new, quota tại ban hành; không đổi ngay submit.

Bảng: academic_change_requests, audit_events, candidates, decisions, files, notification_outbox, research_projects, supervisor_assignments, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Old/proposed supervisor, status/history/decision. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Giữ phân công cũ có from/to, cập nhật quota cả 2 phía. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-20 — Bảng điểm, GPA và miễn bổ sung

### A. Thông tin

- Phân hệ/trang: m04 trong index.html.
- Nút/thao tác: 4 course completed, ENV 809; 3 metric.
- Vai trò: NCS, PDT theoROLE_MODULES; scope ở 00.
- File/hàm: index.html: 839–970.
- Hiện tại: **Điểm/GPA 8.85/3.65/miễn bổ sung tĩnh; không hàm tính GPA.**

### B. Hành vi

GET courses+program → render điểm score/letter/credits/status/exemption.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Process/exam/final/letter/GPA 10/GPA 4, required-earned.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-22, API-15 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidate_programs, course_offerings, course_registrations, course_results, courses, decisions, program_requirements, program_versions.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-22: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-22 | GET | /api/candidates/{candidateId}/courses | Học phần/điểm/tổng hợp; NCS, PDT theo ROLE_MODULES; vai trò khác cần chốt |
| API-15 | GET | /api/candidates/{candidateId}/program | Khung CTĐT và miễn bổ sung; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-22:

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "code"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

30/70 có trong label, vídụ; chuyển hệ 4/làm tròn/học lại cần chốt.

Bảng: candidate_programs, course_offerings, course_registrations, course_results, courses, decisions, program_requirements, program_versions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Process/exam/final/letter/GPA 10/GPA 4, required-earned. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Điểm/GPA nhấtquán, missing khác 0, exemption có QĐ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-21 — Đăng ký/hủy ENV 809

### A. Thông tin

- Phân hệ/trang: m04 trong index.html.
- Nút/thao tác: +Đăng ký ↔ Hủy.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 902](../../js/management.js#L902) `handleToggleCourse`.
- Hiện tại: **Set registeredCourses, đổi text/class giữ reload; không kỳ/tiên quyết/quyền handler.**

### B. Hành vi

POST offeringID → registrationID; cancel DELETE registration → reload.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Status/registerAllowed/cancelAllowed/reason Disabled.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: courseOfferingId, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-23, API-24, API-22 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, course_offerings, course_registrations, course_results, courses, program_requirements. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| courseOfferingId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-23: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-22: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-23 | POST | /api/candidates/{candidateId}/course-registrations | Đăng ký học phần; NCS |
| API-24 | DELETE | /api/course-registrations/{registrationId} | Hủy đăng ký; NCS chính mình |
| API-22 | GET | /api/candidates/{candidateId}/courses | Học phần/điểm/tổng hợp; NCS, PDT theo ROLE_MODULES; vai trò khác cần chốt |

Mẫu request API-23:

```json
{
  "courseOfferingId": "off-env809"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 ALREADY_REGISTERED; 409 REGISTRATION_CLOSED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Code không đủ khóa khi course nhiều kỳ; không hủy sau biên chốt.

Bảng: audit_events, course_offerings, course_registrations, course_results, courses, program_requirements. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Status/registerAllowed/cancelAllowed/reason Disabled. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Duplicate/ngoài kỳ bị chặn, đổi UI sau API thành công. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-22 — Đồng bộ bảng điểm

### A. Thông tin

- Phân hệ/trang: m04 trong index.html.
- Nút/thao tác: Đồng bộ.
- Vai trò: PDT trên UI; scope ở 00.
- File/hàm: index.html: 846.
- Hiện tại: **Chỉ alert đã cập nhật, không nguồn điểm/import.**

### B. Hành vi

Tạo jobs → poll → reload courses vàbáolỗi dòng.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Job/updatedRows/errors/điểm mới.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: candidateId, source, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-25, API-26, API-22 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, course_offerings, course_registrations, course_results, courses, integration_jobs, program_requirements. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| candidateId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-25: payload UI |
| source | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-25: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-22: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-22: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-25 | POST | /api/course-sync-jobs | Đồng bộ bảng điểm; PDT |
| API-26 | GET | /api/course-sync-jobs/{jobId} | Kết quả đồng bộ; PDT |
| API-22 | GET | /api/candidates/{candidateId}/courses | Học phần/điểm/tổng hợp; NCS, PDT theo ROLE_MODULES; vai trò khác cần chốt |

Mẫu request API-25:

```json
{
  "candidateId": "ncs-01",
  "source": "graduate_training"
}
```

Mẫu response:

```json
{
  "data": {
    "id": "sync-01",
    "status": "queued"
  },
  "requestId": "req-01"
}
```

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 503 GRADE_SOURCE_UNAVAILABLE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chốtnguồn/map mã/ghi đèđiểm; không giả đã kết nối.

Bảng: audit_events, course_offerings, course_registrations, course_results, courses, integration_jobs, program_requirements. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Job/updatedRows/errors/điểm mới. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

503 khi chưa cấu hình; failed không đã thành công. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-23 — Nộp tiểu luận tổng quan

### A. Thông tin

- Phân hệ/trang: m05 trong index.html.
- Nút/thao tác: Nộp Tiểu luận, title/summary/PDF.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2730–2752.
- Hiện tại: **Lưu metadata; không đổi essayResult/title HTML.**

### B. Hành vi

Upload PDF → POST type essay → GET submissions chờ đánh giá.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Submission ID/title/summary/revision/status/file/time.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-submit-essay và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, title, summary, researchObject, methodology, fileId, explanationFileId. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-28, API-27 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, decisions, files, notification_outbox, research_submissions, submission_evaluations. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| type | string hoặc null | Có | Enumallowlist/quyền/transition | API-28: payload UI |
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| summary | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| researchObject | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| methodology | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |
| explanationFileId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2733 | input (không name/id) | text/Có | Tổng quan các giải pháp sinh học xử lý nước thải chăn nuôi lợn tại vùng Mekong | Đọc thực tế ởHiện tại; chưa gửi server |
| 2737 | textarea (không name/id) | textarea/Có | Tiểu luận phân tích và tổng hợp 68 công trình nghiên cứu về công nghệ màng sinh học, thực vật thủy sinh và giải pháp kinh tế tuần hoàn trong xử lý nước thải chăn nuôi lợn quy mô trang trại... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2742 | input (không name/id) | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-28 | POST | /api/candidates/{candidateId}/research-submissions | Nộp tiểu luận/đề cương; NCS |
| API-27 | GET | /api/candidates/{candidateId}/research-submissions | Tiểu luận và đề cương; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-28:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 REQUIRED_ATTACHMENT_MISSING. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Bản nộp mới không giữ đã đạt cũ, kết quảgắnrevision.

Bảng: audit_events, decisions, files, notification_outbox, research_submissions, submission_evaluations. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Submission ID/title/summary/revision/status/file/time. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

NHD/BM thấy nội dungvàbyte file bản mới. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-24 — Nhập điểm tiểu ban tiểu luận

### A. Thông tin

- Phân hệ/trang: m05 trong index.html.
- Nút/thao tác: 3 scores+textarea+submit.
- Vai trò: BM, NHD; scope ở 00.
- File/hàm: [js/management.js: 923](../../js/management.js#L923) `handleGradeEssay`.
- Hiện tại: **TB toFixed 2>=7 pass; textarea không đọc; 3 điểm HTML không cập nhật khi TB đổi.**

### B. Hành vi

Nhập 3 evaluator/score/comment/minutes → POST evaluation → server mean → row/badge/checklist.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Scores/comment/average/result/minutes/actor/time.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-grade-essay và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: scores, comment, minutesFileId, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-29, API-27, API-48 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidates, course_results, decisions, doctoral_topics, files, program_requirements, progress_reports, publications, research_submissions, submission_evaluations. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| scores | array<object> | Có | 3 evaluator khác nhau thuộc roster; mỗi score 0–10 | API-29: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-29: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-29: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-29: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2403 | input essay-score-1 | number/Có | 8.5 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2407 | input essay-score-2 | number/Có | 9.0 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2411 | input essay-score-3 | number/Có | 8.8 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2416 | textarea (không name/id) | textarea/Không | Tiểu luận tổng quan cập nhật đầy đủ các công trình nghiên cứu trong và ngoài nước trong 5 năm gần đây, phương pháp luận rõ ràng, đề tài có tính cấp thiết cao. | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-29 | POST | /api/research-submissions/{submissionId}/evaluations | Chấm tiểu luận; NHD, BM được phân công |
| API-27 | GET | /api/candidates/{candidateId}/research-submissions | Tiểu luận và đề cương; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-29:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 INVALID_SCORE; 409 SUBMISSION_NOT_READY. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

0–10, roster chấm; ngưỡng 7 là demo; chốtđiểmxéttrước/sau làm tròn.

Bảng: academic_rules, audit_events, candidates, course_results, decisions, doctoral_topics, files, program_requirements, progress_reports, publications, research_submissions, submission_evaluations. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Scores/comment/average/result/minutes/actor/time. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

6.99 fail theo rule chốt, comment thật lưu, không guard UI thay ACL. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-25 — Nộp đề cương và giải trình

### A. Thông tin

- Phân hệ/trang: m05 trong index.html.
- Nút/thao tác: Title/object/methodology, 2 PDF.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2762–2798.
- Hiện tại: **Require 2 file; workflow; outlineStatus Chờ duyệt; cardm05 vẫn approved; không handlerduyệt lại.**

### B. Hành vi

Upload 2 PDF → POST outline → submitted; review API 30 sau quyền chốt.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Revision/status/file/explanation/reviews/vote/decision.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-submit-outline và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, title, summary, researchObject, methodology, fileId, explanationFileId, action, comment, minutesFileId, decisionId, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-28, API-30, API-27 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, decisions, files, notification_outbox, research_submissions, submission_evaluations, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| type | string hoặc null | Có | Enumallowlist/quyền/transition | API-28: payload UI |
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| summary | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| researchObject | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| methodology | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-28: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |
| explanationFileId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-28: payload UI |
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-30: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-30: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-30: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-30: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-30: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2765 | input (không name/id) | text/Có | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn và thu hồi năng lượng tái tạo tại vùng ĐBSCL | Đọc thực tế ởHiện tại; chưa gửi server |
| 2770 | input (không name/id) | text/Có | Nước thải chăn nuôi lợn tại An Giang & Cần Thơ | Đọc thực tế ởHiện tại; chưa gửi server |
| 2774 | input (không name/id) | text/Có | Thực nghiệm mô hình lab, màng bio-carrier và phân tích LCA | Đọc thực tế ởHiện tại; chưa gửi server |
| 2780 | input outline-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |
| 2788 | input outline-explanation-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-28 | POST | /api/candidates/{candidateId}/research-submissions | Nộp tiểu luận/đề cương; NCS |
| API-30 | POST | /api/research-submissions/{submissionId}/reviews | Thông qua đề cương; BM, KHOA, PDT theo quyền cần chốt |
| API-27 | GET | /api/candidates/{candidateId}/research-submissions | Tiểu luận và đề cương; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-28:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 REQUIRED_ATTACHMENT_MISSING. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chốtgiải trình lần đầu hay chỉ revision, chữ ký/bỏ phiếu HĐ.

Bảng: audit_events, decisions, files, notification_outbox, research_submissions, submission_evaluations, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Revision/status/file/explanation/reviews/vote/decision. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Nộp bản mới không badge pass cũ, cóđườngreviewapproved. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-26 — Danh sách/tổng kết chuyên đề

### A. Thông tin

- Phân hệ/trang: m06 trong index.html.
- Nút/thao tác: 3 row, 100%, 6 TC, 9.0.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 1071–1156; [js/management.js: 1465](../../js/management.js#L1465) `initManagement`.
- Hiện tại: **Init đổi tên vào strong của ô cells[0], tức nhãn thứ tự; tên ở cells[1] vẫn lấy từ HTML. Điểm/trạng thái từ seed, nhưng các thẻ100% và9.0 chưa được tính lại.**

### B. Hành vi

GET topics render row và summary cùng nguồn, download minutes file ID.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Ordinal/title/credits/NHD/date/score/status; summary count/GPA.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-31 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn doctoral_topics, program_requirements, topic_evaluations.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-31: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-31 | GET | /api/candidates/{candidateId}/doctoral-topics | Danh sách/tổng hợp chuyên đề; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-31:

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "ordinal"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

2–3 hay 3 theo program cần chốt.

Bảng: doctoral_topics, program_requirements, topic_evaluations. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Ordinal/title/credits/NHD/date/score/status; summary count/GPA. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Mutation đổi cả row/summary, không nhầmcolumn. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-27 — Đăng ký chuyên đề

### A. Thông tin

- Phân hệ/trang: m06 trong index.html.
- Nút/thao tác: Ordinal/title/NHD/month/file.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2808–2849.
- Hiện tại: **Đổi topic index có sẵn pending/—; không row 4; file không trong requiredFileWorkflows nên không bắt buộc.**

### B. Hành vi

POST topic/revisiontheomodechốt → reload list/summary.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Topic ID/revision/status/requiredcredits.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-register-topic và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: ordinal, title, supervisorId, expectedReportMonth, fileId, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-32, API-31 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, doctoral_topics, files, program_requirements, topic_evaluations. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| ordinal | integer | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| title | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| supervisorId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-32: payload UI |
| expectedReportMonth | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-32: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-32: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-31: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2811 | select (không name/id) | select/Có | Chuyên đề 1 (2 Tín chỉ) Chuyên đề 2 (2 Tín chỉ) Chuyên đề 3 (2 Tín chỉ) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2819 | input (không name/id) | text/Có | Nhập tên chuyên đề chuyên sâu... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2824 | select (không name/id) | select/Có | GS.TS. Trần Văn Hướng PGS.TS. Lê Văn Tuấn TS. Nguyễn Hải Nam TS. Lê Hoàng Nam | Đọc thực tế ởHiện tại; chưa gửi server |
| 2833 | input (không name/id) | text/Có | Tháng / Năm (Ví dụ: 12/2025) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2839 | input (không name/id) | file/Không | .pdf, .doc, .docx | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-32 | POST | /api/candidates/{candidateId}/doctoral-topics | Đăng ký chuyên đề; NCS |
| API-31 | GET | /api/candidates/{candidateId}/doctoral-topics | Danh sách/tổng hợp chuyên đề; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-32:

```json
{
  "ordinal": 3,
  "title": "Đánh giá vòng đời LCA",
  "supervisorId": "sup-01",
  "expectedReportMonth": "2026-12",
  "fileId": "file-topic"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 TOPIC_EXISTS; 409 YEAR1_REQUIREMENTS_NOT_MET. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Điều kiện năm 1 vàfilemandatorycần chốt; không over write đã đạt.

Bảng: audit_events, doctoral_topics, files, program_requirements, topic_evaluations. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Topic ID/revision/status/requiredcredits. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Uniqueordinal, không mất điểm/lịch sử bản cũ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-28 — Chấm điểm chuyên đề

### A. Thông tin

- Phân hệ/trang: m06 trong index.html.
- Nút/thao tác: 3 button → prompt 0–10.
- Vai trò: BM, NHD; scope ở 00.
- File/hàm: [js/management.js: 956](../../js/management.js#L956) `handleGradeTopic`.
- Hiện tại: **Guard role; toFixed 1; passed kể cả 0; lưu state.**

### B. Hành vi

Score/comment/minutes(UI cần thêm) → POST evaluate → row/summary/checklist.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Score/result/rule/evaluator/time/minutes.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: score, comment, minutesFileId, version, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-33, API-31, API-48 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidates, course_results, doctoral_topics, files, program_requirements, progress_reports, publications, research_submissions, topic_evaluations. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| score | decimal | Có | Số hữu hạn 0–10; ngưỡng đạt theo rule | API-33: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-33: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-33: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-33: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-31: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-31: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-33 | POST | /api/doctoral-topics/{topicId}/evaluations | Chấm chuyên đề; NHD, BM được phân công |
| API-31 | GET | /api/candidates/{candidateId}/doctoral-topics | Danh sách/tổng hợp chuyên đề; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-33:

```json
{
  "score": 8.5,
  "comment": "Đạt yêu cầu",
  "minutesFileId": "file-minutes",
  "version": 1
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 INVALID_SCORE; 409 ALREADY_FINALIZED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Ngưỡng đạt chưa có căn cứ, không suypassedmọi số.

Bảng: academic_rules, audit_events, candidates, course_results, doctoral_topics, files, program_requirements, progress_reports, publications, research_submissions, topic_evaluations. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Score/result/rule/evaluator/time/minutes. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Cancel không gửi, <0/>10 reject, dưới ngưỡng fail. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-29 — Báo cáo, lịch kỳ và cảnh báo

### A. Thông tin

- Phân hệ/trang: m07 trong index.html.
- Nút/thao tác: 4 kỳ bảng, 18 ngày Lê Văn Hải.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 1159–1256; js/management.js: 459–462.
- Hiện tại: **HTML 4 kỳ, seed 6 kỳ pass, form 5/6, dashboard 7; warning 18 ngàyhardcode; initkhônghydratestatusrows.**

### B. Hành vi

GET reports+alerts → lịch kỳ/nội dung/status/files/review/overdue.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Periods/dueAt/summary/comments/files/latest/available/overdueDays.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-34, API-37 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidates, notification_deliveries, progress_reports, report_periods, workflow_reviews.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-34: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-34 | GET | /api/candidates/{candidateId}/progress-reports | Báo cáo và lịch kỳ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-37 | GET | /api/progress-alerts | Cảnh báo quá hạn; NHD, BM, KHOA, PDT theo scope |

Mẫu query API-34:

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "periodNumber"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Latest theo ngày/lịch, bỏ slice(-1); không bỏ kỳ chưa nộp.

Bảng: candidates, notification_deliveries, progress_reports, report_periods, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Periods/dueAt/summary/comments/files/latest/available/overdueDays. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Kỳ 7 khi theo lịch sẽ có available; ngày quá hạn cập nhật theo asOf. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-30 — Nộp báo cáo tiến độ

### A. Thông tin

- Phân hệ/trang: m07 trong index.html.
- Nút/thao tác: Kỳ 5/6, nội dung, khó khăn, nextplan, PDF.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2859–2898.
- Hiện tại: **Workflow; find period đổi pending; không thêm kỳ 7/row mới; readonly date 29/09 tĩnh.**

### B. Hành vi

Chọn periodID thật → nhập fields → upload → POST report → refresh.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Report ID/revision/status/submittedAt server/files.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-submit-progress và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: periodId, summary, difficulties, nextPlan, fileId, page, pageSize, sort, academicYear. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-35, API-34, API-07 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, candidates, files, notification_outbox, progress_reports, report_periods, supervisor_assignments, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| periodId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-35: payload UI |
| summary | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| difficulties | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| nextPlan | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-35: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-35: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-34: query UI |
| academicYear | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-07: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2863 | select (không name/id) | select/Có | Kỳ 5 (10/2025 - 04/2026) Kỳ 6 (04/2026 - 10/2026) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2870 | input (không name/id) | text/Không | 29/09/2026 | Readonly/server tự lấy |
| 2874 | textarea (không name/id) | textarea/Có | Đã hoàn thành toàn bộ thí nghiệm tại hiện trường An Giang và thu thập 120 mẫu nước thải; đã công bố thành công 01 bài báo trên Tạp chí WoS Q 1; đang tiến hành viết chương 3 và chương 4 của bản thảo luận án. | Đọc thực tế ởHiện tại; chưa gửi server |
| 2878 | input (không name/id) | text/Không | Cần thêm hóa chất tinh khiết phân tích HPLC tại phòng thí nghiệm trung tâm. | Đọc thực tế ởHiện tại; chưa gửi server |
| 2882 | input (không name/id) | text/Có | Hoàn thiện toàn văn bản thảo luận án để gửi Bộ môn và NHD duyệt trước ngày 15/02/2027. | Đọc thực tế ởHiện tại; chưa gửi server |
| 2887 | input progress-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-35 | POST | /api/candidates/{candidateId}/progress-reports | Nộp báo cáo; NCS |
| API-34 | GET | /api/candidates/{candidateId}/progress-reports | Báo cáo và lịch kỳ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-07 | GET | /api/me/dashboard | Dashboard theo vai trò; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu request API-35:

```json
{
  "periodId": "period-07",
  "summary": "Đã thu thập mẫu",
  "difficulties": "Thiếu vật tư",
  "nextPlan": "Hoàn thiện bản thảo",
  "fileId": "file-report"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 PERIOD_CLOSED; 409 DUPLICATE_REPORT. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Re submit giữ bản cũ, không tự duyệt; date client không nguồn tin.

Bảng: academic_change_requests, audit_events, candidates, files, notification_outbox, progress_reports, report_periods, supervisor_assignments, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Report ID/revision/status/submittedAt server/files. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Thiết bị khác thấy PDF/nội dung/kỳ, status đúng. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-31 — Đánh giá báo cáo

### A. Thông tin

- Phân hệ/trang: m07 trong index.html.
- Nút/thao tác: 4 nút Đạt; không nút Không đạt.
- Vai trò: NHD, BM trên UI; scope ở 00.
- File/hàm: [js/management.js: 987](../../js/management.js#L987) `handleGradeProgressReport`.
- Hiện tại: **State period/result badge; audit; không comment, toastnóiđã lưu comment; không guard role trực tiếp.**

### B. Hành vi

Thêm UI comment/result → POST review đúng report → NCS nhận kết luận.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Result/comment/reviewedBy/At/version.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: result, comment, version, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-36, API-34, API-48 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidates, course_results, doctoral_topics, notification_outbox, program_requirements, progress_reports, publications, report_periods, research_submissions, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| result | string hoặc null | Có | Enumallowlist/quyền/transition | API-36: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-36: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-36: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-34: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-34: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-36 | POST | /api/progress-reports/{reportId}/reviews | Đánh giá báo cáo; NHD, BM theo bước cần chốt |
| API-34 | GET | /api/candidates/{candidateId}/progress-reports | Báo cáo và lịch kỳ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-36:

```json
{
  "result": "pass",
  "comment": "Đạt tiến độ",
  "version": 1
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 REPORT_NOT_SUBMITTED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

ChốtBMxác nhận hay cùng chấm 1 bước; không tự thêm bước.

Bảng: academic_rules, audit_events, candidates, course_results, doctoral_topics, notification_outbox, program_requirements, progress_reports, publications, report_periods, research_submissions, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Result/comment/reviewedBy/At/version. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Chưa nộp 409, không đạt cần lý do, sai scope 403. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-32 — Gửi email cảnh báo/nhắc nhở ngay

### A. Thông tin

- Phân hệ/trang: m07 trong index.html.
- Nút/thao tác: Cảnh báo quá hạn; Nhắc ngay.
- Vai trò: NHD, PDT trên UI; scope ở 00.
- File/hàm: index.html: 1169, 1185.
- Hiện tại: **Alert đã gửi 02 NCS hoặc Lê Văn Hải/NHD; không mailthật.**

### B. Hành vi

GET alerts → POST reminder đúng scope → polljob → sent/failure.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Job/recipientcount/sent/failed/errors.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: page, pageSize, sort, alertIds, channel. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-37, API-38, API-39 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, candidates, notification_deliveries, notification_outbox, progress_reports, report_periods. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-37: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-37: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-37: query UI |
| alertIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-38: payload UI |
| channel | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-38: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-37 | GET | /api/progress-alerts | Cảnh báo quá hạn; NHD, BM, KHOA, PDT theo scope |
| API-38 | POST | /api/progress-reminders | Gửi nhắc hạn; NHD, PDT |
| API-39 | GET | /api/notification-jobs/{jobId} | Kết quả gửi nhắc; Người tạo job có quyền |

Mẫu request API-38:

```json
{
  "alertIds": [
    "alert-01"
  ],
  "channel": "email"
}
```

Mẫu response:

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

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 REMINDER_COOLDOWN; 503 EMAIL_NOT_CONFIGURED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Email/recipientsserver, cooldown, chưa nộp kỳ hiện hành.

Bảng: audit_events, candidates, notification_deliveries, notification_outbox, progress_reports, report_periods. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Job/recipientcount/sent/failed/errors. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Không gửitênhardcode, queued khác sent, lỗi cấu hình báo đúng. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-33 — Khai báo và danh sách công bố

### A. Thông tin

- Phân hệ/trang: m08 trong index.html.
- Nút/thao tác: Khai báo/title/journal/category/DOI/ISSN/file.
- Vai trò: NCS tạo, đọc theo scope; scope ở 00.
- File/hàm: [js/management.js: 1052](../../js/management.js#L1052) `handleDeclarePublication`; [js/management.js: 1009](../../js/management.js#L1009) `renderPublicationsTable`.
- Hiện tại: **RequireDOIregex/file; ISSN không đọc, author first cố định; verified false/score 0; tổng score từ verified; renderer thay tbody.**

### B. Hành vi

POST publication và file ID → list/summary/dashboard; role/affiliation fields cần bổ sung.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật All publication fields, evidence, verifiedcount/score total/eligible.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-declare-pub và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: title, journal, category, doi, issn, authorRole, affiliation, contributionPercent, fileIds, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-41, API-40 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, files, notification_outbox, publication_authors, publication_reviews, publications. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
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
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-40: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2437 | input pub-title-input | text/Có | Nhập tên bài báo tiếng Anh hoặc tiếng Việt... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2441 | input pub-journal-input | text/Có | Ví dụ: Water Science and Technology | Đọc thực tế ởHiện tại; chưa gửi server |
| 2445 | select pub-cat-select | select/Có | WoS (SCIE / SSCI) · Q 1 WoS (SCIE / SSCI) · Q 2 Scopus · Q 2 Scopus · Q 3 / Q 4 Tạp chí uy tín thuộc danh mục HĐGSNN (>= 0.75 đ) | Đọc thực tế ởHiện tại; chưa gửi server |
| 2455 | input pub-doi-input | text/Không | 10.1016/j.envsci.2025.109... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2459 | input (không name/id) | text/Không | 0944-1344 | Đọc thực tế ởHiện tại; chưa gửi server |
| 2464 | input pub-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-41 | POST | /api/candidates/{candidateId}/publications | Khai báo công bố; NCS |
| API-40 | GET | /api/candidates/{candidateId}/publications | Công bố và chuẩn đầu ra; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-41:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DUPLICATE_DOI; 422 INVALID_DOI. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

DOI optional với tạp chí HĐGSNN cần chốt; không firstmặcđịnh.

Bảng: academic_rules, audit_events, files, notification_outbox, publication_authors, publication_reviews, publications. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

All publication fields, evidence, verifiedcount/score total/eligible. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

ISSN/role lưu, duplicate DOI bị chặn, badge update. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-34 — Thẩm định công bố

### A. Thông tin

- Phân hệ/trang: m08 trong index.html.
- Nút/thao tác: Nút động Thẩm định → prompt score 0–1.
- Vai trò: NHD, PDT; scope ở 00.
- File/hàm: [js/management.js: 1090](../../js/management.js#L1090) `verifyPublication`.
- Hiện tại: **Guard role; verified true và score prompt; không nguồn WoS/Scopus; NHD/PDT cùng duyệt 1 lần.**

### B. Hành vi

Xem bài/file → decision/score/comment/evidence → POST review → summary/checklist.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Reviewer/source/evidence/score/status/version.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: action, approvedScore, comment, source, evidenceFileId, version, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-42, API-40, API-48 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidates, course_results, doctoral_topics, files, notification_outbox, program_requirements, progress_reports, publication_reviews, publications, research_submissions. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-42: payload UI |
| approvedScore | decimal | Có | 0–1 theo demo; phạm vi thực cần chốt | API-42: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-42: payload UI |
| source | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-42: payload UI |
| evidenceFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-42: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-42: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-40: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-40: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-42 | POST | /api/publications/{publicationId}/reviews | Thẩm định công bố; NHD, PDT theo quy trình chốt |
| API-40 | GET | /api/candidates/{candidateId}/publications | Công bố và chuẩn đầu ra; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-42:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 403 SELF_REVIEW_FORBIDDEN; 409 WRONG_STAGE; 422 INVALID_PUBLICATION_SCORE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Sơ đồ hai cấp≠handler 1 bước, cần chốt; không tự duyệt user nhiều role.

Bảng: academic_rules, audit_events, candidates, course_results, doctoral_topics, files, notification_outbox, program_requirements, progress_reports, publication_reviews, publications, research_submissions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Reviewer/source/evidence/score/status/version. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

NCS 403, điểm nguồn thật lưu, không doublecount. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-35 — Sơ đồ thẩm định công bố

### A. Thông tin

- Phân hệ/trang: m08 trong index.html.
- Nút/thao tác: Modal 4 bước.
- Vai trò: NHD, PDT; scope ở 00.
- File/hàm: index.html: 2479–2527; [js/management.js: 706](../../js/management.js#L706) `openModal`.
- Hiện tại: **Chỉ nội dung NCS → NHD → PDT → 02 bài; không transition.**

### B. Hành vi

Mở/đóng đọc sơ đồ; reviews thật từ API-40.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-workflow-pub và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

02 bài khác 0.75 score, cần chốt.

### F. Đầu ra

Nội dung tĩnh chưa được xác nhận. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Mở modal không đồngnghĩaduyệt. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-36 — Đề tài và phiên bản luận án

### A. Thông tin

- Phân hệ/trang: m09 trong index.html.
- Nút/thao tác: Tên VI/EN, QĐ, lĩnh vực, NHD, v 1/v 2/v 3.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 1335–1467.
- Hiện tại: **Tên/bảng/14%/NHD kýhardcode; stateapprovalkhônghydrateđầy đủ sau reload.**

### B. Hành vi

GET thesis → project/versions/approval/check; download file ID.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật TitleVI/EN, decision, NHD; label/stage/date/size/note/locked/file.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-43, API-66 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn audit_events, defense_approvals, file_links, files, research_projects, similarity_checks, theses, thesis_versions.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-43 | GET | /api/candidates/{candidateId}/thesis | Đề tài và phiên bản luận án; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-43:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Approval/similarity cùng versionhash, không 14%khi chưa quét.

Bảng: audit_events, defense_approvals, file_links, files, research_projects, similarity_checks, theses, thesis_versions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

TitleVI/EN, decision, NHD; label/stage/date/size/note/locked/file. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Chưa có check/approval không render đã đạt. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-37 — Đề nghị đổi tên đề tài

### A. Thông tin

- Phân hệ/trang: m09, m12 trong index.html.
- Nút/thao tác: Tên cũ/mới VI/EN, lý do, PDF.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2908–2938.
- Hiện tại: **Workflow metadata, không đổi project/table BD.**

### B. Hành vi

POST change type=title_change → review/QĐ → cập nhật title history.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật RequestID/status/old-newtitles/decision/effectivedate.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-change-topic-title và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, reason, startDate, endDate, proposedSupervisorId, newTitleVi, newTitleEn, destinationUnitId, attachmentIds, action, comment, decisionId, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-13, API-14, API-43 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, candidates, decisions, defense_approvals, files, notification_outbox, research_projects, similarity_checks, supervisor_assignments, theses, thesis_versions, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
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
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-14: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-14: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-14: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-14: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2911 | textarea (không name/id) | textarea/Không | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn tại vùng ĐBSCL | Readonly/server tự lấy |
| 2915 | textarea (không name/id) | textarea/Có | Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn và thu hồi năng lượng tái tạo tại vùng Đồng bằng sông Cửu Long | Đọc thực tế ởHiện tại; chưa gửi server |
| 2919 | textarea (không name/id) | textarea/Có | Research on integrated biotechnological solutions for piggery wastewater treatment and renewable energy recovery in the Mekong Delta region | Đọc thực tế ởHiện tại; chưa gửi server |
| 2923 | textarea (không name/id) | textarea/Có | Bổ sung phần thu hồi năng lượng sinh học nhằm phản ánh chính xác kết quả thực nghiệm và tăng tính ứng dụng thực tiễn của luận án. | Đọc thực tế ởHiện tại; chưa gửi server |
| 2928 | input change-title-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-13 | POST | /api/candidates/{candidateId}/academic-changes | Gửi yêu cầu thay đổi; NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt |
| API-14 | POST | /api/academic-changes/{changeId}/reviews | Thẩm tra/ban hành biến động; KHOA, PDT, BGH theo bước; NHD góp ý nếu quy trình chốt |
| API-43 | GET | /api/candidates/{candidateId}/thesis | Đề tài và phiên bản luận án; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-13:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DUPLICATE_PENDING_REQUEST; 422 INVALID_DATE_RANGE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Oldtitleserversuyra, không tin readonly; không đổiởsubmit.

Bảng: academic_change_requests, audit_events, candidates, decisions, defense_approvals, files, notification_outbox, research_projects, similarity_checks, supervisor_assignments, theses, thesis_versions, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

RequestID/status/old-newtitles/decision/effectivedate. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Sau QĐ title public/thesis đồng bộ, lịch sử cũ giữ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-38 — Upload phiên bản luận án

### A. Thông tin

- Phân hệ/trang: m09 trong index.html.
- Nút/thao tác: Nútlớnmodal; nút+nhỏdòng 1424 alert.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2948–2974.
- Hiện tại: **Chọnlabelv 3.1/v 3.0/v 2.0, note, PDF; workflow không thêm versions.**

### B. Hành vi

Chọn stage/note/PDF → upload → POST version → reload history; nút nhỏnốicùngmodal.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật ID/label/stage/note/size/file/time/signoffaffected.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-upload-thesis-version và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: stage, changeNote, fileId, baseVersionId. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-44, API-43 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, defense_approvals, files, research_projects, similarity_checks, theses, thesis_versions. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| stage | string hoặc null | Có | Enumallowlist/quyền/transition | API-44: payload UI |
| changeNote | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-44: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-44: payload UI |
| baseVersionId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-44: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2951 | select (không name/id) | select/Có | v 3.1 - Bản chỉnh sửa hoàn thiện sau bảo vệ chính thức v 3.0 - Bản bảo vệ chính thức cấp Trường v 2.0 - Bản gửi Phản biện độc lập | Đọc thực tế ởHiện tại; chưa gửi server |
| 2959 | textarea (không name/id) | textarea/Có | Mô tả tóm tắt nội dung chỉnh sửa so với phiên bản trước... | Đọc thực tế ởHiện tại; chưa gửi server |
| 2964 | input thesis-file-input | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-44 | POST | /api/candidates/{candidateId}/thesis-versions | Nộp phiên bản luận án; NCS |
| API-43 | GET | /api/candidates/{candidateId}/thesis | Đề tài và phiên bản luận án; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-44:

```json
{
  "stage": "school_defense",
  "changeNote": "Tiếp thu góp ý",
  "fileId": "file-thesis",
  "baseVersionId": "ver-01"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 VERSION_LOCKED; 409 BASE_VERSION_CHANGED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Label server, giữbyte cũ; chốtlock/bảo vệ hồ sơ.

Bảng: audit_events, defense_approvals, files, research_projects, similarity_checks, theses, thesis_versions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

ID/label/stage/note/size/file/time/signoffaffected. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Bản mới tải thật, không over write bản đã khóa. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-39 — Kiểm tra tương đồng Turnitin

### A. Thông tin

- Phân hệ/trang: m09 trong index.html.
- Nút/thao tác: Quét Turnitin.
- Vai trò: PDT; scope ở 00.
- File/hàm: [js/management.js: 1184](../../js/management.js#L1184) `handleRunTurnitin`.
- Hiện tại: **Báo chưa kết nối, đổi gauge status; 14%HTML vẫn còn; handlerkhôngsinh 14%.**

### B. Hành vi

POST check → pollresult → percentage/report/status; 503 nếu chưa cấu hình.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Provider/status/percentage/report/version/hash/time/threshold.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-45, API-46 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, files, integration_jobs, similarity_checks. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-45 | POST | /api/thesis-versions/{versionId}/similarity-checks | Yêu cầu kiểm tra tương đồng; PDT |
| API-46 | GET | /api/similarity-checks/{checkId} | Kết quả tương đồng; PDT; NCS/NHD theo hồ sơ |

Mẫu request API-45:

```json
{}
```

Mẫu response:

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

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 503 SIMILARITY_PROVIDER_NOT_CONFIGURED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

APA 100%/không đạovănkhôngsuytừpercentage.

Bảng: audit_events, files, integration_jobs, similarity_checks. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Provider/status/percentage/report/version/hash/time/threshold. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

503 không đã đạt, đổi bản không dùng kết quả cũ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-40 — NHD đồng ý bảo vệ

### A. Thông tin

- Phân hệ/trang: m09 trong index.html.
- Nút/thao tác: NHD Ký số.
- Vai trò: NHD; scope ở 00.
- File/hàm: [js/management.js: 1195](../../js/management.js#L1195) `handleSignDefenseApproval`.
- Hiện tại: **SignedAt/By localStorage, badge ký số; không chứng thư/file ký.**

### B. Hành vi

Xem đúng version/nhận xét → POST approval; dịch vụ ký thật cần chốt riêng.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Signoff/version/actor/time/review File/signatureStatus.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: comment, reviewFileId, signatureEvidenceId, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-47, API-43 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, defense_approvals, files, notification_outbox, research_projects, similarity_checks, theses, thesis_versions. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-47: payload UI |
| reviewFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-47: payload UI |
| signatureEvidenceId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-47: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-47: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-47 | POST | /api/thesis-versions/{versionId}/defense-approvals | NHD đồng ý bảo vệ; NHD đang phân công |
| API-43 | GET | /api/candidates/{candidateId}/thesis | Đề tài và phiên bản luận án; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-47:

```json
{
  "comment": "Đồng ý cho bảo vệ",
  "reviewFileId": "file-review",
  "signatureEvidenceId": null,
  "version": 1
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 STALE_THESIS_VERSION. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Timestamp không ký số, NHD phân công thật.

Bảng: audit_events, defense_approvals, files, notification_outbox, research_projects, similarity_checks, theses, thesis_versions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Signoff/version/actor/time/review File/signatureStatus. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Đổi bản thu hồi hoặc duyệt lại theo policy, badge đúng signatureStatus. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-41 — Checklist điều kiện bảo vệ

### A. Thông tin

- Phân hệ/trang: m10 trong index.html.
- Nút/thao tác: 6 card, badge passedCount/6.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: [js/management.js: 1116](../../js/management.js#L1116) `renderDefenseChecklistUI`.
- Hiện tại: **hpCond=essay>=7 nhưng label 24/24; outline 3 topics, sum verified>=.75, report mảng cuối pass, months<=max. Không kiểm credits/ngoại ngữ/seminar/signoff/similarity.**

### B. Hành vi

GET eligibility, sau điểm/pub/report/hạn reload; backend kiểm lại trong transition.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Items/key/status/actual/required/evidence/reason, eligible/ruleVersion.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-48 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_rules, candidates, course_results, doctoral_topics, program_requirements, progress_reports, publications, research_submissions.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-48 | GET | /api/candidates/{candidateId}/defense-eligibility | Checklist bảo vệ; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu query API-48:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Unknown không pass; chốtbộđiều kiện chung khác demo.

Bảng: academic_rules, candidates, course_results, doctoral_topics, program_requirements, progress_reports, publications, research_submissions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Items/key/status/actual/required/evidence/reason, eligible/ruleVersion. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Essaypass không tự 24 TC, kỳ chưa nộp không đạt. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-42 — Phản biện kín, công khai và hội đồng

### A. Thông tin

- Phân hệ/trang: m10 trong index.html.
- Nút/thao tác: 2 PB, 30 ngày, 7 member, 7 phiếu 9.4; QĐ/nghị quyết.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 1498–1628.
- Hiện tại: **Toàn bảng/mốc/kết quả tĩnh; không lập hội đồng/gửi PB/seminar UI.**

### B. Hành vi

GET defense ACL → render review/public/schedule/member/vote → file download.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Codeanonymized/conclusion, noticeelapsed/schedule/venue, council/decision/vote.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-49, API-66 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn audit_events, council_members, council_votes, councils, defenses, file_links, files, independent_reviews, public_notices, seminars.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-49 | GET | /api/candidates/{candidateId}/defense | Hội đồng/phản biện/công khai/kết quả; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-49:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

ẨnidentityPBkhỏi NCS; 3 PB table khác 2 PB sơ đồ.

Bảng: audit_events, council_members, council_votes, councils, defenses, file_links, files, independent_reviews, public_notices, seminars. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Codeanonymized/conclusion, noticeelapsed/schedule/venue, council/decision/vote. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

30/30 tính thật, người được giao xem đúng hồ sơ. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-43 — Nhập kết quả biểu quyết

### A. Thông tin

- Phân hệ/trang: m10 trong index.html.
- Nút/thao tác: Promptyes 0–7.
- Vai trò: HOIDONG; scope ở 00.
- File/hàm: [js/management.js: 1212](../../js/management.js#L1212) `handleDefenseVoting`.
- Hiện tại: **Một actor ghi tổng, 7 cố định, >=4 passed; không phiếu riêng/minutes; badgekhônghydrate.**

### B. Hành vi

POST tổng 50 hoặc phương án phiếu cá nhân 51 sau quyết định; GET defense.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Yes/total/presence/result/score/minutes/resolution.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: yesVotes, totalVotes, minutesFileId, resolutionFileId, version, vote, score, comment, fileId. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-50, API-51, API-49 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, council_members, council_votes, councils, defenses, files, independent_reviews, public_notices, seminars. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| yesVotes | integer | Có | Integer; 0<=yes<=total<=số người dự | API-50: payload UI |
| totalVotes | integer | Có | Integer; 0<=yes<=total<=số người dự | API-50: payload UI |
| minutesFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-50: payload UI |
| resolutionFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-50: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-50: payload UI |
| vote | string hoặc null | Có | Type/độ dài/allowlist; không HTML tùy ý | API-51: payload UI |
| score | decimal | Có | Số hữu hạn 0–10; ngưỡng đạt theo rule | API-51: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-51: payload UI |
| fileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-51: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-50 | POST | /api/defenses/{defenseId}/vote-results | Ghi tổng phiếu; HOIDONG được giao và quyền ghi tổng cần chốt |
| API-51 | POST | /api/defenses/{defenseId}/council-votes | Phiếu cá nhân (phương án thay thế); HOIDONG được giao |
| API-49 | GET | /api/candidates/{candidateId}/defense | Hội đồng/phản biện/công khai/kết quả; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-50:

```json
{
  "yesVotes": 7,
  "totalVotes": 7,
  "minutesFileId": "file-minutes",
  "resolutionFileId": "file-resolution",
  "version": 1
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 VOTES_EXCEED_ATTENDANCE; 409 DEFENSE_NOT_HELD. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chọn 1 mô hình, không cộng trùng; ngưỡng/7 người cần chốt.

Bảng: audit_events, council_members, council_votes, councils, defenses, files, independent_reviews, public_notices, seminars. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Yes/total/presence/result/score/minutes/resolution. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Sai scope 403, số phiếu vượt dự 422, duplicate không lần 2. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-44 — Sơ đồ sáu bước bảo vệ

### A. Thông tin

- Phân hệ/trang: m10 trong index.html.
- Nút/thao tác: modal workflow defense.
- Vai trò: TheoROLE_MODULES; scope ở 00.
- File/hàm: index.html: 2530–2588.
- Hiện tại: **Nội dung 5 TS seminar, 6 điều kiện khác checklist, 2 PB 30 ngày làm việc, HĐ 7, public 30, bỏ phiếu kín.**

### B. Hành vi

Mở đọc/đóng; hồ sơ thật theo status API 49, không transitiontừnode.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-workflow-defense và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Không tự biến nội dung modal thành quy trình chuẩn.

### F. Đầu ra

Mô tả chưa xác nhận văn bản gốc. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Mở sơ đồ không tạo QĐ/HĐ/email. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-45 — Công khai và điều phối bảo vệ còn thiếu

### A. Thông tin

- Phân hệ/trang: m10, public trong index.html.
- Nút/thao tác: Chưa nút đăng/lập HĐ/gửi PB/ghi seminar.
- Vai trò: PDT, BM, KHOA, BGH, HĐ theo quyền cần chốt; scope ở 00.
- File/hàm: index.html: 1498–1628, 2530–2588; extracted_doc.txt FR-BV01–05.
- Hiện tại: **Chỉ nội dung/link example.com, không chứng minh API tổ chức đã có.**

### B. Hành vi

API 52 đề xuất publish; sau xác nhận mới đặc tả mutation seminar/PB/HĐ/QĐ/lịch sẽ cần UI riêng.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Notice/file/timestamp/elapsed, scheduleđọc.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: summaryFileId, fullTextFileId, newContributionsFileId, scheduledDefenseAt, q, majorId, page, pageSize, sort, lang. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-52, API-58, API-49 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, candidates, council_members, council_votes, councils, defenses, files, independent_reviews, public_notices, research_projects, seminars. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| summaryFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| fullTextFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| newContributionsFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-52: payload UI |
| scheduledDefenseAt | timestamp ISO | Có | Type/độ dài/allowlist; không HTML tùy ý | API-52: payload UI |
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| majorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-58: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| lang | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-52 | POST | /api/defenses/{defenseId}/public-notices | Đăng công khai luận án; PDT cần chốt |
| API-58 | GET | /api/public/theses | Kho luận án công khai; Công khai |
| API-49 | GET | /api/candidates/{candidateId}/defense | Hội đồng/phản biện/công khai/kết quả; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-52:

```json
{
  "summaryFileId": "file-summary",
  "fullTextFileId": "file-full",
  "newContributionsFileId": "file-contribution",
  "scheduledDefenseAt": "2026-11-15T01:00:00Z"
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 NOT_APPROVED_FOR_PUBLICATION. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không thêm bước duyệt ngoài nguồn, công khai timestamp server.

Bảng: audit_events, candidates, council_members, council_votes, councils, defenses, files, independent_reviews, public_notices, research_projects, seminars. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Notice/file/timestamp/elapsed, scheduleđọc. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Bài public thật/có file; không lùingàyclients. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-46 — Hồ sơ tốt nghiệp/lưu chiểu

### A. Thông tin

- Phân hệ/trang: m11 trong index.html.
- Nút/thao tác: Thẻ bằng, 3 nơi/checklist 4 dòng.
- Vai trò: Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao; scope ở 00.
- File/hàm: index.html: 1633–1722.
- Hiện tại: **Completedhardcode, 30 ngày lưu chiểu, khác báo cáo cũ 3–6 tháng.**

### B. Hành vi

GET graduation → post defense/deposits/verified/checklist/degree.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Receipt/date/file/verified, signatures/finance/archive, degree.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-53, API-66 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_rules, audit_events, defenses, degree_records, deposits, file_links, files, post_defense_submissions.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-53 | GET | /api/candidates/{candidateId}/graduation | Sau bảo vệ/lưu chiểu/bằng; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-53:

```json
{}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chốtnơilưu chiểu/hạn/tài chính; không coiđủbảo vệ=đủ tốt nghiệp.

Bảng: academic_rules, audit_events, defenses, degree_records, deposits, file_links, files, post_defense_submissions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Receipt/date/file/verified, signatures/finance/archive, degree. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Thiếu biên nhận không completed, bằng chỉ khi issued. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-47 — Nộp chỉnh sửa/hồ sơ sau bảo vệ

### A. Thông tin

- Phân hệ/trang: m11 trong index.html.
- Nút/thao tác: 2 PDF, 2 mã biên nhận.
- Vai trò: NCS; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 2984–3016.
- Hiện tại: **Workflow metadata, không deposits/graduation; không verify receipt.**

### B. Hành vi

Upload final/explanation; receiptseparatefields → POST post → review 55 sau chốt.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Submission/deposits/files/status/reviews.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-submit-post-defense và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: thesisFileId, explanationFileId, deposits, action, comment, verifiedDepositIds, version. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-54, API-55, API-53 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, defenses, degree_records, deposits, files, notification_outbox, post_defense_submissions, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| thesisFileId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-54: payload UI |
| explanationFileId | ID opaque | Tùy type/điều kiện | FK tồn tại, đúng scope; file clean/đúng purpose | API-54: payload UI |
| deposits | array<object> | Có | Type/độ dài/allowlist; không HTML tùy ý | API-54: payload UI |
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-55: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-55: payload UI |
| verifiedDepositIds | array<ID> | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-55: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-55: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 2989 | input post-defense-thesis-file | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |
| 2997 | input post-defense-explanation-file | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |
| 3004 | input (không name/id) | text/Có | BN-TV089/2026 (Ngày: 20/01/2026) | Đọc thực tế ởHiện tại; chưa gửi server |
| 3008 | input (không name/id) | text/Có | NL-892/NLV (Ngày: 25/01/2026) | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-54 | POST | /api/candidates/{candidateId}/post-defense-submissions | Nộp hồ sơ sau bảo vệ; NCS |
| API-55 | POST | /api/post-defense-submissions/{submissionId}/reviews | Xác nhận chỉnh sửa/lưu chiểu; HOIDONG/PDT theo quyền cần chốt |
| API-53 | GET | /api/candidates/{candidateId}/graduation | Sau bảo vệ/lưu chiểu/bằng; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-54:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DEFENSE_NOT_PASSED; 422 DEPOSIT_EVIDENCE_REQUIRED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chủ tịch/thư ký/PDT xác nhận theo quy trình chốt; số biên nhận không đủ chứng cứ.

Bảng: academic_rules, audit_events, defenses, degree_records, deposits, files, notification_outbox, post_defense_submissions, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Submission/deposits/files/status/reviews. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

HĐ/PDT xem tải file bản mới, chứng cứ actor thật. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-48 — BGH công nhận học vị/cấp bằng

### A. Thông tin

- Phân hệ/trang: m11 trong index.html.
- Nút/thao tác: BGH Ký QĐ.
- Vai trò: BGH; scope ở 00.
- File/hàm: [js/management.js: 1237](../../js/management.js#L1237) `handleConferDegree`.
- Hiện tại: **6 điều kiện demo, QĐ 128 cố định; không defenseVote/approval/post/deposit, không register.**

### B. Hành vi

Xem graduation/QĐ → POST conferral → server kiểm/sinh sổ → reload public lookup.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Degree ID/code/register/date/decision/status.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: decisionId, version, code, name, page, pageSize. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-56, API-53, API-57 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_rules, audit_events, candidates, decisions, defenses, degree_records, deposits, majors, notification_outbox, post_defense_submissions. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-56: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-56: payload UI |
| code | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| name | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-56 | POST | /api/candidates/{candidateId}/degree-conferrals | Công nhận học vị/cấp bằng; BGH |
| API-53 | GET | /api/candidates/{candidateId}/graduation | Sau bảo vệ/lưu chiểu/bằng; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-57 | GET | /api/public/degrees | Tra cứu văn bằng; Công khai |

Mẫu request API-56:

```json
{
  "decisionId": "dec-degree",
  "version": 1
}
```

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 REQUIREMENTS_NOT_MET; 409 DEGREE_ALREADY_ISSUED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Transactionunique/idempotency, chứng cứ QĐ thật.

Bảng: academic_rules, audit_events, candidates, decisions, defenses, degree_records, deposits, majors, notification_outbox, post_defense_submissions. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Degree ID/code/register/date/decision/status. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Chưa bảo vệ/thiếu lưu chiểu không cấp, mã mới tra cứu đúng. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-49 — Phôi 3D và tra cứu nhanh nội bộ

### A. Thông tin

- Phân hệ/trang: m11, m13 trong index.html.
- Nút/thao tác: Xem Phôi, Mở Console, Tra cứu ngay.
- Vai trò: Theo module, public cho khách; scope ở 00.
- File/hàm: [js/management.js: 1334](../../js/management.js#L1334) `openDegreeLookup`; index.html: 1646, 1834–1840.
- Hiện tại: **Mở phôi chỉ view; quick lookup luônđiềncodekểcảhọtên; default 2026 không khớp register 2025.**

### B. Hành vi

Điều hướng public; map code/name đúng → API-57 → card/chọn bản trùng tên.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Bản register thật; không file xuất 3D.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: code, name, page, pageSize. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-57 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidates, decisions, degree_records, majors.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| code | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| name | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-57 | GET | /api/public/degrees | Tra cứu văn bằng; Công khai |

Mẫu query API-57:

```json
{
  "code": "TS-AGU-2026-089",
  "name": "Nguyễn Văn Bình",
  "page": 1,
  "pageSize": 20
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 LOOKUP_QUERY_REQUIRED; 429 RATE_LIMIT. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không nhận phôi có giá trị pháp lý/blockchain vì label.

Bảng: candidates, decisions, degree_records, majors. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Bản register thật; không file xuất 3D. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Mã sai empty, tênđúngquerykhôngnhầmcode. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-50 — Tạo yêu cầu biến động tổng quát

### A. Thông tin

- Phân hệ/trang: m12 trong index.html.
- Nút/thao tác: 6 type, reason, PDF.
- Vai trò: NCS; withdrawal do PDT khởi tạo cần chốt; scope ở 00.
- File/hàm: [js/management.js: 1341](../../js/management.js#L1341) `handleGenericWorkflowSubmit`; index.html: 3026–3055.
- Hiện tại: **Chỉ workflow, không bảng BD; NCS thấy option buộc thôi học nhưng không ban hành.**

### B. Hành vi

Payload theo type UI cần thêm → POST 13 → review 14.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Request code/type/payload/status/actor/decision/effectivedate.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-create-change-request và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, reason, startDate, endDate, proposedSupervisorId, newTitleVi, newTitleEn, destinationUnitId, attachmentIds, action, comment, decisionId, version, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-13, API-14, API-12 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: academic_change_requests, audit_events, candidates, decisions, files, notification_outbox, research_projects, supervisor_assignments, workflow_reviews. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
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
| action | string hoặc null | Có | Enumallowlist/quyền/transition | API-14: payload UI |
| comment | string hoặc null | Tùy type/điều kiện | Type/độ dài/allowlist; không HTML tùy ý | API-14: payload UI |
| decisionId | ID opaque | Có | FK tồn tại, đúng scope; file clean/đúng purpose | API-14: payload UI |
| version | integer | Có | Integer>=1; khớp version/revision | API-14: payload UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-12: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

**Từng field UI hiện có:**

| Dòng | Tag/ID | Kiểu/required HTML | Default/options/placeholder | Ghi chú |
|---|---|---|---|---|
| 3029 | select (không name/id) | select/Có | Thay đổi / Bổ sung Người hướng dẫn khoa học Thay đổi tên đề tài nghiên cứu Xin tạm dừng học tập / Nghỉ học tạm thời Gia hạn thời gian đào tạo (6 - 12 tháng) Chuyển cơ sở đào tạo / Chuyển ngành Xử lý buộc thôi học (do quá hạn tối đa hoặc vi phạm) | Đọc thực tế ởHiện tại; chưa gửi server |
| 3040 | textarea (không name/id) | textarea/Có | Trình bày lý do, thời gian, cơ sở thực hiện... | Đọc thực tế ởHiện tại; chưa gửi server |
| 3045 | input (không name/id) | file/Không | .pdf | Đọc thực tế ởHiện tại; chưa gửi server |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-13 | POST | /api/candidates/{candidateId}/academic-changes | Gửi yêu cầu thay đổi; NCS chính mình; PDT khởi tạo xử lý hành chính cần chốt |
| API-14 | POST | /api/academic-changes/{changeId}/reviews | Thẩm tra/ban hành biến động; KHOA, PDT, BGH theo bước; NHD góp ý nếu quy trình chốt |
| API-12 | GET | /api/candidates/{candidateId}/academic-changes | Lịch sử học vụ/biến động; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |

Mẫu request API-13:

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

Mẫu response:

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

HTTP 201 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 409 DUPLICATE_PENDING_REQUEST; 422 INVALID_DATE_RANGE. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Transfer cần nơi ngành/dates, pause/extension dates; không NCS tựkỷluật.

Bảng: academic_change_requests, audit_events, candidates, decisions, files, notification_outbox, research_projects, supervisor_assignments, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Request code/type/payload/status/actor/decision/effectivedate. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

m01/m12 chung request không duplicate, đủ fields theo type. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-51 — Lịch sử và sơ đồ biến động

### A. Thông tin

- Phân hệ/trang: m12 trong index.html.
- Nút/thao tác: 4 BD, QĐ/Biên bản/Chi tiết, sơ đồ.
- Vai trò: TheoROLE_MODULES; scope ở 00.
- File/hàm: index.html: 1726–1800, 2591–2633.
- Hiện tại: **Bảngcứng, tải alert; sơ đồ Khoa → PDT → BGH không review button.**

### B. Hành vi

GET changes, file; modal đọc; quyết định cuối đổi hồ sơ.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Candidate/type/reason/date/reviews/decision/status/files.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện mở modal-workflow-changes và hydrate bản ghi hiện hành.
3. Các trường gửi/tra cứu: type, page, pageSize, sort. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-12, API-66 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_change_requests, audit_events, decisions, file_links, files, workflow_reviews.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| type | string hoặc null | Tùy filter | Enumallowlist/quyền/transition | API-12: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-12: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-12: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-12 | GET | /api/candidates/{candidateId}/academic-changes | Lịch sử học vụ/biến động; Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao |
| API-66 | GET | /api/files/{fileId}/content | Tải/xem tệp riêng; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |

Mẫu query API-12:

```json
{
  "type": "extension",
  "page": 1,
  "pageSize": 20,
  "sort": "-submittedAt"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Chốttínhhạnsaupause, không cộng tháng submit.

Bảng: academic_change_requests, audit_events, decisions, file_links, files, workflow_reviews. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Candidate/type/reason/date/reviews/decision/status/files. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Lịchsửm01/m12 đồng nhất, reject/return nếu rule chốt. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-52 — Thống kê tiến độ/công bố

### A. Thông tin

- Phân hệ/trang: m13 trong index.html.
- Nút/thao tác: 4 cohort 48 NCS, 91 bài 44/25/22, 2.4 bài/NCS.
- Vai trò: PDT, KHOA, BGH; scope ở 00.
- File/hàm: index.html: 1853–1925.
- Hiện tại: **Số/barphần trămtĩnh, 126 dashboard khác 48. 91/48 không 2.4; 48/27/25%không quytrònlàm trònrõ.**

### B. Hành vi

GET reports unit/major/cohort/year → groups/counts/percent/scope/asOf.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Numerator/denominator/count/category/cohort/average.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: cohortId, majorId, unitId, asOf, year, supervisorId. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-59, API-60 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn academic_change_requests, candidates, cohorts, publication_authors, publication_reviews, publications, supervisor_assignments, training_plans.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| cohortId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| majorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| unitId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-59: query UI |
| asOf | date ISO | Tùy filter | ISOdate thật; range theo lịch | API-59: query UI |
| year | integer | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-60: query UI |
| supervisorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-60: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-59 | GET | /api/reports/training-summary | Thống kê tiến độ; PDT, KHOA, BGH |
| API-60 | GET | /api/reports/publication-summary | Thống kê công bố; PDT, KHOA, BGH |

Mẫu query API-59:

```json
{
  "cohortId": "cohort-23",
  "majorId": "major-01",
  "unitId": "unit-01",
  "asOf": "2026-10-14"
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

ĐếmDISTINCTcùng scope; không tự giả 2.4 công thức.

Bảng: academic_change_requests, candidates, cohorts, publication_authors, publication_reviews, publications, supervisor_assignments, training_plans. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Numerator/denominator/count/category/cohort/average. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Export/dashboard cùng filter/snapshot, mẫu số 0 null. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-53 — Xuất ba báo cáo quản trị

### A. Thông tin

- Phân hệ/trang: m13 trong index.html.
- Nút/thao tác: AUN-QA, Thông tư 18, Ba công khai.
- Vai trò: PDT, KHOA, BGH; scope ở 00.
- File/hàm: [js/management.js: 1264](../../js/management.js#L1264) `handleExportReport`.
- Hiện tại: **Download CSV thật nhưnghardcode; 3 tênASCIIkhôngchứatiến độ/NCS nên cả 3 rơinhánhkiểm định; label PDF/XLSX khác CSV.**

### B. Hành vi

Chọn reportType/format/filter → POST export → poll → download đúng format.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Job/name/MIME/binary/errors/scope/asOf.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: reportType, format, filters, asOf. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-61, API-62 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, export_jobs, files. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| reportType | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| format | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| filters | object | Có | Type/độ dài/allowlist; không HTML tùy ý | API-61: payload UI |
| asOf | date ISO | Có | ISOdate thật; range theo lịch | API-61: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-61 | POST | /api/report-exports | Xuất báo cáo/hồ sơ; PDT, KHOA, BGH theo loại/scope; NCS hồ sơ mình; NHD cần chốt |
| API-62 | GET | /api/report-exports/{exportId} | Trạng thái/file xuất; Người yêu cầu hoặc người được cấp quyền |

Mẫu request API-61:

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

Mẫu response:

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

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 FORMAT_NOT_SUPPORTED; 409 TEMPLATE_NOT_CONFIGURED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Template chốt, bỏ logic string reportName, lấy dữ liệu thật.

Bảng: audit_events, export_jobs, files. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Job/name/MIME/binary/errors/scope/asOf. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

3 nút tạo 3 báo cáokhácđúngnhãnformatkhôngCSVfake XLSX. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-54 — Ma trận quyền và nhật ký

### A. Thông tin

- Phân hệ/trang: m14 trong index.html.
- Nút/thao tác: 6 role, AudiLog, Làm mới, Xuất CSV.
- Vai trò: PDT; scope ở 00.
- File/hàm: [js/management.js: 628](../../js/management.js#L628) `renderAuditLogTable`; [js/management.js: 1301](../../js/management.js#L1301) `handleExportAuditLog`; [js/management.js: 1324](../../js/management.js#L1324) `refreshAuditLog`.
- Hiện tại: **Matrix 6 role không HĐ; audit localStorage/IP172.16.14.88/time client; refresh local/export CSV mảng cục bộ.**

### B. Hành vi

/me quyền+GET audit filter/page; refresh → GET; exporttypeaudit_log.

Backend kiểm phiên/quyền/điều kiện → transaction hồ sơ/review/audit/outbox → ID/time/version → kết quả. UI cập nhật Time/actor/role/action/target/IP/result/requestId, total.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: actorId, action, from, to, page, pageSize, sort, reportType, format, filters, asOf. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi Lưu/Gửi/Xác nhận, tắt nhấn lặp; upload byte và chờ fileclean trước nếu form có tệp; chỉ ghi nhận thành công sau response.
5. Gọi API-02, API-63, API-61, API-62 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Trong transaction, cập nhật các bảng liên quan: audit_events, export_jobs, files, role_permissions, sessions, units, user_roles, users. Giữ revision/history, audit và outbox; không dùng actor/time/role từ client.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| actorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-63: query UI |
| action | string hoặc null | Tùy filter | Enumallowlist/quyền/transition | API-63: query UI |
| from | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |
| to | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-63: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-63: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-63: query UI |
| reportType | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| format | string hoặc null | Có | Enumallowlist/quyền/transition | API-61: payload UI |
| filters | object | Có | Type/độ dài/allowlist; không HTML tùy ý | API-61: payload UI |
| asOf | date ISO | Có | ISOdate thật; range theo lịch | API-61: payload UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-02 | GET | /api/me | Phiên và quyền; NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| API-63 | GET | /api/audit-events | Xem/làm mới nhật ký; PDT có audit.read |
| API-61 | POST | /api/report-exports | Xuất báo cáo/hồ sơ; PDT, KHOA, BGH theo loại/scope; NCS hồ sơ mình; NHD cần chốt |
| API-62 | GET | /api/report-exports/{exportId} | Trạng thái/file xuất; Người yêu cầu hoặc người được cấp quyền |

Mẫu request API-61:

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

Mẫu response:

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

HTTP 202 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 FORMAT_NOT_SUPPORTED; 409 TEMPLATE_NOT_CONFIGURED. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Append-only, actor/IP server, không API sửa/xóa; CSV escape/formulainjection.

Bảng: audit_events, export_jobs, files, role_permissions, sessions, units, user_roles, users. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Time/actor/role/action/target/IP/result/requestId, total. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Thiết bị khác thấy audit mutation, scope/search/paging thật. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-55 — Persona 7 vai trò và workload giới thiệu

### A. Thông tin

- Phân hệ/trang: roles trong index.html.
- Nút/thao tác: 7 button động/bar/tasks.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/app.js: 1081](../../js/app.js#L1081) `renderPersonaWorkspace`; js/app.js: 459–638.
- Hiện tại: **Workload 85/62/45/70/90/30/55, mã TBM/BCNK/PĐT/HĐ; táchcurrentUser.**

### B. Hành vi

Chọn persona → render nội dung tĩnh, không API nghiệp vụ; workload thật sau cần chốtmẫu số.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Mô phỏng không cấp quyền, nội dung tasks không chứng minh function đã có.

### F. Đầu ra

Title/desc/tasks/workloadtext. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Bấm persona HĐ không đổi phiên. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-56 — Lộ trình 6 giai đoạn/Inspector

### A. Thông tin

- Phân hệ/trang: roadmap trong index.html.
- Nút/thao tác: 6 node card, HologramX/backdrop.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/app.js: 1162](../../js/app.js#L1162) `initConstellationGraph`; js/app.js: 639–742.
- Hiện tại: **ROADMAP 6 bước tĩnh; Inspector đầu ra.**

### B. Hành vi

Bấm node → title/details/items → close, không chuyển stage thật.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

02 bài/03 topic/30 ngày cần chốt, không API duyệt từ node.

### F. Đầu ra

Nội dung lộ trình tĩnh. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Mở popup không tạo/duyệt/cấp bằng. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-57 — Kho luận án công khai/tìm kiếm

### A. Thông tin

- Phân hệ/trang: public trong index.html.
- Nút/thao tác: Search 3 card, 6 PDF link.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/app.js: 1210](../../js/app.js#L1210) `renderThesesList`; [js/app.js: 1240](../../js/app.js#L1240) `initThesisSearch`.
- Hiện tại: **MảngTHESES_LIST3VI/EN, filter client; example.com; đổi language full-listbỏfilter; api/homejschưanạp.**

### B. Hành vi

GETpublictheses query/filter/page/sort → render → GET public file.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Title/candidate/field/date/published/URL/id/pages.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: q, majorId, page, pageSize, sort, lang. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-58, API-67 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidates, files, public_notices, research_projects.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| q | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| majorId | ID opaque | Tùy filter | FK tồn tại, đúng scope; file clean/đúng purpose | API-58: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-58: query UI |
| sort | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| lang | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-58: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-58 | GET | /api/public/theses | Kho luận án công khai; Công khai |
| API-67 | GET | /api/public/files/{fileId}/content | Tải tệp đã công khai; Công khai |

Mẫu query API-58:

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

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: Quyền/validation/trạng thái từng API. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Adaptercandidate/date/fullUrl → candidateName/expectedDefenseDate/fullTextUrl; chỉ published.

Bảng: candidates, files, public_notices, research_projects. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Title/candidate/field/date/published/URL/id/pages. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

File thật, empty/error đúng, thêm notice hiện sau publish. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-58 — Tra cứu sổ gốc/phôi bằng

### A. Thông tin

- Phân hệ/trang: public trong index.html.
- Nút/thao tác: Code/name, Xuất phôi 3D.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/app.js: 1294](../../js/app.js#L1294) `initCertificateGenerator`; js/app.js: 1255–1286.
- Hiện tại: **3 register JS; khớp chính xác hoa thường, cả 2 AND; đã khác báo cáo cũtạophôitùyý; không DB thật.**

### B. Hành vi

Ít nhất 1 field → GET lookup → chooseifduplicatename → render card/clearold.

Backend kiểm phiên/quyền/điều kiện → truy vấn trong phạm vi, không mutation khi đọc. UI cập nhật Code/name/nameEn/major/majorEn/register/date/decision/status/source.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: code, name, page, pageSize. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Gọi API-57 theo method/path và payload ở D/03; không gọi endpoint lưu cho việc chỉ mở/đóng modal.
6. Backend kiểm phiên nếu endpoint yêu cầu, action permission, quan hệ hồ sơ, validation và quy tắc riêng ở E/03.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn candidates, decisions, degree_records, majors.
8. Máy chủ trả data/requestId với đúng status hoặc lỗi thống nhất; chi tiết trường đầu ra ở F và JSON 03.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| code | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| name | string hoặc null | Tùy filter | Type/độ dài/allowlist; không HTML tùy ý | API-57: query UI |
| page | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| pageSize | integer | Tùy filter | page>=1, pageSize 1–100 | API-57: query UI |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

| API | Method | Endpoint | Mục đích/quyền |
|---|---|---|---|
| API-57 | GET | /api/public/degrees | Tra cứu văn bằng; Công khai |

Mẫu query API-57:

```json
{
  "code": "TS-AGU-2026-089",
  "name": "Nguyễn Văn Bình",
  "page": 1,
  "pageSize": 20
}
```

Mẫu response:

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

HTTP 200 thành công; 401/403/404/409/422/500/503, upload 413/415 theo 03. Lỗi riêng: 422 LOOKUP_QUERY_REQUIRED; 429 RATE_LIMIT. **Endpoint đề xuất**; API còn lại có path/query/quyền/JSON/lỗi ở[03](03-DANH-SACH-API.md).

### E. Xử lý Backend

Không tự dựng nameinput thành verified; không DOB/CCCD/email public.

Bảng: candidates, decisions, degree_records, majors. Kiểm action/scope/status; old/new/reviewer/time/version. Outbox NCS/chủ hồ sơ hoặc actor tiếp theo; bấm modal/đọc không gửi duyệt. Entities 04, transition 05.

### F. Đầu ra

Code/name/nameEn/major/majorEn/register/date/decision/status/source. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

- Thiếu/sai format 422 fieldErrors; giữ form. ID không tồn tại 404; quyền 401/403; trùng/status/version 409.
- File 413/415/422/quarantine; thao tác không file không áp dụng upload error; không coi tên file là đã tải server.
- Server 500/503 requestId; rollback nếu chưa commit. Mất mạng/timeout không có HTTP response: giữ input, GET status, gửi lại cùng Idempotency-Key; không duplicate.

### H. Tiêu chí hoàn thành

Codewrong/namewrong/mix 2 record empty; revoked không valid. Kiểm happy/lỗi quyền/validation/transition/mất mạng; mutation hiện sau reload và thiết bị khác; mock không ghi đè API.

## CN-59 — Trang chủ, văn bản và giới thiệu

### A. Thông tin

- Phân hệ/trang: home, citations, about trong index.html.
- Nút/thao tác: CTA/launchtiles, 3 card TT 18/QĐ 1688/QĐ 655.
- Vai trò: Công khai; scope ở 00.
- File/hàm: index.html: 109–236, 2128–2195; js/app.js: I18N_DICT.
- Hiện tại: **Nội dung tĩnh/tuyênbố 100%; card văn bản không link gốc/handler; CTArouter.**

### B. Hành vi

CTAđiều hướng CN 01; không APICMStrừ scope bổ sung.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Không suytuânthủpháp lý từ UI, không coicardlàfunction.

### F. Đầu ra

Nội dung giới thiệu tĩnh. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Kiểm kê card không tương tác rõ. Không mutation ngầm khi đọc/điều hướng/đóng UI.

## CN-60 — Hub hỗ trợ, Zalo/Facebook/chatbot

### A. Thông tin

- Phân hệ/trang: Hỗ trợ trong index.html.
- Nút/thao tác: Trigger, 3 options, 4 chips, Gửi/Enter, X.
- Vai trò: Công khai; scope ở 00.
- File/hàm: [js/app.js: 950](../../js/app.js#L950) `initContactHub`; [js/app.js: 1000](../../js/app.js#L1000) `initAIChatbot`.
- Hiện tại: **Zalo FB toast 098.765.4321/fanpage; chatifelsekeyworddelay 400 ms; không AI API/chatpersist.**

### B. Hành vi

Mở hub → toast/AI popup → nhập/chip → local message → close. Không tựthêmLLMservice.

Không DB/request HTTP, tác động client như trên.

**Trình tự tích hợp (API là đề xuất):**

1. Người dùng thực hiện đúng nút/thao tác nêu ở A; nếu chưa có UI, phải bổ sung ở đợt tích hợp theo câu hỏi 08.
2. Giao diện thực hiện thay đổi view, prompt hoặc hiển thị danh sách/kết quả như hành vi đã mô tả ở trên.
3. Các trường gửi/tra cứu: Không có payload server; dữ liệu thao tác client ở phần A. Các ô readonly và actor lấy lại từ máy chủ.
4. Khi đọc/lọc/tải kết quả, chỉ thay phần hiển thị; không tự chuyển trạng thái nghiệp vụ.
5. Không gọi API nghiệp vụ cho hành vi này.
6. Backend không tham gia; giao diện xử lý cục bộ như phần Hiện tại.
7. Không thêm, sửa, xóa dữ liệu nghiệp vụ chỉ vì đọc/điều hướng; truy vấn Không có bảng Backend..
8. Không có HTTP response; kết quả là trạng thái giao diện cục bộ.
9. Giao diện cập nhật đúng các vùng nêu ở F; giữ input khi lỗi, không dùng mock ghi đè dữ liệu thật; hủy/đóng không tự gửi.

### C. Đầu vào

| Field | Kiểu dữ liệu | Bắt buộc | Validation | Ghi chú |
|---|---|---|---|---|
| Target/thao tác | UI event | Theo hành vi | Selector tồn tại | Client |
| actorUserId/activeRole/scope | ID/enum | Server suy ra | Phiên/quyền/quan hệ | Không tin actor client |
| id/code/createdAt/updatedAt | ID/string/time | Server sinh mutation | Unique/serverclock | Không random client |
| Kết quả/status/eligible | Enum/boolean/decimal | Server tính | Rule/bằng chứng | Không client tự đạt |

### D. API

Không API, method/JSON/HTTP không áp dụng; scope bổ sung phải chốt.

### E. Xử lý Backend

Hotline demo/điều kiện bảo vệFAQkhônglàthôngtinxác nhận.

### F. Đầu ra

FAQlocal, không dữ liệu học vụ cá nhân. Schema đầy đủ ở 03; thiếu chứng cứ null/unknown/reason.

### G. Lỗi

Target thiếu giữ UI/hủy; không DB/trùng/nghiệp vụ. Link không file không báo đã tải; mock không xác thực; đọc local không cần network.

### H. Tiêu chí hoàn thành

Không gửi ra ngoài/đổi trạng thái từ chat demo. Không mutation ngầm khi đọc/điều hướng/đóng UI.

