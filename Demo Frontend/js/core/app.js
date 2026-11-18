/**
 * DTMS ACADEMIC STUDIO OS - SPA ENGINE (js/core/app.js)
 * Cổng Đào tạo Tiến sĩ Số - Trường ĐH An Giang (ĐHQG-HCM)
 * Dynamic Language Switcher (VI / EN) & High-Contrast Design System
 */
(function initializeStudioOS(global, document) {
  "use strict";

  let currentLang = global.DTMS_DATA.getString("dtms-language") === "EN" ? "EN" : "VI";
  let activePersonaKey = "NCS";
  const originalTextNodes = new WeakMap();
  const UI_PLACEHOLDERS_EN = {
    "Nhập câu hỏi của bạn...": "Enter your question...", "Tìm kiếm nhanh dữ liệu hệ thống...": "Search system data...",
    "Nhập mã số văn bằng hoặc họ tên để tra cứu...": "Enter a degree number or full name to search...",
    "Tìm theo tên NCS, chuyên ngành hoặc tên luận án...": "Search by candidate, field, or thesis title...",
    "Trình bày lý do, thời gian, cơ sở thực hiện...": "Explain the reason, duration, and requested arrangement...",
    "Nhập nội dung...": "Enter details...", "Tìm theo tên NCS, mã số, căn cước công dân...": "Search by candidate name, ID, or citizen ID...",
    "Nhập Số hiệu bằng (TS-AGU-2026-089) hoặc Họ tên...": "Enter a degree number (TS-AGU-2026-089) or full name...",
    "Ví dụ: TS-AGU-2025-089": "Example: TS-AGU-2025-089", "Ví dụ: Nguyễn Văn A": "Example: Nguyen Van A",
    "Ví dụ: 06 tháng (từ 15/10/2026 đến 15/04/2027)": "Example: 6 months (15 Oct 2026 to 15 Apr 2027)",
    "Nêu rõ lý do học thuật / công tác / sức khỏe và cam kết hoàn thành...": "Explain the academic, work, or health reason and your completion commitment...",
    "Nhập tên bài báo tiếng Anh hoặc tiếng Việt...": "Enter the publication title...", "Ví dụ: Water Science and Technology": "Example: Water Science and Technology",
    "Nêu rõ lý do học thuật, sức khỏe hoặc điều chỉnh chuyên sâu phạm vi đề tài...": "Explain the academic or health reason, or the proposed change in research scope...",
    "Nhập tên chuyên đề chuyên sâu...": "Enter the doctoral topic title...", "Tháng / Năm (Ví dụ: 12/2025)": "Month / year (e.g. 12/2025)",
    "Nhập tên đề tài mới đề xuất...": "Enter the proposed new thesis title...", "Mô tả tóm tắt nội dung chỉnh sửa so với phiên bản trước...": "Summarize changes from the previous version...",
    "Trình bày lý do, thời gian, cơ sở thực hiện...": "Describe the reason, duration, and requested arrangement..."
  };
  const UI_ATTRIBUTES_EN = {
    "Chuyển đổi vai trò làm việc": "Switch working role", "Khôi phục dữ liệu khởi tạo": "Restore initial data",
    "Thanh dock điều hướng": "Dock navigation", "Chuyển đổi ngôn ngữ": "Switch language", "Nhấp để chuyển đổi vai trò": "Click to switch role",
    "Chuyển đổi quyền làm việc": "Switch working role", "Khôi phục dữ liệu mẫu ban đầu": "Restore sample data", "Nhấp để đổi vai trò đăng nhập": "Click to change the signed-in role",
    "Hỗ trợ & Liên hệ": "Support & contact", "Đóng chat": "Close chat"
  };
  const UI_TRANSLATIONS_EN = {
    "Truy cập hệ thống DTMS": "Access DTMS", "Email người dùng:": "User email:", "Ghi nhớ email": "Remember email", "Tiếp tục": "Continue",
    "Nhập email gắn với hồ sơ người dùng để mở bàn làm việc tương ứng.": "Enter the email associated with your user profile to open your workspace.",
    "Không tìm thấy hồ sơ người dùng với email này. Vui lòng kiểm tra lại hoặc liên hệ đơn vị quản lý tài khoản.": "No user profile was found for this email. Check the address or contact your account administrator.",
    "Đã mở bàn làm việc": "Workspace opened", "Bạn có thể tiếp tục xử lý các nghiệp vụ theo vai trò của mình.": "You can continue with the tasks available to your role.",
    "Đã kết thúc phiên làm việc": "Session ended", "Dữ liệu đã lưu được giữ nguyên.": "Your saved records have been retained.",
    "Hồ sơ học vụ": "Academic records", "Lưu hồ sơ": "Save record", "Sao lưu dữ liệu JSON": "Back up data as JSON",
    "🔄 Khôi phục dữ liệu": "🔄 Restore data", "Theo dõi lịch sử thao tác và các thay đổi trong quá trình xử lý hồ sơ.": "Review activity history and changes made while processing academic records.",
    "Chức năng này hiện chưa khả dụng.": "This feature is currently unavailable.", "Vui lòng liên hệ đơn vị quản lý đào tạo hoặc quản trị hệ thống để được hỗ trợ.": "Please contact Academic Affairs or your system administrator for support.",
    "Dịch vụ chưa khả dụng": "Service unavailable", "Chưa có kết quả kiểm tra độ tương đồng": "No similarity check result is available",
    "Đổi vai trò": "Switch role", "⇄ Đổi vai trò": "⇄ Switch role", "Đổi Vai trò": "Switch role", "⇄ Đổi Vai trò": "⇄ Switch role", "Reset Data": "Reset data", "Đăng nhập OS": "Sign in",
    "Vào Hệ thống Quản trị Học vụ (14 Phân hệ Nghiệp vụ) →": "Open Academic Management (14 modules) →",
    "🔍 Tra cứu Phôi bằng 3D": "🔍 Verify 3D diploma", "✎ Cập nhật thông tin cá nhân": "✎ Edit profile",
    "📄 Đơn xin gia hạn / Tạm dừng": "📄 Extension / suspension request", "📥 Tải hồ sơ số (PDF)": "📥 Download digital file (PDF)",
    "Xem & Sửa": "View / edit", "+ Tạo đơn mới": "+ Create request", "📄 File đơn": "📄 Request file",
    "✎ Lập / Điều chỉnh kế hoạch": "✎ Create / revise plan", "✓ Phê duyệt kế hoạch (NHD/PĐT)": "✓ Approve plan (Advisor / Academic Affairs)",
    "📥 Tải Khung CTĐT": "📥 Download curriculum", "+ Thêm mốc": "+ Add milestone", "+ Phân công Người hướng dẫn": "+ Assign supervisor",
    "⇄ Đề xuất Thay đổi / Bổ sung NHD": "⇄ Request supervisor change", "Chi tiết": "Details", "⟳ Đồng bộ bảng điểm": "⟳ Sync grades",
    "+ Đăng ký": "+ Register", "📄 Nộp Tiểu luận tổng quan": "📄 Submit literature review", "📑 Nộp Đề cương nghiên cứu": "📑 Submit research proposal",
    "✎ Nhập điểm Tiểu ban": "✎ Enter committee grades", "📄 Tải Tiểu luận": "📄 Download review", "📋 Tải Biên bản": "📋 Download minutes",
    "📑 Tải Đề cương": "📑 Download proposal", "📝 Bản giải trình": "📝 Revision response", "+ Đăng ký chuyên đề mới": "+ Register doctoral topic",
    "📥 Tải sổ biên bản chuyên đề": "📥 Download topic minutes", "✎ Chấm điểm": "✎ Grade", "Biên bản": "Minutes",
    "+ Nộp Báo cáo tiến độ kỳ mới": "+ Submit progress report", "⚠️ Gửi cảnh báo quá hạn (Email)": "⚠️ Send overdue reminder (email)",
    "Nhắc nhở ngay": "Send reminder", "Đạt": "Pass", "File": "File", "+ Khai báo bài báo khoa học": "+ Declare publication",
    "📄 Minh chứng": "📄 Evidence", "✎ Đổi tên đề tài": "✎ Change thesis title", "+ Upload phiên bản luận án mới": "+ Upload thesis version",
    "✍ NHD Ký số đồng ý cho bảo vệ": "✍ Supervisor approval for defense", "▶ Quét Turnitin": "▶ Run similarity check",
    "+ Nộp phiên bản mới": "+ Submit new version", "Tải về": "Download", "Tải bản chính": "Download final version",
    "✓ Nhập kết quả bỏ phiếu Hội đồng (7/7 Đạt)": "✓ Enter council vote", "📋 Tải Nghị quyết HĐ": "📋 Download council resolution",
    "📄 Quyết định thành lập HĐ": "📄 Council appointment decision", "+ Nộp bản chỉnh sửa sau bảo vệ": "+ Submit post-defense revisions",
    "🎓 BGH Ký Quyết Định Công Nhận Học Vị": "🎓 Approve degree decision", "🏛 Xem Phôi Bằng Ép Kim 3D": "🏛 View 3D diploma",
    "📄 Giấy TV ĐHAG": "📄 AGU library receipt", "🏛 Giấy TV Quốc Gia": "🏛 National Library receipt",
    "+ Tạo đơn / Yêu cầu thay đổi": "+ Create change request", "Xem QĐ": "View decision", "📊 Xuất Báo Cáo Kiểm Định AUN-QA": "📊 Export AUN-QA report",
    "📑 Xuất Báo Cáo Thông tư 18": "📑 Export Circular 18 report", "📥 Xuất Dữ Liệu Ba Công Khai": "📥 Export public data",
    "🔍 Tra cứu ngay": "🔍 Search now", "🏛 Mở Console 3D": "🏛 Open 3D viewer", "⇄ Chuyển đổi vai trò làm việc": "⇄ Switch role",
    "📥 Xuất Audit Log (CSV)": "📥 Export audit log (CSV)", "⟳ Làm mới": "⟳ Refresh", "Xuất phôi bằng Tiến sĩ 3D": "Generate 3D doctoral diploma",
    "Đăng Nhập Hệ Thống": "Sign in", "Hủy bỏ": "Cancel", "Lưu Thay Đổi": "Save changes", "Hủy": "Cancel",
    "Gửi Đơn Lên Khoa & PĐT": "Submit to Faculty and Academic Affairs", "Ban Hành Quyết Định Phân Công": "Issue assignment decision",
    "Lưu Điểm & Ký Biên Bản": "Save grades and minutes", "Gửi Thẩm Định Lên PĐT": "Send to Academic Affairs for review",
    "Lưu Kế Hoạch & Gửi Duyệt": "Save plan and submit for approval", "Gửi Đề Xuất Lên Khoa & PĐT": "Submit request to Faculty and Academic Affairs",
    "Nộp Bài Cho Bộ Môn": "Submit to department", "Lưu & Gửi Phê Duyệt": "Save and submit for approval", "Đăng Ký Chuyên Đề": "Register topic",
    "Gửi Cho NHD Đánh Giá": "Submit to supervisor for review", "Trình Khoa & Hiệu Trưởng Phê Duyệt": "Submit to Faculty and Rector for approval",
    "Upload & Lưu Phiên Bản": "Upload and save version", "Gửi Hồ Sơ Xét Cấp Bằng": "Submit degree application", "Gửi Yêu Cầu Xử Lý": "Submit request",
    "Đã đánh giá (Đạt)": "Evaluated (Pass)", "Chờ đánh giá": "Awaiting review", "Đã duyệt": "Approved", "Đang chờ Khoa duyệt": "Awaiting faculty review",
    "Hỗ trợ & Liên hệ": "Support & contact", "Chat qua Zalo Hỗ trợ": "Chat with Zalo support", "Messenger Facebook": "Facebook Messenger",
    "🤖 AI Trợ lý Học thuật": "🤖 Academic AI assistant", "Gửi": "Send", "Quy trình 6 bước?": "What are the six steps?",
    "Điều kiện bảo vệ?": "Defense requirements?", "Tra cứu văn bằng?": "Verify a diploma?", "DTMS là gì?": "What is DTMS?",
    "M01. Hồ sơ NCS": "M01. Candidate profile", "M02. CTĐT & Kế hoạch": "M02. Program & plan", "M03. Người hướng dẫn": "M03. Supervisors",
    "M04. Học phần & Điểm": "M04. Courses & grades", "M05. Tiểu luận & Đề cương": "M05. Review & proposal", "M06. Chuyên đề Tiến sĩ": "M06. Doctoral topics",
    "M07. Tiến độ Nghiên cứu": "M07. Research progress", "M08. Công bố Khoa học": "M08. Publications", "M09. Đề tài & Luận án": "M09. Research & thesis",
    "M10. Bảo vệ Luận án": "M10. Thesis defense", "M11. Hoàn thiện & Cấp bằng": "M11. Completion & degree", "M12. Quản lý Biến động": "M12. Academic changes",
    "M13. Tra cứu & Báo cáo": "M13. Search & reports", "M14. Phân quyền & Nhật ký": "M14. Access & audit log",
    "Tên đăng nhập (Email / Mã cán bộ / Mã NCS):": "Username (email / staff ID / candidate ID):", "Mật khẩu:": "Password:", "Ghi nhớ tài khoản": "Remember me",
    "Họ và tên NCS:": "Candidate name:", "Mã số NCS:": "Candidate ID:", "Số điện thoại:": "Phone number:", "Email liên hệ:": "Contact email:",
    "Cơ quan công tác hiện tại:": "Current workplace:", "Loại đề nghị học vụ:": "Request type:", "Thời gian xin phép:": "Requested duration:",
    "Lý do chi tiết & Kế hoạch cam kết:": "Reason and proposed plan:", "Đính kèm đơn có chữ ký của NHD & Minh chứng:": "Attach signed request and supporting documents:",
    "Nghiên cứu sinh được phân công:": "Assigned candidate:", "Người hướng dẫn 1 (Chính):": "Primary supervisor:", "Người hướng dẫn 2 (Đồng hướng dẫn - nếu có):": "Co-supervisor (optional):",
    "Số Quyết định phân công của Hiệu trưởng:": "Rector's assignment decision number:", "Điểm Cán bộ chấm 1 (GS.TS Trần Văn Hướng):": "Reviewer 1 score (Prof. Tran Van Huong):",
    "Điểm Cán bộ chấm 2 (TS. Lê Hoàng Nam):": "Reviewer 2 score (Dr. Le Hoang Nam):", "Điểm Cán bộ chấm 3 (TS. Nguyễn Hải Nam):": "Reviewer 3 score (Dr. Nguyen Hai Nam):",
    "Nhận xét chuyên môn của Tiểu ban:": "Committee comments:", "Tên bài báo khoa học (Title):": "Publication title:", "Tên tạp chí xuất bản (Journal):": "Journal name:",
    "Phân loại danh mục:": "Publication category:", "Mã số DOI:": "DOI:", "Chỉ số ISSN / e-ISSN:": "ISSN / e-ISSN:",
    "Học kỳ điều chỉnh:": "Semester:", "Thời hạn dự kiến hoàn thành:": "Expected completion date:", "Mục tiêu & Khối lượng công việc học tập / nghiên cứu:": "Study and research goals and workload:",
    "Dự kiến sản phẩm đầu ra (Bài báo / Báo cáo):": "Expected outputs (publication / report):", "Hình thức đề xuất:": "Request type:", "Người hướng dẫn hiện tại:": "Current supervisor:",
    "Người hướng dẫn đề xuất mới/bổ sung:": "Proposed new / additional supervisor:", "Lý do đề xuất thay đổi/bổ sung:": "Reason for the proposed change:",
    "Đính kèm Biên bản đồng thuận giữa các bên (PDF):": "Attach signed agreement (PDF):", "Tải lên biên bản thỏa thuận đồng thuận (PDF)": "Upload signed agreement (PDF)",
    "Tên đề tài tiểu luận tổng quan:": "Literature review title:", "Tóm tắt nội dung (Abstract):": "Abstract:", "File toàn văn Tiểu luận (PDF, tối đa 20MB):": "Full literature review (PDF, up to 20 MB):",
    "Tên đề cương nghiên cứu:": "Research proposal title:", "Đối tượng & Phạm vi nghiên cứu:": "Research subject and scope:", "Phương pháp nghiên cứu chính:": "Primary research methods:",
    "File Đề cương nghiên cứu hoàn thiện (PDF):": "Final research proposal (PDF):", "File Bản giải trình tiếp thu ý kiến đóng góp của Hội đồng (PDF):": "Response to committee comments (PDF):",
    "Chọn thứ tự chuyên đề:": "Select topic number:", "Tên chuyên đề tiến sĩ:": "Doctoral topic title:", "Cán bộ phụ trách hướng dẫn:": "Supervising faculty member:",
    "Thời gian dự kiến báo cáo:": "Expected presentation date:", "Upload đề cương / Bản thảo chuyên đề (nếu có):": "Upload topic outline / draft (optional):", "Kỳ báo cáo định kỳ:": "Reporting period:",
    "Ngày nộp báo cáo:": "Submission date:", "Khối lượng công việc đã hoàn thành trong 6 tháng qua:": "Work completed in the past six months:",
    "Những khó khăn, vướng mắc & đề xuất hỗ trợ:": "Challenges and requested support:", "Kế hoạch nghiên cứu chi tiết 6 tháng tới:": "Research plan for the next six months:",
    "File Báo cáo tiến độ đầy đủ có chữ ký của NCS (PDF):": "Signed progress report (PDF):", "Tên đề tài hiện tại:": "Current thesis title:",
    "Tên đề tài mới đề xuất (Tiếng Việt):": "Proposed thesis title (Vietnamese):", "Tên đề tài mới đề xuất (Tiếng Anh):": "Proposed thesis title (English):",
    "Lý do điều chỉnh tên đề tài:": "Reason for the title change:", "Biên bản họp Bộ môn đồng thuận (PDF):": "Department meeting minutes approving the change (PDF):",
    "Chọn phiên bản luận án:": "Thesis version:", "Ghi chú các điểm sửa đổi chính:": "Summary of revisions:", "File toàn văn Luận án (PDF, dung lượng tối đa 50MB):": "Full thesis (PDF, up to 50 MB):",
    "File Luận án bản in chính thức hoàn thiện (PDF có chữ ký):": "Final signed thesis (PDF):", "Bản giải trình chi tiết tiếp thu ý kiến của 07 thành viên Hội đồng:": "Detailed response to all seven committee members:",
    "Giấy biên nhận nộp Thư viện Trường ĐH An Giang:": "An Giang University Library receipt:", "Giấy biên nhận nộp Thư viện Quốc gia Việt Nam:": "National Library of Vietnam receipt:",
    "Phân loại biến động học vụ:": "Academic change type:", "Nội dung chi tiết yêu cầu & Căn cứ đề nghị:": "Request details and justification:", "Tệp minh chứng đính kèm (PDF):": "Supporting document (PDF):",
    "Số hiệu văn bằng": "Degree serial number", "Họ và tên người được cấp bằng": "Degree holder's full name",
    "TRƯỜNG ĐẠI HỌC AN GIANG · ĐHQG-HCM": "AN GIANG UNIVERSITY · VNU-HCM", "Nghiên cứu sinh Khóa 2023 · Khoa NN-TNTN": "PhD candidate, 2023 cohort · Faculty of Agriculture and Natural Resources",
    "● ACADEMIC STUDIO OS · TRANG CHỦ TINH GỌN": "● ACADEMIC STUDIO OS · HOME", "Hệ điều hành": "Operating system", "Đào tạo Tiến sĩ": "Doctoral Training", "Số": "System",
    "\"Khai phóng tri thức – Nâng tầm nghiên cứu – Kiến tạo tương lai\"": "\"Advancing knowledge – Elevating research – Shaping the future\"",
    "Phân hệ Nghiệp vụ": "Academic modules", "Vai trò RBAC": "RBAC roles", "Chuyển đổi số": "Digital transformation", "Tra cứu Phôi bằng": "Diploma verification",
    "TRƯỜNG ĐẠI HỌC AN GIANG": "AN GIANG UNIVERSITY", "Phạm vi quản lý:": "Management scope:", "Toàn bộ Quá trình Đào tạo TS": "Entire doctoral training lifecycle",
    "Truy cập Nhanh các Phân hệ Chuyên biệt:": "Quick access to specialized modules:", "Quản lý Học vụ": "Academic management", "14 Phân hệ Nghiệp vụ": "14 academic modules",
    "Đối tượng": "Stakeholders", "Bàn làm việc 7 Vai trò": "7 role workspaces", "Quy trình": "Process", "Sơ đồ Lộ trình 6 bước": "Six-step roadmap",
    "Công khai": "Public services", "Luận án & Phôi bằng 3D": "Theses & 3D diplomas", "Văn bản": "Regulations", "Căn cứ pháp lý & Quy chế": "Legal basis & policies",
    "Giới thiệu": "About", "Mục tiêu quản trị số": "Digital management goals", "Trung Tâm Quản Lý Đào Tạo Nghiên Cứu Sinh (14 Phân Hệ)": "Doctoral Training Management Center (14 modules)",
    "Nghiên cứu sinh Khóa 2023 · Khoa NN-TNTN": "PhD candidate, 2023 cohort · Faculty of Agriculture and Natural Resources",
    "Tất cả trạng thái học vụ": "All academic statuses", "Đang học (Bình thường)": "Enrolled (active)", "Gia hạn học tập": "Extension", "Tạm dừng học tập": "Suspended",
    "Đã bảo vệ luận án": "Thesis defended", "Đã cấp bằng Tiến sĩ": "Doctoral degree issued", "Tổng số Nghiên cứu sinh": "Total PhD candidates",
    "Đang học bình thường": "Active candidates", "Đang gia hạn (6-12 tháng)": "On extension (6–12 months)", "Tạm dừng / Bảo lưu": "Suspended / on leave",
    "1. Thông tin Cá nhân Nghiên cứu sinh": "1. Candidate profile", "Dữ liệu đã xác thực": "Verified information", "Họ và tên:": "Full name:",
    "Ngày sinh & Giới tính:": "Date of birth & gender:", "Số CCCD / Định danh:": "Citizen ID:", "Số điện thoại:": "Phone number:", "Email học thuật:": "Academic email:",
    "Cơ quan công tác:": "Workplace:", "Viện Nghiên cứu Biến đổi Khí hậu ĐBSCL": "Mekong Delta Climate Change Research Institute", "Địa chỉ liên hệ:": "Contact address:",
    "2. Hồ sơ Đào tạo & Trạng thái Học vụ": "2. Training record & academic status", "Đang học tập": "Enrolled", "Mã số Nghiên cứu sinh:": "Candidate ID:",
    "Chuyên ngành đào tạo:": "Field of study:", "Khoa học Môi trường (Mã: 9440301)": "Environmental Science (Code: 9440301)", "Khóa tuyển sinh:": "Admission cohort:",
    "Khóa 2023 (Đợt 2 - Tháng 10/2023)": "2023 cohort (Round 2 - October 2023)", "Quyết định công nhận NCS:": "Admission decision:",
    "Loại hình đào tạo:": "Study mode:", "Tập trung liên tục (03 năm)": "Full-time (3 years)", "Thời hạn đào tạo chuẩn:": "Standard training period:",
    "Thời hạn tối đa (kể cả gia hạn):": "Maximum period (including extensions):", "Mã NCS": "Candidate ID", "Họ và tên": "Full name", "Ngành đào tạo": "Field of study",
    "Khóa": "Cohort", "NHD Khoa học": "Academic supervisor", "Trạng thái học vụ": "Academic status", "Thao tác": "Actions", "Khoa học Môi trường": "Environmental Science",
    "Trồng trọt nâng cao": "Advanced Crop Science", "Quản trị Kinh doanh": "Business Administration", "Gia hạn 06 tháng": "Extended by 6 months",
    "3. Lịch sử Đơn Xin Gia hạn / Tạm dừng Học tập": "3. Extension / suspension request history", "Mã đơn": "Request ID", "Loại học vụ": "Request type",
    "Thời gian đề xuất": "Requested duration", "Lý do đề nghị": "Reason", "Ngày nộp": "Submitted", "Tình trạng phê duyệt": "Approval status", "Minh chứng": "Evidence",
    "06 tháng (Đến 15/04/2027)": "6 months (through 15 Apr 2027)", "Đang hoàn thiện phản biện bài báo quốc tế WoS Q1": "Finalizing review of a WoS Q1 article",
    "Khung Chương Trình & Kế Hoạch Đào Tạo Toàn Khóa": "Program framework & full study plan", "Tổng thời lượng 90 tín chỉ, phân bổ trong 06 học kỳ chính thức theo Quyết định 655/QĐ-ĐHAG.": "A total of 90 credits across six semesters under Decision 655/QĐ-ĐHAG.",
    "TIẾN ĐỘ THỰC HIỆN SO VỚI KẾ HOẠCH TOÀN KHÓA": "PROGRESS AGAINST THE FULL STUDY PLAN", "Tiến độ đạt 68% / 65% kế hoạch chuẩn (+3% Vượt tiến độ)": "Progress is 68% against a 65% plan (+3% ahead)",
    "Đã duyệt bởi NHD & PĐT": "Approved by supervisor and Academic Affairs", "Khối lượng Chương trình Đào tạo (90 Tín chỉ)": "Program requirements (90 credits)",
    "Khối kiến thức": "Requirement group", "Số tín chỉ": "Credits", "Trạng thái": "Status", "Học phần chung & chuyên ngành": "Core and field courses", "Hoàn thành 12/12": "Completed 12/12",
    "Tiểu luận tổng quan": "Literature review", "Đạt (8.77 điểm)": "Passed (8.77)", "03 Chuyên đề Tiến sĩ": "Three doctoral topics", "Hoàn thành 3/3": "Completed 3/3",
    "Nghiên cứu & Luận án Tiến sĩ": "Research & doctoral thesis", "Đang thực hiện": "In progress", "Kế hoạch Chi tiết theo Học kỳ": "Semester-by-semester plan",
    "Học kỳ": "Semester", "Nội dung trọng tâm": "Key activities", "Hạn mốc": "Due date", "Kết quả": "Outcome", "Hoàn thành học phần nâng cao & Tiểu luận": "Complete advanced courses & literature review",
    "Đạt 100%": "100% complete", "Bảo vệ Đề cương & Chuyên đề 1": "Defend proposal & topic 1", "Bảo vệ Chuyên đề 2 & Nộp bài báo 1": "Defend topic 2 & submit publication 1",
    "Chuyên đề 3 & Xuất bản Scopus Q1": "Topic 3 & publish in Scopus Q1", "Đang thực hiện (85%)": "In progress (85%)", "Trình Bộ môn & Phản biện độc lập": "Department review & independent review",
    "Kế hoạch": "Plan", "Bảo vệ Luận án cấp Trường & Cấp bằng": "University thesis defense & degree conferral",
    "Quản Lý Người Hướng Dẫn Khoa Học & Định Mức": "Supervisor management & workload limits", "Kiểm soát định mức hướng dẫn tối đa theo Điều 13 Thông tư 18/2021/TT-BGDĐT.": "Enforce supervision workload limits under Article 13 of Circular 18/2021/TT-BGDDT.",
    "Giáo sư hướng dẫn độc lập": "Professor, primary supervisor", "Phó Giáo sư hướng dẫn chính": "Associate professor, primary supervisor", "Tiến sĩ (trên 3 năm thâm niên)": "Doctor (over 3 years' experience)",
    "Họ và tên NHD": "Supervisor name", "Học hàm / Học vị": "Academic title / degree", "Cơ quan / Đơn vị": "Institution / unit", "Hướng nghiên cứu chuyên sâu": "Research specialization",
    "Số NCS đang hướng dẫn": "Candidates supervised", "Kiểm tra định mức TT18": "Circular 18 workload check",
    "Khoa Nông nghiệp - TNTN (Trường ĐHAG)": "Faculty of Agriculture and Natural Resources (AGU)", "Công nghệ xử lý nước & sinh thái vùng lũ": "Water treatment technology & floodplain ecology",
    "Hợp lệ (Còn 1 chỉ tiêu)": "Eligible (1 place remaining)", "Phó Giáo sư · Tiến sĩ": "Associate Professor · PhD", "Trường ĐH Khoa học Tự nhiên ĐHQG-HCM": "VNU-HCM University of Science",
    "Hóa học Môi trường & Màng sinh học": "Environmental chemistry & biofilms", "Đạt ngưỡng định mức": "At workload limit", "Tiến sĩ (5 năm kinh nghiệm)": "PhD (5 years' experience)",
    "Viện Môi trường & Tài nguyên ĐHQG-HCM": "VNU-HCM Institute for Environment and Resources", "Kinh tế tuần hoàn trong nông nghiệp": "Circular economy in agriculture",
    "Quản Lý Học Phần, Điểm Số & Học Phần Bổ Sung": "Course registration, grades & supplementary courses", "Điều kiện hoàn thành: Tích lũy tối thiểu 12 tín chỉ tiến sĩ với điểm từng học phần từ 7.0 (Điểm B) trở lên.": "Completion requirement: earn at least 12 doctoral credits, with a grade of B (7.0) or higher in each course.",
    "Tín chỉ học phần tích lũy": "Course credits earned", "Điểm trung bình GPA (Hệ 4: 3.65)": "Grade point average (4.0 scale: 3.65)", "ĐẠT CHUẨN": "MEETS REQUIREMENTS", "Điều kiện hoàn thành học phần": "Course completion requirements",
    "Mã HP": "Course code", "Tên học phần": "Course title", "Số TC": "Credits", "Giảng viên giảng dạy": "Instructor", "Quá trình (30%)": "Coursework (30%)", "Tổng kết": "Final", "Điểm chữ": "Letter grade", "Trạng thái / Đăng ký": "Status / registration",
    "Phương pháp nghiên cứu khoa học nâng cao": "Advanced research methods", "Đã hoàn thành": "Completed", "Độc học môi trường và an toàn sinh thái": "Environmental toxicology and ecological safety",
    "Quản lý chất thải rắn & công nghệ tuần hoàn": "Solid waste management & circular technologies", "Mô hình hóa các quá trình môi trường": "Environmental process modeling", "Chuyên đề chọn lọc: Kinh tế sinh thái ĐBSCL (Tự chọn)": "Selected topic: Mekong Delta ecological economics (elective)",
    "Học Phần Bổ Sung (Dành cho NCS học chuyển tiếp hoặc ngành gần)": "Supplementary courses (for bridging or related fields)", "Miễn trừ (Đúng chuyên ngành Thạc sĩ)": "Exempt (same Master's field)",
    "Quản Lý Tiểu Luận Tổng Quan & Đề Cương Nghiên Cứu": "Literature review & research proposal", "Thẩm định tổng quan tài liệu, bảo vệ đề cương nghiên cứu và quản lý bản giải trình chỉnh sửa.": "Review the literature review, research proposal defense, and response to committee comments.",
    "1. Tiểu luận Tổng quan (Literature Review)": "1. Literature review", "Đã bảo vệ (Đạt)": "Defended (Pass)", "Tên tiểu luận:": "Review title:", "Ngày bảo vệ trước Bộ môn:": "Department defense date:",
    "Điểm trung bình thống nhất:": "Agreed average score:", "Biên bản đánh giá Tiểu luận:": "Literature review evaluation minutes:", "Số BB-TL01/ĐHAG (Đã ký số)": "Minutes No. BB-TL01/AGU (digitally signed)",
    "2. Đề cương Chi tiết & Bản Giải trình Chỉnh sửa": "2. Detailed proposal & response to revisions", "Đã thông qua chính thức": "Officially approved", "Ngày bảo vệ Đề cương:": "Proposal defense date:",
    "Kết quả bỏ phiếu:": "Vote result:", "5/5 Phiếu Tán thành (100%)": "5/5 votes in favor (100%)", "Bản giải trình tiếp thu góp ý:": "Response to committee comments:", "Số 289/QĐ-ĐHAG ký ngày 20/05/2024": "No. 289/QĐ-ĐHAG, signed 20 May 2024",
    "Quản Lý 02 – 03 Chuyên Đề Tiến Sĩ Bắt Buộc": "Manage two to three required doctoral topics", "Mỗi NCS phải hoàn thành 2 đến 3 chuyên đề tiến sĩ (tương đương 6 tín chỉ) với đánh giá của Tiểu ban chuyên môn.": "Each candidate completes two or three doctoral topics (six credits) assessed by a specialist committee.",
    "Chuyên đề": "Topic", "Tên chuyên đề tiến sĩ": "Doctoral topic title", "Cán bộ hướng dẫn / phụ trách": "Supervisor / coordinator", "Ngày báo cáo": "Presentation date", "Điểm TB": "Average score",
    "Chuyên đề 1": "Topic 1", "Chuyên đề 2": "Topic 2", "Chuyên đề 3": "Topic 3", "Đánh giá hiện trạng ô nhiễm nguồn nước mặt nông thôn ĐBSCL do chăn nuôi": "Assessment of livestock pollution in rural Mekong Delta surface waters",
    "Đã đánh giá (Đạt)": "Evaluated (Pass)", "Ứng dụng công nghệ màng sinh học và thực vật thủy sinh xử lý nước thải": "Wastewater treatment using biofilm and aquatic plants",
    "Đánh giá vòng đời (LCA) và hiệu quả kinh tế - kỹ thuật của mô hình xử lý": "Life-cycle and techno-economic assessment of the treatment model", "Hoàn thành 100% Khối lượng 03 Chuyên đề Tiến sĩ": "All three doctoral topics completed",
    "Tổng số tín chỉ chuyên đề: 6/6 TC. Điểm trung bình chuyên đề: 9.0/10. Biên bản đã lưu trữ đầy đủ tại Khoa và Phòng Đào tạo.": "Topic credits: 6/6. Average score: 9.0/10. Minutes are on file with the Faculty and Academic Affairs.",
    "Quản Lý Báo Cáo Tiến Độ (6 Tháng / Lần) & Cảnh Báo Quá Hạn": "Progress reports (every six months) & overdue alerts", "NCS bắt buộc nộp Báo cáo tiến độ định kỳ 6 tháng/lần; NHD đánh giá Đạt/Không đạt trực tiếp trên hệ thống.": "Candidates submit a progress report every six months; supervisors record pass or revision decisions in the system.",
    "HỆ THỐNG CẢNH BÁO TIẾN ĐỘ TỰ ĐỘNG (OVERDUE DETECTOR)": "AUTOMATIC PROGRESS ALERTS", "Kỳ báo cáo": "Reporting period", "Giai đoạn thực hiện": "Reporting dates", "Khối lượng công việc chính": "Key work completed", "Ngày nộp báo cáo": "Submission date", "NHD Đánh giá": "Supervisor decision", "Nhận xét của NHD": "Supervisor comments",
    "Đạt tiến độ": "On track", "NCS chủ động, hoàn thành tốt các môn học nâng cao.": "The candidate is proactive and has completed advanced courses successfully.", "Học phần tiến sĩ & Thu thập mẫu ban đầu": "Doctoral courses & initial sample collection",
    "Quản Lý Công Bố Khoa Học (WoS/Scopus) & Thẩm Định Chuẩn Đầu Ra": "Scientific publications (WoS/Scopus) & output review", "CHUẨN ĐẦU RA CÔNG BỐ KHOA HỌC BẮT BUỘC (TT18 & ĐHQG-HCM)": "REQUIRED PUBLICATION OUTPUT (CIRCULAR 18 & VNU-HCM)",
    "Đạt 2 / 2 bài báo chuẩn quốc tế (01 WoS Q1 + 01 Scopus Q2) — ĐẠT 100% CHUẨN ĐẦU RA": "2/2 international publications (one WoS Q1 + one Scopus Q2) — REQUIREMENT MET", "✓ ĐỦ ĐIỀU KIỆN CÔNG BỐ ĐỂ BẢO VỆ": "✓ PUBLICATION REQUIREMENT MET FOR DEFENSE",
    "Tên bài báo khoa học & DOI": "Publication title & DOI", "Tên tạp chí & ISSN": "Journal & ISSN", "Phân loại tạp chí": "Journal category", "Vai trò tác giả": "Author role", "Tình trạng thẩm định (PĐT)": "Review status (Academic Affairs)", "Tác giả chính (1st Author)": "First author", "Đã thẩm định hợp lệ": "Verified", "Tác giả liên hệ (Corresponding)": "Corresponding author",
    "Quản Lý Tên Đề Tài, Các Phiên Bản Luận Án & Kiểm Tra Trùng Lặp Turnitin": "Thesis title, versions & similarity check", "Quản lý phiên bản toàn văn, kiểm soát định dạng, trích dẫn chuẩn APA/IEEE và ký xác nhận đồng ý cho bảo vệ.": "Manage thesis versions, formatting, APA/IEEE citations, and supervisor defense approval.",
    "1. Thông tin Đề tài Luận án Tiến sĩ": "1. Doctoral thesis information", "NHD Đã Ký Đồng Ý Bảo Vệ": "Supervisor approved defense", "Tên đề tài (Tiếng Việt):": "Thesis title (Vietnamese):", "Tên đề tài (Tiếng Anh):": "Thesis title (English):",
    "Quyết định giao đề tài:": "Thesis assignment decision:", "Lĩnh vực chuyên môn:": "Field:", "Khoa học Môi trường / Xử lý Nước thải": "Environmental Science / Wastewater Treatment", "Người hướng dẫn chính:": "Primary supervisor:", "2. Kiểm tra Trùng lặp Turnitin & Định dạng Trích dẫn": "2. Similarity check & citation format",
    "Định dạng bìa và khung luận án chuẩn Thông tư 18/2021/TT-BGDĐT": "Cover and thesis structure follow Circular 18/2021/TT-BGDDT", "Trích dẫn tài liệu tham khảo đồng nhất theo chuẩn APA 7th (100% hợp lệ)": "References follow APA 7th style", "Không phát hiện dấu hiệu đạo văn, sao chép dữ liệu thí nghiệm": "No plagiarism or copied experimental data detected",
    "3. Quản Lý Các Phiên Bản Toàn Văn Luận Án (Version Control)": "3. Thesis version history", "Phiên bản": "Version", "Giai đoạn nộp": "Submission stage", "Ngày upload": "Upload date", "Dung lượng": "File size", "Ghi chú điều chỉnh": "Revision notes",
    "Bản thảo trình Bộ môn": "Department draft", "Bản thảo phục vụ sinh hoạt chuyên môn Bộ môn": "Draft for department review", "Bản gửi Phản biện độc lập": "Independent review copy", "Bản đã tiếp thu ý kiến của Bộ môn gửi 02 Phản biện độc lập": "Revised copy sent to two independent reviewers", "Bản bảo vệ chính thức cấp Trường": "Official university defense copy", "Bản in chính thức phục vụ Hội đồng Đánh giá luận án": "Final printed copy for the thesis evaluation council",
    "Quản Lý Bảo Vệ Luận Án Cấp Trường (Hội Đồng & Phản Biện Độc Lập)": "University thesis defense (council & independent reviewers)", "Kiểm tra 6 điều kiện bảo vệ, quản lý phản biện kín, công khai 30 ngày và quyết nghị kết quả bảo vệ.": "Check six eligibility requirements, manage blind reviews, publish for 30 days, and record the defense outcome.",
    "1. Quản lý 02 Phản Biện Độc Lập Kín": "1. Two independent blind reviewers", "2/2 Bản nhận xét Đạt": "2/2 reviews passed", "Mã phản biện": "Reviewer ID", "Chuyên gia / Đơn vị": "Reviewer / institution", "Ngày nhận xét": "Review date", "Kết luận": "Decision",
    "Chuyên gia ngoài trường (ĐHQG-HCM)": "External expert (VNU-HCM)", "Đồng ý cho bảo vệ": "Approved for defense", "Chuyên gia đầu ngành (ĐH Cần Thơ)": "Leading expert (Can Tho University)",
    "2. Công Khai 30 Ngày & Kết Quả Bỏ Phiếu": "2. 30-day public notice & vote result", "7/7 Phiếu Tán Thành (100% Xuất Sắc)": "7/7 votes in favor (unanimous)", "Công khai tóm tắt luận án trên cổng:": "Thesis summary published on portal:",
    "Đã đủ 30/30 ngày (01/12/2025 – 31/12/2025)": "30/30 days completed (1–31 Dec 2025)", "Ngày tổ chức phiên bảo vệ:": "Defense date:", "15/01/2026 tại Hội trường A - ĐH An Giang": "15 Jan 2026 at Hall A, An Giang University",
    "Điểm đánh giá trung bình của HĐ:": "Council average score:", "9.4 / 10 (Xuất sắc)": "9.4 / 10 (Excellent)", "Nghị quyết của Hội đồng:": "Council resolution:", "Đề nghị công nhận học vị và cấp bằng Tiến sĩ": "Recommend awarding the doctoral degree",
    "3. Danh Sách Hội Đồng Đánh Giá Luận Án Cấp Trường (07 Thành viên theo TT18)": "3. University thesis evaluation council (seven members under Circular 18)", "Vai trò Hội đồng": "Council role", "Cơ quan công tác": "Institution", "Đánh giá bỏ phiếu": "Vote", "Chủ tịch": "Chair", "Trường Đại học An Giang": "An Giang University",
    "Tán thành (Xuất sắc)": "In favor (Excellent)", "Tán thành (Đạt)": "In favor (Pass)", "Phản biện 1": "Reviewer 1", "Phản biện 2": "Reviewer 2", "Phản biện 3": "Reviewer 3", "Thư ký": "Secretary", "Ủy viên": "Member",
    "Hoàn Thiện Sau Bảo Vệ, Hồ Sơ Lưu Chiểu & Cấp Bằng Tiến Sĩ": "Post-defense completion, library deposit & degree issuance", "Thẩm định bản chỉnh sửa sau bảo vệ, xác nhận nộp lưu chiểu Thư viện Quốc gia và cấp phôi bằng Tiến sĩ số.": "Review post-defense revisions, confirm library deposits, and issue the digital doctoral degree.",
    "VĂN BẰNG TIẾN SĨ CHÍNH THỨC (DOCTOR OF PHILOSOPHY)": "OFFICIAL DOCTORAL DEGREE", "Công Nhận Học Vị &amp; Cấp Bằng Tiến Sĩ cho NCS. Nguyễn Văn Bình": "Doctoral degree conferred upon PhD candidate Nguyen Van Binh",
    "Số hiệu văn bằng:": "Degree serial number:", "· Số vào sổ gốc:": "· Register number:", "· Quyết định:": "· Decision:", "Đã Ban Hành Quyết Định &amp; Cấp Bằng Số": "Decision issued & digital degree conferred",
    "1. Hồ sơ Nộp Lưu Chiểu Bắt Buộc": "1. Required library deposits", "Đã hoàn tất lưu chiểu": "Deposits completed", "Thư viện Trường ĐH An Giang:": "An Giang University Library:", "Đã nộp (Giấy biên nhận số BN-TV089/2026)": "Submitted (receipt BN-TV089/2026)",
    "Thư viện Quốc gia Việt Nam:": "National Library of Vietnam:", "Đã nộp (Xác nhận số NL-892/NLV)": "Submitted (confirmation NL-892/NLV)", "Cục Thông tin KH&amp;CN Quốc gia:": "National Agency for Science and Technology Information:", "Đã đăng ký lưu trữ số": "Digital archive registration complete",
    "2. Checklist Điều Kiện Tốt Nghiệp": "2. Graduation checklist", "Đủ điều kiện cấp bằng": "Eligible for degree issuance", "Bản giải trình sau bảo vệ được Chủ tịch &amp; Thư ký HĐ ký duyệt": "Post-defense response approved by council chair and secretary",
    "Hoàn tất lưu chiểu 03 nơi theo đúng thời hạn 30 ngày": "Deposits completed at all three repositories within 30 days", "Hoàn tất thanh toán tài chính &amp; trả thẻ thư viện": "Outstanding fees paid and library card returned", "Hồ sơ gốc lưu trữ đầy đủ tại Phòng Đào tạo Sau Đại học": "Complete original file archived by Graduate Academic Affairs",
    "Quản Lý Các Thay Đổi & Xử Lý Biến Động Học Vụ": "Academic changes & status requests", "Quản lý hồ sơ đổi NHD, đổi tên đề tài, tạm dừng học tập, chuyển cơ sở đào tạo hoặc buộc thôi học theo Thông tư 18.": "Manage supervisor and thesis title changes, suspension, transfer, and dismissal requests under Circular 18.",
    "Mã biến động": "Change ID", "NCS thực hiện": "Candidate", "Loại biến động": "Change type", "Nội dung chi tiết thay đổi": "Details", "Ngày đề xuất": "Requested", "Quyết định phê duyệt": "Approval decision", "Gia hạn thời gian": "Extension", "Đổi tên đề tài": "Thesis title change", "Đã ban hành QĐ": "Decision issued", "Đã phê duyệt": "Approved", "Đã tiếp nhận lại": "Reinstated", "Buộc thôi học": "Dismissal", "Đã thôi học": "Dismissed",
    "Tra Cứu Văn Bằng, Thống Kê Tiến Độ & Xuất Hồ Sơ Kiểm Định": "Degree verification, progress statistics & accreditation reports", "Thống kê tổng hợp tiến độ nghiên cứu sinh, phân loại công bố khoa học và xuất báo cáo phục vụ kiểm định chất lượng AUN-QA / MOET.": "Summarize candidate progress and publications, and export AUN-QA / ministry accreditation reports.",
    "1. Công cụ Tra cứu Văn bằng Tiến sĩ Số": "1. Digital doctoral degree verification", "Hệ thống Tra cứu 24/7": "24/7 verification", "💡 Kết quả tra cứu trực tuyến có giá trị pháp lý tương đương văn bằng giấy, được mã hóa bằng Blockchain Seal của ĐHQG-HCM.": "Online results are legally equivalent to paper degrees and secured with the VNU-HCM blockchain seal.",
    "2. Thống Kê Tiến Độ Nghiên Cứu Sinh Theo Khóa": "2. Candidate progress by cohort", "Tổng 48 NCS": "48 candidates total", "Khóa K2021 (Giai đoạn bảo vệ &amp; cấp bằng):": "Cohort 2021 (defense & degree):", "8 NCS (100% Đúng hạn)": "8 candidates (100% on time)",
    "Khóa K2022 (Giai đoạn công bố &amp; bản thảo):": "Cohort 2022 (publications & thesis):", "12 NCS (85% Đúng hạn · 15% Gia hạn)": "12 candidates (85% on time · 15% extended)", "Khóa K2023 (Giai đoạn chuyên đề &amp; thí nghiệm):": "Cohort 2023 (doctoral topics & experiments):", "14 NCS (92% Đúng hạn)": "14 candidates (92% on time)",
    "Khóa K2024 (Giai đoạn học phần &amp; đề cương):": "Cohort 2024 (courses & proposal):", "14 NCS (100% Mới nhập học)": "14 candidates (new cohort)", "3. Thống Kê Công Bố Khoa Học Toàn Trường": "3. University-wide publication statistics", "91 Bài báo": "91 publications",
    "TẠP CHÍ WOS (Q1/Q2)": "WOS JOURNALS (Q1/Q2)", "44 bài": "44 papers", "48% Tổng số công bố": "48% of publications", "25 bài": "25 papers", "27% Tổng số công bố": "27% of publications", "TẠP CHÍ HĐGSNN (&gt;=0.75)": "PROFESSOR COUNCIL-APPROVED JOURNALS (≥0.75)", "22 bài": "22 papers", "25% Tổng số công bố": "25% of publications", "CHỈ TIÊU BÌNH QUÂN": "AVERAGE OUTPUT", "2.4 bài/NCS": "2.4 papers/candidate", "Vượt chuẩn Thông tư 18": "Above Circular 18 requirement",
    "Ma Trận Phân Quyền 06 Vai Trò (RBAC) & Nhật Ký Hoạt Động (Audit Log)": "Six-role access matrix (RBAC) & audit log", "Theo dõi giám sát thời gian thực toàn bộ thao tác phê duyệt, nhập điểm, ban hành quyết định và ký số.": "Monitor approvals, grading, decisions, and digital signatures in real time.", "1. Ma Trận Phân Quyền Theo 06 Vai Trò (Role-Based Access Control)": "1. Six-role access control matrix", "Bảo mật đa tầng ĐHQG-HCM": "VNU-HCM multi-layer security",
    "Vai trò chức năng": "Role", "Hồ sơ &amp; Kế hoạch": "Records & plans", "Học phần &amp; Điểm": "Courses & grades", "Chuyên đề &amp; Báo cáo": "Topics & reports", "Bài báo &amp; Minh chứng": "Publications & evidence", "Bảo vệ Luận án": "Thesis defense", "Cấp Bằng &amp; Quyết định": "Degree & decisions",
    "NCS (Nghiên cứu sinh)": "PhD candidate", "Xem / Tạo đơn": "View / submit request", "Đăng ký / Xem": "Register / view", "Nộp bản thảo": "Submit draft", "Khai báo / Upload": "Declare / upload", "Nộp luận án": "Submit thesis", "Tra cứu / Nhận bằng": "Verify / receive degree",
    "NHD (Người hướng dẫn)": "Supervisor", "Duyệt kế hoạch": "Approve plan", "Xem điểm": "View grades", "Đánh giá Đạt/Không": "Record pass / revise", "Xác nhận bài báo": "Review publication", "Ký số cho bảo vệ": "Sign defense approval", "Xem hồ sơ": "View records",
    "BM (Trưởng Bộ môn)": "Department chair", "Xem kết quả": "View results", "Tổ chức chấm CĐ": "Coordinate topic assessment", "Thẩm tra nội dung": "Review content", "Thông qua cấp BM": "Department approval", "Xem quyết nghị": "View resolution",
    "Khoa (Ban Chủ nhiệm Khoa)": "Faculty leadership", "Duyệt đơn gia hạn": "Approve extension", "Quản lý toàn khoa": "Faculty-wide management", "Phê duyệt kết quả": "Approve results", "Xác nhận điều kiện": "Confirm eligibility", "Đề xuất Hội đồng": "Propose council", "Theo dõi cấp bằng": "Track degree issuance",
    "PĐT (Phòng Đào tạo SĐH)": "Graduate Academic Affairs", "Quản trị toàn bộ": "Full administration", "Quản lý tín chỉ": "Manage credits", "Lưu trữ biên bản": "Archive minutes", "Thẩm định WoS": "Review WoS publications", "Phản biện độc lập": "Independent review", "Quản lý Sổ gốc": "Manage master register",
    "BGH (Ban Giám hiệu)": "University leadership", "Ký QĐ trúng tuyển": "Sign admission decisions", "Giám sát chất lượng": "Quality oversight", "Xem báo cáo": "View reports", "Xem thống kê": "View statistics", "Ký QĐ Hội đồng": "Sign council decision", "Ký QĐ Cấp Bằng": "Sign degree decision"
  };
  const translationDecoder = document.createElement("textarea");
  Object.entries(UI_TRANSLATIONS_EN).forEach(([source, translated]) => {
    if (!source.includes("&")) return;
    translationDecoder.innerHTML = source;
    if (translationDecoder.value !== source) UI_TRANSLATIONS_EN[translationDecoder.value] = translated;
  });

  function translateUnkeyedText(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest("[data-i18n]")) continue;
      if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
      const original = originalTextNodes.get(node);
      const trimmed = original.trim();
      const translated = lang === "EN" ? UI_TRANSLATIONS_EN[trimmed] : null;
      if (!translated) {
        if (lang === "VI" && node.nodeValue !== original) node.nodeValue = original;
        continue;
      }
      if (node.nodeValue !== original.replace(trimmed, translated)) {
        node.nodeValue = original.replace(trimmed, translated);
      }
    }
  }

  // MULTI-LANGUAGE TRANSLATION DICTIONARY (Comprehensive Coverage)
  const I18N_DICT = {
    VI: {
      univ_name: "TRƯỜNG ĐẠI HỌC AN GIANG · ĐHQG-HCM",
      status_online: "DTMS OS ONLINE",
      search_placeholder: "Tìm kiếm nhanh dữ liệu hệ thống...",
      login_os: "Đăng nhập OS",
      dock_home: "Trang chủ",
      dock_about: "Giới thiệu",
      dock_roles: "Đối tượng",
      dock_roadmap: "Quy trình",
      dock_public: "Công khai",
      dock_citations: "Văn bản",
      dock_mgmt: "Quản lý Học vụ (14 Phân hệ)",

      home_tag: "● ACADEMIC STUDIO OS · TRANG CHỦ TINH GỌN",
      home_h1_html: 'Hệ điều hành <br />Đào tạo Tiến sĩ <span class="text-cyan">Số</span>',
      home_motto: '"Khai phóng tri thức – Nâng tầm nghiên cứu – Kiến tạo tương lai"',
      home_desc: "Nền tảng số hóa quản trị hợp nhất hồ sơ Nghiên cứu sinh, theo dõi tiến độ công bố bài báo khoa học và thẩm định bằng Tiến sĩ tại Trường Đại học An Giang (ĐHQG-HCM).",
      m1_label: "Chuyển đổi số",
      m2_label: "Persona Studio",
      m3_label: "Constellation Nodes",
      m4_label: "Tra cứu Phôi bằng",
      campus_name: "TRƯỜNG ĐẠI HỌC AN GIANG",
      campus_scope_label: "Phạm vi quản lý:",
      campus_scope_val: "Toàn bộ Quá trình Đào tạo TS",
      launchpad_title: "Truy cập Nhanh các Phân hệ Chuyên biệt:",
      tile1_title: "Giới thiệu",
      tile1_sub: "Mục tiêu quản trị số",
      tile2_title: "Đối tượng",
      tile2_sub: "Bàn làm việc 7 Vai trò",
      tile3_title: "Quy trình",
      tile3_sub: "Sơ đồ Lộ trình 6 bước",
      tile4_title: "Công khai",
      tile4_sub: "Luận án & Phôi bằng 3D",
      tile5_title: "Văn bản",
      tile5_sub: "Căn cứ pháp lý & Quy chế",

      about_title: "Giới thiệu Hệ thống DTMS",
      about_subtitle: "Số hóa và tổ chức quản trị thống nhất toàn bộ quá trình đào tạo tiến sĩ tại Trường Đại học An Giang (ĐHQG-HCM).",
      about_card1_title: "Mục tiêu Số hóa Tập trung",
      about_card1_desc: "DTMS được xây dựng nhằm chuẩn hóa toàn bộ dữ liệu hồ sơ Nghiên cứu sinh, theo dõi lộ trình học phần, kiểm soát 03 chuyên đề tiến sĩ, bài báo khoa học công bố và hỗ trợ quy trình phản biện độc lập bảo vệ luận án.",
      about_card2_title: "Hạ tầng ĐHQG-HCM Standard",
      about_card2_desc: "Hỗ trợ số hóa quy trình đào tạo; quy tắc chính thức và các tích hợp cần được nhà trường xác nhận.",

      roles_title: "Đối tượng & Bàn làm việc 07 Vai trò",
      roles_subtitle: "Trực quan hóa chỉ số tải trọng công việc và danh mục nhiệm vụ chính cho từng cá nhân, đơn vị.",
      persona_workspace_tag: "● BÀN LÀM VIỆC VAI TRÒ",
      persona_role_code: "Mã vai trò:",
      persona_workload_label: "Chỉ số Tải trọng Công việc Số",
      persona_tasks_label: "Danh mục Nhiệm vụ & Báo cáo Trọng tâm:",

      roadmap_title: "Quy trình Lộ trình 06 Giai đoạn",
      roadmap_subtitle: "Nhấp vào từng nút mốc kết nối để xem chi tiết sản phẩm đầu ra bắt buộc qua Hologram Inspector.",
      roadmap_inspect_btn: "Hologram Inspect →",
      roadmap_modal_stage: "GIAI ĐOẠN",
      roadmap_modal_outputs: "Hồ sơ & Sản phẩm bắt buộc:",

      public_title: "Kho Luận án Tiến sĩ Công khai",
      public_subtitle: "Tra cứu và tham khảo các luận án tiến sĩ đã được công khai.",
      lookup_title: "Console Tra cứu Phôi bằng Tiến sĩ 3D",
      lookup_subtitle: "Nhập số hiệu văn bằng và họ tên để tra cứu thông tin xác minh.",
      theses_sec_title: "Kho Luận án Tiến sĩ Công khai",
      thesis_search_ph: "Lọc theo tên NCS, chuyên ngành hoặc tên luận án...",
      thesis_summary_btn: "📄 Tóm tắt PDF",
      thesis_full_btn: "📚 Toàn văn",
      thesis_empty: "Không tìm thấy luận án phù hợp.",
      verifier_sec_title: "2. Console Tra cứu Phôi bằng Tiến sĩ 3D",
      ver_code_label: "01. Số hiệu văn bằng",
      ver_code_ph: "Ví dụ: TS-AGU-2025-089",
      ver_name_label: "02. Họ và tên người được cấp bằng",
      ver_name_ph: "Ví dụ: Nguyễn Văn A",
      ver_btn: "Tra cứu & Xuất phôi bằng 3D",
      ver_toast_title: "Xác thực phôi bằng thành công",
      ver_toast_msg: "Đã trích xuất thông tin phôi bằng Tiến sĩ cho ",

      citations_title: "Văn bản & Căn cứ Pháp lý",
      citations_subtitle: "Danh mục các văn bản quy phạm pháp luật viện dẫn trong tài liệu phân tích hệ thống.",
      cit1_sub: "Bộ Giáo dục và Đào tạo — Quy chế Đào tạo Tiến sĩ",
      cit2_sub: "Đại học Quốc gia TP.HCM — Quy định chung",
      cit3_sub: "Trường Đại học An Giang — Quy chế chi tiết",

      contact_trigger: "Hỗ trợ & Liên hệ",
      contact_zalo: "Chat qua Zalo Hỗ trợ",
      contact_fb: "Messenger Facebook",
      contact_ai: "🤖 AI Trợ lý Học thuật",
      ai_header_title: "AI Trợ lý Học thuật DTMS",
      ai_header_sub: "Trực tuyến 24/7",
      ai_welcome: "Xin chào! Tôi là AI Trợ lý Học thuật DTMS. Bạn có thể hỏi tôi các câu hỏi cơ bản về Đào tạo Tiến sĩ tại ĐH An Giang!",
      chip1: "DTMS là gì?",
      chip2: "Quy trình 6 bước?",
      chip3: "Điều kiện bảo vệ?",
      chip4: "Tra cứu văn bằng?",
      ai_input_ph: "Nhập câu hỏi của bạn...",
      ai_send: "Gửi",

      lang_toast_title: "Ngôn ngữ: Tiếng Việt",
      lang_toast_msg: "Đã chuyển giao diện sang tiếng Việt.",

      m01_tab: "M01. Hồ sơ NCS",
      m02_tab: "M02. CTĐT & Kế hoạch",
      m03_tab: "M03. Người hướng dẫn",
      m04_tab: "M04. Học phần & Điểm",
      m05_tab: "M05. Tiểu luận & Đề cương",
      m06_tab: "M06. Chuyên đề Tiến sĩ",
      m07_tab: "M07. Tiến độ Nghiên cứu",
      m08_tab: "M08. Công bố Khoa học",
      m09_tab: "M09. Đề tài & Luận án",
      m10_tab: "M10. Bảo vệ Luận án",
      m11_tab: "M11. Hoàn thiện & Cấp bằng",
      m12_tab: "M12. Quản lý Biến động",
      m13_tab: "M13. Tra cứu & Báo cáo",
      m14_tab: "M14. Phân quyền & Nhật ký"
    },
    EN: {
      univ_name: "AN GIANG UNIVERSITY · VNU-HCM",
      status_online: "DTMS OS ONLINE",
      search_placeholder: "Quick system search...",
      login_os: "Login OS",
      dock_home: "Home",
      dock_about: "About",
      dock_roles: "Stakeholders",
      dock_roadmap: "Roadmap",
      dock_public: "Public Hub",
      dock_citations: "Regulations",
      dock_mgmt: "Academic Management (14 Modules)",

      home_tag: "● ACADEMIC STUDIO OS · COMPACT HOMEPAGE",
      home_h1_html: 'Doctoral Training <br />Management System <span class="text-cyan">OS</span>',
      home_motto: '"Unlocking Knowledge – Elevating Research – Shaping Future"',
      home_desc: "Unified digital platform managing PhD candidate profiles, tracking publication progress, and verifying doctoral degrees at An Giang University (VNU-HCM).",
      m1_label: "Digitalization",
      m2_label: "Persona Workspaces",
      m3_label: "Roadmap Stages",
      m4_label: "Degree Verification",
      campus_name: "AN GIANG UNIVERSITY",
      campus_scope_label: "Management Scope:",
      campus_scope_val: "Entire Doctoral Training Lifecycle",
      launchpad_title: "Quick Access to Specialized Modules:",
      tile1_title: "About",
      tile1_sub: "Digital Governance Goals",
      tile2_title: "Stakeholders",
      tile2_sub: "7 Role Workspaces",
      tile3_title: "Roadmap",
      tile3_sub: "6-Stage Process Map",
      tile4_title: "Public Hub",
      tile4_sub: "Theses & 3D Degrees",
      tile5_title: "Regulations",
      tile5_sub: "Legal & Regulatory Citations",

      about_title: "About DTMS System",
      about_subtitle: "Digitalizing and unifying doctoral training management at An Giang University (VNU-HCM).",
      about_card1_title: "Centralized Digitalization Goal",
      about_card1_desc: "DTMS standardizes PhD candidate data, tracks course progress, oversees 03 doctoral topics, monitors journal publications, and supports independent review workflows.",
      about_card2_title: "VNU-HCM Standard Infrastructure",
      about_card2_desc: "Supports digital academic workflows. Institutional rules, authentication and integrations require verification before production use.",

      roles_title: "Stakeholders & 07 Workspaces",
      roles_subtitle: "Visualizing workload indicators and key tasks for each stakeholder role.",
      persona_workspace_tag: "● PERSONA WORKSPACE",
      persona_role_code: "Role code:",
      persona_workload_label: "Digital Workload Index",
      persona_tasks_label: "Key Tasks & Focus Reports:",

      roadmap_title: "06-Stage Roadmap Process",
      roadmap_subtitle: "Click on any milestone node to view required outputs via Hologram Inspector.",
      roadmap_inspect_btn: "Hologram Inspect →",
      roadmap_modal_stage: "STAGE",
      roadmap_modal_outputs: "Required Documents & Deliverables:",

      public_title: "Public Doctoral Theses",
      public_subtitle: "Browse and search publicly available doctoral theses.",
      lookup_title: "3D Doctoral Degree Verification Console",
      lookup_subtitle: "Enter a degree serial number and recipient name to verify a doctoral degree.",
      theses_sec_title: "Public Doctoral Theses Repository",
      thesis_search_ph: "Filter by candidate name, major, or thesis title...",
      thesis_summary_btn: "📄 PDF Summary",
      thesis_full_btn: "📚 Full Text",
      thesis_empty: "No matching theses found.",
      verifier_sec_title: "2. 3D Doctoral Degree Verification Console",
      ver_code_label: "01. Degree Serial Code",
      ver_code_ph: "Example: TS-AGU-2025-089",
      ver_name_label: "02. Full Name of Recipient",
      ver_name_ph: "Example: Nguyen Van Binh",
      ver_btn: "Verify & Output 3D Degree",
      ver_toast_title: "Verification Successful",
      ver_toast_msg: "Extracted 3D degree certificate for ",

      citations_title: "Regulations & Legal Citations",
      citations_subtitle: "List of legal regulatory documents referenced in system architecture.",
      cit1_sub: "Ministry of Education and Training — PhD Training Regulations",
      cit2_sub: "Vietnam National University HCMC — General Regulations",
      cit3_sub: "An Giang University — Detailed Implementation Statute",

      contact_trigger: "Support & Contact",
      contact_zalo: "Chat via Zalo Support",
      contact_fb: "Facebook Messenger",
      contact_ai: "🤖 AI Academic Assistant",
      ai_header_title: "DTMS AI Academic Assistant",
      ai_header_sub: "Online 24/7",
      ai_welcome: "Hello! I am DTMS AI Academic Assistant. You can ask me basic questions about Doctoral Training at An Giang University!",
      chip1: "What is DTMS?",
      chip2: "6-Step Process?",
      chip3: "Defense Requirements?",
      chip4: "Degree Verification?",
      ai_input_ph: "Type your question...",
      ai_send: "Send",

      lang_toast_title: "Language: English",
      lang_toast_msg: "Interface language switched to English.",

      m01_tab: "M01. Candidate Profile",
      m02_tab: "M02. Curriculum & Plan",
      m03_tab: "M03. Scientific Advisors",
      m04_tab: "M04. Courses & Grades",
      m05_tab: "M05. Essay & Outline",
      m06_tab: "M06. Doctoral Topics",
      m07_tab: "M07. Research Progress",
      m08_tab: "M08. Scientific Publications",
      m09_tab: "M09. Thesis & Dissertation",
      m10_tab: "M10. Dissertation Defense",
      m11_tab: "M11. Graduation & Degree",
      m12_tab: "M12. Academic Changes",
      m13_tab: "M13. Lookup & Reports",
      m14_tab: "M14. RBAC & Audit Log"
    }
  };

  // LOCALIZED DATA STORE FOR 7 STAKEHOLDER PERSONA WORKSPACES
  const PERSONA_DATA = {
    VI: {
      NCS: {
        code: "NCS",
        title: "Nghiên cứu sinh",
        workload: 85,
        workloadText: "85% Tiến độ Học tập & Chuyên đề đã hoàn thành",
        desc: "Chủ động xây dựng kế hoạch nghiên cứu, nộp học liệu, công bố bài báo khoa học và hoàn thành các chuyên đề tiến sĩ.",
        tasks: [
          "Lập kế hoạch đào tạo 3-4 năm và đăng ký mốc nghiên cứu",
          "Nộp Báo cáo Tiến độ định kỳ (6 tháng/lần)",
          "Cập nhật minh chứng công bố bài báo trên tạp chí WoS/Scopus/HĐGSCD",
          "Đăng ký bảo vệ 03 Chuyên đề tiến sĩ và Luận án cấp cơ sở"
        ]
      },
      NHD: {
        code: "NHD",
        title: "Người hướng dẫn khoa học",
        workload: 62,
        workloadText: "62% Tiến độ Đánh giá & Phê duyệt",
        desc: "Định hướng học thuật, thẩm định tiến độ nghiên cứu, xác nhận bài báo khoa học và viết bản nhận xét luận án.",
        tasks: [
          "Phê duyệt Kế hoạch nghiên cứu toàn khóa của NCS",
          "Đánh giá và xác nhận Báo cáo tiến độ 6 tháng/lần",
          "Xác nhận khối lượng đóng góp trong các bài báo công bố",
          "Viết Nhận xét Luận án cho phép NCS nộp hồ sơ bảo vệ"
        ]
      },
      TBM: {
        code: "TBM",
        title: "Trưởng Bộ môn",
        workload: 45,
        workloadText: "45% Công tác Đánh giá Chuyên môn Cấp cơ sở",
        desc: "Tổ chức sinh hoạt khoa học, đánh giá chuyên đề tiến sĩ, tiểu luận tổng quan và bảo vệ cấp Đơn vị chuyên môn.",
        tasks: [
          "Tổ chức đánh giá 03 Chuyên đề tiến sĩ và Tiểu luận tổng quan",
          "Phân công Tiểu ban chuyên môn chấm điểm và lập biên bản",
          "Thẩm định hồ sơ bảo vệ luận án cấp Đơn vị chuyên môn"
        ]
      },
      BCNK: {
        code: "BCNK",
        title: "Ban Chủ nhiệm Khoa",
        workload: 70,
        workloadText: "70% Hồ sơ Quản lý Đào tạo SĐH Khoa",
        desc: "Quản lý chất lượng đào tạo sau đại học toàn Khoa, duyệt đề xuất chuyên môn và trình danh sách Hội đồng.",
        tasks: [
          "Phê duyệt kết quả chuyên đề tiến sĩ do Bộ môn trình",
          "Đề xuất danh sách các nhà khoa học tham gia Hội đồng Đánh giá",
          "Xác nhận điều kiện công bố khoa học & chuẩn đầu ra ngoại ngữ"
        ]
      },
      PĐT: {
        code: "PĐT",
        title: "Phòng Đào tạo Sau Đại học",
        workload: 90,
        workloadText: "90% Tốc độ Xử lý Nghiệp vụ Hệ thống",
        desc: "Đơn vị thường trực quản trị nghiệp vụ, thẩm định điều kiện pháp lý, gửi phản biện độc lập và hoàn thiện hồ sơ cấp bằng.",
        tasks: [
          "Thẩm định hồ sơ trúng tuyển và ban hành mã số NCS",
          "Gửi luận án lấy ý kiến 02 Phản biện độc lập theo quy định",
          "Quản lý lưu chiểu Thư viện Quốc gia và lập Sổ gốc cấp bằng"
        ]
      },
      BGH: {
        code: "BGH",
        title: "Ban Giám hiệu",
        workload: 30,
        workloadText: "30% Thẩm quyền Phê duyệt Quyết định",
        desc: "Ban hành các Quyết định chính thức trong toàn bộ quá trình đào tạo và công nhận học vị Tiến sĩ.",
        tasks: [
          "Ký Quyết định công nhận Nghiên cứu sinh chính thức",
          "Ký Quyết định thành lập Hội đồng Đánh giá Luận án cấp Trường",
          "Ký Quyết định công nhận học vị và cấp bằng Tiến sĩ"
        ]
      },
      HĐ: {
        code: "HĐ",
        title: "Hội đồng Đánh giá & Phản biện",
        workload: 55,
        workloadText: "55% Tiến độ Đánh giá Phản biện Độc lập",
        desc: "Các nhà khoa học uy tín nhận xét độc lập, đặt câu hỏi phản biện và đánh giá chất lượng luận án tại các phiên họp.",
        tasks: [
          "Viết Bản nhận xét Phản biện độc lập đánh giá đóng góp mới",
          "Đặt câu hỏi phản biện tại phiên bảo vệ chính thức",
          "Bỏ phiếu đánh giá và thông qua Biên bản Quyết nghị Hội đồng"
        ]
      }
    },
    EN: {
      NCS: {
        code: "NCS",
        title: "PhD Candidate",
        workload: 85,
        workloadText: "85% Coursework & Topic Progress Completed",
        desc: "Proactively formulate research plans, submit academic materials, publish papers, and complete doctoral topics.",
        tasks: [
          "Establish 3-4 year training plan and register research milestones",
          "Submit periodic progress reports (every 6 months)",
          "Update publication proofs in WoS/Scopus journals",
          "Register defense for 3 Doctoral Topics and Institutional Thesis"
        ]
      },
      NHD: {
        code: "NHD",
        title: "Scientific Supervisor",
        workload: 62,
        workloadText: "62% Evaluation & Approval Progress",
        desc: "Provide academic guidance, review research progress, verify journal publications, and write thesis evaluation reports.",
        tasks: [
          "Approve PhD candidate's full-term research plan",
          "Evaluate and verify semi-annual progress reports",
          "Verify contribution proportion in published research papers",
          "Write thesis review authorizing candidate defense application"
        ]
      },
      TBM: {
        code: "TBM",
        title: "Department Chair",
        workload: 45,
        workloadText: "45% Departmental Academic Assessment",
        desc: "Organize academic seminars, evaluate doctoral topics, literature reviews, and departmental defense sessions.",
        tasks: [
          "Organize assessment for 3 Doctoral Topics & Overview Essay",
          "Assign specialized sub-committee for grading & minutes",
          "Verify thesis defense application at Departmental level"
        ]
      },
      BCNK: {
        code: "BCNK",
        title: "Faculty Board",
        workload: 70,
        workloadText: "70% Postgraduate Operations Managed",
        desc: "Manage postgraduate training quality faculty-wide, approve academic proposals, and submit committee lists.",
        tasks: [
          "Approve doctoral topic results submitted by Department",
          "Propose list of scientists for Evaluation Council",
          "Verify publication requirements & foreign language proficiency"
        ]
      },
      PĐT: {
        code: "PĐT",
        title: "Postgraduate Academic Office",
        workload: 90,
        workloadText: "90% System Processing Speed",
        desc: "Standing operational unit, inspecting legal conditions, dispatching independent reviews, and issuing degree records.",
        tasks: [
          "Verify admission records and issue candidate IDs",
          "Send thesis for 02 Independent Reviews as mandated",
          "Manage National Library deposit and issue master degree register"
        ]
      },
      BGH: {
        code: "BGH",
        title: "University Directorate",
        workload: 30,
        workloadText: "30% Official Approval Authority",
        desc: "Issue official Decisions across the training lifecycle and officially confer PhD degrees.",
        tasks: [
          "Sign Official Decision admitting PhD candidate",
          "Sign Decision establishing Institutional Evaluation Council",
          "Sign Decision conferring academic degree & PhD diploma"
        ]
      },
      HĐ: {
        code: "HĐ",
        title: "Evaluation Council & Reviewers",
        workload: 55,
        workloadText: "55% Independent Review Progress",
        desc: "Prestigious scholars conducting independent reviews, raising defense questions, and evaluating thesis quality.",
        tasks: [
          "Write Independent Review evaluating novel contributions",
          "Raise critical questions at official defense session",
          "Vote on evaluation and pass Council Resolution Minutes"
        ]
      }
    }
  };

  // LOCALIZED DATA STORE FOR 6-STAGE ROADMAP GRAPH
  const ROADMAP_NODES = {
    VI: [
      {
        num: "01",
        title: "Công nhận NCS",
        tag: "Khởi tạo",
        desc: "Trúng tuyển, cấp mã số NCS & mở hồ sơ số",
        details: "Tiếp nhận hồ sơ sau trúng tuyển, phát hành quyết định công nhận Nghiên cứu sinh và mở tài khoản hệ thống DTMS.",
        items: ["Quyết định công nhận NCS", "Tài khoản làm việc số", "Hồ sơ trúng tuyển hợp lệ"]
      },
      {
        num: "02",
        title: "Lập Kế hoạch",
        tag: "Định hướng",
        desc: "Lập kế hoạch 3-4 năm & thống nhất với NHD",
        details: "Xây dựng kế hoạch nghiên cứu toàn khóa, danh mục môn học bổ sung và ký xác nhận với Người hướng dẫn khoa học.",
        items: ["Kế hoạch đào tạo toàn khóa", "Biên bản thống nhất NHD", "Lộ trình thực nghiệm"]
      },
      {
        num: "03",
        title: "Học tập & Chuyên đề",
        tag: "Học phần",
        desc: "Hoàn thành các môn học & 03 Chuyên đề TS",
        details: "Hoàn thành các học phần tiến sĩ nâng cao, tiểu luận tổng quan và bảo vệ 03 chuyên đề tiến sĩ bắt buộc.",
        items: ["Bảng điểm học phần tiến sĩ", "03 Báo cáo Chuyên đề tiến sĩ", "Tiểu luận tổng quan"]
      },
      {
        num: "04",
        title: "Nghiên cứu & Công bố",
        tag: "Công bố",
        desc: "Công bố tối thiểu 02 bài báo ISI/Scopus",
        details: "Thực hiện đề tài, nộp báo cáo tiến độ 6 tháng/lần và công bố kết quả trên các tạp chí khoa học chuyên ngành uy tín.",
        items: ["Minh chứng bài báo WoS/Scopus/HĐGSCD", "Báo cáo tiến độ 6 tháng", "Xác nhận của NHD"]
      },
      {
        num: "05",
        title: "Đánh giá Luận án",
        tag: "Thẩm định",
        desc: "Phản biện độc lập & bảo vệ cấp Trường",
        details: "Thẩm định điều kiện, nhận xét phản biện độc lập, công khai luận án FR-BV05 và tổ chức bảo vệ chính thức.",
        items: ["Bản nhận xét phản biện độc lập", "Công khai 30 ngày trên cổng", "Biên bản Hội đồng đánh giá"]
      },
      {
        num: "06",
        title: "Tốt nghiệp & Cấp bằng",
        tag: "Hoàn tất",
        desc: "Lưu chiểu TVQG & cấp bằng Tiến sĩ",
        details: "Nộp lưu chiểu Thư viện Quốc gia, ký quyết định công nhận học vị và cấp văn bằng Tiến sĩ chính thức.",
        items: ["Xác nhận lưu chiểu Thư viện Quốc gia", "Quyết định công nhận học vị Tiến sĩ", "Bằng Tiến sĩ & Sổ gốc"]
      }
    ],
    EN: [
      {
        num: "01",
        title: "Candidate Admission",
        tag: "Initiation",
        desc: "Admission, Candidate ID assignment & Digital Profile",
        details: "Receive post-admission records, issue official Candidate Recognition Decision, and create DTMS system account.",
        items: ["Candidate Recognition Decision", "Digital Workspace Account", "Verified Admission Profile"]
      },
      {
        num: "02",
        title: "Training Plan",
        tag: "Orientation",
        desc: "Formulate 3-4 year plan & sign with Supervisor",
        details: "Develop full-term research plan, supplementary course list, and obtain signature confirmation from Scientific Supervisor.",
        items: ["Full-term Training Plan", "Supervisor Agreement Minutes", "Experimental Roadmap"]
      },
      {
        num: "03",
        title: "Coursework & Topics",
        tag: "Modules",
        desc: "Complete courses & 03 Doctoral Topics",
        details: "Complete advanced doctoral course modules, literature review essay, and defend 03 compulsory doctoral topics.",
        items: ["Doctoral Course Transcript", "03 Doctoral Topic Reports", "Literature Overview Essay"]
      },
      {
        num: "04",
        title: "Research & Publication",
        tag: "Publication",
        desc: "Publish at least 02 WoS/Scopus articles",
        details: "Execute research project, submit semi-annual progress reports, and publish findings in prestigious peer-reviewed journals.",
        items: ["WoS/Scopus Journal Proofs", "Semi-annual Progress Report", "Supervisor Verification"]
      },
      {
        num: "05",
        title: "Thesis Evaluation",
        tag: "Appraisal",
        desc: "Independent peer review & Institutional defense",
        details: "Inspect eligibility, process 02 independent reviews, publish thesis on portal (FR-BV05), and hold official defense.",
        items: ["Independent Peer Review Reports", "30-day Public Portal Notice", "Council Evaluation Minutes"]
      },
      {
        num: "06",
        title: "Graduation & Degree",
        tag: "Completion",
        desc: "National Library deposit & PhD degree conferral",
        details: "Deposit final thesis to National Library of Vietnam, sign degree conferral decision, and issue official PhD diploma.",
        items: ["National Library Deposit Receipt", "PhD Degree Conferral Decision", "Official PhD Diploma & Register"]
      }
    ]
  };

  // Toast Utility
  function showToast(title, msg) {
    const region = document.querySelector("[data-toast-region]");
    if (!region) return;
    const item = document.createElement("div");
    item.style.cssText = "padding:12px 18px; border-radius:10px; background:#061e3d; border:1px solid #2563eb; color:#ffffff; font-size:0.84rem; box-shadow:0 10px 25px rgba(6,30,61,0.25);";
    const heading = document.createElement('strong'); heading.textContent = title;
    const message = document.createElement('p'); message.textContent = msg;
    message.style.cssText = 'margin:2px 0 0;color:#cbd5e1;font-size:.78rem';
    item.append(heading, message);
    if (region.children.length >= 4) region.firstElementChild.remove();
    region.append(item);
    setTimeout(() => {
      item.style.opacity = "0";
      setTimeout(() => item.remove(), 200);
    }, 3500);
  }
  global.showToast = showToast;

  // SCREEN VIEWS SWITCHER ENGINE
  function switchView(targetViewId, updateHistory = true, anchorId) {
    if (!document.querySelector('.os-view[data-view="'+CSS.escape(targetViewId)+'"]')) targetViewId='home';
    if (global.DTMS_MANAGEMENT && !global.DTMS_MANAGEMENT.canAccessView(targetViewId)) return;
    document.querySelectorAll('.os-view').forEach(view=>view.classList.toggle('is-active',view.dataset.view===targetViewId));
    document.querySelectorAll('[data-dock-target]').forEach(button=>{
      const active=button.dataset.dockTarget===targetViewId;
      button.classList.toggle('is-active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    if(updateHistory && location.hash !== '#'+targetViewId) history.pushState(null,'','#'+targetViewId);
    if(anchorId) requestAnimationFrame(()=>document.getElementById(anchorId)?.scrollIntoView({block:'start'}));
    else global.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    document.dispatchEvent(new CustomEvent('dtms:view-change',{detail:{view:targetViewId}}));
  }
  global.switchView = switchView;

  function initViewRouter() {
    const restore=()=>{ if(location.hash !== '#main-content') switchView(location.hash.slice(1)||'home',false); };
    global.addEventListener('popstate',restore);
    global.addEventListener('hashchange',restore);
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-dock-target],[data-switch-view]');
      if(!button)return;
      event.preventDefault();
      switchView(button.dataset.dockTarget||button.dataset.switchView,true,button.dataset.dockAnchor);
    });
  }

  // Dynamic DOM Translation Renderer
  function applyLanguage(lang) {
    const dict = I18N_DICT[lang];
    if (!dict) return;
    document.documentElement.lang = lang.toLowerCase();
    if (!document.body.dataset.sourceTitle) document.body.dataset.sourceTitle = document.title;
    document.title = lang === "EN" ? "DTMS | Doctoral Training Management System - An Giang University" : document.body.dataset.sourceTitle;

    // 1. Translate elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key] !== undefined) {
        if (key === "home_h1_html") {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. Translate input placeholders with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((input) => {
      const key = input.dataset.i18nPlaceholder;
      if (dict[key] !== undefined) {
        input.placeholder = dict[key];
      }
    });
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((input) => {
      if (input.hasAttribute("data-i18n-placeholder")) return;
      if (!input.dataset.sourcePlaceholder) input.dataset.sourcePlaceholder = input.placeholder;
      input.placeholder = lang === "EN"
        ? (UI_PLACEHOLDERS_EN[input.dataset.sourcePlaceholder] || input.dataset.sourcePlaceholder)
        : input.dataset.sourcePlaceholder;
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (dict[key] !== undefined) el.title = dict[key];
    });
    document.querySelectorAll("[title], [aria-label]").forEach((el) => {
      ["title", "aria-label"].forEach((attribute) => {
        if (!el.hasAttribute(attribute)) return;
        const key = `source${attribute === "title" ? "Title" : "AriaLabel"}`;
        if (!el.dataset[key]) el.dataset[key] = el.getAttribute(attribute);
        const original = el.dataset[key];
        el.setAttribute(attribute, lang === "EN" ? (UI_ATTRIBUTES_EN[original] || original) : original);
      });
    });

    // 3. Update tooltips on dock items
    document.querySelectorAll(".dock-item").forEach((btn) => {
      const tooltipVal = lang === "VI" ? btn.dataset.tooltipVi : btn.dataset.tooltipEn;
      if (tooltipVal) {
        btn.setAttribute("data-tooltip", tooltipVal);
      }
    });

    // 4. Update language toggle button text
    const langBtn = document.querySelector("[data-lang-btn]");
    if (langBtn) {
      langBtn.innerHTML = `🌐 ${lang === "VI" ? "VI | EN" : "EN | VI"}`;
    }

    // 5. Re-render dynamic data components
    renderPersonaWorkspace(activePersonaKey);
    renderConstellationGraph();
    global.DTMS_PUBLIC_THESES?.render?.();
    global.DTMS_MANAGEMENT?.refreshLanguage?.();
    translateUnkeyedText(lang);
  }

  // Language Switcher Controller (VI / EN)
  function initLanguageSwitcher() {
    const langBtn = document.querySelector("[data-lang-btn]");
    if (!langBtn) return;

    applyLanguage(currentLang);
    const translatorObserver = new MutationObserver(() => translateUnkeyedText(currentLang));
    translatorObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

    langBtn.addEventListener("click", () => {
      currentLang = currentLang === "VI" ? "EN" : "VI";
      global.DTMS_DATA.setString("dtms-language", currentLang);
      applyLanguage(currentLang);
      
      const dict = I18N_DICT[currentLang];
      showToast(dict.lang_toast_title, dict.lang_toast_msg);
    });
  }

  // Single Collapsed Contact Hub Logic
  function initContactHub() {
    const triggerBtn = document.querySelector("[data-contact-trigger]");
    const hubMenu = document.querySelector("[data-contact-hub]");
    const optionZalo = document.querySelector("[data-option-zalo]");
    const optionFb = document.querySelector("[data-option-fb]");
    const optionAi = document.querySelector("[data-option-ai]");
    const chatWindow = document.querySelector("[data-ai-chat-window]");

    if (!triggerBtn || !hubMenu) return;

    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hubMenu.classList.toggle("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!hubMenu.contains(e.target) && !triggerBtn.contains(e.target)) {
        hubMenu.classList.remove("is-open");
      }
    });

    if (optionZalo) {
      optionZalo.addEventListener("click", () => {
        hubMenu.classList.remove("is-open");
        showToast(
          currentLang === "VI" ? "Chat Zalo Hỗ trợ" : "Zalo Support Chat",
          currentLang === "VI" ? "Số Zalo phòng Đào tạo Sau Đại học: 098.765.4321" : "Postgraduate Office Zalo Hotline: 098.765.4321"
        );
      });
    }

    if (optionFb) {
      optionFb.addEventListener("click", () => {
        hubMenu.classList.remove("is-open");
        showToast(
          currentLang === "VI" ? "Messenger Facebook" : "Facebook Messenger",
          currentLang === "VI" ? "Fanpage chính thức: Trường Đại học An Giang - ĐHQG-HCM" : "Official Fanpage: An Giang University - VNU-HCM"
        );
      });
    }

    if (optionAi && chatWindow) {
      optionAi.addEventListener("click", () => {
        hubMenu.classList.remove("is-open");
        chatWindow.classList.add("is-open");
      });
    }
  }

  // Render Persona Workspace dynamically based on current lang
  function renderPersonaWorkspace(k) {
    activePersonaKey = k;
    const navBox = document.querySelector("[data-persona-nav]");
    const displayBox = document.querySelector("[data-persona-display]");
    if (!navBox || !displayBox) return;

    const personaStore = PERSONA_DATA[currentLang] || PERSONA_DATA["VI"];
    const dict = I18N_DICT[currentLang];

    navBox.innerHTML = Object.keys(personaStore).map((key) => `
      <button class="persona-btn ${key === activePersonaKey ? 'is-active' : ''}" data-p-key="${key}">
        <span>${personaStore[key].title}</span>
        <span class="persona-btn-badge">${personaStore[key].code}</span>
      </button>
    `).join("");

    const p = personaStore[activePersonaKey] || personaStore["NCS"];
    displayBox.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <span style="padding:4px 10px; border-radius:9999px; background:var(--uni-blue-50); border:1px solid var(--uni-blue-100); color:var(--uni-blue-800); font-size:0.74rem; font-weight:700;">
          ${dict.persona_workspace_tag}
        </span>
        <span style="font-size:0.8rem; color:var(--text-secondary);">${dict.persona_role_code} <strong style="color:var(--uni-blue-900);">${p.code}</strong></span>
      </div>
      <h3 style="color:var(--uni-blue-900); font-size:1.4rem; margin-bottom:8px;">${p.title}</h3>
      <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6; margin-bottom:16px;">${p.desc}</p>

      <div style="margin:20px 0 24px;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary); margin-bottom:8px;">
          <span>${dict.persona_workload_label}</span>
          <strong style="color:var(--uni-blue-800);">${p.workload}%</strong>
        </div>
        <div class="workload-track">
          <div class="workload-fill" style="width: ${p.workload}%;"></div>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted); margin-top:6px; display:block;">${p.workloadText}</span>
      </div>

      <h4 style="font-size:0.9rem; color:var(--uni-blue-800); margin:20px 0 10px;">${dict.persona_tasks_label}</h4>
      <div style="display:grid; gap:10px;">
        ${p.tasks.map((task) => `
          <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:8px; background:var(--bg-subtle); border:1px solid var(--border-card); font-size:0.84rem; color:var(--text-main);">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style="color:var(--uni-blue-800); flex:0 0 auto;"><path d="m5 12 4 4L19 6"/></svg>
            <span>${task}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function initPersonaSimulator() {
    const navBox = document.querySelector("[data-persona-nav]");
    if (!navBox) return;

    navBox.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-p-key]");
      if (!btn) return;
      renderPersonaWorkspace(btn.dataset.pKey);
    });

    renderPersonaWorkspace("NCS");
  }

  // Render Constellation Roadmap Graph dynamically based on current lang
  function renderConstellationGraph() {
    const graphBox = document.querySelector("[data-constellation-graph]");
    if (!graphBox) return;

    const nodes = ROADMAP_NODES[currentLang] || ROADMAP_NODES["VI"];
    const dict = I18N_DICT[currentLang];

    graphBox.innerHTML = nodes.map((node, i) => `
      <button type="button" class="node-card" data-node-idx="${i}">
        <div class="node-number">${node.num}</div>
        <h4 style="color:var(--uni-blue-900); font-size:1.05rem; margin:0 0 6px;">${node.title}</h4>
        <p style="color:var(--text-secondary); font-size:0.78rem; margin:0;">${node.desc}</p>
        <span style="display:inline-block; margin-top:10px; font-size:0.72rem; color:var(--uni-blue-800); font-weight:700;">${dict.roadmap_inspect_btn}</span>
      </button>
    `).join("");
  }

  function initConstellationGraph() {
    const graphBox = document.querySelector("[data-constellation-graph]");
    const modal = document.querySelector("[data-hologram-modal]");
    const modalBody = document.querySelector("[data-modal-body]");
    const modalClose = document.querySelector("[data-modal-close]");

    if (!graphBox) return;

    renderConstellationGraph();

    graphBox.addEventListener("click", (e) => {
      const card = e.target.closest("[data-node-idx]");
      if (!card) return;
      const idx = parseInt(card.dataset.nodeIdx, 10);
      const nodes = ROADMAP_NODES[currentLang] || ROADMAP_NODES["VI"];
      const node = nodes[idx];
      if (!node) return;

      const dict = I18N_DICT[currentLang];

      modalBody.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <span style="padding:3px 10px; border-radius:9999px; background:var(--uni-blue-50); border:1px solid var(--uni-blue-100); color:var(--uni-blue-800); font-size:0.72rem; font-weight:800;">${dict.roadmap_modal_stage} ${node.num}</span>
          <span style="color:var(--text-secondary); font-size:0.8rem;">● ${node.tag}</span>
        </div>
        <h3 style="font-size:1.4rem; color:var(--uni-blue-900); margin:0 0 12px;">${node.title}</h3>
        <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:20px;">${node.details}</p>
        
        <div style="background:var(--bg-subtle); border-radius:12px; padding:16px; border:1px solid var(--border-card);">
          <strong style="color:var(--uni-blue-800); font-size:0.88rem; display:block; margin-bottom:8px;">${dict.roadmap_modal_outputs}</strong>
          <ul style="margin:0; padding-left:18px; color:var(--text-main); font-size:0.84rem; line-height:1.6;">
            ${node.items.map((it) => `<li>${it}</li>`).join("")}
          </ul>
        </div>
      `;

      modal.classList.add("is-open");
    });

    if (modalClose && modal) {
      modalClose.addEventListener("click", () => modal.classList.remove("is-open"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("is-open");
      });
    }
  }

  // DOM Loaded Engine Init
  document.addEventListener("DOMContentLoaded", () => {
    initViewRouter();
    initLanguageSwitcher();
    initContactHub();
    initConstellationGraph();
    initPersonaSimulator();
  });
})(window, document);




