# Rà soát frontend DTMS

> Báo cáo lịch sử ngày 17/10/2026. Bản hiện tại xem `../TODO.md`, `../PROGRESS.md` và `BAO_CAO_HOAN_THIEN_FRONTEND_2026-10-18.md`; các kết luận/file path dưới đây thuộc lần sửa trước.

Ngày: 17/10/2026. Phạm vi: toàn bộ mã trong Demo Frontend và README thư mục cha. Công nghệ thực tế: HTML, CSS, JavaScript thuần; không có framework, package.json, backend hoặc database trong bản mã này. Tài liệu backend-handoff cũ là đặc tả đề xuất, không phải endpoint đã triển khai.

## Đánh giá trước khi sửa

| STT | Phân hệ / Chức năng | Trạng thái | Vấn đề | Hướng xử lý |
|---|---|---|---|---|
| 1 | 7 màn hình: home, management, roles, roadmap, public, citations, about | Đã có nhưng cần cải thiện | Điều hướng không giữ lịch sử; phần tử bấm thiếu bàn phím | Chuẩn hóa điều hướng, semantic và focus |
| 2 | Đăng nhập / 7 vai trò | Có lỗi cần sửa | Tự vào NCS, thiếu đăng xuất; mật khẩu demo dễ hiểu nhầm xác thực thật | Gắn nhãn demo, phiên, đăng xuất và kiểm quyền handler |
| 3 | M01 Hồ sơ NCS | Chưa hoàn thiện | Chỉ sửa liên hệ của một NCS; nút hai hồ sơ khác chỉ alert | CRUD danh sách demo, validation, bảo vệ hồ sơ mẫu |
| 4 | M02 Chương trình / kế hoạch | Đã có nhưng cần cải thiện | Duyệt NHD→BM→PDT hoạt động ở localStorage; thông tin form không hiện lại ở panel | Lưu và render kế hoạch đã gửi |
| 5 | M03 Người hướng dẫn | Có lỗi cần sửa | Định mức UI khác state; gửi lại tăng quota; phân công không hiện lại | Chặn trùng, lưu phân công, render quota |
| 6 | M04 Học phần | Đã có nhưng cần cải thiện | Đăng ký lưu local; đồng bộ điểm chỉ alert thành công | Kiểm quyền; trạng thái tích hợp đúng thực tế |
| 7 | M05 Tiểu luận / đề cương | Có lỗi cần sửa | Điểm chỉ được kiểm qua HTML; gửi đề cương chưa có thao tác duyệt | Kiểm điểm, lưu trạng thái, bổ sung duyệt demo |
| 8 | M06 Chuyên đề | Có lỗi cần sửa | Mọi điểm 0–10 đều thành Đạt; đăng ký chưa cập nhật đủ tiêu đề | Kết quả đúng điểm, cập nhật panel |
| 9 | M07 Tiến độ | Có lỗi cần sửa | Handler đánh giá thiếu quyền; bảng chỉ có 4 trong 6 kỳ; gửi nhắc giả | Hiển thị đủ kỳ, kiểm quyền, ghi nhắc cục bộ |
| 10 | M08 Công bố | Đã có nhưng cần cải thiện | Thêm/thẩm định có lưu; thiếu chống trùng DOI và sửa/xóa bản chưa duyệt | CRUD có quyền, xác thực DOI |
| 11 | M09 Luận án | Chưa hoàn thiện | Lưu metadata qua form nhưng bảng phiên bản không cập nhật; ký số giả | Render phiên bản, ghi xác nhận demo |
| 12 | M10 Bảo vệ | Có lỗi cần sửa | Checklist tự coi đủ 24 tín chỉ dù màn hình ghi 18/24; phiếu mẫu | Đối soát state, phân biệt quy tắc demo |
| 13 | M11 Cấp bằng | Có lỗi cần sửa | Cấp bằng chưa chặn thiếu phiếu / hồ sơ sau bảo vệ; giả ký thật | Bổ sung điều kiện và nhãn mô phỏng |
| 14 | M12 Biến động | Chưa hoàn thiện | Chỉ ghi chung workflow, bảng không cập nhật | Đưa yêu cầu mới vào bảng |
| 15 | M13 Báo cáo | Có lỗi cần sửa | Nút ghi XLSX/PDF nhưng trả CSV, nội dung hardcoded | Xuất CSV đúng tên, lấy state hiện hành |
| 16 | M14 Nhật ký | Đã có nhưng cần cải thiện | Có xuất CSV nhưng dữ liệu chèn HTML chưa escape hết | Escape, xuất CSV an toàn, lọc/phân trang |
| 17 | Danh sách / bảng | Chưa có | Không tìm/lọc/sắp xếp/phân trang bảng quản trị | Thành phần dùng chung |
| 18 | Responsive / modal / upload | Có lỗi cần sửa | Dock cố định chiếm mobile; nhiều grid inline; thiếu focus trap, giới hạn tệp | CSS dùng chung, drawer, dialog, validation |
| 19 | Tra cứu bằng / luận án công khai | Đã có nhưng cần cải thiện | Sổ bằng và bài mẫu; URL tệp rỗng; api.js chưa được nạp | Nhãn dữ liệu mẫu, trạng thái tệp, nối API cấu hình |
| 20 | Lưu dữ liệu | Có lỗi cần sửa | JSON thiếu trường gây crash; nuốt lỗi lưu; migration reset quota đã dùng | Đọc/ghi an toàn, giữ bản lỗi, bỏ reset tự động |
| 21 | Mã dùng chung | Có lỗi cần sửa | 12 hàm quản lý trùng tên, home.js là mã cũ không nạp | Bỏ bản hàm bị ghi đè, ghi rõ mã đang nạp |

