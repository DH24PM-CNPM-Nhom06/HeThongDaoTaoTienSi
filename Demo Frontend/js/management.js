/**
 * DTMS MANAGEMENT STUDIO - CORE JAVASCRIPT ENGINE (js/management.js)
 * Cổng Quản lý Đào tạo Nghiên cứu sinh & Tiến sĩ - Trường ĐH An Giang (ĐHQG-HCM)
 * Hỗ trợ 14 Phân hệ Chức năng Toàn diện & Bàn làm việc Phân quyền (RBAC)
 */
(function initializeDTMSManagement(global) {
  "use strict";

  // 1. DATA STORE: 6 VAI TRÒ CHÍNH (RBAC ROLES & DEMO ACCOUNTS)
  const USERS_ROLE_STORE = {
    NCS: {
      id: "usr_ncs",
      code: "NCS",
      name: "NCS. Nguyễn Văn Bình",
      title: "Nghiên cứu sinh Khóa 2023",
      unit: "Khoa Nông nghiệp - TNTN",
      major: "Khoa học Môi trường (Mã: 9440301)",
      avatarText: "NB",
      email: "nvbinh_ncs@agu.edu.vn",
      phone: "0912.345.678"
    },
    NHD: {
      id: "usr_nhd",
      code: "NHD",
      name: "GS.TS. Trần Văn Hướng",
      title: "Người hướng dẫn khoa học chính",
      unit: "Bộ môn Kỹ thuật Môi trường",
      major: "Khoa học & Kỹ thuật Môi trường",
      avatarText: "TH",
      email: "tvhuong@agu.edu.vn",
      phone: "0903.888.999"
    },
    BM: {
      id: "usr_bm",
      code: "BM",
      name: "TS. Lê Hoàng Nam",
      title: "Trưởng Bộ môn Kỹ thuật Môi trường",
      unit: "Khoa Nông nghiệp - TNTN",
      major: "Quản lý Tài nguyên Nước",
      avatarText: "LN",
      email: "lhnam@agu.edu.vn",
      phone: "0908.777.666"
    },
    KHOA: {
      id: "usr_khoa",
      code: "KHOA",
      name: "PGS.TS. Nguyễn Thị Kim",
      title: "Phó Trưởng Khoa Nông nghiệp - TNTN",
      unit: "Ban Chủ nhiệm Khoa NN-TNTN",
      major: "Nông nghiệp Công nghệ cao",
      avatarText: "NK",
      email: "ntkim@agu.edu.vn",
      phone: "0918.555.444"
    },
    PDT: {
      id: "usr_pdt",
      code: "PDT",
      name: "ThS. Phạm Minh Đăng",
      title: "Chuyên viên QLĐT Sau Đại học",
      unit: "Phòng Đào tạo Sau Đại học",
      major: "Quản lý Giáo dục Đại học",
      avatarText: "PĐ",
      email: "pmdang_pdt@agu.edu.vn",
      phone: "0296.384.6666"
    },
    BGH: {
      id: "usr_bgh",
      code: "BGH",
      name: "PGS.TS. Võ Văn Thắng",
      title: "Hiệu trưởng Trường ĐH An Giang",
      unit: "Ban Giám hiệu Trường ĐH An Giang",
      major: "Chủ tịch Hội đồng Khoa học",
      avatarText: "VT",
      email: "vvthang@agu.edu.vn",
      phone: "0296.384.1111"
    },
    HOIDONG: {
      id: "usr_council",
      code: "HOIDONG",
      name: "PGS.TS. Nguyễn Minh Châu",
      title: "Ủy viên Hội đồng đánh giá luận án",
      unit: "Hội đồng đánh giá cấp Trường",
      major: "Khoa học Môi trường",
      avatarText: "MC",
      email: "hoidong@agu.edu.vn",
      phone: "0296.384.2222"
    }
  };

  // State
  let currentUser = USERS_ROLE_STORE[sessionStorage.getItem("dtms-role") || "NCS"] || USERS_ROLE_STORE.NCS;
  let activeModuleId = "m01";

  const ROLE_MODULES = {
    NCS: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12"],
    NHD: ["m01", "m02", "m03", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12"],
    BM: ["m01", "m02", "m03", "m05", "m06", "m07", "m09", "m10", "m12"],
    KHOA: ["m01", "m02", "m03", "m05", "m06", "m10", "m12", "m13"],
    PDT: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12", "m13", "m14"],
    BGH: ["m01", "m03", "m10", "m11", "m12", "m13"],
    HOIDONG: ["m09", "m10"]
  };

  const ROLE_DASHBOARDS = {
    NCS: { stage: "Giai đoạn nghiên cứu", metrics: [["Tiến độ đào tạo", "68%"], ["Tín chỉ đã đạt", "18 / 24"], ["Báo cáo kỳ này", "Còn 12 ngày"]], actions: [["Nộp báo cáo tiến độ", "m07"], ["Khai báo công bố khoa học", "m08"], ["Xem kế hoạch đào tạo", "m02"]], queue: "Báo cáo tiến độ học kỳ 7 cần nộp trước ngày 11/10/2026.", deadline: "Hoàn thiện bản thảo Chuyên đề 3 · 18/10/2026" },
    NHD: { stage: "Hướng dẫn và đánh giá NCS", metrics: [["NCS đang hướng dẫn", "06"], ["Hồ sơ chờ duyệt", "03"], ["Báo cáo cần đánh giá", "02"]], actions: [["Đánh giá báo cáo tiến độ", "m07"], ["Duyệt kế hoạch đào tạo", "m02"], ["Thẩm định công bố khoa học", "m08"]], queue: "Có 2 báo cáo tiến độ và 1 kế hoạch đang chờ ý kiến của thầy.", deadline: "Đánh giá báo cáo của NCS Trần Minh Anh · 03/10/2026" },
    BM: { stage: "Điều phối chuyên môn cấp Bộ môn", metrics: [["NCS thuộc bộ môn", "18"], ["Hồ sơ chờ xác nhận", "04"], ["Mốc sắp đến hạn", "03"]], actions: [["Xác nhận kế hoạch", "m02"], ["Theo dõi chuyên đề", "m06"], ["Rà soát tiến độ", "m07"]], queue: "4 hồ sơ đào tạo cần rà soát và xác nhận ở cấp Bộ môn.", deadline: "Chốt danh sách đánh giá chuyên đề đợt tháng 10 · 06/10/2026" },
    KHOA: { stage: "Điều hành đào tạo cấp Khoa", metrics: [["NCS toàn Khoa", "42"], ["Hồ sơ chờ thông qua", "05"], ["Cảnh báo tiến độ", "03"]], actions: [["Rà soát hồ sơ NCS", "m01"], ["Rà soát đề cương nghiên cứu", "m05"], ["Xem báo cáo tổng hợp", "m13"]], queue: "5 hồ sơ đề cương và luận án chờ Khoa xem xét.", deadline: "Phiên họp xét đề cương nghiên cứu · 08/10/2026" },
    PDT: { stage: "Quản lý đào tạo sau đại học", metrics: [["NCS đang đào tạo", "126"], ["Hồ sơ chờ thẩm định", "12"], ["Đủ điều kiện bảo vệ", "08"]], actions: [["Thẩm định hồ sơ", "m01"], ["Kiểm tra điều kiện bảo vệ", "m10"], ["Lập báo cáo đào tạo", "m13"]], queue: "12 hồ sơ đang chờ thẩm định tại Phòng Đào tạo.", deadline: "Hoàn tất danh sách đủ điều kiện bảo vệ đợt 2 · 12/10/2026" },
    BGH: { stage: "Giám sát và phê duyệt cấp Trường", metrics: [["NCS toàn Trường", "126"], ["Quyết định chờ ký", "03"], ["Hồ sơ bảo vệ", "08"]], actions: [["Xem hồ sơ trình ký", "m10"], ["Theo dõi cấp bằng", "m11"], ["Xem thống kê toàn Trường", "m13"]], queue: "3 quyết định hội đồng và bảo vệ đang trình ký.", deadline: "Ký quyết định thành lập Hội đồng · 05/10/2026" },
    HOIDONG: { stage: "Đánh giá luận án được phân công", metrics: [["Hồ sơ được giao", "02"], ["Phiếu đánh giá đã gửi", "01 / 02"], ["Phiên bảo vệ sắp tới", "01"]], actions: [["Xem luận án được phân công", "m09"], ["Nhập phiếu đánh giá", "m10"]], queue: "Còn 1 phiếu nhận xét luận án chưa được gửi.", deadline: "Gửi nhận xét luận án NCS Lê Quốc Huy · 09/10/2026" }
  };
  const ROLE_DASHBOARDS_EN = {
    NCS: { stage: "Research stage", metrics: [["Training progress", "68%"], ["Credits earned", "18 / 24"], ["Current report", "Due in 12 days"]], actions: [["Submit progress report", "m07"], ["Declare publication", "m08"], ["View study plan", "m02"]], queue: "Your semester 7 progress report is due on 11 Oct 2026.", deadline: "Complete doctoral topic 3 draft · 18 Oct 2026" },
    NHD: { stage: "Supervision and candidate review", metrics: [["Candidates supervised", "06"], ["Pending reviews", "03"], ["Reports to review", "02"]], actions: [["Review progress reports", "m07"], ["Approve study plan", "m02"], ["Review publications", "m08"]], queue: "Two progress reports and one study plan are awaiting your review.", deadline: "Review Tran Minh Anh's report · 03 Oct 2026" },
    BM: { stage: "Department coordination", metrics: [["Candidates in department", "18"], ["Pending confirmations", "04"], ["Upcoming milestones", "03"]], actions: [["Confirm study plan", "m02"], ["Track doctoral topics", "m06"], ["Review progress", "m07"]], queue: "Four academic records need department review.", deadline: "Confirm the October topic review list · 06 Oct 2026" },
    KHOA: { stage: "Faculty-level academic management", metrics: [["Candidates in faculty", "42"], ["Pending approvals", "05"], ["Progress alerts", "03"]], actions: [["Review candidate files", "m01"], ["Review research outlines", "m05"], ["View summary reports", "m13"]], queue: "Five proposals and thesis records are awaiting faculty review.", deadline: "Research proposal review meeting · 08 Oct 2026" },
    PDT: { stage: "Graduate academic affairs", metrics: [["Active candidates", "126"], ["Records awaiting review", "12"], ["Eligible for defense", "08"]], actions: [["Review candidate records", "m01"], ["Check defense requirements", "m10"], ["Create academic report", "m13"]], queue: "Twelve records are awaiting Graduate Academic Affairs review.", deadline: "Finalize the defense eligibility list · 12 Oct 2026" },
    BGH: { stage: "University-level oversight and approval", metrics: [["Candidates university-wide", "126"], ["Decisions to sign", "03"], ["Defense records", "08"]], actions: [["Review decisions", "m10"], ["Track degree issuance", "m11"], ["View university reports", "m13"]], queue: "Three council and defense decisions are awaiting signature.", deadline: "Sign the council appointment decision · 05 Oct 2026" },
    HOIDONG: { stage: "Assigned thesis reviews", metrics: [["Assigned records", "02"], ["Reviews submitted", "01 / 02"], ["Upcoming defense sessions", "01"]], actions: [["View assigned theses", "m09"], ["Enter evaluation", "m10"]], queue: "One thesis review is still outstanding.", deadline: "Submit the review for Le Quoc Huy · 09 Oct 2026" }
  };

  const ACTION_ACCESS = [
    { selector: '[onclick*="modal-edit-profile"]', roles: ["NCS", "PDT"], label: "Cập nhật hồ sơ NCS" },
    { selector: '[onclick*="Xem hồ sơ NCS"]', roles: ["NHD", "BM", "KHOA", "PDT", "BGH"], label: "Mở hồ sơ NCS" },
    { selector: '[onclick*="modal-leave-request"]', roles: ["NCS"], label: "Gửi yêu cầu học vụ" },
    { selector: '[onclick*="modal-edit-plan"]', roles: ["NCS"], label: "Cập nhật kế hoạch đào tạo" },
    { selector: '[onclick*="handleApprovePlan"]', roles: ["NHD", "BM", "KHOA", "PDT"], label: "Duyệt kế hoạch đào tạo" },
    { selector: '[onclick*="modal-assign-supervisor"]', roles: ["PDT"], label: "Phân công người hướng dẫn" },
    { selector: '[onclick*="modal-change-supervisor"]', roles: ["NCS"], label: "Đề xuất đổi người hướng dẫn" },
    { selector: '[onclick*="modal-submit-essay"]', roles: ["NCS"], label: "Nộp tiểu luận tổng quan" },
    { selector: '[onclick*="modal-submit-outline"]', roles: ["NCS"], label: "Nộp đề cương nghiên cứu" },
    { selector: '[onclick*="modal-grade-essay"]', roles: ["BM", "NHD"], label: "Đánh giá tiểu luận" },
    { selector: '[onclick*="modal-register-topic"]', roles: ["NCS"], label: "Đăng ký chuyên đề tiến sĩ" },
    { selector: '[onclick*="handleGradeTopic"]', roles: ["BM", "NHD"], label: "Chấm chuyên đề" },
    { selector: '[onclick*="handleToggleCourse"]', roles: ["NCS"], label: "Đăng ký học phần" },
    { selector: '[onclick*="cập nhật dữ liệu bảng điểm"]', roles: ["PDT"], label: "Đồng bộ bảng điểm học phần" },
    { selector: '[onclick*="modal-submit-progress"]', roles: ["NCS"], label: "Nộp báo cáo tiến độ" },
    { selector: '[onclick*="handleGradeProgressReport"]', roles: ["NHD", "BM"], label: "Đánh giá báo cáo tiến độ" },
    { selector: '[onclick*="modal-declare-pub"]', roles: ["NCS"], label: "Khai báo công bố khoa học" },
    { selector: '[onclick*="modal-workflow-pub"]', roles: ["NHD", "PDT"], label: "Theo dõi thẩm định công bố" },
    { selector: '[onclick*="modal-change-topic-title"]', roles: ["NCS"], label: "Đề xuất điều chỉnh đề tài" },
    { selector: '[onclick*="modal-upload-thesis-version"]', roles: ["NCS"], label: "Nộp phiên bản luận án" },
    { selector: '[onclick*="handleRunTurnitin"]', roles: ["PDT"], label: "Kiểm tra độ trùng lặp" },
    { selector: '[onclick*="handleSignDefenseApproval"]', roles: ["NHD"], label: "Xác nhận cho phép bảo vệ" },
    { selector: '[onclick*="handleExportReport"]', roles: ["PDT", "KHOA", "BGH"], label: "Xuất báo cáo" },
    { selector: '[onclick*="gửi email cảnh báo"]', roles: ["NHD", "PDT"], label: "Gửi nhắc hạn báo cáo" },
    { selector: '[onclick*="thúc đẩy học vụ"]', roles: ["NHD", "PDT"], label: "Nhắc NCS bổ sung tiến độ" },
    { selector: '[onclick*="System Audit Log"]', roles: ["PDT"], label: "Xuất nhật ký thao tác" },
    { selector: '[onclick*="modal-workflow-defense"]', roles: ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH", "HOIDONG"], label: "Theo dõi quy trình bảo vệ" },
    { selector: '[onclick*="handleDefenseVoting"]', roles: ["HOIDONG"], label: "Gửi kết quả bỏ phiếu" },
    { selector: '[onclick*="modal-submit-post-defense"]', roles: ["NCS"], label: "Nộp hồ sơ sau bảo vệ" },
    { selector: '[onclick*="handleConferDegree"]', roles: ["BGH"], label: "Phê duyệt cấp bằng" },
    { selector: '[onclick*="modal-create-change-request"]', roles: ["NCS"], label: "Tạo yêu cầu thay đổi học vụ" },
    { selector: '[onclick*="modal-login"]', roles: ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH", "HOIDONG"], label: null },
    { selector: '[onclick*="modal-role-switcher"]', roles: ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH", "HOIDONG"], label: null },
    { selector: '[onclick*="handleExportAuditLog"]', roles: ["PDT"], label: null },
    { selector: '[onclick*="refreshAuditLog"]', roles: ["PDT"], label: null },
    { selector: '[onclick*="handleConferDegree"]', roles: ["BGH"], label: null },
    { selector: '[onclick*="handleDefenseVoting"]', roles: ["HOIDONG"], label: null },
    { selector: '[onclick*="handleGradeProgressReport"]', roles: ["NHD", "BM"], label: null },
    { selector: '[onclick*="handleGradeTopic"]', roles: ["BM", "NHD"], label: null },
    { selector: '[onclick*="modal-workflow-changes"]', roles: ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH"], label: null },
    { selector: '[onclick*="modal-assign-supervisor"]', roles: ["PDT"], label: null },
    { selector: '[onclick*="modal-change-supervisor"]', roles: ["NCS"], label: null }
  ];

  const MODAL_ACCESS = {
    "modal-edit-profile": ["NCS", "PDT"], "modal-leave-request": ["NCS"], "modal-edit-plan": ["NCS"],
    "modal-assign-supervisor": ["PDT"], "modal-change-supervisor": ["NCS"], "modal-grade-essay": ["BM", "NHD"],
    "modal-submit-essay": ["NCS"], "modal-submit-outline": ["NCS"], "modal-register-topic": ["NCS"],
    "modal-submit-progress": ["NCS"], "modal-declare-pub": ["NCS"], "modal-workflow-pub": ["NHD", "PDT"],
    "modal-change-topic-title": ["NCS"], "modal-upload-thesis-version": ["NCS"], "modal-workflow-defense": ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH", "HOIDONG"],
    "modal-submit-post-defense": ["NCS"], "modal-create-change-request": ["NCS"],
    "modal-workflow-changes": ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH"]
  };

  function applyRolePermissions() {
    const roleKey = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser) || "NCS";
    const allowed = ROLE_MODULES[currentUser.code] || ROLE_MODULES.NCS;
    document.querySelectorAll(".mgmt-tab-btn").forEach((button) => {
      button.hidden = !allowed.includes(button.dataset.targetModule);
    });
    if (!allowed.includes(activeModuleId)) {
      switchModuleTab(allowed[0] || "m01");
    }
    ACTION_ACCESS.forEach(({ selector, roles }) => {
      document.querySelectorAll(selector).forEach((control) => {
        control.hidden = !roles.includes(roleKey);
      });
    });
    document.querySelectorAll("[data-role-admin-action]").forEach((control) => {
      control.hidden = roleKey !== "PDT";
    });
    Object.entries(MODAL_ACCESS).forEach(([modalId, roles]) => {
      const modal = document.getElementById(modalId);
      if (modal) modal.dataset.allowedRoles = roles.join(",");
    });
    document.querySelectorAll(".mgmt-panel").forEach((panel) => {
      panel.hidden = !allowed.includes(panel.id.replace("panel-", ""));
    });
    const candidateRows = document.querySelector("#panel-m01 .mgmt-table-wrapper tbody");
    if (candidateRows) {
      Array.from(candidateRows.rows).forEach((row, index) => {
        row.hidden = ["NCS", "NHD"].includes(roleKey) && index > 0;
      });
    }
  }

  function renderRoleDashboard() {
    const header = document.querySelector(".mgmt-top-header");
    if (!header) return;
    let dashboard = document.querySelector("[data-role-dashboard]");
    if (!dashboard) {
      dashboard = document.createElement("section");
      dashboard.dataset.roleDashboard = "";
      dashboard.className = "role-dashboard";
      header.insertAdjacentElement("afterend", dashboard);
    }
    const roleKey = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser) || "NCS";
    const isEnglish = localStorage.getItem("dtms-language") === "EN";
    const data = (isEnglish ? ROLE_DASHBOARDS_EN : ROLE_DASHBOARDS)[roleKey] || (isEnglish ? ROLE_DASHBOARDS_EN : ROLE_DASHBOARDS).NCS;
    const roleNames = isEnglish
      ? { NCS: "PhD candidate", NHD: "Supervisor", BM: "Department chair", KHOA: "Faculty leadership", PDT: "Graduate Academic Affairs", BGH: "University leadership", HOIDONG: "Review committee" }
      : { NCS: "Nghiên cứu sinh", NHD: "Người hướng dẫn khoa học", BM: "Trưởng Bộ môn", KHOA: "Ban Chủ nhiệm Khoa", PDT: "Phòng Đào tạo", BGH: "Ban Giám hiệu", HOIDONG: "Hội đồng đánh giá" };
    const title = header.querySelector(".mgmt-header-title h2");
    const subtitle = header.querySelector(".mgmt-header-title p");
    if (title) title.textContent = `${isEnglish ? "Workspace" : "Bàn làm việc"} · ${roleNames[roleKey]}`;
    if (subtitle) subtitle.textContent = isEnglish ? `Records and actions available to ${roleNames[roleKey]}.` : `Các hồ sơ, nhiệm vụ và thao tác được phân quyền cho ${roleNames[roleKey]}.`;
    dashboard.innerHTML = `
      <div class="role-dashboard-heading"><div><span class="role-dashboard-eyebrow">BẢNG ĐIỀU KHIỂN · ${currentUser.code}</span><h2>Xin chào, ${currentUser.name}</h2><p>${currentUser.title} · ${data.stage}</p></div><span class="role-dashboard-date">Năm học 2026–2027</span></div>
      <div class="role-dashboard-metrics">${data.metrics.map(([label, value]) => `<article class="role-dashboard-metric"><span>${label}</span><strong>${value}</strong></article>`).join("")}</div>
      <div class="role-dashboard-grid"><article class="role-dashboard-panel role-dashboard-priority"><span class="role-dashboard-eyebrow">CẦN ƯU TIÊN</span><h3>${data.queue}</h3><p>Hạn gần nhất: ${data.deadline}</p></article><article class="role-dashboard-panel"><span class="role-dashboard-eyebrow">TRUY CẬP NGHIỆP VỤ</span><div class="role-dashboard-actions">${data.actions.map(([label, module]) => `<button type="button" data-dashboard-module="${module}">${label}<span aria-hidden="true">→</span></button>`).join("")}</div></article></div>`;
    dashboard.querySelectorAll("[data-dashboard-module]").forEach((button) => button.addEventListener("click", () => switchModuleTab(button.dataset.dashboardModule)));
  }

  function login(event) {
    event.preventDefault();
    const email = document.getElementById("login-username").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const match = Object.entries(USERS_ROLE_STORE).find(([, user]) => user.email.toLowerCase() === email);
    const error = document.getElementById("login-error");
    if (!match || password !== "agu2026") {
      error.hidden = false;
      error.textContent = "Thông tin đăng nhập chưa chính xác. Hãy kiểm tra email và mật khẩu.";
      return;
    }
    error.hidden = true;
    sessionStorage.setItem("dtms-role", match[0]);
    switchRole(match[0]);
    closeModal("modal-login");
    notify("Đăng nhập thành công", `Xin chào ${match[1].name}. Bàn làm việc đã cập nhật theo vai trò của bạn.`);
  }

  // Helper: Toast message
  function notify(title, msg, type) {
    if (global.showToast) {
      global.showToast(title, msg);
    } else {
      const region = document.querySelector("[data-toast-region]");
      if (!region) return;
      const item = document.createElement("div");
      item.style.cssText = "padding:12px 18px; border-radius:10px; background:#061e3d; border:1px solid #2563eb; color:#ffffff; font-size:0.84rem; box-shadow:0 10px 25px rgba(6,30,61,0.25);";
      item.innerHTML = `<strong>${title}</strong><p style="margin:2px 0 0; color:#cbd5e1; font-size:0.78rem;">${msg}</p>`;
      region.append(item);
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 200);
      }, 3500);
    }
  }

  // 2. AUDIT LOG INITIAL DATA & APPENDER
  let AUDIT_LOGS = [
    { time: "29/09/2026 13:15:20", user: "ThS. Phạm Minh Đăng", role: "PDT", action: "Thẩm định bài báo", target: "Paper Scopus Q1 (Water Research)", ip: "172.16.10.45", status: "Thành công" },
    { time: "29/09/2026 11:42:05", user: "GS.TS. Trần Văn Hướng", role: "NHD", action: "Đánh giá Báo cáo tiến độ", target: "Kỳ 4 - Đạt yêu cầu", ip: "172.16.12.18", status: "Thành công" },
    { time: "29/09/2026 09:20:11", user: "NCS. Nguyễn Văn Bình", role: "NCS", action: "Nộp bản thảo Chuyên đề 3", target: "Chuyên đề 3: Đánh giá vòng đời LCA", ip: "115.78.22.90", status: "Thành công" },
    { time: "28/09/2026 16:05:44", user: "PGS.TS. Võ Văn Thắng", role: "BGH", action: "Ký Quyết định Hội đồng", target: "HĐ Đánh giá Luận án TS-2026-089", ip: "172.16.1.10", status: "Thành công" },
    { time: "28/09/2026 14:30:00", user: "TS. Lê Hoàng Nam", role: "BM", action: "Nhập điểm Tiểu luận", target: "Tiểu luận tổng quan: 8.77 điểm", ip: "172.16.15.22", status: "Thành công" }
  ];

  function addAuditLog(action, target) {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    AUDIT_LOGS.unshift({
      time: timeStr,
      user: currentUser.name,
      role: currentUser.code,
      action: action,
      target: target,
      ip: "172.16.14.88",
      status: "Thành công"
    });
    renderAuditLogTable();
  }

  function renderAuditLogTable() {
    const tbody = document.getElementById("audit-log-tbody");
    if (!tbody) return;
    tbody.innerHTML = AUDIT_LOGS.map(log => `
      <tr>
        <td><span style="font-family:monospace; font-size:0.8rem; color:var(--text-muted);">${log.time}</span></td>
        <td><strong>${log.user}</strong></td>
        <td><span class="role-pill-badge">${log.role}</span></td>
        <td><span class="audit-log-badge approve">${log.action}</span></td>
        <td>${log.target}</td>
        <td><span style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary);">${log.ip}</span></td>
        <td><span class="status-pill is-success">${log.status}</span></td>
      </tr>
    `).join("");
  }

  // 3. SWITCH ACTIVE USER & ROLE
  function switchRole(roleKey, quiet = false) {
    if (!USERS_ROLE_STORE[roleKey]) return;
    currentUser = USERS_ROLE_STORE[roleKey];
    sessionStorage.setItem("dtms-role", roleKey);
    if (!quiet) {
      global.location.reload();
      return;
    }

    // Update Topbar UI
    const topAvatar = document.getElementById("topbar-avatar");
    const topName = document.getElementById("topbar-user-name");
    const topRole = document.getElementById("topbar-role-badge");
    const activeDisplay = document.getElementById("mgmt-active-user-display");

    if (topAvatar) topAvatar.textContent = currentUser.avatarText;
    if (topName) topName.textContent = currentUser.name;
    if (topRole) topRole.textContent = currentUser.code;

    if (activeDisplay) {
      activeDisplay.innerHTML = `
        <div class="active-user-avatar">${currentUser.avatarText}</div>
        <div class="active-user-info">
          <strong>${currentUser.name}</strong>
          <span>${currentUser.title} · ${currentUser.unit}</span>
        </div>
        <span class="role-pill-badge">${currentUser.code}</span>
      `;
    }

    applyRolePermissions();
    renderRoleDashboard();
  }

  // 4. TAB SWITCHER FOR 14 MODULES
  function switchModuleTab(moduleId) {
    const allowed = ROLE_MODULES[currentUser.code] || ROLE_MODULES.NCS;
    if (!allowed.includes(moduleId)) {
      notify("Không đủ quyền truy cập", "Vai trò hiện tại không được phép mở phân hệ này.");
      return;
    }
    activeModuleId = moduleId;
    const tabBtns = document.querySelectorAll(".mgmt-tab-btn");
    const panels = document.querySelectorAll(".mgmt-panel");

    tabBtns.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.targetModule === moduleId);
    });

    panels.forEach(panel => {
      panel.classList.toggle("is-active", panel.id === `panel-${moduleId}`);
    });

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // 5. MODAL SYSTEM CONTROLLER
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const allowedRoles = modal?.dataset.allowedRoles?.split(",") || [];
    const currentRole = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser);
    if (allowedRoles.length && !allowedRoles.includes(currentRole)) {
      notify("Không đủ quyền thao tác", "Vai trò hiện tại không được phép thực hiện thao tác này.");
      return;
    }
    if (modal) modal.classList.add("is-open");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("is-open");
  }

  function initModalListeners() {
    document.addEventListener("click", e => {
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        const modalId = closeBtn.dataset.closeModal;
        closeModal(modalId);
      }

      const modalBg = e.target.closest(".mgmt-modal");
      if (modalBg && e.target === modalBg) {
        modalBg.classList.remove("is-open");
      }
    });
  }

  // Helper: XSS Sanitization
  function escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // 1. DATA STORE: LOCALSTORAGE PERSISTENCE ENGINE & DATASETS
  const STORAGE_KEY = "DTMS_MANAGEMENT_APP_STATE_V2";

  const INITIAL_STATE = {
    profile: {
      phone: "0912.345.678",
      email: "nvbinh_ncs@agu.edu.vn",
      workplace: "Khoa Nông nghiệp - TNTN",
      monthsUsed: 36,
      maxMonths: 48
    },
    advisorsQuota: {
      "GS.TS. Trần Văn Hướng": { title: "GS", max: 4, count: 2 },
      "PGS.TS. Lê Văn Tuấn": { title: "PGS", max: 3, count: 2 },
      "TS. Nguyễn Hải Nam": { title: "TS", max: 3, count: 1 },
      "PGS.TS. Nguyễn Thị Kim": { title: "PGS", max: 3, count: 2 },
      "TS. Lê Hoàng Nam": { title: "TS", max: 3, count: 2 }
    },
    planStage: 0, // 0: Chờ NHD, 1: Chờ BM, 2: Chờ PDT, 3: Đã duyệt hoàn tất
    essayResult: { avg: "8.77", s1: 8.5, s2: 9.0, s3: 8.8, status: "pass" },
    outlineStatus: "Đã duyệt",
    topics: [
      { name: "Chuyên đề 1: Tổng quan ĐTM vùng ĐBSCL", score: "8.8", status: "passed" },
      { name: "Chuyên đề 2: Phương pháp đánh giá rủi ro độc chất", score: "8.5", status: "passed" },
      { name: "Chuyên đề 3: Đánh giá vòng đời LCA", score: "9.1", status: "passed" }
    ],
    publications: [
      {
        id: "pub_01",
        title: "Assessment of Microplastic Pollution in Mekong Delta Estuarine Waters",
        journal: "Environmental Science & Technology",
        cat: "Scopus Q1",
        authorRole: "Tác giả chính (1st)",
        verified: true,
        score: 1.0,
        doi: "10.1016/j.envsci.2025.109"
      },
      {
        id: "pub_02",
        title: "Heavy Metal Accumulation in Sediment of An Giang Inland Waterways",
        journal: "AGU Journal of Science",
        cat: "Bài báo WoS/Scopus",
        authorRole: "Tác giả chính (1st)",
        verified: true,
        score: 0.75,
        doi: "10.1016/j.envsci.2025.202"
      }
    ],
    leaveRequests: [
      { id: "ĐN-1082", type: "Gia hạn học tập", duration: "06 tháng", reason: "Hoàn thiện thu thập mẫu hiện trường", date: "15/08/2026", status: "Đã duyệt bởi PDT", fileName: "don_xin_gia_han_signed.pdf" }
    ],
    progressReports: [
      { period: 1, status: "pass" }, { period: 2, status: "pass" }, { period: 3, status: "pass" },
      { period: 4, status: "pass" }, { period: 5, status: "pass" }, { period: 6, status: "pass" }
    ],
    auditLogs: [
      { time: "29/09/2026 13:15:20", user: "ThS. Phạm Minh Đăng", role: "PDT", action: "Thẩm định bài báo", target: "Paper Scopus Q1 (Water Research)", ip: "172.16.10.45", status: "Thành công" },
      { time: "29/09/2026 11:42:05", user: "GS.TS. Trần Văn Hướng", role: "NHD", action: "Đánh giá Báo cáo tiến độ", target: "Kỳ 6 - Đạt yêu cầu", ip: "172.16.12.18", status: "Thành công" },
      { time: "29/09/2026 09:20:11", user: "NCS. Nguyễn Văn Bình", role: "NCS", action: "Nộp bản thảo Chuyên đề 3", target: "Chuyên đề 3: Đánh giá vòng đời LCA", ip: "115.78.22.90", status: "Thành công" },
      { time: "28/09/2026 16:05:44", user: "PGS.TS. Võ Văn Thắng", role: "BGH", action: "Ký Quyết định Hội đồng", target: "HĐ Đánh giá Luận án TS-2026-089", ip: "172.16.1.10", status: "Thành công" },
      { time: "28/09/2026 14:30:00", user: "TS. Lê Hoàng Nam", role: "BM", action: "Nhập điểm Tiểu luận", target: "Tiểu luận tổng quan: 8.77 điểm", ip: "172.16.15.22", status: "Thành công" }
    ]
  };

  function getAppState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to load local state:", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  function saveAppState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save local state:", e);
    }
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("DTMS_WORKFLOW_SUBMISSIONS_V1");
    notify("Đã khôi phục dữ liệu", "Hệ thống đã reset dữ liệu mẫu ban đầu.");
    setTimeout(() => global.location.reload(), 600);
  }

  let APP_STATE = getAppState();
  AUDIT_LOGS = APP_STATE.auditLogs || AUDIT_LOGS;
  APP_STATE.advisorsQuota = { ...INITIAL_STATE.advisorsQuota, ...(APP_STATE.advisorsQuota || {}) };
  const oldSeedQuota = APP_STATE.advisorsQuota["GS.TS. Trần Văn Hướng"];
  if (oldSeedQuota?.max === 4 && oldSeedQuota.count === 4) oldSeedQuota.count = 2;
  saveAppState(APP_STATE);

  function applyRolePermissions() {
    const roleKey = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser) || "NCS";
    const allowed = ROLE_MODULES[currentUser.code] || ROLE_MODULES.NCS;
    document.querySelectorAll(".mgmt-tab-btn").forEach((button) => {
      button.hidden = !allowed.includes(button.dataset.targetModule);
    });
    if (!allowed.includes(activeModuleId)) {
      switchModuleTab(allowed[0] || "m01");
    }
    ACTION_ACCESS.forEach(({ selector, roles }) => {
      document.querySelectorAll(selector).forEach((control) => {
        control.hidden = !roles.includes(roleKey);
      });
    });
    document.querySelectorAll("[data-role-admin-action]").forEach((control) => {
      control.hidden = roleKey !== "PDT";
    });
    Object.entries(MODAL_ACCESS).forEach(([modalId, roles]) => {
      const modal = document.getElementById(modalId);
      if (modal) modal.dataset.allowedRoles = roles.join(",");
    });
    document.querySelectorAll(".mgmt-panel").forEach((panel) => {
      panel.hidden = !allowed.includes(panel.id.replace("panel-", ""));
    });

    renderPublicationsTable();
    renderPlanStatusUI();
    renderDefenseChecklistUI();
  }

  function renderRoleDashboard() {
    const header = document.querySelector(".mgmt-top-header");
    if (!header) return;
    let dashboard = document.querySelector("[data-role-dashboard]");
    if (!dashboard) {
      dashboard = document.createElement("section");
      dashboard.dataset.roleDashboard = "";
      dashboard.className = "role-dashboard";
      header.insertAdjacentElement("afterend", dashboard);
    }
    const roleKey = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser) || "NCS";
    const isEnglish = localStorage.getItem("dtms-language") === "EN";
    const dashboards = isEnglish ? ROLE_DASHBOARDS_EN : ROLE_DASHBOARDS;
    const data = dashboards[roleKey] || dashboards.NCS;
    const allowedModules = ROLE_MODULES[roleKey] || ROLE_MODULES.NCS;
    const roleActions = data.actions.filter(([, moduleId]) => allowedModules.includes(moduleId));
    const roleNames = isEnglish
      ? { NCS: "PhD candidate", NHD: "Supervisor", BM: "Department chair", KHOA: "Faculty leadership", PDT: "Graduate Academic Affairs", BGH: "University leadership", HOIDONG: "Review committee" }
      : { NCS: "Nghiên cứu sinh", NHD: "Người hướng dẫn khoa học", BM: "Trưởng Bộ môn", KHOA: "Ban Chủ nhiệm Khoa", PDT: "Phòng Đào tạo", BGH: "Ban Giám hiệu", HOIDONG: "Hội đồng đánh giá" };
    const title = header.querySelector(".mgmt-header-title h2");
    const subtitle = header.querySelector(".mgmt-header-title p");
    if (title) title.textContent = `${isEnglish ? "Workspace" : "Bàn làm việc"} · ${roleNames[roleKey]}`;
    if (subtitle) subtitle.textContent = isEnglish ? `Records and actions available to ${roleNames[roleKey]}.` : `Các hồ sơ, nhiệm vụ và thao tác được phân quyền cho ${roleNames[roleKey]}.`;
    dashboard.innerHTML = `
      <div class="role-dashboard-heading"><div><span class="role-dashboard-eyebrow">${isEnglish ? "DASHBOARD" : "BẢNG ĐIỀU KHIỂN"} · ${currentUser.code}</span><h2>${isEnglish ? "Welcome," : "Xin chào,"} ${escapeHtml(currentUser.name)}</h2><p>${escapeHtml(isEnglish ? roleNames[roleKey] : currentUser.title)} · ${data.stage}</p></div><span class="role-dashboard-date">${isEnglish ? "Academic year 2026–2027" : "Năm học 2026–2027"}</span></div>
      <div class="role-dashboard-metrics">${data.metrics.map(([label, value]) => `<article class="role-dashboard-metric"><span>${label}</span><strong>${value}</strong></article>`).join("")}</div>
      <div class="role-dashboard-grid"><article class="role-dashboard-panel role-dashboard-priority"><span class="role-dashboard-eyebrow">${isEnglish ? "PRIORITY" : "CẦN ƯU TIÊN"}</span><h3>${data.queue}</h3><p>${isEnglish ? "Next due:" : "Hạn gần nhất:"} ${data.deadline}</p></article><article class="role-dashboard-panel"><span class="role-dashboard-eyebrow">${isEnglish ? "QUICK ACCESS" : "TRUY CẬP NGHIỆP VỤ"}</span><div class="role-dashboard-actions">${roleActions.map(([label, module]) => `<button type="button" data-dashboard-module="${module}">${label}<span aria-hidden="true">→</span></button>`).join("")}</div></article></div>`;
    dashboard.querySelectorAll("[data-dashboard-module]").forEach((button) => button.addEventListener("click", () => switchModuleTab(button.dataset.dashboardModule)));
    let submissions = [];
    try { submissions = JSON.parse(localStorage.getItem("DTMS_WORKFLOW_SUBMISSIONS_V1") || "[]"); } catch (_) { submissions = []; }
    if (submissions.length) {
      const history = document.createElement("section");
      history.className = "role-dashboard-panel";
      history.style.marginTop = "16px";
      history.innerHTML = `<span class="role-dashboard-eyebrow">YÊU CẦU ĐÃ GHI NHẬN TRÊN THIẾT BỊ NÀY</span><div style="display:grid;gap:8px;margin-top:10px;">${submissions.slice(0, 5).map(item => `<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.status)} · ${new Date(item.submittedAt).toLocaleString("vi-VN")}</span></div>`).join("")}</div>`;
      dashboard.append(history);
    }
  }

  function login(event) {
    event.preventDefault();
    const email = document.getElementById("login-username").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const match = Object.entries(USERS_ROLE_STORE).find(([, user]) => user.email.toLowerCase() === email);
    const error = document.getElementById("login-error");
    if (!match || password !== "agu2026") {
      error.hidden = false;
      error.textContent = "Thông tin đăng nhập chưa chính xác. Hãy kiểm tra email và mật khẩu.";
      return;
    }
    error.hidden = true;
    sessionStorage.setItem("dtms-role", match[0]);
    switchRole(match[0]);
    closeModal("modal-login");
    notify("Đăng nhập thành công", `Xin chào ${match[1].name}. Bàn làm việc đã cập nhật theo vai trò của bạn.`);
  }

  // Helper: Toast message
  function notify(title, msg, type) {
    if (global.showToast) {
      global.showToast(title, msg);
    } else {
      const region = document.querySelector("[data-toast-region]");
      if (!region) return;
      const item = document.createElement("div");
      item.style.cssText = "padding:12px 18px; border-radius:10px; background:#061e3d; border:1px solid #2563eb; color:#ffffff; font-size:0.84rem; box-shadow:0 10px 25px rgba(6,30,61,0.25);";
      item.innerHTML = `<strong>${escapeHtml(title)}</strong><p style="margin:2px 0 0; color:#cbd5e1; font-size:0.78rem;">${escapeHtml(msg)}</p>`;
      region.append(item);
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 200);
      }, 3500);
    }
  }

  // 2. AUDIT LOG INITIAL DATA & APPENDER
  function addAuditLog(action, target) {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const newLog = {
      time: timeStr,
      user: currentUser.name,
      role: currentUser.code,
      action: action,
      target: target,
      ip: "172.16.14.88",
      status: "Thành công"
    };
    AUDIT_LOGS.unshift(newLog);
    APP_STATE.auditLogs = AUDIT_LOGS;
    saveAppState(APP_STATE);
    renderAuditLogTable();
  }

  function renderAuditLogTable() {
    const tbody = document.getElementById("audit-log-tbody");
    if (!tbody) return;
    tbody.innerHTML = AUDIT_LOGS.map(log => `
      <tr>
        <td><span style="font-family:monospace; font-size:0.8rem; color:var(--text-muted);">${log.time}</span></td>
        <td><strong>${escapeHtml(log.user)}</strong></td>
        <td><span class="role-pill-badge">${escapeHtml(log.role)}</span></td>
        <td><span class="audit-log-badge approve">${escapeHtml(log.action)}</span></td>
        <td>${escapeHtml(log.target)}</td>
        <td><span style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary);">${log.ip}</span></td>
        <td><span class="status-pill is-success">${log.status}</span></td>
      </tr>
    `).join("");
  }

  // 3. SWITCH ACTIVE USER & ROLE
  function switchRole(roleKey, quiet = false) {
    if (!USERS_ROLE_STORE[roleKey]) return;
    currentUser = USERS_ROLE_STORE[roleKey];
    sessionStorage.setItem("dtms-role", roleKey);
    if (!quiet) {
      global.location.reload();
      return;
    }

    // Update Topbar UI
    const topAvatar = document.getElementById("topbar-avatar");
    const topName = document.getElementById("topbar-user-name");
    const topRole = document.getElementById("topbar-role-badge");
    const activeDisplay = document.getElementById("mgmt-active-user-display");

    if (topAvatar) topAvatar.textContent = currentUser.avatarText;
    if (topName) topName.textContent = currentUser.name;
    if (topRole) topRole.textContent = currentUser.code;

    if (activeDisplay) {
      activeDisplay.innerHTML = `
        <div class="active-user-avatar">${currentUser.avatarText}</div>
        <div class="active-user-info">
          <strong>${escapeHtml(currentUser.name)}</strong>
          <span>${escapeHtml(currentUser.title)} · ${escapeHtml(currentUser.unit)}</span>
        </div>
        <span class="role-pill-badge">${currentUser.code}</span>
      `;
    }

    applyRolePermissions();
    renderRoleDashboard();
  }

  // 4. TAB SWITCHER FOR 14 MODULES
  function switchModuleTab(moduleId) {
    const allowed = ROLE_MODULES[currentUser.code] || ROLE_MODULES.NCS;
    if (!allowed.includes(moduleId)) {
      notify("Không đủ quyền truy cập", "Vai trò hiện tại không được phép mở phân hệ này.");
      return;
    }
    activeModuleId = moduleId;
    const tabBtns = document.querySelectorAll(".mgmt-tab-btn");
    const panels = document.querySelectorAll(".mgmt-panel");

    tabBtns.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.targetModule === moduleId);
    });

    panels.forEach(panel => {
      panel.classList.toggle("is-active", panel.id === `panel-${moduleId}`);
    });

    if (moduleId === "m10") renderDefenseChecklistUI();
    if (moduleId === "m08") renderPublicationsTable();
    if (moduleId === "m02") renderPlanStatusUI();

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // 5. MODAL SYSTEM CONTROLLER
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const allowedRoles = modal?.dataset.allowedRoles?.split(",") || [];
    const currentRole = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser);
    if (allowedRoles.length && !allowedRoles.includes(currentRole)) {
      notify("Không đủ quyền thao tác", "Vai trò hiện tại không được phép thực hiện thao tác này.");
      return;
    }
    if (modal) modal.classList.add("is-open");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("is-open");
  }

  function initModalListeners() {
    document.addEventListener("click", e => {
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        const modalId = closeBtn.dataset.closeModal;
        closeModal(modalId);
      }

      const modalBg = e.target.closest(".mgmt-modal");
      if (modalBg && e.target === modalBg) {
        modalBg.classList.remove("is-open");
      }
    });
  }

  // 6. MODULE-SPECIFIC ACTIONS & BUSINESS RULE ENFORCERS

  // Module 1: Update personal info
  function handleUpdateProfile(e) {
    e.preventDefault();
    const phone = document.getElementById("profile-phone-input").value.trim();
    const email = document.getElementById("profile-email-input").value.trim();
    const workplace = document.getElementById("profile-workplace-input").value.trim();

    APP_STATE.profile.phone = phone;
    APP_STATE.profile.email = email;
    APP_STATE.profile.workplace = workplace;
    saveAppState(APP_STATE);

    const displayPhone = document.getElementById("profile-display-phone");
    const displayEmail = document.getElementById("profile-display-email");
    const displayWorkplace = document.getElementById("profile-display-workplace");

    if (displayPhone) displayPhone.textContent = phone;
    if (displayEmail) displayEmail.textContent = email;
    if (displayWorkplace) displayWorkplace.textContent = workplace;

    closeModal("modal-edit-profile");
    addAuditLog("Cập nhật thông tin cá nhân", "Cập nhật SĐT, Email, Nơi công tác NCS vào localStorage");
    notify("Hồ sơ đã cập nhật", "Thông tin cá nhân Nghiên cứu sinh đã được đồng bộ vào lưu trữ.");
  }

  // Module 1: Submit Extension/Leave
  function handleSubmitLeaveRequest(e) {
    e.preventDefault();
    const type = document.getElementById("leave-type-select").value;
    const duration = document.getElementById("leave-duration-input").value;
    const reason = document.getElementById("leave-reason-input").value;
    const fileInput = document.getElementById("leave-file-input");
    if (!fileInput?.files?.length) {
      notify("Thiếu minh chứng", "Chọn tệp đơn có chữ ký trước khi gửi yêu cầu.");
      return;
    }
    const fileName = fileInput.files[0].name;

    const newReq = {
      id: `ĐN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: type,
      duration: duration,
      reason: reason,
      date: new Date().toLocaleDateString("vi-VN"),
      status: "Đang chờ Khoa duyệt",
      fileName: fileName
    };

    APP_STATE.leaveRequests.unshift(newReq);
    saveAppState(APP_STATE);
    renderLeaveHistoryTable();

    closeModal("modal-leave-request");
    addAuditLog("Nộp đơn biến động học vụ", `${type} thời gian ${duration} (Minh chứng: ${fileName})`);
    notify("Đã ghi nhận đơn", `Đơn xin ${type} kèm tên tệp ${fileName} đã được lưu cục bộ. Nội dung tệp chưa tải lên máy chủ.`);
  }

  function renderLeaveHistoryTable() {
    const tbody = document.getElementById("leave-history-tbody");
    if (!tbody) return;
    tbody.innerHTML = APP_STATE.leaveRequests.map(req => `
      <tr>
        <td><strong>${escapeHtml(req.id)}</strong></td>
        <td><span class="status-pill is-purple">${escapeHtml(req.type)}</span></td>
        <td>${escapeHtml(req.duration)}</td>
        <td>${escapeHtml(req.reason)}</td>
        <td>${escapeHtml(req.date)}</td>
        <td><span class="status-pill is-warning">${escapeHtml(req.status)}</span></td>
        <td>
          <button class="btn-mgmt btn-mgmt-sm btn-mgmt-outline-blue" onclick="alert('File minh chứng: ${escapeHtml(req.fileName)}')">📄 ${escapeHtml(req.fileName)}</button>
        </td>
      </tr>
    `).join("");
  }

  // Module 2: Multi-tiered Plan Approval (FR-CT03)
  function renderPlanStatusUI() {
    const badge = document.getElementById("plan-status-badge");
    if (!badge) return;
    const isEnglish = localStorage.getItem("dtms-language") === "EN";
    const stages = isEnglish ? [
      { label: "Awaiting supervisor approval (Level 1)", class: "status-pill is-warning" },
      { label: "Awaiting department approval (Level 2)", class: "status-pill is-blue" },
      { label: "Awaiting Academic Affairs approval (Level 3)", class: "status-pill is-purple" },
      { label: "Fully approved by supervisor, department and Academic Affairs", class: "status-pill is-success" }
    ] : [
      { label: "Chờ NHD phê duyệt (Cấp 1)", class: "status-pill is-warning" },
      { label: "Chờ Bộ môn phê duyệt (Cấp 2)", class: "status-pill is-blue" },
      { label: "Chờ Phòng Đào tạo phê duyệt (Cấp 3)", class: "status-pill is-purple" },
      { label: "Đã duyệt hoàn tất bởi NHD, BM & PĐT", class: "status-pill is-success" }
    ];
    const current = stages[APP_STATE.planStage || 0];
    badge.className = current.class;
    badge.textContent = current.label;
  }

  function handleApprovePlan() {
    const roleCode = currentUser.code;
    const stage = APP_STATE.planStage || 0;

    if (roleCode === "NCS") {
      notify("Không có quyền", "NCS chỉ có quyền gửi kế hoạch. Việc phê duyệt cần qua Người hướng dẫn, Bộ môn và PĐT.");
      return;
    }

    if (stage === 0 && roleCode === "NHD") {
      APP_STATE.planStage = 1;
      saveAppState(APP_STATE);
      renderPlanStatusUI();
      addAuditLog("NHD Duyệt kế hoạch học tập", "Cấp 1: NHD GS.TS. Trần Văn Hướng đã duyệt kế hoạch");
      notify("Duyệt Cấp 1 thành công", "Người hướng dẫn đã ký duyệt kế hoạch. Đã chuyển hồ sơ sang Trưởng Bộ môn.");
    } else if (stage === 1 && roleCode === "BM") {
      APP_STATE.planStage = 2;
      saveAppState(APP_STATE);
      renderPlanStatusUI();
      addAuditLog("Bộ môn Duyệt kế hoạch học tập", "Cấp 2: Trưởng Bộ môn TS. Lê Hoàng Nam đã xác nhận kế hoạch");
      notify("Duyệt Cấp 2 thành công", "Bộ môn đã thông qua kế hoạch. Đã chuyển hồ sơ đến Phòng Đào tạo.");
    } else if (stage === 2 && roleCode === "PDT") {
      APP_STATE.planStage = 3;
      saveAppState(APP_STATE);
      renderPlanStatusUI();
      addAuditLog("PĐT Phê duyệt kế hoạch học tập", "Cấp 3: Phòng Đào tạo đã thẩm định và ký phê duyệt chính thức");
      notify("Duyệt hoàn tất", "Phòng Đào tạo đã phê duyệt toàn văn Kế hoạch đào tạo 3 năm của NCS!");
    } else if (stage === 3) {
      notify("Kế hoạch đã hoàn tất", "Kế hoạch đào tạo đã được 3 cấp phê duyệt đầy đủ.");
    } else {
      notify("Chưa đúng luồng duyệt", `Trạng thái hiện tại yêu cầu cấp có thẩm quyền phê duyệt tiếp theo.`);
    }
  }

  // Module 3: Assign Supervisor with Quota Check (FR-HD02)
  function handleAssignSupervisor(e) {
    e.preventDefault();
    const ncsName = document.getElementById("assign-ncs-select").value;
    const nhdMain = document.getElementById("assign-nhd-main-select").value;
    const nhdSub = document.getElementById("assign-nhd-sub-select").value;
    const decisionNo = document.getElementById("assign-decision-input").value || "450/QĐ-ĐHAG";

    // Quota Enforcement: GS max 4, PGS/TS max 3
    const selectedSupervisors = [...new Set([nhdMain, nhdSub].filter(Boolean))];
    for (const supervisor of selectedSupervisors) {
      const quotaData = APP_STATE.advisorsQuota[supervisor];
      if (!quotaData) {
        notify("Thiếu dữ liệu định mức", `Chưa có định mức cho ${supervisor}. Không thể ban hành phân công.`);
        return;
      }
      if (quotaData.count >= quotaData.max) {
        notify(
          "Cảnh báo Định mức NHD (FR-HD02)",
          `Không thể phân công: ${supervisor} (${quotaData.title}) đã hướng dẫn ${quotaData.count}/${quotaData.max} NCS. Vượt quá định mức cho phép.`
        );
        return;
      }
    }
    selectedSupervisors.forEach(supervisor => APP_STATE.advisorsQuota[supervisor].count += 1);
    saveAppState(APP_STATE);

    closeModal("modal-assign-supervisor");
    addAuditLog("Phân công Người hướng dẫn", `Giao ${nhdMain} hướng dẫn NCS ${ncsName} (QĐ: ${decisionNo})`);
    notify("Đã ghi nhận phân công", `Đã lưu phân công ${nhdMain}${nhdSub ? ` và ${nhdSub}` : ""} cho ${ncsName} trong dữ liệu demo cục bộ.`);
  }

  // Module 4: Course Registration
  function handleToggleCourse(courseCode, btn) {
    const registeredCourses = new Set(APP_STATE.registeredCourses || []);
    const isRegistered = registeredCourses.has(courseCode);
    if (isRegistered) {
      registeredCourses.delete(courseCode);
      btn.className = "btn-mgmt btn-mgmt-sm btn-mgmt-primary";
      btn.textContent = "+ Đăng ký";
      notify("Hủy môn thành công", `Đã hủy học phần ${courseCode}`);
      addAuditLog("Hủy đăng ký học phần", `Học phần: ${courseCode}`);
    } else {
      registeredCourses.add(courseCode);
      btn.className = "btn-mgmt btn-mgmt-sm btn-mgmt-danger";
      btn.textContent = "✕ Hủy đăng ký";
      notify("Đăng ký thành công", `Đã đăng ký học phần ${courseCode}`);
      addAuditLog("Đăng ký học phần mới", `Học phần: ${courseCode}`);
    }
    APP_STATE.registeredCourses = Array.from(registeredCourses);
    saveAppState(APP_STATE);
  }

  // Module 5: Grade Overview Essay (FR-HP02 - Validation Avg >= 7.0)
  function handleGradeEssay(e) {
    e.preventDefault();
    const score1 = parseFloat(document.getElementById("essay-score-1").value) || 0;
    const score2 = parseFloat(document.getElementById("essay-score-2").value) || 0;
    const score3 = parseFloat(document.getElementById("essay-score-3").value) || 0;
    const avg = ((score1 + score2 + score3) / 3).toFixed(2);
    const isPass = parseFloat(avg) >= 7.0;

    APP_STATE.essayResult = {
      avg: avg,
      s1: score1,
      s2: score2,
      s3: score3,
      status: isPass ? "pass" : "fail"
    };
    saveAppState(APP_STATE);

    const avgEl = document.getElementById("essay-avg-score");
    if (avgEl) {
      avgEl.textContent = `${avg} (${isPass ? "ĐẠT" : "KHÔNG ĐẠT - Dưới 7.0"})`;
      avgEl.style.color = isPass ? "var(--uni-blue-900)" : "#dc2626";
    }

    closeModal("modal-grade-essay");
    renderDefenseChecklistUI();
    addAuditLog("Nhập điểm Tiểu luận tổng quan", `Điểm TB: ${avg} - Kết luận: ${isPass ? 'ĐẠT' : 'KHÔNG ĐẠT (TB < 7.0)'}`);
    notify(
      isPass ? "Tiểu luận ĐẠT" : "Tiểu luận KHÔNG ĐẠT",
      `Điểm trung bình Tiểu luận tổng quan: ${avg}/10. ${isPass ? "Đã đủ điều kiện qua môn." : "Điểm dưới 7.0 không đủ điều kiện chuyển tiếp!"}`
    );
  }

  // Module 6: Grade Doctoral Topic
  function handleGradeTopic(topicIdx) {
    if (!(["BM", "NHD"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn hoặc Trưởng Bộ môn được nhập điểm chuyên đề.");
      return;
    }
    const enteredScore = global.prompt(`Nhập điểm Chuyên đề ${topicIdx} (0–10):`, "8.5");
    if (enteredScore === null) return;
    const numericScore = Number(enteredScore);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 10) {
      notify("Điểm không hợp lệ", "Điểm chuyên đề phải là số từ 0 đến 10.");
      return;
    }
    const score = numericScore.toFixed(1);
    if (APP_STATE.topics[topicIdx - 1]) {
      APP_STATE.topics[topicIdx - 1].score = score;
      APP_STATE.topics[topicIdx - 1].status = "passed";
      saveAppState(APP_STATE);
    }
    const scoreEl = document.getElementById(`topic-score-${topicIdx}`);
    const statusEl = document.getElementById(`topic-status-${topicIdx}`);
    if (scoreEl) scoreEl.textContent = `${score}/10`;
    if (statusEl) {
      statusEl.className = "status-pill is-success";
      statusEl.textContent = "Đã đánh giá (Đạt)";
    }
    renderDefenseChecklistUI();
    addAuditLog("Đánh giá Chuyên đề tiến sĩ", `Chuyên đề ${topicIdx}: Điểm ${score}/10`);
    notify("Chấm chuyên đề thành công", `Đã lưu kết quả đánh giá Chuyên đề ${topicIdx} với điểm số ${score}/10.`);
  }

  // Module 7: 6-Month Progress Report Grading
  function handleGradeProgressReport(period, result) {
    const reportObj = APP_STATE.progressReports.find(r => r.period === period);
    if (reportObj) {
      reportObj.status = result;
      saveAppState(APP_STATE);
    }
    const statusEl = document.getElementById(`progress-status-period-${period}`);
    if (statusEl) {
      if (result === "pass") {
        statusEl.className = "status-pill is-success";
        statusEl.textContent = "Đạt tiến độ";
      } else {
        statusEl.className = "status-pill is-warning";
        statusEl.textContent = "Cần chỉnh sửa";
      }
    }
    renderDefenseChecklistUI();
    addAuditLog("NHD Đánh giá Báo cáo tiến độ", `Kỳ báo cáo ${period}: ${result === 'pass' ? 'ĐẠT' : 'YÊU CẦU ĐẨY NHANH'}`);
    notify("Đã lưu đánh giá tiến độ", `Đã lưu nhận xét và kết luận kỳ báo cáo số ${period}.`);
  }

  // Module 8: Publication Declaration & Role-Restricted Verification (FR-CD05)
  function renderPublicationsTable() {
    const tbody = document.getElementById("pub-table-tbody");
    if (!tbody) return;

    const canVerify = ["PDT", "NHD"].includes(currentUser.code);
    const isEnglish = localStorage.getItem("dtms-language") === "EN";

    tbody.innerHTML = APP_STATE.publications.map(pub => {
      const isVerified = pub.verified;
      const statusHtml = isVerified
        ? `<span class="status-pill is-success">✓ ${isEnglish ? "Verified" : "Đã thẩm định hợp lệ"} (${Number(pub.score).toFixed(2)} ${isEnglish ? "points" : "điểm"})</span>`
        : `<span class="status-pill is-warning">${isEnglish ? "Awaiting review" : "Chờ PĐT Thẩm định"}</span>`;

      let actionHtml = "";
      if (canVerify && !isVerified) {
        actionHtml = `<button class="btn-mgmt btn-mgmt-sm btn-mgmt-success" onclick="DTMS_MANAGEMENT.verifyPublication('${pub.id}')">✓ ${isEnglish ? "Review (WoS/Scopus)" : "Thẩm định (WoS/Scopus)"}</button>`;
      } else if (!canVerify && !isVerified) {
        actionHtml = `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">${isEnglish ? "Awaiting authorized reviewer" : "Chờ đại diện PĐT/NHD duyệt"}</span>`;
      } else {
        actionHtml = `<span style="font-size:0.78rem; color:#059669; font-weight:700;">✓ ${isEnglish ? "Verified" : "Đã xác minh"}</span>`;
      }

      return `
        <tr>
          <td><strong>${escapeHtml(pub.title)}</strong><br/><span style="font-size:0.75rem; color:var(--text-muted);">DOI: ${escapeHtml(pub.doi)}</span></td>
          <td>${escapeHtml(pub.journal)}</td>
          <td><span class="status-pill is-blue">${escapeHtml(pub.cat)}</span></td>
          <td>${escapeHtml(pub.authorRole)}</td>
          <td>${statusHtml}</td>
          <td>${actionHtml}</td>
        </tr>
      `;
    }).join("");

    // Calculate total valid score
    const totalScore = APP_STATE.publications.filter(p => p.verified).reduce((sum, p) => sum + p.score, 0);
    const scoreBadge = document.getElementById("pub-total-score-display");
    if (scoreBadge) {
      scoreBadge.textContent = isEnglish ? `${totalScore.toFixed(2)} / 0.75 points (Circular 18)` : `${totalScore.toFixed(2)} / 0.75 điểm (Đầu ra TT18)`;
      scoreBadge.className = totalScore >= 0.75 ? "status-pill is-success" : "status-pill is-warning";
    }
  }

  function handleDeclarePublication(e) {
    e.preventDefault();
    const title = document.getElementById("pub-title-input").value.trim();
    const journal = document.getElementById("pub-journal-input").value.trim();
    const category = document.getElementById("pub-cat-select").value;
    const doi = document.getElementById("pub-doi-input").value.trim();
    const fileInput = document.getElementById("pub-file-input");
    if (!title || !journal || !/^10\.\d{4,9}\/\S+$/i.test(doi)) {
      notify("Thông tin chưa hợp lệ", "Nhập tiêu đề, tạp chí và DOI đúng định dạng trước khi khai báo.");
      return;
    }
    if (!fileInput?.files?.length) {
      notify("Thiếu minh chứng", "Chọn tệp bài báo hoặc thư chấp nhận trước khi gửi khai báo.");
      return;
    }
    const fileName = fileInput.files[0].name;

    const newPub = {
      id: `pub_${Date.now()}`,
      title: title,
      journal: journal,
      cat: category,
      authorRole: "Tác giả chính (1st)",
      verified: false,
      score: 0,
      doi: doi,
      fileName: fileName
    };

    APP_STATE.publications.unshift(newPub);
    saveAppState(APP_STATE);
    renderPublicationsTable();

    closeModal("modal-declare-pub");
    addAuditLog("Khai báo bài báo khoa học", `Khai báo bài: "${title}" (${category}) kèm tệp ${fileName}`);
    notify("Đã gửi khai báo", "Thông tin và tên tệp minh chứng đã lưu trên thiết bị này, chờ vai trò có thẩm quyền thẩm định. Nội dung tệp chưa được tải lên máy chủ.");
  }

  function verifyPublication(pubId) {
    if (!["PDT", "NHD"].includes(currentUser.code)) {
      notify("Không có quyền thẩm định", "NCS không được tự thẩm định bài báo. Thao tác này dành cho PĐT và NHD.");
      return;
    }

    const pub = APP_STATE.publications.find(p => p.id === pubId);
    if (pub) {
      const scoreInput = global.prompt(`Nhập điểm công bố được duyệt cho “${pub.title}” (0–1):`, String(pub.score || "0.75"));
      if (scoreInput === null) return;
      const score = Number(scoreInput);
      if (!Number.isFinite(score) || score < 0 || score > 1) {
        notify("Điểm không hợp lệ", "Điểm công bố phải nằm trong khoảng 0 đến 1.");
        return;
      }
      pub.score = score;
      pub.verified = true;
      saveAppState(APP_STATE);
      renderPublicationsTable();
      renderDefenseChecklistUI();
      addAuditLog("PĐT Thẩm định bài báo khoa học", `Xác nhận hợp lệ bài báo "${pub.title}" (+${pub.score} điểm)`);
      notify("Đã lưu kết quả thẩm định", `Đã ghi nhận ${pub.score.toFixed(2)} điểm theo đánh giá của người duyệt. Frontend demo chưa kết nối nguồn WoS/Scopus.`);
    }
  }

  // Module 10: Dynamic Defense Checklist Evaluation (FR-BV02)
  function renderDefenseChecklistUI() {
    const container = document.getElementById("defense-checklist-container");
    if (!container) return;

    const essayAvg = parseFloat(APP_STATE.essayResult?.avg || 0);
    const essayPass = essayAvg >= 7.0;
    const hpCond = essayPass;

    const outlineCond = APP_STATE.outlineStatus === "Đã duyệt";
    const topicsCount = APP_STATE.topics.filter(t => t.status === "passed").length;
    const topicsCond = topicsCount >= 3;

    const pubScore = APP_STATE.publications.filter(p => p.verified).reduce((sum, p) => sum + p.score, 0);
    const pubCond = pubScore >= 0.75;

    const latestReport = APP_STATE.progressReports.slice(-1)[0];
    const progressCond = latestReport && latestReport.status === "pass";

    const monthsUsed = APP_STATE.profile.monthsUsed || 36;
    const maxMonths = APP_STATE.profile.maxMonths || 48;
    const durationCond = monthsUsed <= maxMonths;

    const isEnglish = localStorage.getItem("dtms-language") === "EN";
    const checklistItems = isEnglish ? [
      { label: "1. Complete 24 course credits and literature review (score ≥ 7.0)", status: hpCond, text: hpCond ? `PASS (24/24 credits · review: ${essayAvg}/10)` : `NOT MET (review: ${essayAvg}/10; minimum 7.0)` },
      { label: "2. Research proposal reviewed and approved", status: outlineCond, text: outlineCond ? "PASS (proposal approved)" : "NOT MET (proposal not approved)" },
      { label: "3. Complete and pass all three doctoral topics", status: topicsCond, text: topicsCond ? "PASS (3/3 topics)" : `NOT MET (${topicsCount}/3 topics)` },
      { label: "4. Verified publications meet the 0.75 point minimum", status: pubCond, text: pubCond ? `PASS (${pubScore.toFixed(2)} / 0.75 points)` : `NOT MET (${pubScore.toFixed(2)} / 0.75 points)` },
      { label: "5. Most recent six-month progress report passed", status: progressCond, text: progressCond ? "PASS (latest report approved)" : "NOT MET (latest report not approved)" },
      { label: "6. Candidate remains within the training period", status: durationCond, text: durationCond ? `PASS (${monthsUsed}/${maxMonths} months)` : `OVERDUE (${monthsUsed}/${maxMonths} months)` }
    ] : [
      { label: "1. Hoàn thành 24 tín chỉ học phần & Tiểu luận tổng quan (≥ 7.0 điểm)", status: hpCond, text: hpCond ? `ĐẠT (24/24 Tín chỉ · Điểm TL: ${essayAvg}/10)` : `CHƯA ĐẠT (Điểm TL: ${essayAvg}/10 < 7.0)` },
      { label: "2. Đánh giá và thông qua Đề cương nghiên cứu", status: outlineCond, text: outlineCond ? "ĐẠT (Đã duyệt Đề cương)" : "CHƯA ĐẠT (Chưa duyệt Đề cương)" },
      { label: "3. Hoàn thành và đánh giá 3/3 Chuyên đề tiến sĩ", status: topicsCond, text: topicsCond ? "ĐẠT (3/3 Chuyên đề xuất sắc)" : `CHƯA ĐẠT (${topicsCount}/3 Chuyên đề)` },
      { label: "4. Thẩm định công bố khoa học đạt tối thiểu 0,75 điểm (WoS/Scopus)", status: pubCond, text: pubCond ? `ĐẠT (${pubScore.toFixed(2)} / 0.75 điểm WoS/Scopus)` : `CHƯA ĐẠT (${pubScore.toFixed(2)} / 0.75 điểm)` },
      { label: "5. Báo cáo tiến độ định kỳ 6 tháng gần nhất Đạt", status: progressCond, text: progressCond ? "ĐẠT (Kỳ 6 Đạt tiến độ)" : "CHƯA ĐẠT (Chưa nộp/duyệt kỳ 6)" },
      { label: "6. Hồ sơ nằm trong thời hạn đào tạo chuẩn (≤ 48 tháng)", status: durationCond, text: durationCond ? `ĐẠT (Đã học ${monthsUsed}/48 tháng)` : `VƯỢT THỜI HẠN (${monthsUsed}/48 tháng)` }
    ];

    const passedCount = checklistItems.filter(i => i.status).length;

    container.innerHTML = `
      <div style="background:var(--uni-blue-50); border:1px solid var(--uni-blue-100); border-radius:12px; padding:18px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:var(--uni-blue-900);">${isEnglish ? "THESIS DEFENSE ELIGIBILITY CHECKLIST" : "BẢNG KIỂM ĐIỀU KIỆN BẢO VỆ LUẬN ÁN (CHECKLIST THÔNG TƯ 18)"}</h4>
            <p style="margin:2px 0 0; font-size:0.8rem; color:var(--text-secondary);">${isEnglish ? "Calculated from the candidate's saved training record." : "Tự động đối soát từ hồ sơ đào tạo thực tế của NCS. Nguyễn Văn Bình"}</p>
          </div>
          <span class="status-pill ${passedCount === 6 ? 'is-success' : 'is-warning'}" style="font-size:0.9rem; padding:6px 14px;">
            ${passedCount === 6 ? (isEnglish ? '✓ ELIGIBLE (6/6)' : '✓ 6/6 ĐỦ ĐIỀU KIỆN BẢO VỆ') : (isEnglish ? `⚠️ NOT ELIGIBLE (${passedCount}/6)` : `⚠️ CHƯA ĐỦ ĐIỀU KIỆN (${passedCount}/6 ĐẠT)`)}
          </span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          ${checklistItems.map(item => `
            <div style="padding:12px; background:#ffffff; border-radius:8px; border:1px solid ${item.status ? '#a7f3d0' : '#fecdd3'}; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:0.82rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">${item.label}</div>
                <div style="font-size:0.75rem; color:${item.status ? '#059669' : '#dc2626'}; font-weight:600;">${item.text}</div>
              </div>
              <span style="font-size:1.2rem; font-weight:800; color:${item.status ? '#059669' : '#dc2626'}; margin-left:8px;">${item.status ? '✓' : '✕'}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Module 9: Turnitin Similarity Check
  function handleRunTurnitin() {
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được gửi yêu cầu kiểm tra độ tương đồng.");
      return;
    }
    const status = document.getElementById("turnitin-gauge-status");
    if (status) status.textContent = "Chưa kết nối Turnitin. Không có kết quả phần trăm tương đồng.";
    notify("Chưa kết nối dịch vụ", "Frontend không thể tính độ tương đồng. Cần cấu hình API Turnitin trước khi hiển thị kết quả.");
  }

  // Module 9: NHD Sign-off for Defense
  function handleSignDefenseApproval() {
    if (currentUser.code !== "NHD") {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn khoa học được xác nhận đồng ý cho bảo vệ.");
      return;
    }
    APP_STATE.defenseApproval = { signedAt: new Date().toISOString(), signedBy: currentUser.id };
    saveAppState(APP_STATE);
    const signBadge = document.getElementById("nhd-defense-sign-badge");
    if (signBadge) {
      signBadge.className = "status-pill is-success";
      signBadge.textContent = "NHD Đã Ký Số Cho Phép Bảo Vệ";
    }
    addAuditLog("NHD Ký xác nhận bảo vệ luận án", "GS.TS. Trần Văn Hướng đã ký số bản nhận xét đồng ý cho NCS bảo vệ");
    notify("Ký số thành công", "Biên bản đồng ý cho phép bảo vệ luận án đã được ký số và gửi lên Hội đồng.");
  }

  // Module 10: Defense Voting & Council Resolution
  function handleDefenseVoting() {
    if (currentUser.code !== "HOIDONG") {
      notify("Không đủ quyền", "Chỉ thành viên Hội đồng được ghi nhận kết quả biểu quyết.");
      return;
    }
    const entered = global.prompt("Nhập số phiếu tán thành (0–7):", "7");
    if (entered === null) return;
    const yesVotes = Number(entered);
    if (!Number.isInteger(yesVotes) || yesVotes < 0 || yesVotes > 7) {
      notify("Số phiếu không hợp lệ", "Nhập số nguyên từ 0 đến 7.");
      return;
    }
    const passed = yesVotes >= 4;
    APP_STATE.defenseVote = { yesVotes, totalVotes: 7, passed, recordedAt: new Date().toISOString() };
    saveAppState(APP_STATE);
    const voteBadge = document.getElementById("defense-vote-result-badge");
    if (voteBadge) {
      voteBadge.className = `status-pill ${passed ? "is-success" : "is-warning"}`;
      voteBadge.textContent = `${yesVotes}/7 Phiếu Tán Thành (${passed ? "Thông qua" : "Không thông qua"})`;
    }
    addAuditLog("Nhập kết quả bỏ phiếu Hội đồng", `${yesVotes}/7 phiếu tán thành; ${passed ? "thông qua" : "không thông qua"}`);
    notify(passed ? "Đã ghi nhận kết quả" : "Chưa đạt đa số", `Kết quả biểu quyết: ${yesVotes}/7 phiếu tán thành.`);
  }

  // Module 11: Graduation & Degree Conferral
  function handleConferDegree() {
    if (currentUser.code !== "BGH") {
      notify("Không đủ quyền", "Chỉ Ban Giám hiệu được ghi nhận quyết định công nhận học vị.");
      return;
    }
    const requirementsMet = Number(APP_STATE.essayResult?.avg || 0) >= 7
      && APP_STATE.outlineStatus === "Đã duyệt"
      && APP_STATE.topics.filter(topic => topic.status === "passed").length >= 3
      && APP_STATE.publications.filter(pub => pub.verified).reduce((sum, pub) => sum + Number(pub.score || 0), 0) >= 0.75
      && APP_STATE.progressReports.slice(-1)[0]?.status === "pass"
      && Number(APP_STATE.profile.monthsUsed || 0) <= Number(APP_STATE.profile.maxMonths || 48);
    if (!requirementsMet) {
      notify("Chưa đủ điều kiện", "Bảng kiểm bảo vệ chưa đạt đầy đủ. Hoàn tất các điều kiện trước khi ghi nhận cấp bằng.");
      return;
    }
    const degBadge = document.getElementById("degree-confer-status");
    if (degBadge) {
      degBadge.className = "status-pill is-success";
      degBadge.textContent = "Đã Ban Hành Quyết Định & Cấp Bằng Số";
    }
    APP_STATE.degreeConferred = { date: new Date().toISOString(), decisionNo: "128/QĐ-ĐHAG", role: currentUser.code };
    saveAppState(APP_STATE);
    addAuditLog("BGH Ký Quyết định công nhận học vị", "Ban hành QĐ số 128/QĐ-ĐHAG công nhận học vị Tiến sĩ");
    notify("Công nhận học vị thành công", "Hiệu trưởng đã ký Quyết định công nhận học vị và cấp Bằng Tiến sĩ!");
  }

  // Module 13: Export Real CSV Reports (FR-BC02, FR-BC04)
  function handleExportReport(reportName) {
    if (!["PDT", "KHOA", "BGH"].includes(currentUser.code)) {
      notify("Không đủ quyền", "Vai trò hiện tại không được phép xuất báo cáo quản trị.");
      return;
    }
    let csvContent = "";
    let defaultFilename = "Bao_Cao_DTMS.csv";

    if (reportName.includes("tiến độ") || reportName.includes("NCS")) {
      defaultFilename = "Bao_Cao_Tien_Do_NCS_2026.csv";
      csvContent = "\uFEFFMã NCS,Họ tên,Ngành đào tạo,Khóa,Tiến độ,Tín chỉ,Điểm TL,Báo cáo 6 tháng,Trạng thái\n" +
        "NCS001,Nguyễn Văn Bình,Khoa học Môi trường,2023,68%,18/24,8.77,Đạt,Trong hạn\n" +
        "NCS002,Trần Minh Anh,Quản lý Tài nguyên Nước,2023,75%,21/24,8.90,Đạt,Trong hạn\n" +
        "NCS003,Phạm Hoàng Nam,Khoa học Môi trường,2024,40%,12/24,8.20,Cần nhắc nhở,Gần quá hạn\n" +
        "NCS004,Lê Thị Hoa,Nông nghiệp CTM,2022,92%,24/24,9.15,Đạt,Bảo vệ đợt 2";
    } else {
      defaultFilename = "Ho_So_Kiem_Dinh_AUN_QA_2026.csv";
      csvContent = "\uFEFFMã tiêu chuẩn,Tên chỉ báo kiểm định,Số lượng hồ sơ minh chứng,Đánh giá chất lượng,Nguồn đối soát\n" +
        "TC-01,Chương trình đào tạo Tiến sĩ,14 Văn bản QĐ,Đạt chuẩn AUN-QA,Phòng Đào tạo\n" +
        "TC-02,Đội ngũ NHD (GS/PGS/TS),42 Cán bộ khoa học,Đạt định mức quy định,Hồ sơ nhân sự\n" +
        "TC-03,Công bố khoa học (WoS/Scopus),128 Bài báo quốc tế,Tối thiểu 0.75đ/NCS,Cơ sở dữ liệu WoS/Scopus\n" +
        "TC-04,Hội đồng bảo vệ luận án,18 Hội đồng 7 thành viên,Đúng cơ sở & quy trình,Hồ sơ bảo vệ";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog("Xuất báo cáo kiểm định", `Xuất tệp CSV: ${defaultFilename}`);
    notify("Tải xuống hoàn tất", `Hệ thống đã kết xuất và tải tệp ${defaultFilename} về máy.`);
  }

  function handleExportAuditLog() {
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được xuất nhật ký hệ thống.");
      return;
    }
    const rows = [["Thời gian", "Người dùng", "Vai trò", "Thao tác", "Đối tượng", "Địa chỉ", "Trạng thái"], ...AUDIT_LOGS.map(log => [log.time, log.user, log.role, log.action, log.target, log.ip, log.status])];
    const csv = "\uFEFF" + rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    downloadBlob(csv, "DTMS_Audit_Log.csv", "text/csv;charset=utf-8");
    addAuditLog("Xuất Audit Log", "Tải nhật ký thao tác dạng CSV");
    notify("Đã xuất nhật ký", "Tệp CSV nhật ký thao tác đã được tải xuống.");
  }

  function downloadBlob(content, filename, type = "text/plain;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function refreshAuditLog() {
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được làm mới nhật ký hệ thống.");
      return;
    }
    try { AUDIT_LOGS = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").auditLogs || AUDIT_LOGS; } catch (_) { /* keep current in-memory records */ }
    renderAuditLogTable();
    notify("Đã làm mới", "Nhật ký đang hiển thị dữ liệu mới nhất đã lưu trên thiết bị này.");
  }

  function openDegreeLookup(code) {
    if (global.switchView) global.switchView("public");
    const input = document.querySelector("[data-input-code]");
    if (input) input.value = code || "";
    document.querySelector("[data-verify-btn]")?.click();
  }

  function handleGenericWorkflowSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const modal = form.closest(".mgmt-modal");
    if (!modal) return;
    const specializedForms = ["form-login", "form-edit-profile", "form-leave-request", "form-assign-supervisor", "form-declare-pub", "form-grade-essay"];
    if (specializedForms.includes(form.id)) return;

    const requiredFileWorkflows = new Set([
      "modal-change-supervisor", "modal-submit-essay", "modal-submit-outline", "modal-submit-progress",
      "modal-change-topic-title", "modal-upload-thesis-version", "modal-submit-post-defense", "modal-create-change-request"
    ]);
    if (requiredFileWorkflows.has(modal.id)) {
      const requiredFiles = [...form.querySelectorAll('input[type="file"]')];
      const missing = requiredFiles.filter(input => !input.files?.length);
      if (missing.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        notify("Thiếu tệp đính kèm", "Chọn đầy đủ tệp minh chứng bắt buộc trước khi gửi biểu mẫu.");
        missing[0].closest("label")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const values = {};
    form.querySelectorAll("input, select, textarea").forEach((control, index) => {
      if (control.type === "submit" || control.type === "button" || control.type === "reset") return;
      const key = control.name || control.id || `field_${index + 1}`;
      if (control.type === "file") {
        const file = control.files?.[0];
        if (file) values[key] = { fileName: file.name, size: file.size, type: file.type };
      } else if (control.type === "checkbox" || control.type === "radio") {
        if (control.checked) values[key] = control.value || true;
      } else {
        values[key] = control.value;
      }
    });
    const title = modal.querySelector(".mgmt-modal-header h3")?.textContent.trim() || modal.id;
    const submissionsKey = "DTMS_WORKFLOW_SUBMISSIONS_V1";
    let submissions = [];
    try { submissions = JSON.parse(localStorage.getItem(submissionsKey) || "[]"); } catch (_) { submissions = []; }
    const item = {
      id: `WF-${Date.now()}`,
      workflow: modal.id,
      title,
      role: currentUser.code,
      submittedAt: new Date().toISOString(),
      status: "Đã ghi nhận trên thiết bị này",
      values
    };
    submissions.unshift(item);
    try { localStorage.setItem(submissionsKey, JSON.stringify(submissions.slice(0, 100))); }
    catch (_) { notify("Không thể lưu yêu cầu", "Bộ nhớ trình duyệt đã đầy. Hãy xóa dữ liệu demo rồi thử lại."); return; }

    if (modal.id === "modal-edit-plan") {
      APP_STATE.planStage = 0;
      saveAppState(APP_STATE);
      renderPlanStatusUI();
    } else if (modal.id === "modal-submit-outline") {
      APP_STATE.outlineStatus = "Chờ duyệt";
      saveAppState(APP_STATE);
      renderDefenseChecklistUI();
    } else if (modal.id === "modal-submit-progress") {
      const selectedPeriod = Number(form.querySelector("select")?.value.match(/\d+/)?.[0] || 0);
      const report = APP_STATE.progressReports.find(entry => entry.period === selectedPeriod);
      if (report) {
        report.status = "pending";
        saveAppState(APP_STATE);
        renderDefenseChecklistUI();
      }
    } else if (modal.id === "modal-register-topic") {
      const controls = form.querySelectorAll("select, input[type='text']");
      const topicNumber = Number(controls[0]?.value.match(/\d+/)?.[0] || 0);
      const topicTitle = controls[1]?.value.trim();
      if (topicNumber >= 1 && topicNumber <= 3 && topicTitle) {
        const topic = APP_STATE.topics[topicNumber - 1];
        if (topic) {
          topic.name = topicTitle;
          topic.status = "pending";
          topic.score = "—";
          saveAppState(APP_STATE);
          const status = document.getElementById(`topic-status-${topicNumber}`);
          const score = document.getElementById(`topic-score-${topicNumber}`);
          if (status) { status.className = "status-pill is-warning"; status.textContent = "Chờ đánh giá"; }
          if (score) score.textContent = "—";
          renderDefenseChecklistUI();
        }
      }
    }

    closeModal(modal.id);
    addAuditLog("Gửi yêu cầu học vụ", `${title} (${item.id})`);
    renderRoleDashboard();
    notify("Đã ghi nhận yêu cầu", `${title} đã được lưu trong bộ nhớ trình duyệt. Tệp chỉ lưu tên và thông tin; nội dung tệp chưa được tải lên máy chủ.`);
    form.reset();
  }

  function canAccessView(viewId) {
    return Boolean(document.querySelector(`.os-view[data-view="${CSS.escape(viewId)}"]`));
  }

  // File Upload Helper Listener
  function initFileUploadListeners() {
    document.addEventListener("change", (e) => {
      if (e.target.matches("input[type='file']")) {
        const file = e.target.files[0];
        if (file) {
          const parentContainer = e.target.closest(".dropzone-area, .file-upload-box, label, form") || e.target.parentElement;
          const displayEl = parentContainer.querySelector(".file-name-display") || parentContainer.querySelector("p");
          if (displayEl) {
            const sizeKB = (file.size / 1024).toFixed(1);
            displayEl.innerHTML = `<strong>📄 Tệp đã chọn: ${escapeHtml(file.name)}</strong> (${sizeKB} KB)`;
            displayEl.style.color = "#0284c7";
          }
          notify("Đã đính kèm tệp", `Đã chọn tệp: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      }
    });
  }

  // 7. INITIALIZE MANAGEMENT COMPONENT ENGINE
  function initManagement() {
    initModalListeners();
    initFileUploadListeners();
    document.addEventListener("submit", handleGenericWorkflowSubmit, true);
    renderAuditLogTable();
    renderLeaveHistoryTable();
    renderPublicationsTable();
    renderPlanStatusUI();
    renderDefenseChecklistUI();

    const registeredCourses = new Set(APP_STATE.registeredCourses || []);
    document.querySelectorAll('[onclick*="handleToggleCourse"]').forEach((button) => {
      const courseCode = button.getAttribute("onclick")?.match(/handleToggleCourse\('([^']+)'/)?.[1];
      if (courseCode && registeredCourses.has(courseCode)) {
        button.className = "btn-mgmt btn-mgmt-sm btn-mgmt-danger";
        button.textContent = "✕ Hủy đăng ký";
      }
    });
    APP_STATE.topics.forEach((topic, index) => {
      const number = index + 1;
      const status = document.getElementById(`topic-status-${number}`);
      const score = document.getElementById(`topic-score-${number}`);
      const row = status?.closest("tr");
      const title = row?.cells[0]?.querySelector("strong");
      if (title) title.textContent = topic.name;
      if (score) score.textContent = topic.score === "—" ? "—" : `${topic.score}/10`;
      if (status) {
        const passed = topic.status === "passed";
        status.className = `status-pill ${passed ? "is-success" : "is-warning"}`;
        status.textContent = passed
          ? (localStorage.getItem("dtms-language") === "EN" ? "Evaluated (Pass)" : "Đã đánh giá (Đạt)")
          : (localStorage.getItem("dtms-language") === "EN" ? "Awaiting review" : "Chờ đánh giá");
      }
    });

    const savedRoleKey = Object.keys(USERS_ROLE_STORE).find((roleKey) => USERS_ROLE_STORE[roleKey] === currentUser) || "NCS";
    switchRole(savedRoleKey, true);
    if (global.switchView) global.switchView("management");

    const loginForm = document.getElementById("form-login");
    if (loginForm) loginForm.addEventListener("submit", login);

    const topbarUserBadge = document.getElementById("topbar-user-badge");
    topbarUserBadge?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal("modal-role-switcher");
      }
    });

    // Tab buttons event
    document.addEventListener("click", e => {
      const tabBtn = e.target.closest("[data-target-module]");
      if (tabBtn) {
        e.preventDefault();
        switchModuleTab(tabBtn.dataset.targetModule);
      }
    });

    // Form handlers
    const profileForm = document.getElementById("form-edit-profile");
    if (profileForm) profileForm.addEventListener("submit", handleUpdateProfile);

    const leaveForm = document.getElementById("form-leave-request");
    if (leaveForm) leaveForm.addEventListener("submit", handleSubmitLeaveRequest);

    const assignForm = document.getElementById("form-assign-supervisor");
    if (assignForm) assignForm.addEventListener("submit", handleAssignSupervisor);

    const pubForm = document.getElementById("form-declare-pub");
    if (pubForm) pubForm.addEventListener("submit", handleDeclarePublication);

    const essayForm = document.getElementById("form-grade-essay");
    if (essayForm) essayForm.addEventListener("submit", handleGradeEssay);

    initQuickCommandSearch();
  }

  function refreshLanguage() {
    renderRoleDashboard();
    renderPlanStatusUI();
    renderPublicationsTable();
    renderDefenseChecklistUI();
  }

  function initQuickCommandSearch() {
    const input = document.querySelector("[data-command-input]");
    if (!input) return;

    const moduleKeywords = [
      { keys: ["hồ sơ", "profile", "ncs", "cá nhân"], id: "m01", name: "Hồ sơ NCS" },
      { keys: ["chương trình", "kế hoạch", "plan", "khung", "tín chỉ"], id: "m02", name: "CTĐT & Kế hoạch" },
      { keys: ["hướng dẫn", "nhd", "supervisor", "thầy", "cán bộ"], id: "m03", name: "Người hướng dẫn" },
      { keys: ["học phần", "môn", "điểm", "gpa", "bảng điểm"], id: "m04", name: "Học phần & Điểm" },
      { keys: ["tiểu luận", "đề cương", "outline", "giải trình"], id: "m05", name: "Tiểu luận & Đề cương" },
      { keys: ["chuyên đề", "topic", "cđ1", "cđ2", "cđ3"], id: "m06", name: "Chuyên đề Tiến sĩ" },
      { keys: ["tiến độ", "báo cáo", "6 tháng", "quá hạn", "progress"], id: "m07", name: "Tiến độ Nghiên cứu" },
      { keys: ["công bố", "bài báo", "scopus", "wos", "isi", "doi"], id: "m08", name: "Công bố Khoa học" },
      { keys: ["đề tài", "luận án", "turnitin", "đạo văn", "trùng lặp"], id: "m09", name: "Đề tài & Luận án" },
      { keys: ["bảo vệ", "hội đồng", "phản biện", "phiếu bầu"], id: "m10", name: "Bảo vệ Luận án" },
      { keys: ["cấp bằng", "tốt nghiệp", "lưu chiểu", "phôi bằng"], id: "m11", name: "Hoàn thiện & Cấp bằng" },
      { keys: ["biến động", "thay đổi", "gia hạn", "tạm dừng", "thôi học"], id: "m12", name: "Quản lý Biến động" },
      { keys: ["tra cứu", "thống kê", "kiểm định", "aun-qa", "báo cáo"], id: "m13", name: "Tra cứu & Báo cáo" },
      { keys: ["phân quyền", "nhật ký", "audit", "log", "rbac"], id: "m14", name: "Phân quyền & Nhật ký" }
    ];

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = input.value.toLowerCase().trim();
        if (!query) return;

        let matched = moduleKeywords.find(m => m.keys.some(k => query.includes(k)));
        if (!matched) matched = moduleKeywords[0];

        if (global.switchView) global.switchView("management");
        switchModuleTab(matched.id);
        notify("Truy cập nhanh", `Đã chuyển đến phân hệ: [${matched.id.toUpperCase()}] ${matched.name}`);
      }
    });
  }

  // EXPORT GLOBAL API
  global.DTMS_MANAGEMENT = {
    init: initManagement,
    refreshLanguage: refreshLanguage,
    switchRole: switchRole,
    switchModuleTab: switchModuleTab,
    openModal: openModal,
    closeModal: closeModal,
    handleToggleCourse: handleToggleCourse,
    handleApprovePlan: handleApprovePlan,
    handleGradeTopic: handleGradeTopic,
    handleGradeProgressReport: handleGradeProgressReport,
    verifyPublication: verifyPublication,
    handleRunTurnitin: handleRunTurnitin,
    handleSignDefenseApproval: handleSignDefenseApproval,
    handleDefenseVoting: handleDefenseVoting,
    handleConferDegree: handleConferDegree,
    handleExportReport: handleExportReport,
    handleExportAuditLog: handleExportAuditLog,
    refreshAuditLog: refreshAuditLog,
    openDegreeLookup: openDegreeLookup,
    addAuditLog: addAuditLog,
    notify: notify,
    canAccessView: canAccessView,
    resetDemoData: resetDemoData
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initManagement);
  } else {
    initManagement();
  }

})(window);
