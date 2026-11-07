# Kiểm kê chức năng và giao diện

Số đếm/định nghĩa ở 00. Control hidden/alert vẫn kiểm kê; row tĩnh cóthểbịrenderert hay thế. IDKT chỉ truy vết.

## Bảyview

| View | Dòng | Mục đích |
|---|---|---|
| home | 109 | Trang chủ |
| management | 239 | Dashboard/14 panel |
| roles | 2058 | 7 persona |
| roadmap | 2072 | 6 node/Inspector |
| public | 2084 | Luận án/bằng |
| citations | 2126 | 3 văn bản |
| about | 2150 | Giới thiệu |

## Mười bốn panel

| ID | Tên | Dòng | Role mở |
|---|---|---|---|
| m01 | Hồ sơ NCS | 343 | NCS, NHD, BM, KHOA, PDT, BGH |
| m02 | CTĐT & Kế hoạch | 592 | NCS, NHD, BM, KHOA, PDT |
| m03 | Người hướng dẫn | 738 | NCS, NHD, BM, KHOA, PDT, BGH |
| m04 | Học phần & Điểm | 839 | NCS, PDT |
| m05 | Tiểu luận & Đề cương | 974 | NCS, NHD, BM, KHOA, PDT |
| m06 | Chuyên đề tiến sĩ | 1071 | NCS, NHD, BM, KHOA, PDT |
| m07 | Tiến độ nghiên cứu | 1159 | NCS, NHD, BM, PDT |
| m08 | Công bố khoa học | 1260 | NCS, NHD, PDT |
| m09 | Đề tài & Luận án | 1335 | NCS, NHD, BM, PDT, HOIDONG |
| m10 | Bảo vệ luận án | 1471 | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG |
| m11 | Hoàn thiện & Cấp bằng | 1633 | NCS, NHD, PDT, BGH |
| m12 | Biến động học vụ | 1726 | NCS, NHD, BM, KHOA, PDT, BGH |
| m13 | Tra cứu & Báo cáo | 1804 | KHOA, PDT, BGH |
| m14 | Phân quyền & Nhật ký | 1929 | PDT |

## 60 nhóm hành vi

| CN | Tên | Phân hệ | Role | API |
|---|---|---|---|---|
| CN-01 | Điều hướng dock, ô ứng dụng và tab | Khung | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | API-02 |
| CN-02 | Đăng nhập, ghi nhớ và quên mật khẩu | Tài khoản | Công khai | API-01, API-02, API-05, API-06 |
| CN-03 | Đổi vai trò và cập nhật thẻ người dùng | Tài khoản | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | API-03, API-02, API-07 |
| CN-04 | Đăng xuất còn thiếu | Tài khoản | Người đăng nhập | API-04 |
| CN-05 | Tìm kiếm lệnh nhanh | Khung | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | Không API |
| CN-06 | Đổi ngôn ngữ VI/EN | Khung | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | Không API |
| CN-07 | Mở/đóng modal và chọn/upload tệp | Khung | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | API-64, API-65 |
| CN-08 | Dashboard theo 7 vai trò | Dashboard | NCS, NHD, BM, KHOA, PDT, BGH, HOIDONG | API-07 |
| CN-09 | Khôi phục dữ liệu demo | Quản trị demo | PDT trên UI | Không API |
| CN-10 | Danh sách NCS, tìm kiếm, lọc | m01 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-08, API-09, API-11 |
| CN-11 | Hồ sơ và cập nhật liên hệ | m01 | NCS, PDT cho sửa; đọc theo scope | API-09, API-10 |
| CN-12 | Nộp đơn gia hạn/tạm dừng | m01 | NCS | API-13, API-12 |
| CN-13 | Tải hồ sơ và từng tài liệu riêng | m01–m12 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-66, API-61, API-62 |
| CN-14 | Khung chương trình/kế hoạch học kỳ | m02 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-15, API-16 |
| CN-15 | Lập/điều chỉnh kế hoạch và thêm mốc | m02 | NCS | API-17, API-16 |
| CN-16 | Duyệt kế hoạch NHD → BM → PDT | m02 | NHD, BM, PDT; KHOA thấy nút nhưng không bước | API-18, API-16, API-07 |
| CN-17 | Danh sách và hồ sơ NHD | m03 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-19, API-20 |
| CN-18 | Phân công NHD chính/phụ | m03 | PDT | API-21, API-19, API-09 |
| CN-19 | Đổi/bổ sung/rút NHD | m03, m12 | NCS | API-13, API-14, API-12 |
| CN-20 | Bảng điểm, GPA và miễn bổ sung | m04 | NCS, PDT theoROLE_MODULES | API-22, API-15 |
| CN-21 | Đăng ký/hủy ENV 809 | m04 | NCS | API-23, API-24, API-22 |
| CN-22 | Đồng bộ bảng điểm | m04 | PDT trên UI | API-25, API-26, API-22 |
| CN-23 | Nộp tiểu luận tổng quan | m05 | NCS | API-28, API-27 |
| CN-24 | Nhập điểm tiểu ban tiểu luận | m05 | BM, NHD | API-29, API-27, API-48 |
| CN-25 | Nộp đề cương và giải trình | m05 | NCS | API-28, API-30, API-27 |
| CN-26 | Danh sách/tổng kết chuyên đề | m06 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-31 |
| CN-27 | Đăng ký chuyên đề | m06 | NCS | API-32, API-31 |
| CN-28 | Chấm điểm chuyên đề | m06 | BM, NHD | API-33, API-31, API-48 |
| CN-29 | Báo cáo, lịch kỳ và cảnh báo | m07 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-34, API-37 |
| CN-30 | Nộp báo cáo tiến độ | m07 | NCS | API-35, API-34, API-07 |
| CN-31 | Đánh giá báo cáo | m07 | NHD, BM trên UI | API-36, API-34, API-48 |
| CN-32 | Gửi email cảnh báo/nhắc nhở ngay | m07 | NHD, PDT trên UI | API-37, API-38, API-39 |
| CN-33 | Khai báo và danh sách công bố | m08 | NCS tạo, đọc theo scope | API-41, API-40 |
| CN-34 | Thẩm định công bố | m08 | NHD, PDT | API-42, API-40, API-48 |
| CN-35 | Sơ đồ thẩm định công bố | m08 | NHD, PDT | Không API |
| CN-36 | Đề tài và phiên bản luận án | m09 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-43, API-66 |
| CN-37 | Đề nghị đổi tên đề tài | m09, m12 | NCS | API-13, API-14, API-43 |
| CN-38 | Upload phiên bản luận án | m09 | NCS | API-44, API-43 |
| CN-39 | Kiểm tra tương đồng Turnitin | m09 | PDT | API-45, API-46 |
| CN-40 | NHD đồng ý bảo vệ | m09 | NHD | API-47, API-43 |
| CN-41 | Checklist điều kiện bảo vệ | m10 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-48 |
| CN-42 | Phản biện kín, công khai và hội đồng | m10 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-49, API-66 |
| CN-43 | Nhập kết quả biểu quyết | m10 | HOIDONG | API-50, API-51, API-49 |
| CN-44 | Sơ đồ sáu bước bảo vệ | m10 | TheoROLE_MODULES | Không API |
| CN-45 | Công khai và điều phối bảo vệ còn thiếu | m10, public | PDT, BM, KHOA, BGH, HĐ theo quyền cần chốt | API-52, API-58, API-49 |
| CN-46 | Hồ sơ tốt nghiệp/lưu chiểu | m11 | Theo ROLE_MODULES và phạm vi hồ sơ ở 00; HĐ chỉ hồ sơ được giao | API-53, API-66 |
| CN-47 | Nộp chỉnh sửa/hồ sơ sau bảo vệ | m11 | NCS | API-54, API-55, API-53 |
| CN-48 | BGH công nhận học vị/cấp bằng | m11 | BGH | API-56, API-53, API-57 |
| CN-49 | Phôi 3D và tra cứu nhanh nội bộ | m11, m13 | Theo module, public cho khách | API-57 |
| CN-50 | Tạo yêu cầu biến động tổng quát | m12 | NCS; withdrawal do PDT khởi tạo cần chốt | API-13, API-14, API-12 |
| CN-51 | Lịch sử và sơ đồ biến động | m12 | TheoROLE_MODULES | API-12, API-66 |
| CN-52 | Thống kê tiến độ/công bố | m13 | PDT, KHOA, BGH | API-59, API-60 |
| CN-53 | Xuất ba báo cáo quản trị | m13 | PDT, KHOA, BGH | API-61, API-62 |
| CN-54 | Ma trận quyền và nhật ký | m14 | PDT | API-02, API-63, API-61, API-62 |
| CN-55 | Persona 7 vai trò và workload giới thiệu | roles | Công khai | Không API |
| CN-56 | Lộ trình 6 giai đoạn/Inspector | roadmap | Công khai | Không API |
| CN-57 | Kho luận án công khai/tìm kiếm | public | Công khai | API-58, API-67 |
| CN-58 | Tra cứu sổ gốc/phôi bằng | public | Công khai | API-57 |
| CN-59 | Trang chủ, văn bản và giới thiệu | home, citations, about | Công khai | Không API |
| CN-60 | Hub hỗ trợ, Zalo/Facebook/chatbot | Hỗ trợ | Công khai | Không API |