## Nguồn dữ liệu

- `index.html`, `app.js`: nội dung mẫu, vai trò giới thiệu, roadmap, sổ bằng mẫu, luận án mẫu.
- `DTMS_MANAGEMENT_APP_STATE_V2`: hồ sơ, quota, kế hoạch, điểm, công bố, đơn, báo cáo và nhật ký demo.
- `DTMS_WORKFLOW_SUBMISSIONS_V1`: yêu cầu workflow và metadata tệp; không có nội dung tệp trên máy chủ.
- `sessionStorage.dtms-role`: persona demo; không phải phiên server hay cơ chế bảo mật.
- `API_BASE_URL` rỗng; `/api/public/theses` mới là tên cấu hình. Không có API sống để xác minh.

## Tiến độ

Đã hoàn tất kiểm kê, sửa nền tảng → chức năng demo → bảng/modal/responsive → adapter API. Kiểm thử tự động và kết quả cụ thể xem [TESTING.md](TESTING.md).

## Kết quả đã triển khai

- Bỏ **11 bản khai báo hàm trùng** đang bị ghi đè. Giữ một implementation và ngăn init đăng ký sự kiện lần hai.
- Thêm lớp lưu JSON `DTMS_DATA`; khôi phục trường bị thiếu, sao giữ JSON hỏng, báo lỗi lưu và rollback state. Không tự đặt lại quota người dùng đã sử dụng. Có sao lưu JSON và xác nhận reset.
- Phiên demo rõ ràng, bỏ mật khẩu hardcoded, nhớ email theo lựa chọn, đăng xuất giữ dữ liệu và chặn quản trị khi tải lại. Bổ sung kiểm quyền handler thay vì chỉ ẩn nút. Ma trận 7 vai trò lấy đúng các thao tác đang hỗ trợ.
- M01: thêm/xem/sửa NCS; xóa hồ sơ thêm mới có xác nhận. Giữ 3 hồ sơ mẫu. Chặn trùng mã/email, kiểm email/điện thoại. NCS chỉ thấy mình; NHD thấy NCS được gán trong mẫu. Sửa liên hệ cập nhật panel và danh sách sau tải lại.
- M02/M03: lưu/hiện kế hoạch đã gửi và duyệt đúng 3 cấp; lưu phân công và định mức mới, chống gửi trùng làm tăng quota; quota bảng/option nhất quán. Chi tiết NHD mở dialog dữ liệu thật đang có trong hàng.
- M04–M08: đăng ký/hủy học phần có lưu; điểm tiểu luận và chuyên đề kiểm khoảng, chuyên đề điểm thấp không tự thành Đạt; báo cáo hiện đủ 6 kỳ với trạng thái chờ/đạt/cần sửa; đề cương có duyệt demo; công bố thêm/sửa/xóa bản chưa duyệt, chặn trùng DOI, chỉ NHD/PDT thẩm định.
- M09–M12: form phiên bản luận án, sau bảo vệ, đổi NHD/đề tài/biến động lưu giá trị và hiện lại ở panel. Bảng phiên bản/biến động bổ sung dòng mới. Xác nhận NHD và phiếu là demo, không giả chữ ký số. Không hiển thị phần trăm Turnitin hoặc kết luận đạo văn giả.
- M10/M11: tín chỉ được cộng từ bảng điểm có kết quả (**12/24**); chặn cấp bằng nếu thiếu bảng kiểm, NHD, phiếu hoặc hồ sơ sau bảo vệ. Các ngưỡng vẫn là quy tắc demo cần nhà trường chốt.
- M13/M14: nút ghi đúng định dạng CSV, lấy state hiện tại; escape CSV để dữ liệu nhập không trở thành công thức khi mở bằng phần mềm bảng tính; nhật ký escape HTML, xuất tải thật. Nút nhắc hạn chỉ ghi cục bộ và nói rõ chưa gửi email.
- 15 bảng dùng chung tìm không dấu, lọc trạng thái khi có nhiều trạng thái, sắp xếp tên/số/ngày, phân trang 5/10/20, số bản ghi và empty state. Tìm/lọc NCS phía trên được nối vào bảng.
- Modal có nhãn dialog, focus, Tab/Shift+Tab, Escape, trả focus và cuộn trong màn hình. Form có label, lỗi tại trường, giữ dữ liệu sai, khóa gửi lặp; tệp kiểm định dạng/kích thước, hỗ trợ kéo thả và trường đính kèm tùy chọn.
- Menu mobile mở/đóng, hỗ trợ bàn phím; bảng cuộn trong vùng riêng; sửa tràn 390px (ban đầu body rộng 502px), nhãn 320px và lỗi cuộn do `body height:100%`. Dashboard thu gọn trên mobile để đến phân hệ nhanh hơn.
- Điều hướng có hash, Back/Forward và đường dẫn trực tiếp. Toast hiển thị text an toàn. Tra cứu văn bằng mẫu kiểm cả tên/mã và hiện rõ kết quả không tìm thấy.
- `api.js` được nạp; luận án công khai có loading/error/empty/retry, kiểm hợp đồng và URL, escape dữ liệu từ API. Khi cấu hình API nhưng gọi lỗi, không âm thầm hiển thị demo.