## Modal/form

| Modal | Dòng | Form | CN |
|---|---|---|---|
| modal-role-switcher | 2185 | Không form | CN-03 |
| modal-login | 2241 | form-login | CN-02 |
| modal-edit-profile | 2272 | form-edit-profile | CN-11 |
| modal-leave-request | 2310 | form-leave-request | CN-12 |
| modal-assign-supervisor | 2349 | form-assign-supervisor | CN-18 |
| modal-grade-essay | 2393 | form-grade-essay | CN-24 |
| modal-declare-pub | 2427 | form-declare-pub | CN-33 |
| modal-workflow-pub | 2479 | Không form | CN-35 |
| modal-workflow-defense | 2530 | Không form | CN-44 |
| modal-workflow-changes | 2591 | Không form | CN-51 |
| modal-edit-plan | 2636 | Không id/generic | CN-15 |
| modal-change-supervisor | 2674 | Không id/generic | CN-19 |
| modal-submit-essay | 2724 | Không id/generic | CN-23 |
| modal-submit-outline | 2756 | Không id/generic | CN-25 |
| modal-register-topic | 2802 | Không id/generic | CN-27 |
| modal-submit-progress | 2853 | Không id/generic | CN-30 |
| modal-change-topic-title | 2902 | Không id/generic | CN-37 |
| modal-upload-thesis-version | 2942 | Không id/generic | CN-38 |
| modal-submit-post-defense | 2978 | Không id/generic | CN-47 |
| modal-create-change-request | 3020 | Không id/generic | CN-50 |

Hologram(index 3121) và chat(3085) là popup riêng. 3 workflow modal chỉ đọc, role modal 7 thẻ, 16 modal còn lại 16 form.

## Thành phần động/card điều hướng

| Nguồn | Thành phần | CN |
|---|---|---|
| [js/management.js: 534](../../js/management.js#L534) `renderRoleDashboard` | 7×3 metric; 20 shortcut cấu hình; active 1 role/recent 5 | 8 |
| [js/management.js: 1009](../../js/management.js#L1009) `renderPublicationsTable` | Rows/status/thẩm định; đètbody mất button HTML | 33 |
| [js/management.js: 796](../../js/management.js#L796) `renderLeaveHistoryTable` | Row+file button alert | 12 |
| [js/management.js: 815](../../js/management.js#L815) `renderPlanStatusUI` | 4 stage badge | 16 |
| [js/management.js: 1116](../../js/management.js#L1116) `renderDefenseChecklistUI` | 6 card | 41 |
| [js/management.js: 628](../../js/management.js#L628) `renderAuditLogTable` | Audit rows | 54 |
| [js/app.js: 1081](../../js/app.js#L1081) `renderPersonaWorkspace` | 7 button/bar/tasks | 55 |
| [js/app.js: 1145](../../js/app.js#L1145) `renderConstellationGraph` | 6 node/Inspector | 56 |
| [js/app.js: 1210](../../js/app.js#L1210) `renderThesesList` | 3 card×2 link VI/EN | 57 |
| [js/app.js: 1294](../../js/app.js#L1294) `initCertificateGenerator` | Card/not found | 58 |
| [js/app.js: 1000](../../js/app.js#L1000) `initAIChatbot` | Messages | 60 |
| index.html: 181–234 | 6 launch-tile div, delegatedlistener | 1 |

## 258 control HTML

| KT | Source | Vị trí | Tag/nội dung/selector | Handler/href/attrs | CN/hành vi |
|---|---|---|---|---|---|
| KT-001 | [index.html:29](../../index.html#L29) | global | button: | data-dock-target=home,data-tooltip=Trang chủ,data-tooltip-vi=Trang chủ,data-tooltip-en=Home | CN-01/Điều hướng |
| KT-002 | [index.html:34](../../index.html#L34) | global | button: | data-dock-target=management,data-tooltip=Quản lý Học vụ (14 Phân hệ),data-tooltip-vi=Quản lý Học vụ (14 Phân hệ),data-tooltip-en=Academic Management (14 Modules) | CN-01/Điều hướng |
| KT-003 | [index.html:38](../../index.html#L38) | global | button: | data-dock-target=roles,data-tooltip=Đối tượng,data-tooltip-vi=Đối tượng (7 Vai trò),data-tooltip-en=Stakeholders | CN-01/Điều hướng |
| KT-004 | [index.html:42](../../index.html#L42) | global | button: | data-dock-target=roadmap,data-tooltip=Quy trình,data-tooltip-vi=Quy trình 6 bước,data-tooltip-en=Roadmap | CN-01/Điều hướng |
| KT-005 | [index.html:46](../../index.html#L46) | global | button: | data-dock-target=public,data-tooltip=Công khai,data-tooltip-vi=Công khai & Tra cứu,data-tooltip-en=Public Hub | CN-01/Điều hướng |
| KT-006 | [index.html:50](../../index.html#L50) | global | button: | data-dock-target=citations,data-tooltip=Văn bản,data-tooltip-vi=Văn bản pháp lý,data-tooltip-en=Regulations | CN-01/Điều hướng |
| KT-007 | [index.html:54](../../index.html#L54) | global | button: | data-dock-target=about,data-tooltip=Giới thiệu,data-tooltip-vi=Giới thiệu DTMS,data-tooltip-en=About | CN-01/Điều hướng |
| KT-008 | [index.html:74](../../index.html#L74) | global | input:Tìm kiếm nhanh dữ liệu hệ thống... | type=text,data-i18n-placeholder=search_placeholder,data-command-input=None | CN-05/Enter định tuyến |
| KT-009 | [index.html:79](../../index.html#L79) | global | button:🌐 VI \| EN | data-lang-btn=None | CN-06/VI/EN |
| KT-010 | [index.html:84](../../index.html#L84) | global | div:NB NCS. Nguyễn Văn Bình NCS | DTMS_MANAGEMENT.openModal('modal-role-switcher') | CN-03/Đổi demo/reload |
| KT-011 | [index.html:90](../../index.html#L90) | global | button:⇄ Đổi vai trò | DTMS_MANAGEMENT.openModal('modal-role-switcher') | CN-03/Đổi demo/reload |
| KT-012 | [index.html:94](../../index.html#L94) | global | button:🔄 Reset Data | DTMS_MANAGEMENT.resetDemoData() | CN-09/Reset 2 khóa |
| KT-013 | [index.html:98](../../index.html#L98) | global | button:Đăng nhập OS | DTMS_MANAGEMENT.openModal('modal-login') | CN-02/Mở login |
| KT-014 | [index.html:132](../../index.html#L132) | home | button:Vào Hệ thống Quản trị Học vụ (14 Phân hệ Nghiệp vụ) → | data-switch-view=management | CN-01/Điều hướng |
| KT-015 | [index.html:137](../../index.html#L137) | home | button:🔍 Tra cứu Phôi bằng 3D | data-switch-view=public | CN-01/Điều hướng |
| KT-016 | [index.html:252](../../index.html#L252) | management | div:NB NCS. Nguyễn Văn Bình Nghiên cứu sinh Khóa 2023 · Khoa NN-TNTN NCS | DTMS_MANAGEMENT.openModal('modal-role-switcher') | CN-03/Đổi demo/reload |
| KT-017 | [index.html:261](../../index.html#L261) | management | button:⇄ Đổi Vai trò | DTMS_MANAGEMENT.openModal('modal-role-switcher') | CN-03/Đổi demo/reload |
| KT-018 | [index.html:270](../../index.html#L270) | management | button:M01. Hồ sơ NCS Profile | data-target-module=m01 | CN-01/Điều hướng |
| KT-019 | [index.html:275](../../index.html#L275) | management | button:M02. CTĐT & Kế hoạch Plan | data-target-module=m02 | CN-01/Điều hướng |
| KT-020 | [index.html:280](../../index.html#L280) | management | button:M03. Người hướng dẫn Advisor | data-target-module=m03 | CN-01/Điều hướng |
| KT-021 | [index.html:285](../../index.html#L285) | management | button:M04. Học phần & Điểm Courses | data-target-module=m04 | CN-01/Điều hướng |
| KT-022 | [index.html:290](../../index.html#L290) | management | button:M05. Tiểu luận & Đề cương Outline | data-target-module=m05 | CN-01/Điều hướng |
| KT-023 | [index.html:295](../../index.html#L295) | management | button:M06. Chuyên đề Tiến sĩ Topics | data-target-module=m06 | CN-01/Điều hướng |
| KT-024 | [index.html:300](../../index.html#L300) | management | button:M07. Tiến độ Nghiên cứu Progress | data-target-module=m07 | CN-01/Điều hướng |
| KT-025 | [index.html:305](../../index.html#L305) | management | button:M08. Công bố Khoa học WoS/Scopus | data-target-module=m08 | CN-01/Điều hướng |
| KT-026 | [index.html:310](../../index.html#L310) | management | button:M09. Đề tài & Luận án Thesis | data-target-module=m09 | CN-01/Điều hướng |
| KT-027 | [index.html:315](../../index.html#L315) | management | button:M10. Bảo vệ Luận án Defense | data-target-module=m10 | CN-01/Điều hướng |
| KT-028 | [index.html:320](../../index.html#L320) | management | button:M11. Hoàn thiện & Cấp bằng Diploma | data-target-module=m11 | CN-01/Điều hướng |
| KT-029 | [index.html:325](../../index.html#L325) | management | button:M12. Quản lý Biến động Changes | data-target-module=m12 | CN-01/Điều hướng |
| KT-030 | [index.html:330](../../index.html#L330) | management | button:M13. Tra cứu & Báo cáo Reports | data-target-module=m13 | CN-01/Điều hướng |
| KT-031 | [index.html:335](../../index.html#L335) | management | button:M14. Phân quyền & Nhật ký Audit Log | data-target-module=m14 | CN-01/Điều hướng |
| KT-032 | [index.html:346](../../index.html#L346) | panel-m01 | input:Tìm theo tên NCS, mã số, căn cước công dân... | type=text | CN-10/Không listener lọc |
| KT-033 | [index.html:347](../../index.html#L347) | panel-m01 | select:Tất cả trạng thái học vụ Đang học (Bình thường) Gia hạn học tập Tạm dừng học tập Đã bảo vệ luận án Đã cấp bằng Tiến sĩ |  | CN-10/Không listener lọc |
| KT-034 | [index.html:358](../../index.html#L358) | panel-m01 | button:✎ Cập nhật thông tin cá nhân | DTMS_MANAGEMENT.openModal('modal-edit-profile') | CN-11/Mở modal |
| KT-035 | [index.html:361](../../index.html#L361) | panel-m01 | button:📄 Đơn xin gia hạn / Tạm dừng | DTMS_MANAGEMENT.openModal('modal-leave-request') | CN-12/Mở modal |
| KT-036 | [index.html:364](../../index.html#L364) | panel-m01 | button:📥 Tải hồ sơ số (PDF) | alert('Đã xuất toàn bộ hồ sơ đào tạo số của NCS dưới định dạng PDF.') | CN-13/Chỉ alert |
| KT-037 | [index.html:519](../../index.html#L519) | panel-m01 | button:Xem & Sửa | DTMS_MANAGEMENT.openModal('modal-edit-profile') | CN-11/Mở modal |
| KT-038 | [index.html:530](../../index.html#L530) | panel-m01 | button:Xem & Sửa | alert('Xem hồ sơ NCS Lê Thị Mai'); | CN-10/Chỉ alert |
| KT-039 | [index.html:541](../../index.html#L541) | panel-m01 | button:Xem & Sửa | alert('Xem hồ sơ NCS Phạm Quốc Cường'); | CN-10/Chỉ alert |
| KT-040 | [index.html:555](../../index.html#L555) | panel-m01 | button:+ Tạo đơn mới | DTMS_MANAGEMENT.openModal('modal-leave-request') | CN-12/Mở modal |
| KT-041 | [index.html:582](../../index.html#L582) | panel-m01 | button:📄 File đơn | alert('Đã tải minh chứng đơn xin học vụ.') | CN-13/Chỉ alert |
| KT-042 | [index.html:599](../../index.html#L599) | panel-m02 | button:✎ Lập / Điều chỉnh kế hoạch | DTMS_MANAGEMENT.openModal('modal-edit-plan') | CN-15/Mở modal |
| KT-043 | [index.html:602](../../index.html#L602) | panel-m02 | button:✓ Phê duyệt kế hoạch (NHD/PĐT) | DTMS_MANAGEMENT.handleApprovePlan() | CN-16/handleApprovePlan |
| KT-044 | [index.html:605](../../index.html#L605) | panel-m02 | button:📥 Tải Khung CTĐT | alert('Tải khung chương trình đào tạo chuẩn (PDF)'); | CN-13/Chỉ alert |
| KT-045 | [index.html:681](../../index.html#L681) | panel-m02 | button:+ Thêm mốc | DTMS_MANAGEMENT.openModal('modal-edit-plan') | CN-15/Mở modal |
| KT-046 | [index.html:745](../../index.html#L745) | panel-m03 | button:+ Phân công Người hướng dẫn | DTMS_MANAGEMENT.openModal('modal-assign-supervisor') | CN-18/Mở modal |
| KT-047 | [index.html:748](../../index.html#L748) | panel-m03 | button:⇄ Đề xuất Thay đổi / Bổ sung NHD | DTMS_MANAGEMENT.openModal('modal-change-supervisor') | CN-19/Mở modal |
| KT-048 | [index.html:808](../../index.html#L808) | panel-m03 | button:Chi tiết | alert('Xem hồ sơ chi tiết và các đề tài GS.TS Trần Văn Hướng đang hướng dẫn.'); | CN-17/Chỉ alert |
| KT-049 | [index.html:819](../../index.html#L819) | panel-m03 | button:Chi tiết | alert('Xem hồ sơ chi tiết PGS.TS Lê Văn Tuấn.'); | CN-17/Chỉ alert |
| KT-050 | [index.html:830](../../index.html#L830) | panel-m03 | button:Chi tiết | alert('Xem hồ sơ chi tiết TS Nguyễn Hải Nam.'); | CN-17/Chỉ alert |
| KT-051 | [index.html:846](../../index.html#L846) | panel-m04 | button:⟳ Đồng bộ bảng điểm | alert('Đã cập nhật dữ liệu bảng điểm học phần từ hệ thống đào tạo Sau đại học.') | CN-22/Chỉ alert |
| KT-052 | [index.html:954](../../index.html#L954) | panel-m04 | button:+ Đăng ký | DTMS_MANAGEMENT.handleToggleCourse('ENV809', this) | CN-21/handleToggleCourse |
| KT-053 | [index.html:981](../../index.html#L981) | panel-m05 | button:📄 Nộp Tiểu luận tổng quan | DTMS_MANAGEMENT.openModal('modal-submit-essay') | CN-23/Mở modal |
| KT-054 | [index.html:984](../../index.html#L984) | panel-m05 | button:📑 Nộp Đề cương nghiên cứu | DTMS_MANAGEMENT.openModal('modal-submit-outline') | CN-25/Mở modal |
| KT-055 | [index.html:987](../../index.html#L987) | panel-m05 | button:✎ Nhập điểm Tiểu ban | DTMS_MANAGEMENT.openModal('modal-grade-essay') | CN-24/Mở modal |
| KT-056 | [index.html:1030](../../index.html#L1030) | panel-m05 | button:📄 Tải Tiểu luận | alert('Tải file Tiểu luận tổng quan'); | CN-13/Chỉ alert |
| KT-057 | [index.html:1031](../../index.html#L1031) | panel-m05 | button:📋 Tải Biên bản | alert('Tải biên bản họp chấm tiểu luận'); | CN-13/Chỉ alert |
| KT-058 | [index.html:1063](../../index.html#L1063) | panel-m05 | button:📑 Tải Đề cương | alert('Tải bản Đề cương nghiên cứu hoàn thiện'); | CN-13/Chỉ alert |
| KT-059 | [index.html:1064](../../index.html#L1064) | panel-m05 | button:📝 Bản giải trình | alert('Tải bản Giải trình tiếp thu ý kiến Hội đồng'); | CN-13/Chỉ alert |
| KT-060 | [index.html:1078](../../index.html#L1078) | panel-m06 | button:+ Đăng ký chuyên đề mới | DTMS_MANAGEMENT.openModal('modal-register-topic') | CN-27/Mở modal |
| KT-061 | [index.html:1081](../../index.html#L1081) | panel-m06 | button:📥 Tải sổ biên bản chuyên đề | alert('Tải toàn bộ biên bản 03 chuyên đề'); | CN-13/Chỉ alert |
| KT-062 | [index.html:1112](../../index.html#L1112) | panel-m06 | button:✎ Chấm điểm | DTMS_MANAGEMENT.handleGradeTopic(1) | CN-28/handleGradeTopic |
| KT-063 | [index.html:1113](../../index.html#L1113) | panel-m06 | button:Biên bản | alert('Tải biên bản chấm Chuyên đề 1'); | CN-13/Chỉ alert |
| KT-064 | [index.html:1125](../../index.html#L1125) | panel-m06 | button:✎ Chấm điểm | DTMS_MANAGEMENT.handleGradeTopic(2) | CN-28/handleGradeTopic |
| KT-065 | [index.html:1126](../../index.html#L1126) | panel-m06 | button:Biên bản | alert('Tải biên bản chấm Chuyên đề 2'); | CN-13/Chỉ alert |
| KT-066 | [index.html:1138](../../index.html#L1138) | panel-m06 | button:✎ Chấm điểm | DTMS_MANAGEMENT.handleGradeTopic(3) | CN-28/handleGradeTopic |
| KT-067 | [index.html:1139](../../index.html#L1139) | panel-m06 | button:Biên bản | alert('Tải biên bản chấm Chuyên đề 3'); | CN-13/Chỉ alert |
| KT-068 | [index.html:1166](../../index.html#L1166) | panel-m07 | button:+ Nộp Báo cáo tiến độ kỳ mới | DTMS_MANAGEMENT.openModal('modal-submit-progress') | CN-30/Mở modal |
| KT-069 | [index.html:1169](../../index.html#L1169) | panel-m07 | button:⚠️ Gửi cảnh báo quá hạn (Email) | alert('Hệ thống đã tự động gửi email cảnh báo quá hạn tới 02 NCS chậm nộp báo cáo.'); | CN-32/Chỉ alert |
| KT-070 | [index.html:1185](../../index.html#L1185) | panel-m07 | button:Nhắc nhở ngay | alert('Đã gửi thông báo thúc đẩy học vụ đến NCS Lê Văn Hải và NHD.'); | CN-32/Chỉ alert |
| KT-071 | [index.html:1214](../../index.html#L1214) | panel-m07 | button:Đạt | DTMS_MANAGEMENT.handleGradeProgressReport(1, 'pass') | CN-31/handleGradeProgressReport |
| KT-072 | [index.html:1215](../../index.html#L1215) | panel-m07 | button:File | alert('Tải file báo cáo tiến độ kỳ 1'); | CN-13/Chỉ alert |
| KT-073 | [index.html:1226](../../index.html#L1226) | panel-m07 | button:Đạt | DTMS_MANAGEMENT.handleGradeProgressReport(2, 'pass') | CN-31/handleGradeProgressReport |
| KT-074 | [index.html:1227](../../index.html#L1227) | panel-m07 | button:File | alert('Tải file báo cáo tiến độ kỳ 2'); | CN-13/Chỉ alert |
| KT-075 | [index.html:1238](../../index.html#L1238) | panel-m07 | button:Đạt | DTMS_MANAGEMENT.handleGradeProgressReport(3, 'pass') | CN-31/handleGradeProgressReport |
| KT-076 | [index.html:1239](../../index.html#L1239) | panel-m07 | button:File | alert('Tải file báo cáo tiến độ kỳ 3'); | CN-13/Chỉ alert |
| KT-077 | [index.html:1250](../../index.html#L1250) | panel-m07 | button:Đạt | DTMS_MANAGEMENT.handleGradeProgressReport(4, 'pass') | CN-31/handleGradeProgressReport |
| KT-078 | [index.html:1251](../../index.html#L1251) | panel-m07 | button:File | alert('Tải file báo cáo tiến độ kỳ 4'); | CN-13/Chỉ alert |
| KT-079 | [index.html:1267](../../index.html#L1267) | panel-m08 | button:+ Khai báo bài báo khoa học | DTMS_MANAGEMENT.openModal('modal-declare-pub') | CN-33/Mở modal |
| KT-080 | [index.html:1270](../../index.html#L1270) | panel-m08 | button:📐 Sơ đồ Phân tích Thiết kế (Thẩm định công bố) | DTMS_MANAGEMENT.openModal('modal-workflow-pub') | CN-35/Mở modal |
| KT-081 | [index.html:1313](../../index.html#L1313) | panel-m08 | button:📄 Minh chứng | alert('Đã tải minh chứng PDF toàn văn bài báo và thư chấp nhận.'); | CN-13/Chỉ alert |
| KT-082 | [index.html:1326](../../index.html#L1326) | panel-m08 | button:📄 Minh chứng | alert('Đã tải minh chứng PDF toàn văn bài báo 2.'); | CN-13/Chỉ alert |
| KT-083 | [index.html:1342](../../index.html#L1342) | panel-m09 | button:✎ Đổi tên đề tài | DTMS_MANAGEMENT.openModal('modal-change-topic-title') | CN-37/Mở modal |
| KT-084 | [index.html:1345](../../index.html#L1345) | panel-m09 | button:+ Upload phiên bản luận án mới | DTMS_MANAGEMENT.openModal('modal-upload-thesis-version') | CN-38/Mở modal |
| KT-085 | [index.html:1348](../../index.html#L1348) | panel-m09 | button:✍ NHD Ký số đồng ý cho bảo vệ | DTMS_MANAGEMENT.handleSignDefenseApproval() | CN-40/handleSignDefenseApproval |
| KT-086 | [index.html:1388](../../index.html#L1388) | panel-m09 | button:▶ Quét Turnitin | DTMS_MANAGEMENT.handleRunTurnitin() | CN-39/handleRunTurnitin |
| KT-087 | [index.html:1424](../../index.html#L1424) | panel-m09 | button:+ Nộp phiên bản mới | alert('Upload phiên bản mới'); | CN-38/Chỉ alert |
| KT-088 | [index.html:1446](../../index.html#L1446) | panel-m09 | button:Tải về | alert('Tải v1.0'); | CN-13/Chỉ alert |
| KT-089 | [index.html:1454](../../index.html#L1454) | panel-m09 | button:Tải về | alert('Tải v2.0'); | CN-13/Chỉ alert |
| KT-090 | [index.html:1462](../../index.html#L1462) | panel-m09 | button:Tải bản chính | alert('Tải v3.0'); | CN-13/Chỉ alert |
| KT-091 | [index.html:1478](../../index.html#L1478) | panel-m10 | button:📐 Sơ đồ Phân tích Thiết kế (Quy trình 6 bước Bảo vệ) | DTMS_MANAGEMENT.openModal('modal-workflow-defense') | CN-44/Mở modal |
| KT-092 | [index.html:1481](../../index.html#L1481) | panel-m10 | button:✓ Nhập kết quả bỏ phiếu Hội đồng (7/7 Đạt) | DTMS_MANAGEMENT.handleDefenseVoting() | CN-43/handleDefenseVoting |
| KT-093 | [index.html:1484](../../index.html#L1484) | panel-m10 | button:📋 Tải Nghị quyết HĐ | alert('Tải biên bản họp và Nghị quyết Hội đồng đánh giá luận án cấp Trường.'); | CN-13/Chỉ alert |
| KT-094 | [index.html:1560](../../index.html#L1560) | panel-m10 | button:📄 Quyết định thành lập HĐ | alert('Đã tải Quyết định thành lập Hội đồng số 580/QĐ-ĐHAG do Hiệu trưởng ký.'); | CN-13/Chỉ alert |
| KT-095 | [index.html:1640](../../index.html#L1640) | panel-m11 | button:+ Nộp bản chỉnh sửa sau bảo vệ | DTMS_MANAGEMENT.openModal('modal-submit-post-defense') | CN-47/Mở modal |
| KT-096 | [index.html:1643](../../index.html#L1643) | panel-m11 | button:🎓 BGH Ký Quyết Định Công Nhận Học Vị | DTMS_MANAGEMENT.handleConferDegree() | CN-48/handleConferDegree |
| KT-097 | [index.html:1646](../../index.html#L1646) | panel-m11 | button:🏛 Xem Phôi Bằng Ép Kim 3D | data-switch-view=public | CN-01/Điều hướng |
| KT-098 | [index.html:1691](../../index.html#L1691) | panel-m11 | button:📄 Giấy TV ĐHAG | alert('Xem giấy xác nhận Thư viện ĐHAG'); | CN-13/Chỉ alert |
| KT-099 | [index.html:1692](../../index.html#L1692) | panel-m11 | button:🏛 Giấy TV Quốc Gia | alert('Xem giấy xác nhận Thư viện Quốc gia'); | CN-13/Chỉ alert |
| KT-100 | [index.html:1733](../../index.html#L1733) | panel-m12 | button:+ Tạo đơn / Yêu cầu thay đổi | DTMS_MANAGEMENT.openModal('modal-create-change-request') | CN-50/Mở modal |
| KT-101 | [index.html:1736](../../index.html#L1736) | panel-m12 | button:📐 Sơ đồ Phân tích Thiết kế (Xử lý biến động & Thôi học) | DTMS_MANAGEMENT.openModal('modal-workflow-changes') | CN-51/Mở modal |
| KT-102 | [index.html:1766](../../index.html#L1766) | panel-m12 | button:Xem QĐ | alert('Xem quyết định'); | CN-13/Chỉ alert |
| KT-103 | [index.html:1776](../../index.html#L1776) | panel-m12 | button:Biên bản | alert('Xem biên bản thông qua'); | CN-13/Chỉ alert |
| KT-104 | [index.html:1786](../../index.html#L1786) | panel-m12 | button:Chi tiết | alert('Xem đơn tạm dừng'); | CN-13/Chỉ alert |
| KT-105 | [index.html:1796](../../index.html#L1796) | panel-m12 | button:Xem QĐ | alert('Xem quyết định thôi học'); | CN-13/Chỉ alert |
| KT-106 | [index.html:1811](../../index.html#L1811) | panel-m13 | button:📊 Xuất Báo Cáo Kiểm Định AUN-QA | DTMS_MANAGEMENT.handleExportReport('BaoCao_KiemDinh_AUN-QA_2026.xlsx') | CN-53/handleExportReport |
| KT-107 | [index.html:1814](../../index.html#L1814) | panel-m13 | button:📑 Xuất Báo Cáo Thông tư 18 | DTMS_MANAGEMENT.handleExportReport('ThongKe_TienDo_TT18_BGDDT.pdf') | CN-53/handleExportReport |
| KT-108 | [index.html:1817](../../index.html#L1817) | panel-m13 | button:📥 Xuất Dữ Liệu Ba Công Khai | DTMS_MANAGEMENT.handleExportReport('DuLieu_BaCongKhai_SĐH_2026.xlsx') | CN-53/handleExportReport |
| KT-109 | [index.html:1834](../../index.html#L1834) | panel-m13 | input:quick-degree-input | type=text,id=quick-degree-input | CN-49/Quick lookup |
| KT-110 | [index.html:1835](../../index.html#L1835) | panel-m13 | button:🔍 Tra cứu ngay | DTMS_MANAGEMENT.openDegreeLookup(document.getElementById('quick-degree-input').value) | CN-49/openDegreeLookup |
| KT-111 | [index.html:1838](../../index.html#L1838) | panel-m13 | button:🏛 Mở Console 3D | data-switch-view=public | CN-01/Điều hướng |
| KT-112 | [index.html:1936](../../index.html#L1936) | panel-m14 | button:⇄ Chuyển đổi vai trò làm việc | DTMS_MANAGEMENT.openModal('modal-role-switcher') | CN-03/Đổi demo/reload |
| KT-113 | [index.html:1939](../../index.html#L1939) | panel-m14 | button:📥 Xuất Audit Log (CSV) | DTMS_MANAGEMENT.handleExportAuditLog() | CN-54/handleExportAuditLog |
| KT-114 | [index.html:2029](../../index.html#L2029) | panel-m14 | button:⟳ Làm mới | DTMS_MANAGEMENT.refreshAuditLog() | CN-54/refreshAuditLog |
| KT-115 | [index.html:2096](../../index.html#L2096) | public | input:Lọc theo tên NCS, chuyên ngành hoặc tên luận án... | type=text,data-i18n-placeholder=thesis_search_ph,data-thesis-search-input=None | CN-57/Lọc mảng |
| KT-116 | [index.html:2108](../../index.html#L2108) | public | input:code-input | type=text,id=code-input,data-i18n-placeholder=ver_code_ph,data-input-code=None | CN-58/Register mẫu |
| KT-117 | [index.html:2112](../../index.html#L2112) | public | input:name-input | type=text,id=name-input,data-i18n-placeholder=ver_name_ph,data-input-name=None | CN-58/Register mẫu |
| KT-118 | [index.html:2114](../../index.html#L2114) | public | button:Xuất phôi bằng Tiến sĩ 3D | data-i18n=ver_btn,data-verify-btn=None | CN-58/Register mẫu |
| KT-119 | [index.html:2189](../../index.html#L2189) | modal-role-switcher | button:✕ | data-close-modal=modal-role-switcher | CN-07/Đóng UI |
| KT-120 | [index.html:2195](../../index.html#L2195) | modal-role-switcher | div:NCS NCS. Nguyễn Văn Bình Nghiên cứu sinh Khóa 2023 | DTMS_MANAGEMENT.switchRole('NCS'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-121 | [index.html:2201](../../index.html#L2201) | modal-role-switcher | div:NHD GS.TS. Trần Văn Hướng Người hướng dẫn khoa học chính | DTMS_MANAGEMENT.switchRole('NHD'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-122 | [index.html:2207](../../index.html#L2207) | modal-role-switcher | div:Bộ môn TS. Lê Hoàng Nam Trưởng Bộ môn Kỹ thuật Môi trường | DTMS_MANAGEMENT.switchRole('BM'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-123 | [index.html:2213](../../index.html#L2213) | modal-role-switcher | div:Khoa PGS.TS. Nguyễn Thị Kim Phó Trưởng Khoa Nông nghiệp - TNTN | DTMS_MANAGEMENT.switchRole('KHOA'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-124 | [index.html:2219](../../index.html#L2219) | modal-role-switcher | div:Phòng Đào tạo ThS. Phạm Minh Đăng Chuyên viên QLĐT Sau đại học | DTMS_MANAGEMENT.switchRole('PDT'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-125 | [index.html:2225](../../index.html#L2225) | modal-role-switcher | div:Ban Giám hiệu PGS.TS. Võ Văn Thắng Hiệu trưởng Trường Đại học An Giang | DTMS_MANAGEMENT.switchRole('BGH'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-126 | [index.html:2231](../../index.html#L2231) | modal-role-switcher | div:Hội đồng PGS.TS. Nguyễn Minh Châu Ủy viên Hội đồng đánh giá luận án | DTMS_MANAGEMENT.switchRole('HOIDONG'); DTMS_MANAGEMENT.closeModal('modal-role-switcher'); | CN-03/Đổi demo/reload |
| KT-127 | [index.html:2245](../../index.html#L2245) | modal-login | button:✕ | data-close-modal=modal-login | CN-07/Đóng UI |
| KT-128 | [index.html:2250](../../index.html#L2250) | modal-login | input:login-username | id=login-username,type=email | CN-02/Control form/theo 02 |
| KT-129 | [index.html:2254](../../index.html#L2254) | modal-login | input:login-password | id=login-password,type=password | CN-02/Control form/theo 02 |
| KT-130 | [index.html:2260](../../index.html#L2260) | modal-login | input:checkbox | type=checkbox | CN-02/Control form/theo 02 |
| KT-131 | [index.html:2262](../../index.html#L2262) | modal-login | a:Quên mật khẩu? | # | CN-02/Control form/theo 02 |
| KT-132 | [index.html:2264](../../index.html#L2264) | modal-login | button:Đăng Nhập Hệ Thống | type=submit | CN-02/Control form/theo 02 |
| KT-133 | [index.html:2276](../../index.html#L2276) | modal-edit-profile | button:✕ | data-close-modal=modal-edit-profile | CN-07/Đóng UI |
| KT-134 | [index.html:2282](../../index.html#L2282) | modal-edit-profile | input:text | type=text,readonly=None | CN-11/Control form/theo 02 |
| KT-135 | [index.html:2286](../../index.html#L2286) | modal-edit-profile | input:text | type=text,readonly=None | CN-11/Control form/theo 02 |
| KT-136 | [index.html:2290](../../index.html#L2290) | modal-edit-profile | input:profile-phone-input | type=text,id=profile-phone-input | CN-11/Control form/theo 02 |
| KT-137 | [index.html:2294](../../index.html#L2294) | modal-edit-profile | input:profile-email-input | type=email,id=profile-email-input | CN-11/Control form/theo 02 |
| KT-138 | [index.html:2298](../../index.html#L2298) | modal-edit-profile | input:profile-workplace-input | type=text,id=profile-workplace-input | CN-11/Control form/theo 02 |
| KT-139 | [index.html:2302](../../index.html#L2302) | modal-edit-profile | button:Hủy bỏ | type=button,data-close-modal=modal-edit-profile | CN-07/Đóng UI |
| KT-140 | [index.html:2303](../../index.html#L2303) | modal-edit-profile | button:Lưu Thay Đổi | type=submit | CN-11/Control form/theo 02 |
| KT-141 | [index.html:2314](../../index.html#L2314) | modal-leave-request | button:✕ | data-close-modal=modal-leave-request | CN-07/Đóng UI |
| KT-142 | [index.html:2319](../../index.html#L2319) | modal-leave-request | select:Gia hạn thời gian đào tạo (Tối đa 12 tháng/lần) Tạm dừng học tập (Nghỉ học tạm thời / Bảo lưu) | id=leave-type-select | CN-12/Control form/theo 02 |
| KT-143 | [index.html:2326](../../index.html#L2326) | modal-leave-request | input:leave-duration-input | type=text,id=leave-duration-input | CN-12/Control form/theo 02 |
| KT-144 | [index.html:2330](../../index.html#L2330) | modal-leave-request | textarea:leave-reason-input | id=leave-reason-input | CN-12/Control form/theo 02 |
| KT-145 | [index.html:2335](../../index.html#L2335) | modal-leave-request | input:leave-file-input | type=file,id=leave-file-input,accept=.pdf,.doc,.docx | CN-12/Control form/theo 02 |
| KT-146 | [index.html:2341](../../index.html#L2341) | modal-leave-request | button:Hủy | type=button,data-close-modal=modal-leave-request | CN-07/Đóng UI |
| KT-147 | [index.html:2342](../../index.html#L2342) | modal-leave-request | button:Gửi Đơn Lên Khoa & PĐT | type=submit | CN-12/Control form/theo 02 |
| KT-148 | [index.html:2353](../../index.html#L2353) | modal-assign-supervisor | button:✕ | data-close-modal=modal-assign-supervisor | CN-07/Đóng UI |
| KT-149 | [index.html:2358](../../index.html#L2358) | modal-assign-supervisor | select:NCS. Nguyễn Văn Bình (Khoa học Môi trường K2023) NCS. Lê Thị Mai (Trồng trọt K2022) NCS. Trần Quốc Huy (Khoa học Môi trường K2024) | id=assign-ncs-select | CN-18/Control form/theo 02 |
| KT-150 | [index.html:2366](../../index.html#L2366) | modal-assign-supervisor | select:GS.TS. Trần Văn Hướng (Đang hướng dẫn 2/3 - Còn 1 chỉ tiêu) PGS.TS. Lê Văn Tuấn (Đang hướng dẫn 2/2) TS. Nguyễn Hải Nam (Đang hướng dẫn 1/1) | id=assign-nhd-main-select | CN-18/Control form/theo 02 |
| KT-151 | [index.html:2374](../../index.html#L2374) | modal-assign-supervisor | select:Không có NHD phụ PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) | id=assign-nhd-sub-select | CN-18/Control form/theo 02 |
| KT-152 | [index.html:2382](../../index.html#L2382) | modal-assign-supervisor | input:assign-decision-input | type=text,id=assign-decision-input | CN-18/Control form/theo 02 |
| KT-153 | [index.html:2385](../../index.html#L2385) | modal-assign-supervisor | button:Hủy | type=button,data-close-modal=modal-assign-supervisor | CN-07/Đóng UI |
| KT-154 | [index.html:2386](../../index.html#L2386) | modal-assign-supervisor | button:Ban Hành Quyết Định Phân Công | type=submit | CN-18/Control form/theo 02 |
| KT-155 | [index.html:2397](../../index.html#L2397) | modal-grade-essay | button:✕ | data-close-modal=modal-grade-essay | CN-07/Đóng UI |
| KT-156 | [index.html:2403](../../index.html#L2403) | modal-grade-essay | input:essay-score-1 | type=number,id=essay-score-1 | CN-24/Control form/theo 02 |
| KT-157 | [index.html:2407](../../index.html#L2407) | modal-grade-essay | input:essay-score-2 | type=number,id=essay-score-2 | CN-24/Control form/theo 02 |
| KT-158 | [index.html:2411](../../index.html#L2411) | modal-grade-essay | input:essay-score-3 | type=number,id=essay-score-3 | CN-24/Control form/theo 02 |
| KT-159 | [index.html:2416](../../index.html#L2416) | modal-grade-essay | textarea:Tiểu luận tổng quan cập nhật đầy đủ các công trình nghiên cứu trong và ngoài nước trong 5 năm gần đây, phương pháp luận rõ ràng, đề tài có tính cấp thiết cao. |  | CN-24/Control form/theo 02 |
| KT-160 | [index.html:2419](../../index.html#L2419) | modal-grade-essay | button:Hủy | type=button,data-close-modal=modal-grade-essay | CN-07/Đóng UI |
| KT-161 | [index.html:2420](../../index.html#L2420) | modal-grade-essay | button:Lưu Điểm & Ký Biên Bản | type=submit | CN-24/Control form/theo 02 |
| KT-162 | [index.html:2431](../../index.html#L2431) | modal-declare-pub | button:✕ | data-close-modal=modal-declare-pub | CN-07/Đóng UI |
| KT-163 | [index.html:2437](../../index.html#L2437) | modal-declare-pub | input:pub-title-input | type=text,id=pub-title-input | CN-33/Control form/theo 02 |
| KT-164 | [index.html:2441](../../index.html#L2441) | modal-declare-pub | input:pub-journal-input | type=text,id=pub-journal-input | CN-33/Control form/theo 02 |
| KT-165 | [index.html:2445](../../index.html#L2445) | modal-declare-pub | select:WoS (SCIE / SSCI) · Q1 WoS (SCIE / SSCI) · Q2 Scopus · Q2 Scopus · Q3 / Q4 Tạp chí uy tín thuộc danh mục HĐGSNN (>= 0.75đ) | id=pub-cat-select | CN-33/Control form/theo 02 |
| KT-166 | [index.html:2455](../../index.html#L2455) | modal-declare-pub | input:pub-doi-input | type=text,id=pub-doi-input | CN-33/Control form/theo 02 |
| KT-167 | [index.html:2459](../../index.html#L2459) | modal-declare-pub | input:0944-1344 | type=text | CN-33/Control form/theo 02 |
| KT-168 | [index.html:2464](../../index.html#L2464) | modal-declare-pub | input:pub-file-input | type=file,id=pub-file-input,accept=.pdf | CN-33/Control form/theo 02 |
| KT-169 | [index.html:2471](../../index.html#L2471) | modal-declare-pub | button:Hủy | type=button,data-close-modal=modal-declare-pub | CN-07/Đóng UI |
| KT-170 | [index.html:2472](../../index.html#L2472) | modal-declare-pub | button:Gửi Thẩm Định Lên PĐT | type=submit | CN-33/Control form/theo 02 |
| KT-171 | [index.html:2483](../../index.html#L2483) | modal-workflow-pub | button:✕ | data-close-modal=modal-workflow-pub | CN-07/Đóng UI |
| KT-172 | [index.html:2534](../../index.html#L2534) | modal-workflow-defense | button:✕ | data-close-modal=modal-workflow-defense | CN-07/Đóng UI |
| KT-173 | [index.html:2595](../../index.html#L2595) | modal-workflow-changes | button:✕ | data-close-modal=modal-workflow-changes | CN-07/Đóng UI |
| KT-174 | [index.html:2640](../../index.html#L2640) | modal-edit-plan | button:✕ | data-close-modal=modal-edit-plan | CN-07/Đóng UI |
| KT-175 | [index.html:2646](../../index.html#L2646) | modal-edit-plan | select:Học kỳ 4 (04/2025 - 10/2025) Học kỳ 5 (10/2025 - 04/2026) Học kỳ 6 (04/2026 - 10/2026) |  | CN-15/Control form/theo 02 |
| KT-176 | [index.html:2654](../../index.html#L2654) | modal-edit-plan | input:text | type=text | CN-15/Control form/theo 02 |
| KT-177 | [index.html:2658](../../index.html#L2658) | modal-edit-plan | textarea:Hoàn thành thí nghiệm thực địa giai đoạn 2, bảo vệ Chuyên đề tiến sĩ 3 và hoàn thiện bài báo gửi tạp chí quốc tế Q1. |  | CN-15/Control form/theo 02 |
| KT-178 | [index.html:2662](../../index.html#L2662) | modal-edit-plan | input:text | type=text | CN-15/Control form/theo 02 |
| KT-179 | [index.html:2666](../../index.html#L2666) | modal-edit-plan | button:Hủy | type=button,data-close-modal=modal-edit-plan | CN-07/Đóng UI |
| KT-180 | [index.html:2667](../../index.html#L2667) | modal-edit-plan | button:Lưu Kế Hoạch & Gửi Duyệt | type=submit | CN-15/Control form/theo 02 |
| KT-181 | [index.html:2678](../../index.html#L2678) | modal-change-supervisor | button:✕ | data-close-modal=modal-change-supervisor | CN-07/Đóng UI |
| KT-182 | [index.html:2683](../../index.html#L2683) | modal-change-supervisor | select:Thay đổi Người hướng dẫn chính Bổ sung thêm Người hướng dẫn 2 (Đồng hướng dẫn) Rút tên Người hướng dẫn phụ |  | CN-19/Control form/theo 02 |
| KT-183 | [index.html:2692](../../index.html#L2692) | modal-change-supervisor | input:text | type=text,readonly=None | CN-19/Control form/theo 02 |
| KT-184 | [index.html:2696](../../index.html#L2696) | modal-change-supervisor | select:PGS.TS. Lê Văn Tuấn (ĐH Khoa học Tự nhiên ĐHQG-HCM) TS. Nguyễn Hải Nam (Viện Môi trường ĐHQG-HCM) PGS.TS. Nguyễn Thị Kim (ĐH An Giang) |  | CN-19/Control form/theo 02 |
| KT-185 | [index.html:2705](../../index.html#L2705) | modal-change-supervisor | textarea:Nêu rõ lý do học thuật, sức khỏe hoặc điều chỉnh chuyên sâu phạm vi đề tài... |  | CN-19/Control form/theo 02 |
| KT-186 | [index.html:2710](../../index.html#L2710) | modal-change-supervisor | input:file | type=file,accept=.pdf | CN-19/Control form/theo 02 |
| KT-187 | [index.html:2716](../../index.html#L2716) | modal-change-supervisor | button:Hủy | type=button,data-close-modal=modal-change-supervisor | CN-07/Đóng UI |
| KT-188 | [index.html:2717](../../index.html#L2717) | modal-change-supervisor | button:Gửi Đề Xuất Lên Khoa & PĐT | type=submit | CN-19/Control form/theo 02 |
| KT-189 | [index.html:2728](../../index.html#L2728) | modal-submit-essay | button:✕ | data-close-modal=modal-submit-essay | CN-07/Đóng UI |
| KT-190 | [index.html:2733](../../index.html#L2733) | modal-submit-essay | input:text | type=text | CN-23/Control form/theo 02 |
| KT-191 | [index.html:2737](../../index.html#L2737) | modal-submit-essay | textarea:Tiểu luận phân tích và tổng hợp 68 công trình nghiên cứu về công nghệ màng sinh học, thực vật thủy sinh và giải pháp kinh tế tuần hoàn trong xử lý nước thải chăn nuôi lợn quy mô trang trại... |  | CN-23/Control form/theo 02 |
| KT-192 | [index.html:2742](../../index.html#L2742) | modal-submit-essay | input:file | type=file,accept=.pdf | CN-23/Control form/theo 02 |
| KT-193 | [index.html:2748](../../index.html#L2748) | modal-submit-essay | button:Hủy | type=button,data-close-modal=modal-submit-essay | CN-07/Đóng UI |
| KT-194 | [index.html:2749](../../index.html#L2749) | modal-submit-essay | button:Nộp Bài Cho Bộ Môn | type=submit | CN-23/Control form/theo 02 |
| KT-195 | [index.html:2760](../../index.html#L2760) | modal-submit-outline | button:✕ | data-close-modal=modal-submit-outline | CN-07/Đóng UI |
| KT-196 | [index.html:2765](../../index.html#L2765) | modal-submit-outline | input:text | type=text | CN-25/Control form/theo 02 |
| KT-197 | [index.html:2770](../../index.html#L2770) | modal-submit-outline | input:text | type=text | CN-25/Control form/theo 02 |
| KT-198 | [index.html:2774](../../index.html#L2774) | modal-submit-outline | input:text | type=text | CN-25/Control form/theo 02 |
| KT-199 | [index.html:2780](../../index.html#L2780) | modal-submit-outline | input:outline-file-input | type=file,id=outline-file-input,accept=.pdf | CN-25/Control form/theo 02 |
| KT-200 | [index.html:2788](../../index.html#L2788) | modal-submit-outline | input:outline-explanation-file-input | type=file,id=outline-explanation-file-input,accept=.pdf | CN-25/Control form/theo 02 |
| KT-201 | [index.html:2794](../../index.html#L2794) | modal-submit-outline | button:Hủy | type=button,data-close-modal=modal-submit-outline | CN-07/Đóng UI |
| KT-202 | [index.html:2795](../../index.html#L2795) | modal-submit-outline | button:Lưu & Gửi Phê Duyệt | type=submit | CN-25/Control form/theo 02 |
| KT-203 | [index.html:2806](../../index.html#L2806) | modal-register-topic | button:✕ | data-close-modal=modal-register-topic | CN-07/Đóng UI |
| KT-204 | [index.html:2811](../../index.html#L2811) | modal-register-topic | select:Chuyên đề 1 (2 Tín chỉ) Chuyên đề 2 (2 Tín chỉ) Chuyên đề 3 (2 Tín chỉ) |  | CN-27/Control form/theo 02 |
| KT-205 | [index.html:2819](../../index.html#L2819) | modal-register-topic | input:Nhập tên chuyên đề chuyên sâu... | type=text | CN-27/Control form/theo 02 |
| KT-206 | [index.html:2824](../../index.html#L2824) | modal-register-topic | select:GS.TS. Trần Văn Hướng PGS.TS. Lê Văn Tuấn TS. Nguyễn Hải Nam TS. Lê Hoàng Nam |  | CN-27/Control form/theo 02 |
| KT-207 | [index.html:2833](../../index.html#L2833) | modal-register-topic | input:Tháng / Năm (Ví dụ: 12/2025) | type=text | CN-27/Control form/theo 02 |
| KT-208 | [index.html:2839](../../index.html#L2839) | modal-register-topic | input:file | type=file,accept=.pdf,.doc,.docx | CN-27/Control form/theo 02 |
| KT-209 | [index.html:2845](../../index.html#L2845) | modal-register-topic | button:Hủy | type=button,data-close-modal=modal-register-topic | CN-07/Đóng UI |
| KT-210 | [index.html:2846](../../index.html#L2846) | modal-register-topic | button:Đăng Ký Chuyên Đề | type=submit | CN-27/Control form/theo 02 |
| KT-211 | [index.html:2857](../../index.html#L2857) | modal-submit-progress | button:✕ | data-close-modal=modal-submit-progress | CN-07/Đóng UI |
| KT-212 | [index.html:2863](../../index.html#L2863) | modal-submit-progress | select:Kỳ 5 (10/2025 - 04/2026) Kỳ 6 (04/2026 - 10/2026) |  | CN-30/Control form/theo 02 |
| KT-213 | [index.html:2870](../../index.html#L2870) | modal-submit-progress | input:text | type=text,readonly=None | CN-30/Control form/theo 02 |
| KT-214 | [index.html:2874](../../index.html#L2874) | modal-submit-progress | textarea:Đã hoàn thành toàn bộ thí nghiệm tại hiện trường An Giang và thu thập 120 mẫu nước thải; đã công bố thành công 01 bài báo trên Tạp chí WoS Q1; đang tiến hành viết chương 3 và chương 4 của bản thảo luận án. |  | CN-30/Control form/theo 02 |
| KT-215 | [index.html:2878](../../index.html#L2878) | modal-submit-progress | input:text | type=text | CN-30/Control form/theo 02 |
| KT-216 | [index.html:2882](../../index.html#L2882) | modal-submit-progress | input:text | type=text | CN-30/Control form/theo 02 |
| KT-217 | [index.html:2887](../../index.html#L2887) | modal-submit-progress | input:progress-file-input | type=file,id=progress-file-input,accept=.pdf | CN-30/Control form/theo 02 |
| KT-218 | [index.html:2894](../../index.html#L2894) | modal-submit-progress | button:Hủy | type=button,data-close-modal=modal-submit-progress | CN-07/Đóng UI |
| KT-219 | [index.html:2895](../../index.html#L2895) | modal-submit-progress | button:Gửi Cho NHD Đánh Giá | type=submit | CN-30/Control form/theo 02 |
| KT-220 | [index.html:2906](../../index.html#L2906) | modal-change-topic-title | button:✕ | data-close-modal=modal-change-topic-title | CN-07/Đóng UI |
| KT-221 | [index.html:2911](../../index.html#L2911) | modal-change-topic-title | textarea:Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn tại vùng ĐBSCL | readonly=None | CN-37/Control form/theo 02 |
| KT-222 | [index.html:2915](../../index.html#L2915) | modal-change-topic-title | textarea:Nghiên cứu giải pháp công nghệ sinh học tích hợp xử lý nước thải chăn nuôi lợn và thu hồi năng lượng tái tạo tại vùng Đồng bằng sông Cửu Long |  | CN-37/Control form/theo 02 |
| KT-223 | [index.html:2919](../../index.html#L2919) | modal-change-topic-title | textarea:Research on integrated biotechnological solutions for piggery wastewater treatment and renewable energy recovery in the Mekong Delta region |  | CN-37/Control form/theo 02 |
| KT-224 | [index.html:2923](../../index.html#L2923) | modal-change-topic-title | textarea:Bổ sung phần thu hồi năng lượng sinh học nhằm phản ánh chính xác kết quả thực nghiệm và tăng tính ứng dụng thực tiễn của luận án. |  | CN-37/Control form/theo 02 |
| KT-225 | [index.html:2928](../../index.html#L2928) | modal-change-topic-title | input:change-title-file-input | type=file,id=change-title-file-input,accept=.pdf | CN-37/Control form/theo 02 |
| KT-226 | [index.html:2934](../../index.html#L2934) | modal-change-topic-title | button:Hủy | type=button,data-close-modal=modal-change-topic-title | CN-07/Đóng UI |
| KT-227 | [index.html:2935](../../index.html#L2935) | modal-change-topic-title | button:Trình Khoa & Hiệu Trưởng Phê Duyệt | type=submit | CN-37/Control form/theo 02 |
| KT-228 | [index.html:2946](../../index.html#L2946) | modal-upload-thesis-version | button:✕ | data-close-modal=modal-upload-thesis-version | CN-07/Đóng UI |
| KT-229 | [index.html:2951](../../index.html#L2951) | modal-upload-thesis-version | select:v3.1 - Bản chỉnh sửa hoàn thiện sau bảo vệ chính thức v3.0 - Bản bảo vệ chính thức cấp Trường v2.0 - Bản gửi Phản biện độc lập |  | CN-38/Control form/theo 02 |
| KT-230 | [index.html:2959](../../index.html#L2959) | modal-upload-thesis-version | textarea:Mô tả tóm tắt nội dung chỉnh sửa so với phiên bản trước... |  | CN-38/Control form/theo 02 |
| KT-231 | [index.html:2964](../../index.html#L2964) | modal-upload-thesis-version | input:thesis-file-input | type=file,id=thesis-file-input,accept=.pdf | CN-38/Control form/theo 02 |
| KT-232 | [index.html:2970](../../index.html#L2970) | modal-upload-thesis-version | button:Hủy | type=button,data-close-modal=modal-upload-thesis-version | CN-07/Đóng UI |
| KT-233 | [index.html:2971](../../index.html#L2971) | modal-upload-thesis-version | button:Upload & Lưu Phiên Bản | type=submit | CN-38/Control form/theo 02 |
| KT-234 | [index.html:2982](../../index.html#L2982) | modal-submit-post-defense | button:✕ | data-close-modal=modal-submit-post-defense | CN-07/Đóng UI |
| KT-235 | [index.html:2989](../../index.html#L2989) | modal-submit-post-defense | input:post-defense-thesis-file | type=file,id=post-defense-thesis-file,accept=.pdf | CN-47/Control form/theo 02 |
| KT-236 | [index.html:2997](../../index.html#L2997) | modal-submit-post-defense | input:post-defense-explanation-file | type=file,id=post-defense-explanation-file,accept=.pdf | CN-47/Control form/theo 02 |
| KT-237 | [index.html:3004](../../index.html#L3004) | modal-submit-post-defense | input:text | type=text | CN-47/Control form/theo 02 |
| KT-238 | [index.html:3008](../../index.html#L3008) | modal-submit-post-defense | input:text | type=text | CN-47/Control form/theo 02 |
| KT-239 | [index.html:3012](../../index.html#L3012) | modal-submit-post-defense | button:Hủy | type=button,data-close-modal=modal-submit-post-defense | CN-07/Đóng UI |
| KT-240 | [index.html:3013](../../index.html#L3013) | modal-submit-post-defense | button:Gửi Hồ Sơ Xét Cấp Bằng | type=submit | CN-47/Control form/theo 02 |
| KT-241 | [index.html:3024](../../index.html#L3024) | modal-create-change-request | button:✕ | data-close-modal=modal-create-change-request | CN-07/Đóng UI |
| KT-242 | [index.html:3029](../../index.html#L3029) | modal-create-change-request | select:Thay đổi / Bổ sung Người hướng dẫn khoa học Thay đổi tên đề tài nghiên cứu Xin tạm dừng học tập / Nghỉ học tạm thời Gia hạn thời gian đào tạo (6 - 12 tháng) Chuyển cơ sở đào tạo / Chuyển ngành Xử lý buộc thôi học (do quá hạn tối đa hoặc vi phạm) |  | CN-50/Control form/theo 02 |
| KT-243 | [index.html:3040](../../index.html#L3040) | modal-create-change-request | textarea:Trình bày lý do, thời gian, cơ sở thực hiện... |  | CN-50/Control form/theo 02 |
| KT-244 | [index.html:3045](../../index.html#L3045) | modal-create-change-request | input:file | type=file,accept=.pdf | CN-50/Control form/theo 02 |
| KT-245 | [index.html:3051](../../index.html#L3051) | modal-create-change-request | button:Hủy | type=button,data-close-modal=modal-create-change-request | CN-07/Đóng UI |
| KT-246 | [index.html:3052](../../index.html#L3052) | modal-create-change-request | button:Gửi Yêu Cầu Xử Lý | type=submit | CN-50/Control form/theo 02 |
| KT-247 | [index.html:3060](../../index.html#L3060) | global | button:Hỗ trợ & Liên hệ | data-contact-trigger=None | CN-60/Hub/chat |
| KT-248 | [index.html:3067](../../index.html#L3067) | global | button:Chat qua Zalo Hỗ trợ | data-option-zalo=None | CN-60/Hub/chat |
| KT-249 | [index.html:3072](../../index.html#L3072) | global | button:Messenger Facebook | data-option-fb=None | CN-60/Hub/chat |
| KT-250 | [index.html:3077](../../index.html#L3077) | global | button:🤖 AI Trợ lý Học thuật | data-option-ai=None | CN-60/Hub/chat |
| KT-251 | [index.html:3096](../../index.html#L3096) | global | button:✕ | data-ai-chat-close=None | CN-60/Hub/chat |
| KT-252 | [index.html:3106](../../index.html#L3106) | global | button:DTMS là gì? | data-i18n=chip1 | CN-60/Hub/chat |
| KT-253 | [index.html:3107](../../index.html#L3107) | global | button:Quy trình 6 bước? | data-i18n=chip2 | CN-60/Hub/chat |
| KT-254 | [index.html:3108](../../index.html#L3108) | global | button:Điều kiện bảo vệ? | data-i18n=chip3 | CN-60/Hub/chat |
| KT-255 | [index.html:3109](../../index.html#L3109) | global | button:Tra cứu văn bằng? | data-i18n=chip4 | CN-60/Hub/chat |
| KT-256 | [index.html:3113](../../index.html#L3113) | global | input:Nhập câu hỏi của bạn... | type=text,data-i18n-placeholder=ai_input_ph,data-ai-chat-input=None | CN-60/Hub/chat |
| KT-257 | [index.html:3114](../../index.html#L3114) | global | button:Gửi | data-i18n=ai_send,data-ai-chat-send=None | CN-60/Hub/chat |
| KT-258 | [index.html:3123](../../index.html#L3123) | global | button:✕ | data-modal-close=None | CN-07/Đóng UI |

## Thiếu handler/UI

Search/selectm01, remember checkbox, quên mật khẩu placeholder; không pagination/logout/CRUDuser-role-program-supervisor/importNCS-importđiểm/reviewoutline-post-change/council CRUD/giao PB/seminar/publish/lockversion. Không nhận có function chỉ vì label.

## CSS/init

app.css: 318 và management.css: 842[hidden]; app.css: 320–340 ẩnrole/resetở 860 px/textở 520 px. Không thay quyền. os-view/panel/modal theo active/open; initManagement mở management dùhomeis-activebanđầu. Các nút mobileẩnđãkiểm kê.