## Chưa hoàn thiện / giới hạn

1. Chưa có backend thật: auth, database, quyền server, upload, email, chữ ký số, Turnitin/WoS/Scopus, tra cứu bằng và export chính thức chưa xác minh.
2. Hồ sơ/điểm/quyết định và nhiều số liệu minh họa vẫn là demo. M01 chi tiết học vụ đang phục vụ NCS Nguyễn Văn Bình; hồ sơ mới chỉ có các trường trong CRUD, chưa có toàn bộ lịch sử đào tạo riêng.
3. BM/KHOA/BGH chưa có scope unitId; NHD demo đối chiếu tên, cần server quan hệ ID. Hai tab trình duyệt chỉnh cùng lúc chưa có khóa phiên bản; dùng backend để giải quyết xung đột.
4. Yêu cầu đổi đề tài/NHD/biến động được tiếp nhận và hiển thị, chưa có chuỗi phê duyệt/ban hành quyết định chính thức. Nút chưa có tệp thật được vô hiệu hóa có lý do; không tạo PDF minh chứng giả.
5. Dữ liệu bảng điểm mẫu chưa đủ 24 tín chỉ nên cấp bằng demo bị chặn đúng điều kiện. Không tự tạo thêm điểm để qua điều kiện.
6. Bộ dịch VI/EN cũ được giữ; một số thành phần mới còn tiếng Việt. Chưa chứng nhận accessibility toàn diện hoặc kiểm thử thiết bị vật lý.
7. Giới hạn môi trường trình duyệt ghi tại TESTING.md; WebKit không đồng nghĩa Safari thật. API mock test không đồng nghĩa kiểm thử backend thật.

## File đã thay đổi / bổ sung

| Loại | File | Mục đích |
|---|---|---|
| Sửa | `index.html` | Semantic main, menu, nhãn demo, dialog CRUD/xác nhận/thông tin, loại nút giả và nạp script |
| Sửa | `css/responsive.css` | Bố cục Studio/responsive, bảng, modal, focus, print |
| Sửa | `js/management.js` | State, quyền, CRUD, workflow, dashboard, báo cáo |
| Sửa | `js/app.js` | Điều hướng, toast, tra cứu mẫu, render/API luận án công khai |
| Sửa | `js/api.js`, `js/config.js` | Adapter HTTP/JSON/timeout và cấu hình credentials |
| Thêm | `js/data.js`, `js/ui.js` | Lưu trữ/CSV và thành phần bảng/form/dialog/upload dùng chung |
| Thêm | `scripts/serve.cjs` | Server local không cần framework |
| Thêm | `scripts/check-frontend.cjs`, `check-integration.cjs`, `check-all.cjs` | Kiểm thử có thể chạy lại |
| Thêm | `README.md`, `docs/FRONTEND_AUDIT.md`, `FRONTEND_TASKS.md`, `BACKEND_INTEGRATION.md`, `TESTING.md` | Hướng dẫn và bàn giao tiếng Việt |
| Sinh từ test | `docs/TEST_RESULTS_*.json`, `TEST_INTEGRATION_*.json`, `test-*.png` | Bằng chứng kết quả, ảnh kiểm tra |

Không thay framework, backend, database, `extracted_doc.txt` hoặc bộ tài liệu/ảnh backend-handoff cũ. Thư mục hiện tại không có Git nên không có git diff hay commit để báo cáo.
