/**
 * DTMS MANAGEMENT STUDIO - CORE JAVASCRIPT ENGINE (js/modules/management.js)
 * Cổng Quản lý Đào tạo Nghiên cứu sinh & Tiến sĩ - Trường ĐH An Giang (ĐHQG-HCM)
 * Hỗ trợ 14 Phân hệ Chức năng Toàn diện & Bàn làm việc Phân quyền (RBAC)
 */
(function initializeDTMSManagement(global) {
  "use strict";

  // 1. DATA STORE: HỒ SƠ VÀ PHÂN QUYỀN CHO 7 VAI TRÒ
  const USERS_ROLE_STORE = {
    NCS: {
      id: "usr_ncs",
      code: "NCS",
      name: ""
    },
    NHD: {
      id: "usr_nhd",
      code: "NHD",
      name: ""
    },
    BM: {
      id: "usr_bm",
      code: "BM",
      name: ""
    },
    KHOA: {
      id: "usr_khoa",
      code: "KHOA",
      name: ""
    },
    PDT: {
      id: "usr_pdt",
      code: "PDT",
      name: ""
    },
    BGH: {
      id: "usr_bgh",
      code: "BGH",
      name: ""
    },
    HOIDONG: {
      id: "usr_council",
      code: "HOIDONG",
      name: ""
    }
  };

  // State
  // ===== PHIÊN ĐĂNG NHẬP VỚI BACKEND =====
  // Token JWT nằm ở localStorage["jwt_token"] (do DTMS_API quản lý). Thông tin hiển thị và danh sách vai trò
  // của tài khoản nằm ở localStorage["dtms-user"] để mở thêm tab vẫn dùng được. Vai trò đang làm việc nằm ở
  // sessionStorage["dtms-role"].
  const SESSION_USER_KEY = "dtms-user";
  function sessionUser() {
    try {
      const value = JSON.parse(global.DTMS_DATA.getString(SESSION_USER_KEY, "") || "null");
      return value && Array.isArray(value.roles) ? value : null;
    } catch { return null; }
  }
  // Có phiên thật khi vừa có token vừa biết tài khoản. Không có thì giao diện ở trạng thái chưa đăng nhập.
  function backendSession() { return Boolean(global.DTMS_API?.getToken?.() && sessionUser()); }
  // Các vai trò giao diện mà tài khoản được dùng; null khi không có phiên thật (chế độ demo, tắt API_BASE_URL).
  function allowedRoles() {
    const user = backendSession() ? sessionUser() : null;
    return user ? user.roles.filter((code) => Object.prototype.hasOwnProperty.call(USERS_ROLE_STORE, code)) : null;
  }
  function initialRoleKey() {
    const saved = global.DTMS_DATA.getString("dtms-role", "", true);
    const allowed = allowedRoles();
    if (!allowed) return saved || "NCS";
    if (allowed.includes(saved)) return saved;
    const primary = sessionUser()?.maVaiTro;
    return allowed.includes(primary) ? primary : (allowed[0] || "NCS");
  }

  let currentUser = USERS_ROLE_STORE[initialRoleKey()] || USERS_ROLE_STORE.NCS;
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

  const ROLE_DASHBOARDS = Object.fromEntries(Object.keys(ROLE_MODULES).map(role => [role, { stage: "", metrics: [], actions: [], queue: "" }]));
  const ROLE_DASHBOARDS_EN = Object.fromEntries(Object.keys(ROLE_MODULES).map(role => [role, { stage: "", metrics: [], actions: [], queue: "" }]));

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
    "modal-assign-supervisor": ["PDT"], "modal-change-supervisor": ["NCS"], "modal-grade-essay": ["BM", "NHD"], "modal-grade-topic": ["BM", "NHD"], "modal-review-progress": ["BM", "NHD"],
    "modal-submit-essay": ["NCS"], "modal-submit-outline": ["NCS"], "modal-register-topic": ["NCS"],
    "modal-submit-progress": ["NCS"], "modal-declare-pub": ["NCS"], "modal-workflow-pub": ["NHD", "PDT"],
    "modal-change-topic-title": ["NCS"], "modal-upload-thesis-version": ["NCS"], "modal-workflow-defense": ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH", "HOIDONG"],
    "modal-submit-post-defense": ["NCS"], "modal-create-change-request": ["NCS"],
    "modal-workflow-changes": ["NCS", "NHD", "BM", "KHOA", "PDT", "BGH"],
    "modal-thesis-topic": ["NCS"], "modal-language-cert": ["NCS"]
  };

  let AUDIT_LOGS = [];

  function escapeHtml(str) {
    str = String(str ?? "");
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // 1. DATA STORE: LOCALSTORAGE PERSISTENCE ENGINE & DATASETS
  const STORAGE_KEY = "DTMS_MANAGEMENT_APP_STATE_V3";

  const INITIAL_STATE = {
    candidates: [],
    assignments: {},
    reminders: [],
    plan: {},
    workflowSubmissions: [],
    profile: { phone: "", email: "", workplace: "", monthsUsed: 0, maxMonths: 0 },
    advisorsQuota: {},
    planStage: 0, // 0: Chờ NHD, 1: Chờ BM, 2: Chờ PDT, 3: Đã duyệt hoàn tất
    essayResult: { avg: "—", s1: null, s2: null, s3: null, status: "pending" },
    essayResults: {},
    topicAssessments: {},
    progressReviews: {},
    outlineStatus: "Chưa có dữ liệu",
    topics: [],
    publications: [],
    leaveRequests: [],
    progressReports: [],
    auditLogs: []
  };

  function getAppState() {
    const state = global.DTMS_DATA.read(STORAGE_KEY, INITIAL_STATE);
    for (const key of ['candidates','topics','publications','leaveRequests','progressReports','auditLogs']) {
      state[key] = state[key].filter(item => item && typeof item === 'object' && !Array.isArray(item));
    }
    state.candidates = state.candidates.map(c => ({ code:'',name:'',major:'',cohort:'',email:'',phone:'',supervisor:'',status:'studying', ...c })).filter(c=>typeof c.id==='string'&&typeof c.name==='string'&&typeof c.code==='string');
    state.publications = state.publications.map(p=>({title:'',journal:'',doi:'',cat:'',authorRole:'', ...p, score:Number.isFinite(Number(p.score))?Number(p.score):0})).filter(p=>typeof p.id==='string'&&typeof p.doi==='string');
    state.planStage = Number.isInteger(state.planStage) ? Math.max(0,Math.min(3,state.planStage)) : 0;
    state.registeredCourses = Array.isArray(state.registeredCourses) ? state.registeredCourses.filter(code => typeof code === 'string') : [];
    state.publications.forEach(publication => { publication.verified = publication.verified === true && publication.score >= 0 && publication.score <= 1; });
    const raw = global.DTMS_DATA.getString(STORAGE_KEY);
    let hasCanonicalWorkflows = false;
    try { hasCanonicalWorkflows = Boolean(raw && Object.hasOwn(JSON.parse(raw), 'workflowSubmissions')); } catch {}
    if (!hasCanonicalWorkflows) state.workflowSubmissions = []; 
    state.workflowSubmissions = state.workflowSubmissions.filter(item => item && typeof item === 'object' && typeof item.workflow === 'string' && typeof item.title === 'string').map(item => ({ ...item, candidateId: item.candidateId || 'ncs-01' }));
    for (const field of ['essayResults', 'topicAssessments', 'progressReviews']) {
      state[field] = Object.fromEntries(Object.entries(state[field] || {}).filter(([, record]) => record && typeof record === 'object' && typeof record.candidate === 'string'));
    }
    state.topics = state.topics.map(topic => ({ ...topic, name: String(topic.name || ''), status: ['passed','failed','pending','revision'].includes(topic.status) ? topic.status : 'pending' }));
    state.progressReports = state.progressReports.filter(report => Number.isInteger(report.period) && report.period > 0 && report.period <= 6);
    state.assignments = Object.fromEntries(Object.entries(state.assignments).map(([id,value])=>[state.candidates.find(c=>id===c.id||id.startsWith(c.name))?.id||id,value]));
    state.schemaVersion = 3;
    return state;
  }

  let lastSavedState;

  function saveAppState(state) {
    if (global.DTMS_DATA.write(STORAGE_KEY, state)) {
      lastSavedState = global.DTMS_DATA.clone(state);
      return true;
    }
    if (lastSavedState) {
      Object.keys(state).forEach(key => delete state[key]);
      Object.assign(state, global.DTMS_DATA.clone(lastSavedState));
      AUDIT_LOGS = state.auditLogs;
      if (initialized) queueMicrotask(() => { renderCandidates(); renderWorkflowUI(); renderDefenseChecklistUI(); });
    }
    return false;
  }

  function resetWorkspaceData() {
    if (!requireRoles(['PDT'])) return;
    confirmAction('Khôi phục dữ liệu khởi tạo? Hồ sơ, công bố và yêu cầu bạn đã thêm sẽ bị thay thế. Hãy tải bản sao JSON trước nếu cần giữ dữ liệu.', () => {
      if (!saveAppState(global.DTMS_DATA.clone(INITIAL_STATE))) return;
      global.DTMS_DATA.remove('DTMS_WORKFLOW_SUBMISSIONS_V2');
      global.location.reload();
    });
  }

  let APP_STATE = getAppState();
  AUDIT_LOGS = APP_STATE.auditLogs || AUDIT_LOGS;
  APP_STATE.advisorsQuota = APP_STATE.advisorsQuota || {};
  lastSavedState = global.DTMS_DATA.clone(APP_STATE);

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
    renderServerViews(); // nút theo vai trò của các vùng dữ liệu máy chủ
  }

  function formatAcademicYear(isEnglish) {
    const now = new Date();
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 8 ? year : year - 1;
    return isEnglish ? `Academic year ${startYear}–${startYear + 1}` : `Năm học ${startYear}–${startYear + 1}`;
  }

  function renderRoleDashboard() {
    const header = document.querySelector(".mgmt-top-header");
    const mount = document.querySelector("[data-role-dashboard-mount]");
    if (!header || !mount) return;
    let dashboard = document.querySelector("[data-role-dashboard]");
    if (!dashboard) {
      dashboard = document.createElement("section");
      dashboard.dataset.roleDashboard = "";
      dashboard.className = "role-dashboard";
      dashboard.setAttribute("aria-labelledby", "role-dashboard-title");
      mount.append(dashboard);
    }
    const authenticatedUser = backendSession() ? sessionUser() : null;
    dashboard.hidden = !(authenticatedUser && authenticatedUser.hoTen);
    const roleKey = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser) || authenticatedUser?.maVaiTro || "NCS";
    const isEnglish = global.DTMS_DATA.getString("dtms-language") === "EN";
    const dashboards = isEnglish ? ROLE_DASHBOARDS_EN : ROLE_DASHBOARDS;
    const data = dashboards[roleKey] || dashboards.NCS;
    const metrics = [];
    const queue = isEnglish ? "No records are available." : "Chưa có dữ liệu để hiển thị.";
    const allowedModules = ROLE_MODULES[roleKey] || ROLE_MODULES.NCS;
    const roleActions = data.actions.filter(([, moduleId]) => allowedModules.includes(moduleId));
    const roleNames = isEnglish
      ? { NCS: "PhD candidate", NHD: "Supervisor", BM: "Department chair", KHOA: "Faculty leadership", PDT: "Graduate Academic Affairs", BGH: "University leadership", HOIDONG: "Review committee" }
      : { NCS: "Nghiên cứu sinh", NHD: "Người hướng dẫn khoa học", BM: "Trưởng Bộ môn", KHOA: "Ban Chủ nhiệm Khoa", PDT: "Phòng Đào tạo", BGH: "Ban Giám hiệu", HOIDONG: "Hội đồng đánh giá" };
    const title = header.querySelector(".mgmt-header-title h2");
    const subtitle = header.querySelector(".mgmt-header-title p");
    if (title) title.textContent = authenticatedUser ? `${isEnglish ? "Workspace" : "Bàn làm việc"} · ${roleNames[roleKey]}` : (isEnglish ? "Workspace" : "Bàn làm việc");
    if (subtitle) subtitle.textContent = authenticatedUser
      ? (isEnglish ? `Records and actions available to ${roleNames[roleKey]}.` : `Các hồ sơ, nhiệm vụ và thao tác được phân quyền cho ${roleNames[roleKey]}.`)
      : (isEnglish ? "Sign in to view your workspace." : "Đăng nhập để xem bàn làm việc của bạn.");
    const profileRoleLabel = document.querySelector("[data-profile-role-label]");
    if (profileRoleLabel) profileRoleLabel.textContent = authenticatedUser
      ? (isEnglish ? `Information, progress and tasks for your role: ${roleNames[roleKey]}.` : `Thông tin, tiến độ và nhiệm vụ theo vai trò: ${roleNames[roleKey]}.`)
      : (isEnglish ? "Sign in to view your profile, progress and tasks." : "Đăng nhập để xem hồ sơ, tiến độ và nhiệm vụ của bạn.");
    dashboard.innerHTML = `
      <div class="role-dashboard-heading"><div><span class="role-dashboard-eyebrow">${isEnglish ? "YOUR WORKSPACE" : "BÀN LÀM VIỆC CỦA BẠN"} · ${roleKey}</span><h2 id="role-dashboard-title">${isEnglish ? "Welcome," : "Xin chào,"} ${escapeHtml(authenticatedUser?.hoTen || "")}</h2><p>${escapeHtml(roleNames[roleKey] || roleKey)}</p></div><span class="role-dashboard-date">${formatAcademicYear(isEnglish)}</span></div>
      <div class="role-dashboard-metrics">${metrics.map(([label, value]) => `<article class="role-dashboard-metric"><span>${label}</span><strong>${escapeHtml(String(value))}</strong></article>`).join("")}</div>
      <article class="role-dashboard-priority">
        <div><span class="role-dashboard-eyebrow">${isEnglish ? "ACADEMIC RECORDS" : "HỒ SƠ HỌC VỤ"}</span><h3>${queue}</h3></div>
        <span class="role-dashboard-deadline">${isEnglish ? "Track your academic and research progress" : "Theo dõi học tập và nghiên cứu"}</span>
      </article>
      <section aria-labelledby="role-dashboard-actions-title">
        <div class="role-dashboard-section-heading">
          <div><span class="role-dashboard-eyebrow">${isEnglish ? "AVAILABLE TO YOUR ROLE" : "CHỨC NĂNG THEO VAI TRÒ"}</span><h3 id="role-dashboard-actions-title">${isEnglish ? "Your permitted tasks" : "Các nghiệp vụ được phép thao tác"}</h3></div>
          <span>${roleActions.length} ${isEnglish ? "tasks" : "chức năng"}</span>
        </div>
        <div class="role-dashboard-actions">${roleActions.map(([label, module], index) => `
          <button type="button" data-dashboard-module="${escapeHtml(module)}">
            <span class="role-action-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span class="role-action-label">${escapeHtml(label)}</span>
            <span class="role-action-arrow" aria-hidden="true">→</span>
          </button>`).join("")}
        </div>
      </section>`;
    dashboard.querySelectorAll("[data-dashboard-module]").forEach((button) => button.addEventListener("click", () => { global.switchView("management"); switchModuleTab(button.dataset.dashboardModule); }));
    const submissions = APP_STATE.workflowSubmissions || [];
    if (submissions.length) {
      const history = document.createElement("section");
      history.className = "role-dashboard-panel";
      history.style.marginTop = "16px";
      history.innerHTML = `<span class="role-dashboard-eyebrow">YÊU CẦU ĐÃ GHI NHẬN TRÊN THIẾT BỊ NÀY</span><div style="display:grid;gap:8px;margin-top:10px;">${submissions.filter(item => item.candidateId === 'ncs-01' && (currentUser.code !== 'NCS' || item.role === 'NCS')).slice(0, 5).map(item => `<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.status)} · ${new Date(item.submittedAt).toLocaleString("vi-VN")}</span></div>`).join("")}</div>`;
      dashboard.append(history);
    }
  }

  // Đăng nhập thật qua backend: POST /api/Auth/login (xem DTMS_API.login trong js/core/api.js).
  async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('login-password');
    const password = passwordInput.value;
    const error = document.getElementById('login-error');
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    const showError = (message) => { error.hidden = false; error.textContent = message; };
    if (!email || !password) { showError('Vui lòng nhập đầy đủ email và mật khẩu.'); return; }
    error.hidden = true;
    if (submitButton) submitButton.disabled = true;
    try {
      const data = await global.DTMS_API.login(email, password);
      const roleKey = String(data.user.maVaiTro ?? '').trim();
      if (!Object.prototype.hasOwnProperty.call(USERS_ROLE_STORE, roleKey)) {
        global.DTMS_API.logout(); // Không giữ token của phiên không dùng được trên giao diện
        showError('Vai trò của tài khoản chưa được hỗ trợ trên giao diện');
        return;
      }
      if (document.getElementById('remember-email').checked) global.DTMS_DATA.write('dtms-remembered-email', email);
      else global.DTMS_DATA.remove('dtms-remembered-email');
      global.DTMS_DATA.remove('dtms-demo-email');
      global.DTMS_DATA.remove('dtms-signed-out', true);
      // Lưu tài khoản và các vai trò được phép TRƯỚC khi switchRole (switchRole kiểm tra theo danh sách này).
      const roles = data.user.roles.filter((code) => Object.prototype.hasOwnProperty.call(USERS_ROLE_STORE, code));
      if (!roles.includes(roleKey)) roles.unshift(roleKey);
      global.DTMS_DATA.setString(SESSION_USER_KEY, JSON.stringify({
        maNguoiDung: data.user.maNguoiDung ?? data.user.MaNguoiDung ?? null,
        hoTen: data.user.hoTen || '',
        email,
        maVaiTro: roleKey,
        roles
      }));
      resetServerData();
      switchRole(roleKey); // switchRole ghi sessionStorage["dtms-role"]
      passwordInput.value = '';
      closeModal('modal-login');
      global.switchView('management');
      notify('Đăng nhập thành công', 'Xin chào ' + (data.user.hoTen || email) + '. Bạn có thể tiếp tục xử lý các nghiệp vụ theo vai trò của mình.');
      // Tài khoản nhiều vai trò (vd GV01: BM và NHD): cho chọn vai trò làm việc ngay sau đăng nhập.

      syncFromServer();
    } catch (err) {
      showError(err.detail || err.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
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
      ip: "Thiết bị hiện tại",
      status: "Thành công"
    };
    AUDIT_LOGS.unshift(newLog);
    APP_STATE.auditLogs = AUDIT_LOGS;
    if (!saveAppState(APP_STATE)) return;
    renderAuditLogTable();
  }

  function renderAuditLogTable() {
    const tbody = document.getElementById("audit-log-tbody");
    if (!tbody) return;
    tbody.innerHTML = AUDIT_LOGS.map(log => `
      <tr>
        <td><span style="font-family:monospace; font-size:0.8rem; color:var(--text-muted);">${escapeHtml(log.time)}</span></td>
        <td><strong>${escapeHtml(log.user)}</strong></td>
        <td><span class="role-pill-badge">${escapeHtml(log.role)}</span></td>
        <td><span class="audit-log-badge approve">${escapeHtml(log.action)}</span></td>
        <td>${escapeHtml(log.target)}</td>
        <td><span style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary);">${escapeHtml(log.ip)}</span></td>
        <td><span class="status-pill is-success">${escapeHtml(log.status)}</span></td>
      </tr>
    `).join("");
  }

  // 3. SWITCH ACTIVE USER & ROLE
  function switchRole(roleKey, quiet = false) {
    if (!USERS_ROLE_STORE[roleKey]) return;
    // Token đã chứa đủ quyền nên đổi vai trò không gọi lại API; chỉ cho đổi sang vai trò tài khoản đang có.
    const allowed = allowedRoles();
    if (allowed && !allowed.includes(roleKey)) {
      notify("Không có vai trò này", "Tài khoản của bạn không được cấp vai trò " + roleKey + ".");
      return;
    }
    currentUser = USERS_ROLE_STORE[roleKey];
    const identity = backendSession() ? sessionUser() : null;
    currentUser.name = identity?.hoTen || "";
    if (identity?.maNguoiDung) currentUser.id = identity.maNguoiDung;
    global.DTMS_DATA.setString("dtms-role", roleKey, true);
    if (!quiet) global.DTMS_DATA.remove("dtms-signed-out", true);
    document.querySelectorAll(".mgmt-modal.is-open").forEach(modal => modal.classList.remove("is-open"));

    // Update Topbar UI
    const topAvatar = document.getElementById("topbar-avatar");
    const topName = document.getElementById("topbar-user-name");
    const topRole = document.getElementById("topbar-role-badge");
    const activeDisplay = document.getElementById("mgmt-active-user-display");

    const hasIdentity = Boolean(identity?.hoTen);
    if (topAvatar) topAvatar.textContent = "";
    if (topName) topName.textContent = "";
    if (topRole) topRole.textContent = hasIdentity ? currentUser.code : "";

    if (activeDisplay) {
      activeDisplay.hidden = !hasIdentity;
      activeDisplay.innerHTML = hasIdentity ? `
        <div class="active-user-avatar"></div>
        <div class="active-user-info">
          <strong></strong>
          <span></span>
        </div>
        <span class="role-pill-badge">${escapeHtml(currentUser.code)}</span>
      ` : "";
    }

    applyRolePermissions();
    renderRoleDashboard();
    renderCandidates();
    renderWorkflowUI();
    updateSessionControls();
    applyRealIdentity();
    if (!quiet) global.switchView("management");
  }

  // Thanh trên và thẻ người dùng lấy danh tính từ phiên đăng nhập thật.
  function applyRealIdentity() {
    const user = backendSession() ? sessionUser() : null;
    if (!user || !user.hoTen) return;
    const fullName = String(user.hoTen).trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const avatarText = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toLocaleUpperCase("vi-VN")
      : (nameParts[0] || "").slice(0, 2).toLocaleUpperCase("vi-VN");
    const topName = document.getElementById("topbar-user-name");
    if (topName) topName.textContent = fullName;
    const topAvatar = document.getElementById("topbar-avatar");
    if (topAvatar) topAvatar.textContent = avatarText;
    const activeName = document.querySelector("#mgmt-active-user-display .active-user-info strong");
    if (activeName) activeName.textContent = fullName;
    const activeAvatar = document.querySelector("#mgmt-active-user-display .active-user-avatar");
    if (activeAvatar) activeAvatar.textContent = avatarText;
    const activeDetails = document.querySelector("#mgmt-active-user-display .active-user-info span");
    if (activeDetails) activeDetails.textContent = "";
    const dashboardName = document.getElementById("role-dashboard-title");
    if (dashboardName) dashboardName.textContent = (global.DTMS_DATA.getString("dtms-language") === "EN" ? "Welcome, " : "Xin chào, ") + fullName;
  }

  // Vai trò làm việc được xác định từ tài khoản đã đăng nhập.

  // 4. TAB SWITCHER FOR 14 MODULES
  function switchModuleTab(moduleId) {
    if (global.DTMS_DATA.getString("dtms-signed-out", "", true)) { openModal("modal-login"); return; }
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

    requestAnimationFrame(() => document.getElementById('panel-'+moduleId)?.scrollIntoView({ block:'start', behavior:'smooth' }));
  }

  // 5. MODAL SYSTEM CONTROLLER
  function openModal(modalId) {
    if (MODAL_ACCESS[modalId] && global.DTMS_DATA.getString('dtms-signed-out', "", true)) { openModal('modal-login'); return; }
    // Chức năng chưa có API: báo "đang phát triển" thay vì mở biểu mẫu rồi lưu cục bộ.
    if (UNDER_DEVELOPMENT[modalId] && backendSession()) { showUnderDevelopment(UNDER_DEVELOPMENT[modalId]); return; }
    // Có phiên máy chủ: "Upload phiên bản luận án mới" ghi qua đề tài luận án thay vì lưu cục bộ.
    if (modalId === "modal-upload-thesis-version" && backendSession()) { openThesisUpload(); return; }
    if (backendSession() && !openingForEdit) prepareFreshServerForm(modalId);
    const modal = document.getElementById(modalId);
    if (modalId === "modal-edit-profile") {
      ["phone", "email", "workplace"].forEach(key => { document.getElementById(`profile-${key}-input`).value = APP_STATE.profile[key]; });
      if (backendSession() && SERVER.profile) {
        document.getElementById("profile-phone-input").value = SERVER.profile.soDienThoai || "";
        document.getElementById("profile-email-input").value = SERVER.profile.email || "";
      }
    }
    const allowedRoles = modal?.dataset.allowedRoles?.split(",") || [];
    const currentRole = Object.keys(USERS_ROLE_STORE).find((key) => USERS_ROLE_STORE[key] === currentUser);
    if (allowedRoles.length && !allowedRoles.includes(currentRole)) {
      notify("Không đủ quyền thao tác", "Vai trò hiện tại không được phép thực hiện thao tác này.");
      return;
    }
    if (modal && ['modal-grade-essay','modal-grade-topic','modal-review-progress'].includes(modalId)) {
      const names = candidateScope().map(candidate => 'NCS. ' + candidate.name);
      const select = modal.querySelector('select[id$="candidate"],select#essay-candidate');
      if(select) [...select.options].forEach(option => option.disabled = Boolean(option.value && !names.includes(option.value)));
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
    if (!requireRoles(["NCS","PDT"])) { if (typeof e !== "undefined") e.preventDefault(); return; }
    e.preventDefault();
    if (backendSession()) { submitServerProfile(e); return; } // PUT /api/Profile/me
    const phone = document.getElementById("profile-phone-input").value.trim();
    const email = document.getElementById("profile-email-input").value.trim();
    const workplace = document.getElementById("profile-workplace-input").value.trim();

    if (!global.DTMS_UI.validate(e.target)) return;
    const own = APP_STATE.candidates.find(item => item.id === "ncs-01");
    if (own) Object.assign(own, { phone, email });
    APP_STATE.profile.phone = phone;
    APP_STATE.profile.email = email;
    APP_STATE.profile.workplace = workplace;
    if (!saveAppState(APP_STATE)) return;

    const displayPhone = document.getElementById("profile-display-phone");
    const displayEmail = document.getElementById("profile-display-email");
    const displayWorkplace = document.getElementById("profile-display-workplace");

    if (displayPhone) displayPhone.textContent = phone;
    if (displayEmail) displayEmail.textContent = email;
    if (displayWorkplace) displayWorkplace.textContent = workplace;

    renderCandidates();
    closeModal("modal-edit-profile");
    addAuditLog("Cập nhật thông tin cá nhân", "Cập nhật SĐT, Email, Nơi công tác NCS vào localStorage");
    notify("Hồ sơ đã cập nhật", "Thông tin cá nhân Nghiên cứu sinh đã được đồng bộ vào lưu trữ.");
  }

  // Module 1: Submit Extension/Leave
  function handleSubmitLeaveRequest(e) {
    if (!requireRoles(["NCS"])) { if (typeof e !== "undefined") e.preventDefault(); return; }
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
      id: `ĐN-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      type: type,
      duration: duration,
      reason: reason,
      date: new Date().toLocaleDateString("vi-VN"),
      status: "Đang chờ Khoa duyệt",
      fileName: fileName
    };

    APP_STATE.leaveRequests.unshift(newReq);
    if (!saveAppState(APP_STATE)) return;
    renderLeaveHistoryTable();

    closeModal("modal-leave-request");
    addAuditLog("Nộp đơn biến động học vụ", `${type} thời gian ${duration} (Minh chứng: ${fileName})`);
    notify("Đã ghi nhận đơn", `Đơn xin ${type} kèm tên tệp ${fileName} đã được lưu cục bộ. Nội dung tệp chưa tải lên máy chủ.`);
  }

  function renderLeaveHistoryTable() {
    const tbody = document.getElementById('leave-history-tbody');
    if (!tbody) return;
    tbody.innerHTML = APP_STATE.leaveRequests.map(req => `<tr><td><strong>${escapeHtml(req.id)}</strong></td><td><span class="status-pill is-purple">${escapeHtml(req.type)}</span></td><td>${escapeHtml(req.duration)}</td><td>${escapeHtml(req.reason)}</td><td>${escapeHtml(req.date)}</td><td><span class="status-pill is-warning">${escapeHtml(req.status)}</span></td><td>${escapeHtml(req.fileName)}<br><small>Chỉ lưu tên tệp, chưa có nội dung tải về.</small></td></tr>`).join('');
  }

  // Module 2: Multi-tiered Plan Approval (FR-CT03)
  function renderPlanStatusUI() {
    const badge = document.getElementById("plan-status-badge");
    if (!badge) return;
    const isEnglish = global.DTMS_DATA.getString("dtms-language") === "EN";
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
    const current = stages[APP_STATE.planStage] || stages[0];
    badge.className = current.class;
    badge.textContent = current.label;
  }

  function handleApprovePlan() {
    if (!requireRoles(['NHD','BM','PDT'])) return;
    if (backendSession()) {
      // Mỗi kế hoạch có nút Duyệt / Từ chối riêng trong danh sách (PUT /api/Kehoachhoctaps/{id}/duyet).
      switchModuleTab('m02');
      notify('Chọn kế hoạch cần duyệt', 'Dùng nút Duyệt hoặc Từ chối ở từng dòng trong danh sách kế hoạch.');
      return;
    }
    const roleCode = currentUser.code;
    const stage = APP_STATE.planStage || 0;

    if (roleCode === "NCS") {
      notify("Không có quyền", "NCS chỉ có quyền gửi kế hoạch. Việc phê duyệt cần qua Người hướng dẫn, Bộ môn và PĐT.");
      return;
    }

    if (stage === 0 && roleCode === "NHD") {
      APP_STATE.planStage = 1;
      if (!saveAppState(APP_STATE)) return;
      renderPlanStatusUI();
      addAuditLog("NHD Duyệt kế hoạch học tập", "Cấp 1: NHD GS.TS. Trần Văn Hướng đã duyệt kế hoạch");
      notify("Duyệt Cấp 1 thành công", "Người hướng dẫn đã ký duyệt kế hoạch. Đã chuyển hồ sơ sang Trưởng Bộ môn.");
    } else if (stage === 1 && roleCode === "BM") {
      APP_STATE.planStage = 2;
      if (!saveAppState(APP_STATE)) return;
      renderPlanStatusUI();
      addAuditLog("Bộ môn Duyệt kế hoạch học tập", "Cấp 2: Trưởng Bộ môn TS. Lê Hoàng Nam đã xác nhận kế hoạch");
      notify("Duyệt Cấp 2 thành công", "Bộ môn đã thông qua kế hoạch. Đã chuyển hồ sơ đến Phòng Đào tạo.");
    } else if (stage === 2 && roleCode === "PDT") {
      APP_STATE.planStage = 3;
      if (!saveAppState(APP_STATE)) return;
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
    if (!requireRoles(["PDT"])) { if (typeof e !== "undefined") e.preventDefault(); return; }
    e.preventDefault();
    const candidateId = document.getElementById("assign-ncs-select").value;
    const candidate = APP_STATE.candidates.find(item=>item.id===candidateId);
    if(!candidate){notify('Hồ sơ không tồn tại','Chọn nghiên cứu sinh trước khi phân công.');return;}
    const ncsName = candidate.name;
    const nhdMain = document.getElementById("assign-nhd-main-select").value;
    const nhdSub = document.getElementById("assign-nhd-sub-select").value;
    const decisionNo = document.getElementById("assign-decision-input").value || "450/QĐ-ĐHAG";

    if (nhdMain === nhdSub) { global.DTMS_UI.fieldError(document.getElementById('assign-nhd-sub-select'), 'Người hướng dẫn chính và phụ phải khác nhau.'); return; }
    const previous = APP_STATE.assignments[candidateId];
    if (previous && previous.main === nhdMain && previous.sub === nhdSub && previous.decisionNo === decisionNo) { notify('Phân công đã tồn tại', 'Không tăng lại định mức khi gửi trùng.'); return; }
    const old = previous ? [previous.main, previous.sub].filter(Boolean) : [];
    const selected = [nhdMain, nhdSub].filter(Boolean);
    for (const name of selected) {
      const quota = APP_STATE.advisorsQuota[name];
      if (!quota || (!old.includes(name) && quota.count >= quota.max)) { notify('Không thể phân công', 'Người hướng dẫn chưa có định mức hoặc đã đủ chỉ tiêu.'); return; }
    }
    old.filter(name => !selected.includes(name)).forEach(name => { const q=APP_STATE.advisorsQuota[name]; if(q)q.count=Math.max(0,q.count-1); });
    selected.filter(name=>!old.includes(name)).forEach(name=>APP_STATE.advisorsQuota[name].count++);
    APP_STATE.assignments[candidateId] = { main:nhdMain, sub:nhdSub, decisionNo };
    if(candidate)candidate.supervisor=nhdMain;
    if (!saveAppState(APP_STATE)) return;
    renderWorkflowUI();
    renderCandidates();

    closeModal("modal-assign-supervisor");
    addAuditLog("Phân công Người hướng dẫn", `Giao ${nhdMain} hướng dẫn NCS ${ncsName} (QĐ: ${decisionNo})`);
    notify("Đã ghi nhận phân công", `Đã lưu phân công ${nhdMain}${nhdSub ? ` và ${nhdSub}` : ""} cho ${ncsName} trong hồ sơ đang quản lý.`);
  }

  // Module 4: Course Registration
  function handleToggleCourse(courseCode, btn) {
    if (!requireRoles(["NCS"])) { if (typeof e !== "undefined") e.preventDefault(); return; }
    if (backendSession()) { showUnderDevelopment("Đăng ký học phần"); return; }
    if (courseCode !== 'ENV809' || !btn) return;
    const registeredCourses = new Set(APP_STATE.registeredCourses || []);
    const isRegistered = registeredCourses.has(courseCode);
    if (isRegistered) registeredCourses.delete(courseCode); else registeredCourses.add(courseCode);
    APP_STATE.registeredCourses = Array.from(registeredCourses);
    if (!saveAppState(APP_STATE)) return;
    btn.className = 'btn-mgmt btn-mgmt-sm '+(isRegistered?'btn-mgmt-primary':'btn-mgmt-danger');
    btn.textContent = isRegistered?'+ Đăng ký':'✕ Hủy đăng ký';
    addAuditLog(isRegistered?'Hủy đăng ký học phần':'Đăng ký học phần mới', courseCode);
    notify('Đã cập nhật đăng ký học phần', isRegistered?'Đã hủy đăng ký học phần.':'Đã đăng ký học phần, chưa phải tín chỉ đã đạt.');
  }

  // Module 5: Grade Overview Essay (FR-HP02 - Validation Avg >= 7.0)
  function handleGradeEssay(e) {
    if (!requireRoles(["NHD", "BM"])) { e.preventDefault(); return; }
    e.preventDefault();
    if (!(["BM", "NHD"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn hoặc Trưởng Bộ môn được xác nhận điểm tiểu ban.");
      return;
    }
    const candidate = document.getElementById("essay-candidate").value;
    if (!requireCandidateReview(candidate)) return;
    const workTitle = document.getElementById("essay-work-select").value;
    const comment = document.getElementById("essay-grade-comment").value.trim();
    const scoreInputs = ["essay-score-1", "essay-score-2", "essay-score-3"].map((id) => document.getElementById(id));
    const scores = scoreInputs.map((input) => Number(input.value));
    if (!candidate || !workTitle || !comment || scores.some((score, index) => scoreInputs[index].value === "" || !Number.isFinite(score) || score < 0 || score > 10)) {
      notify("Thiếu thông tin", "Chọn nghiên cứu sinh và bài cần chấm, nhập đủ ba điểm từ 0 đến 10 cùng nhận xét.");
      return;
    }
    const [score1, score2, score3] = scores;
    const avg = ((score1 + score2 + score3) / 3).toFixed(2);
    const isPass = parseFloat(avg) >= 7.0;
    const record = {
      candidate, workTitle, comment, gradedBy: currentUser.name,
      gradedAt: new Date().toISOString(),
      avg: avg,
      s1: score1,
      s2: score2,
      s3: score3,
      status: isPass ? "pass" : "fail"
    };
    APP_STATE.essayResults[`${candidate}|${workTitle}`] = record;
    if (currentUser.code === "NCS") APP_STATE.essayResult = record;
    if (!saveAppState(APP_STATE)) return;

    const avgEl = document.getElementById("essay-avg-score");
    if (avgEl && currentUser.code === "NCS") {
      avgEl.textContent = `${avg} (${isPass ? "ĐẠT" : "KHÔNG ĐẠT - Dưới 7.0"})`;
      avgEl.style.color = isPass ? "var(--uni-blue-900)" : "#dc2626";
    }

    closeModal("modal-grade-essay");
    renderDefenseChecklistUI();
    renderGradeHistories();
    addAuditLog("Nhập điểm Tiểu ban", `${candidate} · ${workTitle} · Điểm TB: ${avg} - ${isPass ? "ĐẠT" : "CHƯA ĐẠT"}`);
    notify(
      "Đã xác nhận kết quả chấm",
      `${candidate} · ${workTitle} · Trung bình ${avg}/10 · ${isPass ? "ĐẠT" : "CHƯA ĐẠT"}.`
    );
  }

  // Module 6: Grade Doctoral Topic
  function handleGradeTopic(topicIdx) {
    if (!requireRoles(["NHD", "BM"])) return;
    if (!(["BM", "NHD"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn hoặc Trưởng Bộ môn được nhập điểm chuyên đề.");
      return;
    }
    const topic = APP_STATE.topics[topicIdx - 1]?.name || `Chuyên đề ${topicIdx}`;
    document.getElementById("form-grade-topic").reset();
    document.getElementById("grade-topic-index").value = String(topicIdx);
    document.getElementById("grade-topic-title").textContent = `Đánh giá · ${topic}`;
    openModal("modal-grade-topic");
  }

  // Module 7: 6-Month Progress Report Grading
  function handleGradeProgressReport(period) {
    if (!requireRoles(["NHD", "BM"])) return;
    if (!(["NHD", "BM"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn hoặc Trưởng Bộ môn được đánh giá báo cáo tiến độ.");
      return;
    }
    document.getElementById("form-review-progress").reset();
    prepareReviewModal(null);
    document.getElementById("progress-review-period").value = String(period);
    document.getElementById("progress-review-title").textContent = `Đánh giá báo cáo tiến độ · Kỳ ${period}`;
    openModal("modal-review-progress");
  }

  // Module 8: Publication Declaration & Role-Restricted Verification (FR-CD05)
  function renderPublicationsTable() {
    const tbody = document.getElementById("pub-table-tbody");
    if (!tbody) return;
    if (backendSession()) { renderServerPublicationsTable(tbody); return; } // GET /api/Congbokhoahocs

    const canVerify = ["PDT", "NHD"].includes(currentUser.code);
    const isEnglish = global.DTMS_DATA.getString("dtms-language") === "EN";

    tbody.innerHTML = APP_STATE.publications.map(pub => {
      const isVerified = pub.verified;
      const statusHtml = isVerified
        ? `<span class="status-pill is-success">✓ ${isEnglish ? "Verified" : "Đã thẩm định hợp lệ"} (${Number(pub.score).toFixed(2)} ${isEnglish ? "points" : "điểm"})</span>`
        : `<span class="status-pill is-warning">${isEnglish ? "Awaiting review" : "Chờ PĐT Thẩm định"}</span>`;

      let actionHtml = "";
      if (canVerify && !isVerified) {
        actionHtml = `<button class="btn-mgmt btn-mgmt-sm btn-mgmt-success" data-verify-publication="${escapeHtml(pub.id)}">✓ ${isEnglish ? "Review (WoS/Scopus)" : "Thẩm định (WoS/Scopus)"}</button>`;
      } else if (!canVerify && !isVerified) {
        actionHtml = `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">${isEnglish ? "Awaiting authorized reviewer" : "Chờ đại diện PĐT/NHD duyệt"}</span>`;
      } else {
        actionHtml = `<span style="font-size:0.78rem; color:#059669; font-weight:700;">✓ ${isEnglish ? "Verified" : "Đã xác minh"}</span>`;
      }

      if (currentUser.code === 'NCS' && !pub.verified) actionHtml += `<div class="candidate-actions"><button type="button" class="btn-mgmt btn-mgmt-sm btn-mgmt-secondary" data-edit-publication="${escapeHtml(pub.id)}">Sửa</button><button type="button" class="btn-mgmt btn-mgmt-sm btn-mgmt-danger" data-delete-publication="${escapeHtml(pub.id)}">Xóa</button></div>`;
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
    if (!requireRoles(["NCS"])) { if (typeof e !== "undefined") e.preventDefault(); return; }
    e.preventDefault();
    if (backendSession()) { submitServerPublication(e); return; } // POST/PUT /api/Congbokhoahocs
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

    const editingId = e.target.dataset.editingId;
    const duplicate = APP_STATE.publications.find(pub => pub.id !== editingId && pub.doi.toLowerCase() === doi.toLowerCase());
    if (duplicate) { global.DTMS_UI.fieldError(document.getElementById('pub-doi-input'), 'DOI đã có trong danh sách công bố.'); return; }
    if (editingId && APP_STATE.publications.find(p=>p.id===editingId)?.verified) { notify('Không thể sửa', 'Công bố đã được thẩm định.'); return; }
    const newPub = {
      id: editingId || `pub_${Date.now()}`,
      title: title,
      journal: journal,
      cat: category,
      authorRole: "Tác giả chính (1st)",
      verified: false,
      score: 0,
      doi: doi,
      fileName: fileName
    };

    const previous = APP_STATE.publications.findIndex(p=>p.id===editingId);
    if(previous>=0)APP_STATE.publications[previous]=newPub;
    else APP_STATE.publications.unshift(newPub);
    if (!saveAppState(APP_STATE)) return;
    renderPublicationsTable();

    delete e.target.dataset.editingId;
    e.target.reset();
    closeModal("modal-declare-pub");
    addAuditLog("Khai báo bài báo khoa học", `Khai báo bài: "${title}" (${category}) kèm tệp ${fileName}`);
    notify("Đã gửi khai báo", "Thông tin và tên tệp minh chứng đã lưu trên thiết bị này, chờ vai trò có thẩm quyền thẩm định. Nội dung tệp chưa được tải lên máy chủ.");
  }

  function verifyPublication(pubId) {
    if (!requireRoles(['PDT','NHD'])) return;
    if (!["PDT", "NHD"].includes(currentUser.code)) {
      notify("Không có quyền thẩm định", "NCS không được tự thẩm định bài báo. Thao tác này dành cho PĐT và NHD.");
      return;
    }

    const pub = APP_STATE.publications.find(p => p.id === pubId);
    if (pub) {
      const scoreInput = global.prompt(`Nhập điểm công bố được duyệt cho “${pub.title}” (0–1):`, String(pub.score || "0.75"));
      if (scoreInput === null) return;
      const score = Number(scoreInput);
      if (!scoreInput.trim() || !Number.isFinite(score) || score < 0 || score > 1) {
        notify("Điểm không hợp lệ", "Điểm công bố phải nằm trong khoảng 0 đến 1.");
        return;
      }
      pub.score = score;
      pub.verified = true;
      if (!saveAppState(APP_STATE)) return;
      renderPublicationsTable();
      renderDefenseChecklistUI();
      addAuditLog("PĐT Thẩm định bài báo khoa học", `Xác nhận hợp lệ bài báo "${pub.title}" (+${pub.score} điểm)`);
      notify("Đã lưu kết quả thẩm định", `Đã ghi nhận ${pub.score.toFixed(2)} điểm theo đánh giá của người duyệt. Thông tin chỉ mục WoS/Scopus cần được đối chiếu với minh chứng công bố.`);
    }
  }

  // Module 10: Dynamic Defense Checklist Evaluation (FR-BV02)
  function renderDefenseChecklistUI() {
    const container = document.getElementById("defense-checklist-container");
    if (!container) return;

    const essayAvg = parseFloat(APP_STATE.essayResult?.avg || 0);
    const essayPass = essayAvg >= 7.0;
    const earnedCredits = earnedCourseCredits();
    const hpCond = essayPass && earnedCredits >= 24;

    const outlineCond = APP_STATE.outlineStatus === "Đã duyệt";
    const topicsCount = APP_STATE.topics.filter(t => t.status === "passed").length;
    const topicsCond = topicsCount >= 3;

    const pubScore = APP_STATE.publications.filter(p => p.verified).reduce((sum, p) => sum + p.score, 0);
    const pubCond = pubScore >= 0.75;

    const latestReport = [...APP_STATE.progressReports].sort((a,b)=>b.period-a.period)[0];
    const progressCond = latestReport && latestReport.status === "pass";

    const monthsUsed = APP_STATE.profile.monthsUsed ?? 36;
    const maxMonths = APP_STATE.profile.maxMonths || 48;
    const durationCond = monthsUsed <= maxMonths;

    const isEnglish = global.DTMS_DATA.getString("dtms-language") === "EN";
    const checklistItems = isEnglish ? [
      { label: "1. Complete 24 course credits and literature review (score ≥ 7.0)", status: hpCond, text: hpCond ? `PASS (${earnedCredits}/24 credits · review: ${essayAvg}/10)` : `NOT MET (${earnedCredits}/24 credits; review: ${essayAvg}/10)` },
      { label: "2. Research proposal reviewed and approved", status: outlineCond, text: outlineCond ? "PASS (proposal approved)" : "NOT MET (proposal not approved)" },
      { label: "3. Complete and pass all three doctoral topics", status: topicsCond, text: topicsCond ? "PASS (3/3 topics)" : `NOT MET (${topicsCount}/3 topics)` },
      { label: "4. Verified publications meet the 0.75 point minimum", status: pubCond, text: pubCond ? `PASS (${pubScore.toFixed(2)} / 0.75 points)` : `NOT MET (${pubScore.toFixed(2)} / 0.75 points)` },
      { label: "5. Most recent six-month progress report passed", status: progressCond, text: progressCond ? "PASS (latest report approved)" : "NOT MET (latest report not approved)" },
      { label: "6. Candidate remains within the training period", status: durationCond, text: durationCond ? `PASS (${monthsUsed}/${maxMonths} months)` : `OVERDUE (${monthsUsed}/${maxMonths} months)` }
    ] : [
      { label: "1. Hoàn thành 24 tín chỉ học phần & Tiểu luận tổng quan (≥ 7.0 điểm)", status: hpCond, text: hpCond ? `ĐẠT (${earnedCredits}/24 Tín chỉ · Điểm TL: ${essayAvg}/10)` : `CHƯA ĐẠT (${earnedCredits}/24 tín chỉ · TL: ${essayAvg}/10)` },
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
            <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:var(--uni-blue-900);">${isEnglish ? "THESIS DEFENSE ELIGIBILITY CHECKLIST" : "BẢNG KIỂM ĐIỀU KIỆN BẢO VỆ"}</h4>
            <p style="margin:2px 0 0; font-size:0.8rem; color:var(--text-secondary);">${isEnglish ? "Calculated from the candidate's saved training record." : "Tổng hợp từ hồ sơ đào tạo, kết quả học tập và công bố khoa học của nghiên cứu sinh."}</p>
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
    if (!requireRoles(['PDT'])) return;
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được gửi yêu cầu kiểm tra độ tương đồng.");
      return;
    }
    const status = document.getElementById("turnitin-gauge-status");
    if (status) status.textContent = "Chưa có kết quả kiểm tra độ tương đồng.";
    notify("Dịch vụ chưa khả dụng", "Chưa thể kiểm tra độ tương đồng. Vui lòng thử lại sau hoặc liên hệ đơn vị quản lý đào tạo.");
  }

  // Module 9: NHD Sign-off for Defense
  function handleSignDefenseApproval() {
    if (!requireRoles(['NHD'])) return;
    if (currentUser.code !== "NHD") {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn khoa học được xác nhận đồng ý cho bảo vệ.");
      return;
    }
    if (APP_STATE.defenseApproval) { notify("Đã xác nhận", "Ý kiến đồng ý đã được lưu trong hồ sơ."); return; }
    APP_STATE.defenseApproval = { signedAt: new Date().toISOString(), signedBy: currentUser.id };
    if (!saveAppState(APP_STATE)) return;
    const signBadge = document.getElementById("nhd-defense-sign-badge");
    if (signBadge) {
      signBadge.className = "status-pill is-success";
      signBadge.textContent = "NHD đã xác nhận đồng ý";
    }
    addAuditLog("NHD xác nhận đồng ý bảo vệ", "Ghi nhận ý kiến đồng ý bảo vệ trong trình duyệt");
    notify("Đã ghi nhận ý kiến", "Đã lưu ý kiến đồng ý bảo vệ. Hồ sơ ký xác nhận được xử lý theo quy trình của đơn vị.");
  }

  // Module 10: Defense Voting & Council Resolution
  function handleDefenseVoting() {
    if (!requireRoles(['HOIDONG'])) return;
    if (currentUser.code !== "HOIDONG") {
      notify("Không đủ quyền", "Chỉ thành viên Hội đồng được ghi nhận kết quả biểu quyết.");
      return;
    }
    const entered = global.prompt("Nhập số phiếu tán thành (0–7):", "7");
    if (entered === null) return;
    const yesVotes = Number(entered);
    if (!entered.trim() || !Number.isInteger(yesVotes) || yesVotes < 0 || yesVotes > 7) {
      notify("Số phiếu không hợp lệ", "Nhập số nguyên từ 0 đến 7.");
      return;
    }
    const passed = yesVotes >= 4;
    APP_STATE.defenseVote = { yesVotes, totalVotes: 7, passed, recordedAt: new Date().toISOString() };
    if (!saveAppState(APP_STATE)) return;
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
    if (!requireRoles(['BGH'])) return;
    if (currentUser.code !== "BGH") {
      notify("Không đủ quyền", "Chỉ Ban Giám hiệu được ghi nhận quyết định công nhận học vị.");
      return;
    }
    if (APP_STATE.degreeConferred) { notify("Đã ghi nhận", "Hồ sơ đã có thông tin quyết định cấp bằng."); return; }
    const requirementsMet = earnedCourseCredits() >= 24 && APP_STATE.defenseVote?.passed && APP_STATE.defenseApproval && APP_STATE.postDefense
      && Number(APP_STATE.essayResult?.avg || 0) >= 7
      && APP_STATE.outlineStatus === "Đã duyệt"
      && APP_STATE.topics.filter(topic => topic.status === "passed").length >= 3
      && APP_STATE.publications.filter(pub => pub.verified).reduce((sum, pub) => sum + Number(pub.score || 0), 0) >= 0.75
      && APP_STATE.progressReports.slice(-1)[0]?.status === "pass"
      && Number(APP_STATE.profile.monthsUsed || 0) <= Number(APP_STATE.profile.maxMonths || 48);
    if (!requirementsMet) {
      notify("Chưa đủ điều kiện", "Cần đủ tín chỉ và bảng kiểm, xác nhận NHD, phiếu thông qua của Hội đồng và hồ sơ sau bảo vệ trước khi ghi nhận quyết định cấp bằng.");
      return;
    }
    const degBadge = document.getElementById("degree-confer-status");
    if (degBadge) {
      degBadge.className = "status-pill is-success";
      degBadge.textContent = "Đã ghi nhận quyết định cấp bằng";
    }
    APP_STATE.degreeConferred = { date: new Date().toISOString(), decisionNo: "128/QĐ-ĐHAG", role: currentUser.code };
    if (!saveAppState(APP_STATE)) return;
    addAuditLog("BGH Ký Quyết định công nhận học vị", "Ban hành QĐ số 128/QĐ-ĐHAG công nhận học vị Tiến sĩ");
    notify("Đã ghi nhận thông tin quyết định", "Thông tin quyết định đã được lưu vào hồ sơ. Việc phát hành văn bằng được thực hiện theo quy trình của nhà trường.");
  }

  // Module 13: Export Real CSV Reports (FR-BC02, FR-BC04)
  function handleExportReport(reportName) {
    if (!requireRoles(['PDT','KHOA','BGH'])) return;
    let rows;
    if (/KiemDinh|AUN/.test(reportName)) {
      rows = [['Chỉ báo','Giá trị','Nguồn'],['Hồ sơ NCS',APP_STATE.candidates.length,'Hồ sơ đang quản lý'],['Tín chỉ đã đạt',earnedCourseCredits(),'Bảng điểm'],['Điểm tiểu luận',APP_STATE.essayResult.avg || 'Chờ chấm','Kết quả đánh giá'],['Kế hoạch: cấp duyệt',APP_STATE.planStage,'Luồng NHD → BM → PDT'],['Đề cương',APP_STATE.outlineStatus,'Trạng thái đã lưu'],['Chuyên đề đạt',APP_STATE.topics.filter(t=>t.status==='passed').length,'Kết quả chuyên đề'],['Công bố đã thẩm định',APP_STATE.publications.filter(p=>p.verified).length,'Danh mục công bố']];
    } else if (/BaCongKhai/.test(reportName)) {
      rows = [['Ngành đào tạo','Số nghiên cứu sinh']];
      for (const major of [...new Set(APP_STATE.candidates.map(c=>c.major))]) rows.push([major,APP_STATE.candidates.filter(c=>c.major===major).length]);
      rows.push([],['Công bố đã duyệt',APP_STATE.publications.filter(p=>p.verified).length],['Nguồn','Hồ sơ đào tạo đang quản lý']);
    } else {
      rows = [['Mã NCS','Họ tên','Ngành','Khóa','Người hướng dẫn','Trạng thái'], ...APP_STATE.candidates.map(c=>[c.code,c.name,c.major,c.cohort,c.supervisor,statusLabel(c.status)]),[],['Kỳ báo cáo tiến độ','Kết quả','Ngày nộp'],...APP_STATE.progressReports.map(r=>[r.period,r.status,r.submittedAt||'Chưa có ngày nộp'])];
    }
    const filename = reportName.replace(/\.[^.]+$/, '') + '.csv';
    downloadBlob(global.DTMS_DATA.csv(rows),filename,'text/csv;charset=utf-8');
    addAuditLog('Xuất báo cáo',filename);
    notify('Đã tạo tệp CSV','Báo cáo đã được xuất từ dữ liệu hồ sơ hiện tại.');
  }

  function handleExportAuditLog() {
    if (!requireRoles(['PDT'])) return;
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được xuất nhật ký hệ thống.");
      return;
    }
    const rows = [["Thời gian", "Người dùng", "Vai trò", "Thao tác", "Đối tượng", "Địa chỉ", "Trạng thái"], ...AUDIT_LOGS.map(log => [log.time, log.user, log.role, log.action, log.target, log.ip, log.status])];
    const csv = global.DTMS_DATA.csv(rows);
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
    if (!requireRoles(['PDT'])) return;
    if (currentUser.code !== "PDT") {
      notify("Không đủ quyền", "Chỉ Phòng Đào tạo được làm mới nhật ký hệ thống.");
      return;
    }
    try { AUDIT_LOGS = JSON.parse(global.DTMS_DATA.getString(STORAGE_KEY) || "{}").auditLogs || AUDIT_LOGS; } catch (_) { /* keep current in-memory records */ }
    renderAuditLogTable();
    notify("Đã làm mới", "Nhật ký đang hiển thị dữ liệu mới nhất đã lưu trên thiết bị này.");
  }

  function openDegreeLookup(code) {
    if (global.switchView) global.switchView("lookup");
    const input = document.querySelector("[data-input-code]");
    if (input) input.value = code || "";
    document.querySelector("[data-verify-btn]")?.click();
  }

  function handleGenericWorkflowSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const modal = form.closest(".mgmt-modal");
    if (!modal) return;
    // Có phiên máy chủ: kế hoạch, báo cáo tiến độ, đề tài và minh chứng ngoại ngữ gửi thẳng lên API.
    if (backendSession() && Object.hasOwn(SERVER_FORMS, form.id)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      SERVER_FORMS[form.id](event, form);
      return;
    }
    const specializedForms = ["form-login", "form-edit-profile", "form-leave-request", "form-assign-supervisor", "form-declare-pub", "form-grade-essay", "form-grade-topic", "form-review-progress", "form-candidate"];
    if (specializedForms.includes(form.id)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (!requireRoles(MODAL_ACCESS[modal.id] || [])) return;
    if (!global.DTMS_UI.validate(form)) return;
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
    const submissions = APP_STATE.workflowSubmissions;
    const item = {
      id: `WF-${Date.now()}`,
      workflow: modal.id,
      title,
      role: currentUser.code,
      candidateId: 'ncs-01',
      submittedAt: new Date().toISOString(),
      status: "Đã ghi nhận trên thiết bị này",
      values
    };
    submissions.unshift(item);
    // Persist cả hai khóa sau khi cập nhật state; không thông báo thành công trước khi lưu.

    if (modal.id === "modal-edit-plan") {
      APP_STATE.plan = { values, submittedAt:item.submittedAt };
      APP_STATE.planStage = 0;
      renderPlanStatusUI();
    } else if (modal.id === "modal-submit-outline") {
      APP_STATE.outlineStatus = "Chờ duyệt";
      renderDefenseChecklistUI();
    } else if (modal.id === "modal-submit-progress") {
      const selectedPeriod = Number(form.querySelector("select")?.value.match(/\d+/)?.[0] || 0);
      const report = APP_STATE.progressReports.find(entry => entry.period === selectedPeriod);
      if (report) {
        report.values = values;
        report.submittedAt = item.submittedAt;
        report.status = "pending";
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
              const status = document.getElementById(`topic-status-${topicNumber}`);
          const score = document.getElementById(`topic-score-${topicNumber}`);
          if (status) { status.className = "status-pill is-warning"; status.textContent = "Chờ đánh giá"; }
          if (score) score.textContent = "—";
          renderDefenseChecklistUI();
        }
      }
    }

    if (modal.id === 'modal-submit-essay') APP_STATE.essayResult = { ...APP_STATE.essayResult, status:'pending', avg:'', submission:values };
    if (modal.id === 'modal-upload-thesis-version') {
      APP_STATE.thesisVersions ||= [];
      APP_STATE.thesisVersions.unshift({ id:item.id, values, submittedAt:item.submittedAt });
    }
    if (modal.id === 'modal-submit-post-defense') APP_STATE.postDefense={ values, submittedAt:item.submittedAt };
    if (!saveAppState(APP_STATE)) return;

    renderWorkflowUI();
    renderDefenseChecklistUI();
    closeModal(modal.id);
    addAuditLog("Gửi yêu cầu học vụ", `${title} (${item.id})`);
    renderRoleDashboard();
    notify("Đã ghi nhận yêu cầu", `${title} đã được lưu trong bộ nhớ trình duyệt. Tệp chỉ lưu tên và thông tin; nội dung tệp chưa được tải lên máy chủ.`);
    form.reset();
  }

  function canAccessView(viewId) {
    if (['management', 'profile'].includes(viewId) && global.DTMS_DATA.getString('dtms-signed-out', "", true)) { openModal('modal-login'); return false; }
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
    if (initialized) return;
    initialized = true;
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
          ? (global.DTMS_DATA.getString("dtms-language") === "EN" ? "Evaluated (Pass)" : "Đã đánh giá (Đạt)")
          : (global.DTMS_DATA.getString("dtms-language") === "EN" ? "Awaiting review" : "Chờ đánh giá");
      }
    });

    document.querySelectorAll('[data-priv-roles]').forEach(button=>button.hidden=!button.dataset.privRoles.split(',').includes(currentUser.code));
    const savedRoleKey = Object.keys(USERS_ROLE_STORE).find((roleKey) => USERS_ROLE_STORE[roleKey] === currentUser) || "NCS";
    switchRole(savedRoleKey, true);
    if (global.switchView) global.switchView(global.DTMS_DATA.getString("dtms-signed-out", "", true) ? "home" : (location.hash.slice(1) || "management"));

    const loginForm = document.getElementById("form-login");
    if (loginForm) loginForm.addEventListener("submit", login);



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

    document.getElementById('form-grade-topic').addEventListener('submit', handleGradeTopicSubmit);
    document.getElementById('form-review-progress').addEventListener('submit', handleProgressReviewSubmit);
    document.getElementById('essay-candidate').addEventListener('change', () => {
      const select=document.getElementById('essay-work-select');select.value='';
      [...select.options].forEach(option=>option.hidden=Boolean(option.dataset.candidate&&option.dataset.candidate!==document.getElementById('essay-candidate').value));
    });
    renderGradeHistories();
    initEnhancements();
    initQuickCommandSearch();
    initServerIntegration();
  }

  function refreshLanguage() {
    updateSessionControls();
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

  const CANDIDATE_STATUS = { studying:'Đang học bình thường', extended:'Gia hạn học tập', paused:'Tạm dừng học tập', defended:'Đã bảo vệ luận án', graduated:'Đã cấp bằng Tiến sĩ' };
  let confirmCallback;
  let initialized = false;
  const sampleTableRows = new Map();

  function statusLabel(status) { return CANDIDATE_STATUS[status] || status; }

  function requireRoles(roles) {
    if (!global.DTMS_DATA.getString('dtms-signed-out', "", true) && roles.includes(currentUser.code)) return true;
    notify('Không đủ quyền thao tác', 'Vai trò hiện tại không được phép thực hiện thao tác này.');
    return false;
  }

  function logout(reason) {
    global.DTMS_API?.logout(); // xóa jwt_token khỏi localStorage
    global.DTMS_DATA.remove(SESSION_USER_KEY);
    resetServerData();
    global.DTMS_DATA.remove('dtms-role', true);
    global.DTMS_DATA.setString('dtms-signed-out', 'true', true);
    document.querySelectorAll('.mgmt-modal.is-open').forEach(modal=>modal.classList.remove('is-open'));
    updateSessionControls();
    global.switchView('home');
    openModal('modal-login');
    if (reason === 'expired') notify('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.');
    else notify('Đã kết thúc phiên làm việc','Dữ liệu đã lưu được giữ nguyên.');
  }

  function updateSessionControls() {
    const signedOut = Boolean(global.DTMS_DATA.getString('dtms-signed-out', '', true)) || !backendSession();
    const hasIdentity = Boolean(sessionUser()?.hoTen);
    document.querySelectorAll('[data-logout]').forEach(control => { control.hidden = signedOut; });
    const userBadge = document.getElementById('topbar-user-badge');
    if (userBadge) userBadge.hidden = signedOut || !hasIdentity;
    const activeDisplay = document.getElementById('mgmt-active-user-display');
    if (activeDisplay) activeDisplay.hidden = signedOut || !hasIdentity;
    const label = document.querySelector('[data-workspace-label]');
    const isEnglish = global.DTMS_DATA.getString('dtms-language') === 'EN';
    if (label) label.textContent = signedOut ? (isEnglish ? 'Access workspace' : 'Truy cập hệ thống') : (isEnglish ? 'Workspace' : 'Bàn làm việc');
  }

  function openWorkspace() {
    if (global.DTMS_DATA.getString('dtms-signed-out', '', true)) openModal('modal-login');
    else global.switchView('management');
  }

  function confirmAction(message, callback) {
    confirmCallback=callback;
    document.querySelector('[data-confirm-message]').textContent=message;
    openModal('modal-confirm');
  }

  function showInformation(title, body) {
    document.querySelector('#modal-information h3').textContent=title;
    document.querySelector('[data-information-body]').innerHTML=body;
    openModal('modal-information');
  }

  function showIntegrationInfo(feature) {
    showInformation(feature, '<p>Chức năng này hiện chưa khả dụng.</p><p>Vui lòng liên hệ đơn vị quản lý đào tạo hoặc quản trị hệ thống để được hỗ trợ.</p>');
  }

  function queueReminder() {
    if (!requireRoles(['NHD','PDT'])) return;
    APP_STATE.reminders.unshift({ id:'REM-'+Date.now(), at:new Date().toISOString(), by:currentUser.code, text:'Nhắc hạn báo cáo tiến độ nghiên cứu sinh' });
    if (!saveAppState(APP_STATE)) return;
    addAuditLog('Ghi nhắc hạn báo cáo','Chưa gửi email; chỉ lưu nhắc hạn tại thiết bị');
    renderWorkflowUI();
    notify('Đã lưu nhắc hạn','Chưa có dịch vụ email. Không có email nào được gửi.');
  }

  function printProfile() {
    if (!requireRoles(ROLE_MODULES.NCS.includes('m01') ? ['NCS','NHD','BM','KHOA','PDT','BGH'] : [])) return;
    switchModuleTab('m01');
    global.print();
  }

  function earnedCourseCredits() {
    // Chỉ cộng học phần có điểm tổng kết trong bảng điểm, không coi đăng ký là đã đạt.
    return [...document.querySelectorAll('#panel-m04 table tbody tr')].reduce((sum,row)=>{
      const grade=Number(row.cells[6]?.textContent.trim());
      const credits=parseInt(row.cells[2]?.textContent,10)||0;
      return sum+(Number.isFinite(grade)&&grade>=7?credits:0);
    },0);
  }

  function candidateScope() {
    if(currentUser.code==='NCS')return APP_STATE.candidates.filter(c=>c.id==='ncs-01');
    if(currentUser.code==='NHD')return APP_STATE.candidates.filter(c=>c.supervisor===currentUser.name);
    return APP_STATE.candidates;
  }

  function renderCandidates() {
    const table=document.querySelector('#panel-m01 table');
    if(!table)return;
    table.id='candidates-table';
    const labels=CANDIDATE_STATUS;
    table.tBodies[0].innerHTML=candidateScope().map(c=>`<tr><td><strong>${escapeHtml(c.code)}</strong></td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.major)}</td><td>${escapeHtml(c.cohort)}</td><td>${escapeHtml(c.supervisor||'Chưa phân công')}</td><td><span class="status-pill ${c.status==='studying'?'is-success':'is-warning'}">${escapeHtml(labels[c.status]||c.status)}</span></td><td><div class="candidate-actions"><button type="button" class="btn-mgmt btn-mgmt-sm btn-mgmt-outline-blue" data-candidate-view="${escapeHtml(c.id)}">Xem${currentUser.code==='PDT'?' / Sửa':''}</button>${currentUser.code==='PDT'&&!c.seeded?`<button type="button" class="btn-mgmt btn-mgmt-sm btn-mgmt-danger" data-candidate-delete="${escapeHtml(c.id)}">Xóa</button>`:''}</div></td></tr>`).join('');
    document.querySelectorAll('[data-candidate-add],[data-backup-data]').forEach(b=>b.hidden=currentUser.code!=='PDT');
    const input=document.querySelector('#panel-m01 .mgmt-input-search');
    if(input?.value)syncCandidateFilter();
  }

  function openCandidate(id) {
    if(!requireRoles(['PDT','NCS','NHD','BM','KHOA','BGH']))return;
    const candidate=id?candidateScope().find(c=>c.id===id):null;
    if(id&&!candidate)return;
    if(!id&&currentUser.code!=='PDT')return;
    const form=document.getElementById('form-candidate');
    form.reset();
    document.getElementById('candidate-id').value=id||'';
    for(const key of ['code','name','major','cohort','email','phone','supervisor','status']) {
      const input=document.getElementById('candidate-'+key);
      input.value=candidate?.[key]||(key==='status'?'studying':'');
      input.disabled=currentUser.code!=='PDT';
      global.DTMS_UI.fieldError(input,'');
    }
    document.getElementById('candidate-save').hidden=currentUser.code!=='PDT';
    document.getElementById('candidate-modal-heading').textContent=id?'Hồ sơ NCS · '+candidate.name:'Thêm nghiên cứu sinh';
    openModal('modal-candidate');
  }

  function saveCandidate(event) {
    event.preventDefault();
    if(!requireRoles(['PDT'])||!global.DTMS_UI.validate(event.target))return;
    const id=document.getElementById('candidate-id').value;
    const old=APP_STATE.candidates.find(c=>c.id===id);
    const candidate={ id:id||'ncs-'+Date.now()+'-'+Math.random().toString(36).slice(2,6), seeded:old?.seeded||false };
    for(const key of ['code','name','major','cohort','email','phone','supervisor','status'])candidate[key]=document.getElementById('candidate-'+key).value.trim();
    if(APP_STATE.candidates.some(c=>c.id!==id&&c.code.toLowerCase()===candidate.code.toLowerCase())) { global.DTMS_UI.fieldError(document.getElementById('candidate-code'),'Mã NCS đã tồn tại.'); return; }
    if(candidate.email&&APP_STATE.candidates.some(c=>c.id!==id&&c.email?.toLowerCase()===candidate.email.toLowerCase())) { global.DTMS_UI.fieldError(document.getElementById('candidate-email'),'Email đã được dùng bởi hồ sơ khác.'); return; }
    if(old)Object.assign(old,candidate);else APP_STATE.candidates.push(candidate);
    if(candidate.id==='ncs-01')Object.assign(APP_STATE.profile,{phone:candidate.phone,email:candidate.email});
    if(!saveAppState(APP_STATE))return;
    renderCandidates(); renderWorkflowUI();
    closeModal('modal-candidate');
    addAuditLog(id?'Sửa hồ sơ nghiên cứu sinh':'Thêm nghiên cứu sinh',candidate.code+' · '+candidate.name);
    notify('Đã lưu hồ sơ','Danh sách đã cập nhật trong bộ nhớ trình duyệt.');
  }

  function deleteCandidate(id) {
    if(!requireRoles(['PDT']))return;
    const candidate=APP_STATE.candidates.find(c=>c.id===id);
    if(!candidate||candidate.seeded) { notify('Hồ sơ khởi tạo','Hồ sơ khởi tạo được bảo vệ. Bạn có thể xóa các hồ sơ được thêm mới.'); return; }
    if(Boolean(APP_STATE.assignments[candidate.id])) { notify('Hồ sơ đang được sử dụng','Không thể xóa hồ sơ đã có phân công người hướng dẫn.'); return; }
    confirmAction('Xóa hồ sơ '+candidate.code+' · '+candidate.name+' khỏi danh sách đang quản lý?',()=>{
      if(!requireRoles(['PDT']))return;
      APP_STATE.candidates=APP_STATE.candidates.filter(c=>c.id!==id);
      if(!saveAppState(APP_STATE))return;
      renderCandidates();
      addAuditLog('Xóa hồ sơ nghiên cứu sinh',candidate.code);
      notify('Đã xóa hồ sơ','Danh sách đã được cập nhật.');
    });
  }

  function syncCandidateFilter() {
    const panel=document.getElementById('panel-m01');
    const input=panel.querySelector('.mgmt-input-search');
    const status=panel.querySelector('.mgmt-select-filter');
    const controls=panel.querySelector('.table-controls');
    if(!controls)return;
    controls.querySelector('input').value=input.value;
    controls.querySelector('input').dispatchEvent(new Event('input'));
    const filter=controls.querySelector('[data-table-filter]');
    const target=statusLabel(status.value);
    filter.value=[...filter.options].some(o=>o.value===target)?target:'';
    filter.dispatchEvent(new Event('change'));
    // Lọc trạng thái không có bản ghi phải cho kết quả rỗng, không rơi về Tất cả.
    if(status.value&&!candidateScope().some(c=>c.status===status.value)) {
      controls.querySelector('input').value='__khong_co_trang_thai__';
      controls.querySelector('input').dispatchEvent(new Event('input'));
    }
  }

  function editPublication(id) {
    if(!requireRoles(['NCS']))return;
    const pub=APP_STATE.publications.find(p=>p.id===id);
    if(!pub||pub.verified)return;
    const form=document.getElementById('form-declare-pub');
    form.reset();form.dataset.editingId=id;
    document.getElementById('pub-title-input').value=pub.title;
    document.getElementById('pub-journal-input').value=pub.journal;
    document.getElementById('pub-cat-select').value=pub.cat;
    document.getElementById('pub-doi-input').value=pub.doi;
    openModal('modal-declare-pub');
  }

  function deletePublication(id) {
    if(!requireRoles(['NCS']))return;
    const pub=APP_STATE.publications.find(p=>p.id===id);
    if(!pub||pub.verified)return;
    confirmAction('Xóa khai báo chưa thẩm định “'+pub.title+'”?',()=>{
      if(!requireRoles(['NCS'])||APP_STATE.publications.find(p=>p.id===id)?.verified)return;
      APP_STATE.publications=APP_STATE.publications.filter(p=>p.id!==id);
      if(!saveAppState(APP_STATE))return;
      renderPublicationsTable();renderDefenseChecklistUI();
      addAuditLog('Xóa khai báo công bố',pub.title);
      notify('Đã xóa khai báo','Công bố chưa thẩm định đã được xóa khỏi danh sách.');
    });
  }

  function workflowValues(workflow, values) {
    const form=document.querySelector('#'+CSS.escape(workflow)+' form');
    return Object.entries(values||{}).map(([key,value])=>{
      const input=form?.querySelector('[name="'+CSS.escape(key)+'"],[data-legacy-name="'+CSS.escape(key)+'"]');
      const label=input?.closest('.mgmt-form-group')?.querySelector('label')?.textContent.trim()||key;
      return `<p><strong>${escapeHtml(label)}</strong> ${escapeHtml(value&&typeof value==='object'?value.fileName:value)}</p>`;
    }).join('');
  }

  function renderWorkflowUI() {
    if(!backendSession()) {
      for(const key of ['name','phone','email','workplace','id','major','cohort','decision','study-type','duration','max-duration']) {
        const display=document.getElementById('profile-display-'+key);
        if(display)display.textContent='—';
      }
      const profileNameInput=document.querySelector('#form-edit-profile input[readonly]');
      if(profileNameInput)profileNameInput.value='';
    }
    const selectedCandidate = document.getElementById('assign-ncs-select').value;
    document.getElementById('assign-ncs-select').replaceChildren(...APP_STATE.candidates.map(candidate=>new Option(candidate.name+' · '+candidate.code,candidate.id)));
    if(APP_STATE.candidates.some(candidate=>candidate.id===selectedCandidate))document.getElementById('assign-ncs-select').value=selectedCandidate;
    const scope=candidateScope();
    [scope.length,scope.filter(c=>c.status==='studying').length,scope.filter(c=>c.status==='extended').length,scope.filter(c=>c.status==='paused').length].forEach((value,i)=>{const metric=document.querySelectorAll('#panel-m01 .mgmt-stat-info strong')[i];if(metric)metric.textContent=value;});
    const essay=document.getElementById('essay-avg-score');
    if(essay)essay.textContent=APP_STATE.essayResult.status==='pending'?'Chờ chấm điểm':APP_STATE.essayResult.avg+' / 10';
    APP_STATE.topics.forEach((topic,index)=>{
      const score=document.getElementById('topic-score-'+(index+1));
      const status=document.getElementById('topic-status-'+(index+1));
      const title=status?.closest('tr')?.cells[0]?.querySelector('strong');
      if(title)title.textContent=topic.name;
      if(score)score.textContent=topic.score==='—'?'—':topic.score+'/10';
      if(status){status.textContent=topic.status==='passed'?'Đã đánh giá (Đạt)':topic.status==='failed'?'Chưa đạt (yêu cầu ≥ 7)':'Chờ đánh giá';status.className='status-pill '+(topic.status==='passed'?'is-success':'is-warning');}
    });
    const progress=document.querySelector('#panel-m07 table tbody');
    if(progress)progress.innerHTML=APP_STATE.progressReports.map(report=>`<tr><td>Kỳ ${report.period}</td><td>Báo cáo định kỳ 6 tháng</td><td>${report.values?workflowValues('modal-submit-progress',report.values):'Chưa có nội dung báo cáo hoặc tệp đính kèm.'}</td><td>${report.submittedAt?escapeHtml(new Date(report.submittedAt).toLocaleDateString('vi-VN')):'Chưa có ngày nộp'}</td><td><span id="progress-status-period-${report.period}" class="status-pill ${report.status==='pass'?'is-success':'is-warning'}">${report.status==='pass'?'Đạt tiến độ':report.status==='pending'?'Chờ đánh giá':'Cần chỉnh sửa'}</span></td><td>${report.status==='pass'?'Đã ghi nhận kết quả':'Chờ NHD/BM đánh giá'}</td><td>${['NHD','BM'].includes(currentUser.code)?`<div class="candidate-actions"><button class="btn-mgmt btn-mgmt-sm btn-mgmt-success" data-grade-period="${report.period}" data-result="pass">Đạt</button><button class="btn-mgmt btn-mgmt-sm btn-mgmt-warning" data-grade-period="${report.period}" data-result="revise">Cần sửa</button></div>`:'Chưa có tệp đính kèm'}</td></tr>`).join('');
    const submissions=APP_STATE.workflowSubmissions;
    const workflowModules={'modal-edit-plan':'m02','modal-change-supervisor':'m03','modal-submit-essay':'m05','modal-submit-outline':'m05','modal-register-topic':'m06','modal-submit-progress':'m07','modal-change-topic-title':'m09','modal-upload-thesis-version':'m09','modal-submit-post-defense':'m11','modal-create-change-request':'m12'};
    for(const [workflow,moduleId] of Object.entries(workflowModules)) {
      const panel=document.getElementById('panel-'+moduleId);
      let summary=panel.querySelector('[data-workflow="'+workflow+'"]');
      const items=submissions.filter(s=>s.workflow===workflow);
      if(!items.length){summary?.remove();continue;}
      if(!summary){summary=document.createElement('section');summary.dataset.workflow=workflow;summary.className='workflow-summary';panel.append(summary);}
      summary.innerHTML='<h4>'+escapeHtml(items[0].title)+' · Đã lưu</h4>'+items.slice(0,5).map(item=>'<div><small>'+escapeHtml(new Date(item.submittedAt).toLocaleString('vi-VN'))+' · '+escapeHtml(item.id)+'</small>'+workflowValues(workflow,item.values)+'</div>').join('<hr>');
    }
    const versions=document.querySelector('#panel-m09 table tbody');
    if(versions){
      if(!sampleTableRows.has('versions'))sampleTableRows.set('versions',versions.innerHTML);
      versions.innerHTML=(APP_STATE.thesisVersions||[]).map((version,index)=>`<tr><td><strong>Phiên bản ${escapeHtml(version.id)}</strong></td><td>Phiên bản đã nộp cục bộ</td><td>${escapeHtml(new Date(version.submittedAt).toLocaleDateString('vi-VN'))}</td><td>Metadata</td><td>${workflowValues('modal-upload-thesis-version',version.values)}</td><td>Chưa lưu nội dung tệp</td></tr>`).join('')+sampleTableRows.get('versions');
    }
    const changes=document.querySelector('#panel-m12 table tbody');
    if(changes){
      if(!sampleTableRows.has('changes'))sampleTableRows.set('changes',changes.innerHTML);
      changes.innerHTML=submissions.filter(s=>['modal-create-change-request','modal-change-topic-title','modal-change-supervisor'].includes(s.workflow)).map(item=>`<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(new Date(item.submittedAt).toLocaleDateString('vi-VN'))}</td><td>${workflowValues(item.workflow,item.values)}</td><td><span class="status-pill is-warning">Chờ xử lý</span></td><td>Chưa có quyết định</td></tr>`).join('')+sampleTableRows.get('changes');
    }
    for(const selector of ['#assign-nhd-main-select','#assign-nhd-sub-select']) document.querySelectorAll(selector+' option').forEach(option=>{
      const quota=APP_STATE.advisorsQuota[option.value];if(quota)option.textContent=option.value+' · '+quota.count+'/'+quota.max+' chỉ tiêu';
    });
    const advisors=document.querySelector('#panel-m03 table tbody');
    if(advisors)for(const row of advisors.rows){
      const name=row.cells[0]?.textContent.trim();
      const entry=Object.entries(APP_STATE.advisorsQuota).find(([key])=>name?.includes(key));
      if(entry){const q=entry[1];row.cells[4].textContent=q.count+' / '+q.max+' NCS';const badge=row.querySelector('.status-pill');if(badge)badge.textContent=q.count>=q.max?'Đủ định mức':'Còn chỉ tiêu';}
    }
    const sign=document.getElementById('nhd-defense-sign-badge');
    if(sign)sign.textContent=APP_STATE.defenseApproval?'NHD đã xác nhận':'Chưa có xác nhận của NHD';
    const degree=document.getElementById('degree-confer-status');
    if(degree)degree.textContent=APP_STATE.degreeConferred?'Đã ghi nhận thông tin quyết định':'Chưa ghi nhận quyết định cấp bằng';
    const vote=document.getElementById('defense-vote-result-badge');
    if(vote)vote.textContent=APP_STATE.defenseVote?APP_STATE.defenseVote.yesVotes+'/7 phiếu tán thành':'Chưa ghi nhận phiếu đánh giá';
    const similarity=document.getElementById('turnitin-gauge-val');if(similarity)similarity.textContent='—';
    const similarityStatus=document.getElementById('turnitin-gauge-status');if(similarityStatus)similarityStatus.textContent='Chưa có kết quả kiểm tra độ tương đồng';
    const fill=document.getElementById('turnitin-gauge-fill');if(fill)fill.style.width='0%';
    document.querySelectorAll('[data-priv-roles]').forEach(b=>b.hidden=!b.dataset.privRoles.split(',').includes(currentUser.code));
    document.querySelector('[data-logout]').hidden=Boolean(global.DTMS_DATA.getString('dtms-signed-out', "", true));
    const credit=document.querySelector('#panel-m04 .mgmt-stat-info strong');if(credit)credit.textContent=earnedCourseCredits()+' / 24 TC';
    const rows=[...document.querySelectorAll('#panel-m04 table tbody tr')];
    const grades=rows.map(row=>({credits:parseInt(row.cells[2]?.textContent,10)||0,grade:Number(row.cells[6]?.textContent.trim())})).filter(item=>Number.isFinite(item.grade));
    const credits=grades.reduce((sum,item)=>sum+item.credits,0);
    const metrics=document.querySelectorAll('#panel-m04 .mgmt-stat-info strong');
    if(metrics[1])metrics[1].textContent=credits?(grades.reduce((sum,item)=>sum+item.grade*item.credits,0)/credits).toFixed(2)+' / 10':'Chưa có điểm';
    if(metrics[2])metrics[2].textContent=earnedCourseCredits()>=24?'Đủ 24 tín chỉ':'Chưa đủ 24 tín chỉ';
    renderPlanStatusUI();
    renderGradeHistories();
    renderReports();
    renderRoleDashboard();
  }

  function approveOutline() {
    if(!requireRoles(['NHD','BM','KHOA','PDT']))return;
    if(APP_STATE.outlineStatus==='Đã duyệt'){notify('Đề cương đã duyệt','Không có yêu cầu mới chờ xử lý.');return;}
    APP_STATE.outlineStatus='Đã duyệt';
    if(!saveAppState(APP_STATE))return;
    renderDefenseChecklistUI();renderWorkflowUI();addAuditLog('Duyệt đề cương','Kết quả được ghi trong trình duyệt');
    notify('Đã duyệt đề cương','Kết quả duyệt đã được cập nhật vào hồ sơ đề cương.');
  }

  function backupData() {
    if(!requireRoles(['PDT']))return;
    downloadBlob(JSON.stringify({ state:APP_STATE, submissions:global.DTMS_DATA.read('DTMS_WORKFLOW_SUBMISSIONS_V2',[]), exportedAt:new Date().toISOString() },null,2),'DTMS_Backup.json','application/json');
  }

  function initEnhancements() {
    const matrix=document.querySelector('#panel-m14 table tbody');
    const matrixRows={
      NCS:['Xem hồ sơ mình, sửa liên hệ, gửi kế hoạch','Đăng ký / Xem','Nộp chuyên đề / báo cáo','Khai báo / sửa, xóa bản chưa duyệt','Xem bảng kiểm','Nộp hồ sơ sau bảo vệ'],
      NHD:['Xem NCS được giao / duyệt kế hoạch cấp 1','Không mở M04','Chấm chuyên đề / báo cáo','Thẩm định công bố','Xem / xác nhận đồng ý','Xem hồ sơ'],
      BM:['Xem / duyệt kế hoạch cấp 2','Không mở M04','Chấm chuyên đề / báo cáo','Không mở M08','Xem','Không mở M11'],
      KHOA:['Xem hồ sơ / kế hoạch','Không mở M04','Xem','Không mở M08','Xem','Không mở M11'],
      PDT:['Quản lý hồ sơ / duyệt kế hoạch cấp 3','Xem bảng điểm','Xem','Thẩm định công bố','Xem bảng kiểm','Xem hồ sơ'],
      BGH:['Xem hồ sơ','Không mở M04','Không mở M06/M07','Không mở M08','Xem','Ghi nhận quyết định khi đủ điều kiện'],
      HOIDONG:['Không mở M01/M02','Không mở M04','Không mở M06/M07','Không mở M08','Ghi nhận phiếu đánh giá','Không mở M11']
    };
    matrix.innerHTML=Object.entries(matrixRows).map(([role,cells])=>'<tr><td><strong>'+role+'</strong></td>'+cells.map(cell=>'<td>'+escapeHtml(cell)+'</td>').join('')+'</tr>').join('');
    const actionBar=document.querySelector('#panel-m01 .mgmt-action-bar > div:last-child');
    actionBar.insertAdjacentHTML('afterbegin','<button type="button" class="btn-mgmt btn-mgmt-primary" data-candidate-add>+ Thêm NCS</button><button type="button" class="btn-mgmt btn-mgmt-secondary" data-backup-data>Sao lưu dữ liệu JSON</button>');
    const outlineBar=document.querySelector('#panel-m05 .mgmt-action-bar');
    outlineBar.insertAdjacentHTML('beforeend','<button type="button" class="btn-mgmt btn-mgmt-success" data-approve-outline data-priv-roles="NHD,BM,KHOA,PDT">Duyệt đề cương</button>');
    document.getElementById('form-candidate').addEventListener('submit',saveCandidate);
    const search=document.querySelector('#panel-m01 .mgmt-input-search');search.setAttribute('aria-label','Tìm tên hoặc mã NCS');search.addEventListener('input',syncCandidateFilter);
    const filter=document.querySelector('#panel-m01 .mgmt-select-filter');filter.setAttribute('aria-label','Lọc trạng thái học vụ');filter.addEventListener('change',syncCandidateFilter);
    document.querySelector('[data-confirm-accept]').addEventListener('click',()=>{const callback=confirmCallback;confirmCallback=null;closeModal('modal-confirm');callback?.();});
    document.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.hasAttribute('data-candidate-add'))openCandidate();
      if(button.hasAttribute('data-backup-data'))backupData();
      if(button.dataset.candidateView)openCandidate(button.dataset.candidateView);
      if(button.dataset.candidateDelete)deleteCandidate(button.dataset.candidateDelete);
      if(button.dataset.editPublication)editPublication(button.dataset.editPublication);
      if(button.dataset.deletePublication)deletePublication(button.dataset.deletePublication);
      if(button.dataset.gradePeriod)handleGradeProgressReport(Number(button.dataset.gradePeriod),button.dataset.result);
      if(button.dataset.verifyPublication)verifyPublication(button.dataset.verifyPublication);
      if(button.hasAttribute('data-approve-outline'))approveOutline();
      if(button.hasAttribute('data-supervisor-detail')){
        const row=button.closest('tr');
        showInformation('Thông tin người hướng dẫn',[...row.cells].slice(0,-1).map((c,i)=>'<p><strong>'+escapeHtml(row.closest('table').tHead.rows[0].cells[i].textContent.replace('↕',''))+':</strong> '+escapeHtml(c.textContent)+'</p>').join(''));
      }
    });
    document.querySelectorAll('[onclick*="queueReminder"]').forEach(b=>b.dataset.privRoles='NHD,PDT');
    document.querySelectorAll('[onclick*="modal-declare-pub"]').forEach(button=>button.addEventListener('click',()=>{const form=document.getElementById('form-declare-pub');delete form.dataset.editingId;form.reset();},true));
    document.querySelectorAll('[onclick*="Đồng bộ bảng điểm"]').forEach(b=>b.dataset.privRoles='PDT');
    const remembered = global.DTMS_DATA.read('dtms-remembered-email', global.DTMS_DATA.read('dtms-demo-email', ''));
    if (remembered) {
      document.getElementById('login-username').value = remembered;
      document.getElementById('remember-email').checked = true;
    }
    document.querySelectorAll('[data-today]').forEach(input=>{const now=new Date();input.value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);});
    document.querySelectorAll('[data-close-modal]').forEach(b=>{if(!b.getAttribute('aria-label'))b.setAttribute('aria-label','Đóng hộp thoại');});
    const checks=document.querySelectorAll('#panel-m09 .mgmt-checklist .mgmt-check-item');
    const captions=['Mẫu bìa và định dạng: cần người có thẩm quyền kiểm tra.','Trích dẫn APA: chưa có công cụ kiểm tra tự động.','Đạo văn / sao chép: chưa có dữ liệu đối soát; không thể kết luận.'];
    checks.forEach((item,i)=>{item.classList.remove('is-valid');item.querySelector('.mgmt-check-icon').textContent='—';item.querySelector('span:last-child').textContent=captions[i]||'Chưa kiểm tra';});
    renderCandidates();renderWorkflowUI();
  }

  function handleGradeTopicSubmit(e) {
    if (!requireRoles(["NHD", "BM"])) { e.preventDefault(); return; }
    e.preventDefault();
    if (!(["BM", "NHD"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Chỉ Người hướng dẫn hoặc Trưởng Bộ môn được xác nhận điểm chuyên đề.");
      return;
    }
    const topicIdx = Number(document.getElementById("grade-topic-index").value);
    const candidate = document.getElementById("topic-candidate").value;
    if (!requireCandidateReview(candidate)) return;
    const scoreInput = document.getElementById("topic-score-input");
    const scoreValue = Number(scoreInput.value);
    const comment = document.getElementById("topic-grade-comment").value.trim();
    if (!candidate || !comment || scoreInput.value === "" || !Number.isFinite(scoreValue) || scoreValue < 0 || scoreValue > 10) {
      notify("Thiếu thông tin", "Chọn nghiên cứu sinh, nhập nhận xét và điểm hợp lệ từ 0 đến 10.");
      return;
    }
    const topic = APP_STATE.topics[topicIdx - 1]?.name || `Chuyên đề ${topicIdx}`;
    const passed = scoreValue >= 7;
    const record = {
      topicIdx, topic, candidate, score: scoreValue.toFixed(1), comment,
      status: passed ? "Đạt" : "Cần chỉnh sửa", gradedBy: currentUser.name,
      gradedAt: new Date().toISOString()
    };
    APP_STATE.topicAssessments[`${candidate}|topic-${topicIdx}`] = record;
    if (currentUser.code === "NCS" && APP_STATE.topics[topicIdx - 1]) {
      APP_STATE.topics[topicIdx - 1].score = record.score;
      APP_STATE.topics[topicIdx - 1].status = passed ? "passed" : "failed";
    }
    if (!saveAppState(APP_STATE)) return;
    const scoreEl = currentUser.code === "NCS" && document.getElementById(`topic-score-${topicIdx}`);
    const statusEl = currentUser.code === "NCS" && document.getElementById(`topic-status-${topicIdx}`);
    if (scoreEl) scoreEl.textContent = `${record.score}/10`;
    if (statusEl) {
      statusEl.className = `status-pill ${passed ? "is-success" : "is-warning"}`;
      statusEl.textContent = passed ? "Đã đánh giá (Đạt)" : "Cần chỉnh sửa";
    }
    closeModal("modal-grade-topic");
    renderWorkflowUI();
    renderGradeHistories();
    renderDefenseChecklistUI();
    addAuditLog("Đánh giá Chuyên đề tiến sĩ", `${candidate} · ${topic} · ${record.score}/10 · ${record.status}`);
    notify("Đã xác nhận kết quả", `${candidate} · ${topic} · ${record.score}/10 · ${record.status}.`);
  }

  function handleProgressReviewSubmit(e) {
    if (!requireRoles(["NHD", "BM"])) { e.preventDefault(); return; }
    e.preventDefault();
    if (!(["NHD", "BM"].includes(currentUser.code))) {
      notify("Không đủ quyền", "Vai trò hiện tại không được phép xác nhận đánh giá tiến độ.");
      return;
    }
    if (backendSession()) {
      // PUT /api/Baocaotiendoes/{id}/nhanxet: máy chủ chỉ cho vai trò NHD của đúng nghiên cứu sinh.
      if (requireRoles(["NHD"])) submitServerProgressReview(e);
      return;
    }
    const period = Number(document.getElementById("progress-review-period").value);
    const candidate = document.getElementById("progress-review-candidate").value;
    if (!requireCandidateReview(candidate)) return;
    const result = document.getElementById("progress-review-result").value === "pass" ? "pass" : "revise";
    const comment = document.getElementById("progress-review-comment").value.trim();
    if (!candidate || !result || !comment) {
      notify("Thiếu thông tin", "Chọn nghiên cứu sinh, kết luận và nhập nhận xét trước khi xác nhận.");
      return;
    }
    const record = { period, candidate, result, comment, reviewer: currentUser.name, reviewedAt: new Date().toISOString() };
    APP_STATE.progressReviews[`${candidate}|period-${period}`] = record;
    if (currentUser.code === "NCS") {
      const reportObj = APP_STATE.progressReports.find((report) => report.period === period);
      if (reportObj) {
        reportObj.status = result;
        reportObj.comment = comment;
      }
      const statusEl = document.getElementById(`progress-status-period-${period}`);
      if (statusEl) {
        statusEl.className = `status-pill ${result === "pass" ? "is-success" : "is-warning"}`;
        statusEl.textContent = result === "pass" ? "Đạt tiến độ" : "Cần chỉnh sửa";
      }
      const commentCell = document.getElementById(`progress-comment-period-${period}`);
      if (commentCell) commentCell.textContent = comment;
    }
    if (!saveAppState(APP_STATE)) return;
    closeModal("modal-review-progress");
    renderWorkflowUI();
    renderGradeHistories();
    renderDefenseChecklistUI();
    addAuditLog("Đánh giá Báo cáo tiến độ", `${candidate} · Kỳ ${period} · ${result === "pass" ? "Đạt tiến độ" : "Yêu cầu chỉnh sửa"}`);
    notify("Đã xác nhận đánh giá", `${candidate} · Kỳ ${period} · ${result === "pass" ? "Đạt tiến độ" : "Yêu cầu chỉnh sửa"}.`);
  }

  function renderGradeHistories() {
    const essayHost = document.querySelector("[data-essay-grade-history]");
    if (essayHost) {
      const records = Object.values(APP_STATE.essayResults || {}).filter(record=>candidateScope().some(c=>record.candidate==='NCS. '+c.name)).sort((a, b) => String(b.gradedAt || "").localeCompare(String(a.gradedAt || "")));
      essayHost.innerHTML = records.length ? `<strong>Kết quả đã xác nhận</strong>${records.slice(0, 5).map((record) => `<article><span><b>${escapeHtml(record.candidate)}</b> · ${escapeHtml(record.workTitle)}</span><span>TB ${escapeHtml(record.avg)}/10 · ${record.status === "pass" ? "Đạt" : "Chưa đạt"}</span></article>`).join("")}` : "";
    }
    const topicHost = document.querySelector("[data-topic-grade-history]");
    if (topicHost) {
      const records = Object.values(APP_STATE.topicAssessments || {}).filter(record=>candidateScope().some(c=>record.candidate==='NCS. '+c.name)).sort((a, b) => String(b.gradedAt || "").localeCompare(String(a.gradedAt || "")));
      topicHost.innerHTML = records.length ? `<strong>Kết quả chuyên đề đã xác nhận</strong>${records.slice(0, 8).map((record) => `<article><span><b>${escapeHtml(record.candidate)}</b> · ${escapeHtml(record.topic)}</span><span>${escapeHtml(record.score)}/10 · ${escapeHtml(record.status)}</span></article>`).join("")}` : "";
    }
    const progressHost = document.querySelector("[data-progress-review-history]");
    if (progressHost) {
      const records = Object.values(APP_STATE.progressReviews || {}).filter(record=>candidateScope().some(c=>record.candidate==='NCS. '+c.name)).sort((a, b) => String(b.reviewedAt || "").localeCompare(String(a.reviewedAt || "")));
      progressHost.innerHTML = records.length ? `<strong>Đánh giá tiến độ đã xác nhận</strong>${records.slice(0, 8).map((record) => `<article><span><b>${escapeHtml(record.candidate)}</b> · Kỳ ${record.period}: ${escapeHtml(record.comment)}</span><span>${record.result === "pass" ? "Đạt tiến độ" : "Yêu cầu chỉnh sửa"}</span></article>`).join("")}` : "";
    }
  }

  function requireCandidateReview(name) {
    if (candidateScope().some(candidate => name === 'NCS. ' + candidate.name)) return true;
    notify('Hồ sơ ngoài phạm vi','Vai trò hiện tại chưa được phân công xem hoặc đánh giá nghiên cứu sinh này.');
    return false;
  }

  function renderReports() {
    const cards=[...document.querySelectorAll('#panel-m13 .mgmt-card')];
    const cohortCard=cards.find(card=>card.querySelector('h3')?.textContent.includes('2.'));
    const publicationCard=cards.find(card=>card.querySelector('h3')?.textContent.includes('3.'));
    const renderRows=(card,rows,total)=>{
      if(!card)return;
      const header=card.querySelector('.mgmt-card-header');
      let host=card.querySelector('[data-report-summary]');
      if(!host){host=document.createElement('div');host.dataset.reportSummary='';[...card.children].filter(child=>child!==header).forEach(child=>child.remove());card.append(host);}
      const badge=header.querySelector('.status-pill,.role-pill-badge');if(badge)badge.textContent=total+' bản ghi';
      host.innerHTML=rows.map(([label,count])=>'<p class="report-row"><span>'+escapeHtml(label)+'</span><strong>'+count+'</strong></p>').join('');
    };
    renderRows(cohortCard,[...new Set(APP_STATE.candidates.map(c=>c.cohort))].map(cohort=>[cohort,APP_STATE.candidates.filter(c=>c.cohort===cohort).length]),APP_STATE.candidates.length);
    renderRows(publicationCard,[['Đã thẩm định',APP_STATE.publications.filter(p=>p.verified).length],['Chờ thẩm định',APP_STATE.publications.filter(p=>!p.verified).length]],APP_STATE.publications.length);
  }

  // ===== TÍCH HỢP BACKEND (request_2) =====
  // Khi có phiên đăng nhập thật (backendSession()), hồ sơ, kế hoạch học tập, báo cáo tiến độ, công bố khoa học,
  // đề tài luận án và minh chứng ngoại ngữ được đọc/ghi qua DTMS_API. Không có phiên (chế độ demo, ví dụ tắt
  // API_BASE_URL) thì giao diện giữ nguyên dữ liệu mẫu cục bộ như trước.
  // Token chứa đủ quyền của mọi vai trò, nên đổi vai trò chỉ thay đổi những nút được hiện, không gọi lại API.
  const SERVER = { profile: null, plans: [], reports: [], publications: [], topics: [], certificates: [], loaded: false };
  const SERVER_LOADERS = { profile: "getProfile", plans: "listPlans", reports: "listProgressReports", publications: "listPublications", topics: "listThesisTopics", certificates: "listLanguageCertificates" };
  // Chức năng chưa có API: giữ thông báo "đang phát triển", không mở biểu mẫu rồi lưu cục bộ.
  const UNDER_DEVELOPMENT = {
    "modal-leave-request": "Gửi yêu cầu học vụ",
    "modal-create-change-request": "Gửi yêu cầu học vụ",
    "modal-change-supervisor": "Đề xuất đổi người hướng dẫn",
    "modal-submit-post-defense": "Nộp đơn xét tốt nghiệp"
  };
  // Vai trò giao diện -> cấp duyệt của API kế hoạch (BM trên giao diện là TBM ở backend).
  const PLAN_CAP = { NHD: "NHD", BM: "TBM", PDT: "PDT" };
  // Mã vai trò tác giả gửi lên API (1/2/3 theo thứ tự các lựa chọn trên biểu mẫu).
  const AUTHOR_ROLES = { 1: "Tác giả chính", 2: "Tác giả liên hệ", 3: "Đồng tác giả" };
  const PLAN_CONTENT = /^Mục tiêu: ([\s\S]*)\nSản phẩm đầu ra: ([\s\S]*)\nHạn hoàn thành: ([^\n]*)$/;
  const MUTED = 'style="font-size:0.75rem; color:var(--text-muted);"';
  let openingForEdit = false;
  let syncTicket = 0;

  function byId(id) { return document.getElementById(id); }

  function formatDate(value) {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : "—";
  }

  // 1 = đồng ý, -1 = từ chối, 0/null = chờ (cùng quy ước với backend).
  function approvalPill(value, labels = ["Đã duyệt", "Từ chối", "Chờ duyệt"]) {
    if (value === 1) return `<span class="status-pill is-success">${labels[0]}</span>`;
    if (value === -1) return `<span class="status-pill is-danger">${labels[1]}</span>`;
    return `<span class="status-pill is-warning">${labels[2]}</span>`;
  }

  function serverButton(label, action, id, kind = "btn-mgmt-secondary", extra = "") {
    return `<button type="button" class="btn-mgmt btn-mgmt-sm ${kind}" data-server-action="${action}" data-id="${escapeHtml(id)}" ${extra}>${label}</button>`;
  }

  function fileButton(url, label = "📄 Tệp") {
    if (!url) return `<span ${MUTED}>Chưa có tệp</span>`;
    return `<button type="button" class="btn-mgmt btn-mgmt-sm btn-mgmt-secondary" data-server-action="file-download" data-file-url="${escapeHtml(url)}">${label}</button>`;
  }

  function emptyRow(columns) {
    return `<tr><td colspan="${columns}" style="text-align:center; color:var(--text-muted); padding:18px;">${SERVER.loaded ? "Chưa có dữ liệu." : "Đang tải dữ liệu từ máy chủ…"}</td></tr>`;
  }

  function showServerError(title, error) {
    if (error?.status === 401) return; // phiên hết hạn: giao diện đã chuyển về màn hình đăng nhập
    notify(title, error?.detail || error?.message || "Không thể thực hiện thao tác. Vui lòng thử lại.");
  }

  function showUnderDevelopment(label) {
    notify(label, "Chức năng đang phát triển: máy chủ chưa có API cho thao tác này nên chưa thể gửi.");
  }

  function resetFormUi(form) {
    form.reset();
    form.querySelectorAll(".file-name-display").forEach((hint) => {
      if (hint.dataset.original) { hint.textContent = hint.dataset.original; hint.style.color = ""; }
    });
  }

  function setBusy(form, busy) {
    const button = form.querySelector('[type="submit"]');
    if (button) button.disabled = busy;
  }

  // Gắn vùng hiển thị dữ liệu máy chủ vào panel (tạo một lần, không cần sửa index.html cho từng panel).
  function serverMount(panelId, key, position = "afterBar") {
    let mount = document.querySelector(`[data-server-view="${key}"]`);
    if (mount) return mount;
    const panel = byId(panelId);
    if (!panel) return null;
    mount = document.createElement("div");
    mount.dataset.serverView = key;
    mount.style.marginBottom = "20px";
    mount.hidden = !backendSession();
    if (position === "end") panel.append(mount);
    else {
      const bar = panel.querySelector(":scope > .mgmt-action-bar");
      if (bar) bar.after(mount); else panel.prepend(mount);
    }
    return mount;
  }

  function setDemoHidden(element, hide) {
    if (!element) return;
    if (hide) {
      if (!element.hidden) { element.hidden = true; element.dataset.demoHidden = ""; }
    } else if (element.hasAttribute("data-demo-hidden")) {
      element.hidden = false;
      element.removeAttribute("data-demo-hidden");
    }
  }

  // Có phiên thật thì ẩn các khối dữ liệu mẫu (số liệu giả) và hiện vùng dữ liệu máy chủ; ngược lại thì khôi phục.
  function applyServerMode() {
    const on = backendSession();
    ["panel-m02", "panel-m07"].forEach((panelId) => {
      [...(byId(panelId)?.children || [])].forEach((child) => {
        if (!child.matches(".mgmt-action-bar, [data-server-view]")) setDemoHidden(child, on);
      });
    });
    setDemoHidden([...(byId("panel-m08")?.children || [])].find((child) => child.classList.contains("mgmt-card")), on);
    setDemoHidden([...document.querySelectorAll("#panel-m09 .mgmt-card")].find((card) => card.querySelector("h3")?.textContent.trim().startsWith("1.")), on);
    document.querySelectorAll("[data-server-view]").forEach((mount) => { mount.hidden = !on; });
    const workplace = byId("profile-workplace-input");
    if (workplace) {
      workplace.readOnly = on;
      workplace.title = on ? "Máy chủ chưa lưu nơi công tác; chỉ email và số điện thoại được cập nhật." : "";
    }
  }

  function resetServerData() {
    syncTicket++; // bỏ qua kết quả của lần tải đang chạy dở
    Object.assign(SERVER, { profile: null, plans: [], reports: [], publications: [], topics: [], certificates: [], loaded: false });
    if (initialized) renderServerViews();
  }

  async function syncFromServer() {
    if (!backendSession()) return;
    const ticket = ++syncTicket;
    const entries = Object.entries(SERVER_LOADERS);
    const results = await Promise.allSettled(entries.map(([, loader]) => global.DTMS_API[loader]()));
    if (ticket !== syncTicket || !backendSession()) return; // đã đăng xuất hoặc đổi tài khoản trong lúc tải
    const failures = [];
    results.forEach((result, index) => {
      const key = entries[index][0];
      if (result.status === "fulfilled") { SERVER[key] = result.value; return; }
      const status = result.reason?.status;
      if (status === 401) return;
      // 403/404: vai trò này không có quyền hoặc không có hồ sơ cho mục đó, coi là rỗng.
      if (status === 403 || status === 404) { SERVER[key] = key === "profile" ? null : []; return; }
      failures.push(result.reason?.detail || result.reason?.message || "Lỗi không xác định.");
    });
    SERVER.loaded = true;
    renderServerViews();
    if (failures.length) notify("Không tải được một phần dữ liệu", failures[0]);
  }

  async function reloadServer(key) {
    try { SERVER[key] = await global.DTMS_API[SERVER_LOADERS[key]](); }
    catch (error) {
      if (error?.status !== 401) notify("Đã lưu nhưng chưa làm mới được danh sách", error?.detail || error?.message || "Vui lòng tải lại trang.");
      return;
    }
    renderServerViews();
  }

  function renderServerViews() {
    applyServerMode();
    renderPublicationsTable();
    if (!backendSession()) return;
    renderServerProfile();
    renderServerPlans();
    renderServerReports();
    renderServerTopics();
    renderServerCertificates();
  }

  // ---- Hồ sơ (GET/PUT /api/Profile/me) ----
  function renderServerProfile() {
    const profile = SERVER.profile;
    if (!profile) return;
    const fullName = profile.hoTen || profile.HoTen || sessionUser()?.hoTen || "—";
    const candidateCode = profile.maNcs || profile.MaNcs || "—";
    const majorCode = profile.maNganh || profile.MaNganh || "—";
    const admissionDecision = profile.soQdtrungTuyen || profile.SoQdtrungTuyen || "—";
    const admissionDate = String(profile.ngayNhapHoc || profile.NgayNhapHoc || "").match(/^(\d{4})/);
    const cohort = admissionDate ? `Khóa ${admissionDate[1]}` : "—";
    const displayValues = {
      "profile-display-name": fullName,
      "profile-display-id": candidateCode,
      "profile-display-major": majorCode,
      "profile-display-cohort": cohort,
      "profile-display-decision": admissionDecision,
      "profile-display-workplace": profile.coQuanCongTac || profile.CoQuanCongTac || "—"
    };
    Object.entries(displayValues).forEach(([id, value]) => {
      const element = byId(id);
      if (element) element.textContent = value;
    });
    const profileNameInput = document.querySelector('#form-edit-profile input[readonly]');
    if (profileNameInput) profileNameInput.value = fullName === "—" ? "" : fullName;
    const phone = byId("profile-display-phone");
    const email = byId("profile-display-email");
    if (phone) phone.textContent = profile.soDienThoai || profile.SoDienThoai || "—";
    if (email) email.textContent = profile.email || profile.Email || "—";
    const activeDetails = document.querySelector("#mgmt-active-user-display .active-user-info span");
    if (activeDetails) {
      const workplace = profile.coQuanCongTac || profile.CoQuanCongTac;
      const roleLabels = {
        NCS: "Nghiên cứu sinh", NHD: "Người hướng dẫn khoa học", BM: "Trưởng Bộ môn",
        KHOA: "Ban Chủ nhiệm Khoa", PDT: "Phòng Đào tạo", BGH: "Ban Giám hiệu", HOIDONG: "Hội đồng đánh giá"
      };
      const roleLabel = roleLabels[currentUser.code] || currentUser.code;
      const identityDetails = [roleLabel, cohort !== "—" ? cohort : "", candidateCode !== "—" ? `Mã NCS: ${candidateCode}` : "", workplace || ""].filter(Boolean);
      activeDetails.textContent = identityDetails.join(" · ") || profile.email || profile.Email || "";
    }
  }

  async function submitServerProfile(event) {
    const form = event.target;
    if (!global.DTMS_UI.validate(form)) return;
    const phone = byId("profile-phone-input").value.trim();
    const email = byId("profile-email-input").value.trim();
    if (phone.length > 20) { global.DTMS_UI.fieldError(byId("profile-phone-input"), "Số điện thoại tối đa 20 ký tự."); return; }
    setBusy(form, true);
    try {
      await global.DTMS_API.updateProfile({ email, soDienThoai: phone || null });
      closeModal("modal-edit-profile");
      await reloadServer("profile");
      notify("Hồ sơ đã cập nhật", "Email và số điện thoại đã được lưu trên máy chủ.");
    } catch (error) {
      showServerError("Không cập nhật được hồ sơ", error);
    } finally { setBusy(form, false); }
  }

  // ---- Kế hoạch đào tạo (GET/POST/PUT /api/Kehoachhoctaps, PUT /{id}/duyet) ----
  function renderServerPlans() {
    const mount = serverMount("panel-m02", "plans");
    if (!mount) return;
    const code = currentUser.code;
    const rows = SERVER.plans.map((plan) => {
      const actions = [];
      if (code === "NCS" && plan.duyetNhd !== 1) actions.push(serverButton("Sửa", "plan-edit", plan.maKeHoach));
      if (PLAN_CAP[code]) {
        actions.push(serverButton("✓ Duyệt", "plan-approve", plan.maKeHoach, "btn-mgmt-success", 'data-decision="1"'));
        actions.push(serverButton("✕ Từ chối", "plan-approve", plan.maKeHoach, "btn-mgmt-outline-danger", 'data-decision="-1"'));
      }
      return `<tr>
        <td style="white-space:nowrap;"><strong>${escapeHtml(plan.maNcs)}</strong></td>
        <td>${escapeHtml(plan.namHoc)} · HK${escapeHtml(plan.hocKy)}</td>
        <td style="white-space:pre-line;">${escapeHtml(plan.noiDungKeHoach)}</td>
        <td>${approvalPill(plan.duyetNhd)}${plan.ykienNhd ? `<div ${MUTED}>${escapeHtml(plan.ykienNhd)}</div>` : ""}</td>
        <td>${approvalPill(plan.duyetTbm)}</td>
        <td>${approvalPill(plan.duyetPdt)}</td>
        <td style="white-space:nowrap;">${formatDate(plan.ngayCapNhat)}</td>
        <td><div class="candidate-actions">${actions.join("") || `<span ${MUTED}>—</span>`}</div></td>
      </tr>`;
    }).join("");
    mount.innerHTML = `<div class="mgmt-card">
      <div class="mgmt-card-header"><h3>Kế hoạch học tập</h3><span class="role-pill-badge">${SERVER.plans.length} kế hoạch</span></div>
      <p ${MUTED}>Dữ liệu lấy từ máy chủ. Duyệt theo thứ tự NHD → Bộ môn → Phòng Đào tạo; duyệt sai thứ tự máy chủ sẽ từ chối và báo lý do.</p>
      <div class="mgmt-table-wrapper"><table class="mgmt-table">
        <thead><tr><th>NCS</th><th>Năm học · HK</th><th>Nội dung kế hoạch</th><th>NHD</th><th>Bộ môn</th><th>PĐT</th><th>Cập nhật</th><th>Thao tác</th></tr></thead>
        <tbody>${rows || emptyRow(8)}</tbody>
      </table></div>
    </div>`;
  }

  function openPlanForm(plan) {
    const form = byId("form-edit-plan");
    if (!form) return;
    resetFormUi(form);
    delete form.dataset.editingId;
    const title = form.closest(".mgmt-modal").querySelector(".mgmt-modal-header h3");
    if (title && !title.dataset.original) title.dataset.original = title.textContent;
    if (title) title.textContent = plan ? "Sửa kế hoạch học tập" : title.dataset.original;
    if (plan) {
      form.dataset.editingId = String(plan.maKeHoach);
      form.dataset.maMonHoc = plan.maMonHoc || "";
      byId("plan-year-input").value = plan.namHoc || "";
      const select = byId("plan-semester-select");
      const value = `HK${plan.hocKy}`;
      if (![...select.options].some((option) => option.value === value)) select.add(new Option(`Học kỳ ${plan.hocKy}`, value));
      select.value = value;
      const parts = String(plan.noiDungKeHoach || "").match(PLAN_CONTENT);
      byId("plan-goals-input").value = parts ? parts[1] : plan.noiDungKeHoach || "";
      byId("plan-outputs-input").value = parts ? parts[2] : "—";
      byId("plan-deadline-input").value = parts ? parts[3] : "—";
    }
  }

  async function submitServerPlan(event, form) {
    if (!requireRoles(["NCS"])) return;
    if (!global.DTMS_UI.validate(form)) return;
    const goals = byId("plan-goals-input");
    const content = `Mục tiêu: ${goals.value.trim()}\nSản phẩm đầu ra: ${byId("plan-outputs-input").value.trim()}\nHạn hoàn thành: ${byId("plan-deadline-input").value.trim()}`;
    if (content.length > 500) {
      global.DTMS_UI.fieldError(goals, `Máy chủ chỉ nhận tối đa 500 ký tự cho toàn bộ nội dung kế hoạch (hiện ${content.length}). Hãy rút gọn mục tiêu hoặc sản phẩm đầu ra.`);
      return;
    }
    const body = { namHoc: byId("plan-year-input").value.trim(), hocKy: Number(byId("plan-semester-select").value.match(/\d+/)?.[0]), noiDungKeHoach: content, maMonHoc: form.dataset.maMonHoc || null };
    const editingId = form.dataset.editingId;
    setBusy(form, true);
    try {
      if (editingId) await global.DTMS_API.updatePlan(editingId, body); else await global.DTMS_API.createPlan(body);
      closeModal("modal-edit-plan");
      resetFormUi(form);
      delete form.dataset.editingId;
      await reloadServer("plans");
      notify(editingId ? "Đã cập nhật kế hoạch" : "Đã gửi kế hoạch", "Kế hoạch được lưu trên máy chủ và chuyển sang bước chờ NHD duyệt.");
    } catch (error) {
      showServerError("Không lưu được kế hoạch", error);
    } finally { setBusy(form, false); }
  }

  async function approveServerPlan(id, decision) {
    const cap = PLAN_CAP[currentUser.code];
    if (!cap) { notify("Không đủ quyền thao tác", "Vai trò hiện tại không được duyệt kế hoạch học tập."); return; }
    let ykien = null;
    if (cap === "NHD") {
      const input = global.prompt(decision === 1 ? "Ý kiến của người hướng dẫn (có thể để trống):" : "Lý do từ chối kế hoạch:", "");
      if (input === null) return;
      ykien = input.trim().slice(0, 500) || null;
    }
    try {
      await global.DTMS_API.approvePlan(id, { cap, trangThaiDuyet: decision, ykien });
      await reloadServer("plans");
      notify(decision === 1 ? "Đã duyệt kế hoạch" : "Đã từ chối kế hoạch", `Kết quả cấp ${cap} đã được ghi nhận trên máy chủ.`);
    } catch (error) {
      // 409: chưa đến lượt duyệt (ví dụ Bộ môn duyệt khi NHD chưa duyệt) - hiện đúng thông báo của máy chủ.
      showServerError(error?.status === 409 ? "Chưa đến lượt duyệt" : "Không cập nhật được duyệt kế hoạch", error);
    }
  }

  // ---- Báo cáo tiến độ (File/upload?purpose=baocao + /api/Baocaotiendoes) ----
  function reportResult(report) {
    if (report.danhGiaNhd === 1) return `<span class="status-pill is-success">Đạt tiến độ</span>`;
    if (report.danhGiaNhd === -1) return `<span class="status-pill is-danger">Cần chỉnh sửa</span>`;
    return `<span class="status-pill is-warning">Chưa đánh giá</span>`;
  }

  function renderServerReports() {
    const mount = serverMount("panel-m07", "reports");
    if (!mount) return;
    const canReview = currentUser.code === "NHD";
    const rows = SERVER.reports.map((report) => `<tr>
      <td><strong>${escapeHtml(report.kyBaoCao)}</strong></td>
      <td style="white-space:nowrap;">${escapeHtml(report.maNcs)}</td>
      <td style="white-space:nowrap;">${formatDate(report.hanNop)}</td>
      <td style="white-space:nowrap;">${formatDate(report.ngayNop)}</td>
      <td>${fileButton(report.fileBaoCao, "📄 Báo cáo")}</td>
      <td>${reportResult(report)}${report.trangThaiKhoa ? `<div ${MUTED}>Đã khóa</div>` : ""}</td>
      <td>${report.nhanXetNhd ? escapeHtml(report.nhanXetNhd) : `<span ${MUTED}>—</span>`}</td>
      <td>${canReview && !report.trangThaiKhoa ? serverButton("Đánh giá", "report-review", report.maBaoCao, "btn-mgmt-outline-blue") : `<span ${MUTED}>—</span>`}</td>
    </tr>`).join("");
    mount.innerHTML = `<div class="mgmt-card">
      <div class="mgmt-card-header"><h3>Báo cáo tiến độ</h3><span class="role-pill-badge">${SERVER.reports.length} báo cáo</span></div>
      <p ${MUTED}>Dữ liệu lấy từ máy chủ. Chỉ người hướng dẫn (vai trò NHD) của nghiên cứu sinh mới đánh giá được báo cáo.</p>
      <div class="mgmt-table-wrapper"><table class="mgmt-table">
        <thead><tr><th>Kỳ báo cáo</th><th>NCS</th><th>Hạn nộp</th><th>Ngày nộp</th><th>Tệp</th><th>NHD đánh giá</th><th>Nhận xét</th><th>Thao tác</th></tr></thead>
        <tbody>${rows || emptyRow(8)}</tbody>
      </table></div>
    </div>`;
  }

  async function submitServerProgress(event, form) {
    if (!requireRoles(["NCS"])) return;
    if (!global.DTMS_UI.validate(form)) return;
    const select = byId("progress-period-select");
    const period = select.value;
    const dueDate = select.selectedOptions[0]?.dataset.hanNop;
    const file = byId("progress-file-input").files[0];
    if (!dueDate) { notify("Thiếu hạn nộp", "Kỳ báo cáo đã chọn chưa có hạn nộp; vui lòng chọn kỳ khác."); return; }
    const send = async () => {
      setBusy(form, true);
      try {
        const uploaded = await global.DTMS_API.uploadFile(file, "baocao");
        await global.DTMS_API.createProgressReport({ kyBaoCao: period, hanNop: dueDate, fileBaoCao: uploaded.fileUrl });
        closeModal("modal-submit-progress");
        resetFormUi(form);
        await reloadServer("reports");
        notify("Đã nộp báo cáo tiến độ", `${period} đã được ghi nhận trên máy chủ và chuyển cho NHD đánh giá.`);
      } catch (error) {
        showServerError("Không nộp được báo cáo tiến độ", error);
      } finally { setBusy(form, false); }
    };
    // Máy chủ không chặn nộp trùng kỳ, nên hỏi lại để tránh tạo hai bản ghi cho cùng một kỳ.
    if (SERVER.reports.some((report) => report.kyBaoCao === period)) {
      confirmAction(`Đã có báo cáo ${period} trên hệ thống. Vẫn gửi thêm một bản ghi mới?`, send);
    } else await send();
  }

  // Hộp đánh giá dùng chung với chế độ demo: bản máy chủ ẩn ô chọn NCS (báo cáo đã xác định NCS).
  function prepareReviewModal(serverReport) {
    const form = byId("form-review-progress");
    const candidate = byId("progress-review-candidate");
    if (!form || !candidate) return;
    const group = candidate.closest(".mgmt-form-group");
    if (group) group.hidden = Boolean(serverReport);
    candidate.required = !serverReport;
    if (serverReport) form.dataset.serverReportId = String(serverReport.maBaoCao); else delete form.dataset.serverReportId;
  }

  function openServerReportReview(id) {
    if (!requireRoles(["NHD"])) return;
    const report = SERVER.reports.find((item) => String(item.maBaoCao) === String(id));
    if (!report) return;
    const form = byId("form-review-progress");
    form.reset();
    prepareReviewModal(report);
    byId("progress-review-title").textContent = `Đánh giá báo cáo tiến độ · ${report.kyBaoCao} (${report.maNcs})`;
    if (report.danhGiaNhd === 1) byId("progress-review-result").value = "pass";
    else if (report.danhGiaNhd === -1) byId("progress-review-result").value = "revision";
    byId("progress-review-comment").value = report.nhanXetNhd || "";
    openForEdit("modal-review-progress", () => {});
  }

  async function submitServerProgressReview(event) {
    const form = event.target;
    const id = form.dataset.serverReportId;
    if (!id) return;
    const result = byId("progress-review-result").value;
    const comment = byId("progress-review-comment").value.trim();
    if (!result || !comment) { notify("Thiếu thông tin", "Chọn kết luận và nhập nhận xét trước khi xác nhận."); return; }
    if (comment.length > 1000) { notify("Nhận xét quá dài", "Máy chủ chỉ nhận tối đa 1000 ký tự."); return; }
    setBusy(form, true);
    try {
      await global.DTMS_API.reviewProgressReport(id, { danhGiaNhd: result === "pass" ? 1 : -1, nhanXetNhd: comment });
      closeModal("modal-review-progress");
      await reloadServer("reports");
      notify("Đã lưu đánh giá", result === "pass" ? "Báo cáo được ghi nhận đạt tiến độ." : "Đã yêu cầu nghiên cứu sinh chỉnh sửa báo cáo.");
    } catch (error) {
      showServerError("Không lưu được đánh giá", error);
    } finally { setBusy(form, false); }
  }

  // ---- Công bố khoa học (GET/POST/PUT /api/Congbokhoahocs, PUT /{id}/duyet) ----
  function renderServerPublicationsTable(tbody) {
    const code = currentUser.code;
    const canVerify = code === "PDT" || code === "NHD";
    tbody.innerHTML = SERVER.publications.map((pub) => {
      const actions = [fileButton(pub.fileMinhChung, "📄 Minh chứng")];
      if (code === "NCS" && pub.trangThaiDuyet !== 1) actions.push(serverButton("Sửa", "pub-edit", pub.maCongBo));
      if (canVerify) {
        if (pub.trangThaiDuyet !== 1) actions.push(serverButton("✓ Thẩm định", "pub-approve", pub.maCongBo, "btn-mgmt-success", 'data-decision="1"'));
        if (pub.trangThaiDuyet !== -1) actions.push(serverButton("✕ Từ chối", "pub-approve", pub.maCongBo, "btn-mgmt-outline-danger", 'data-decision="-1"'));
      }
      return `<tr>
        <td><strong>${escapeHtml(pub.tenBaiBao)}</strong><br/><span ${MUTED}>DOI: ${escapeHtml(pub.linkDoi || "—")} · NCS ${escapeHtml(pub.maNcs)}</span></td>
        <td>${escapeHtml(pub.tenTapChi)}</td>
        <td><span class="status-pill is-blue">${escapeHtml(pub.phanLoai)}</span></td>
        <td>${escapeHtml(AUTHOR_ROLES[pub.vaiTroTacGia] || "—")}${pub.coTenNhd ? `<div ${MUTED}>Có tên NHD</div>` : ""}</td>
        <td>${approvalPill(pub.trangThaiDuyet, ["✓ Đã thẩm định hợp lệ", "Không đạt thẩm định", "Chờ PĐT/NHD thẩm định"])}</td>
        <td><div class="candidate-actions">${actions.join("")}</div></td>
      </tr>`;
    }).join("") || emptyRow(6);
    const badge = byId("pub-total-score-display");
    if (badge) {
      const approved = SERVER.publications.filter((pub) => pub.trangThaiDuyet === 1).length;
      badge.textContent = `${approved} / ${SERVER.publications.length} công bố đã thẩm định`;
      badge.className = approved ? "status-pill is-success" : "status-pill is-warning";
    }
  }

  function editServerPublication(id) {
    if (!requireRoles(["NCS"])) return;
    const pub = SERVER.publications.find((item) => String(item.maCongBo) === String(id));
    if (!pub || pub.trangThaiDuyet === 1) return;
    const form = byId("form-declare-pub");
    resetFormUi(form);
    form.dataset.editingId = String(pub.maCongBo);
    form.dataset.fileUrl = pub.fileMinhChung || "";
    byId("pub-title-input").value = pub.tenBaiBao || "";
    byId("pub-journal-input").value = pub.tenTapChi || "";
    const category = byId("pub-cat-select");
    if (![...category.options].some((option) => option.value === pub.phanLoai)) category.add(new Option(pub.phanLoai, pub.phanLoai));
    category.value = pub.phanLoai;
    byId("pub-doi-input").value = pub.linkDoi || "";
    byId("pub-author-role-select").value = String(pub.vaiTroTacGia || 1);
    byId("pub-has-supervisor-input").checked = Boolean(pub.coTenNhd);
    byId("pub-affiliation-input").checked = Boolean(pub.diaChiTruong);
    openForEdit("modal-declare-pub", () => {});
  }

  async function submitServerPublication(event) {
    const form = event.target;
    const title = byId("pub-title-input").value.trim();
    const journal = byId("pub-journal-input").value.trim();
    const doi = byId("pub-doi-input").value.trim();
    const file = byId("pub-file-input").files[0];
    const editingId = form.dataset.editingId;
    if (!title || !journal || !/^10\.\d{4,9}\/\S+$/i.test(doi)) {
      notify("Thông tin chưa hợp lệ", "Nhập tiêu đề, tạp chí và DOI đúng định dạng trước khi khai báo.");
      return;
    }
    if (title.length > 500 || journal.length > 300 || doi.length > 255) {
      notify("Thông tin quá dài", "Tên bài báo tối đa 500 ký tự, tên tạp chí 300 ký tự, DOI 255 ký tự.");
      return;
    }
    if (!editingId && !file) { notify("Thiếu minh chứng", "Chọn tệp bài báo hoặc thư chấp nhận trước khi gửi khai báo."); return; }
    if (SERVER.publications.some((pub) => String(pub.maCongBo) !== editingId && (pub.linkDoi || "").toLowerCase() === doi.toLowerCase())) {
      global.DTMS_UI.fieldError(byId("pub-doi-input"), "DOI đã có trong danh sách công bố.");
      return;
    }
    setBusy(form, true);
    try {
      let fileUrl = form.dataset.fileUrl || "";
      if (file) fileUrl = (await global.DTMS_API.uploadFile(file, "minhchung")).fileUrl;
      const body = {
        tenBaiBao: title, tenTapChi: journal, phanLoai: byId("pub-cat-select").value, linkDoi: doi,
        vaiTroTacGia: Number(byId("pub-author-role-select").value), coTenNhd: byId("pub-has-supervisor-input").checked,
        diaChiTruong: byId("pub-affiliation-input").checked, fileMinhChung: fileUrl
      };
      if (editingId) await global.DTMS_API.updatePublication(editingId, body); else await global.DTMS_API.createPublication(body);
      closeModal("modal-declare-pub");
      resetFormUi(form);
      delete form.dataset.editingId;
      delete form.dataset.fileUrl;
      await reloadServer("publications");
      notify(editingId ? "Đã cập nhật công bố" : "Đã gửi khai báo", "Công bố được lưu trên máy chủ và chờ NHD/PĐT thẩm định.");
    } catch (error) {
      showServerError("Không lưu được công bố", error);
    } finally { setBusy(form, false); }
  }

  async function approveServerPublication(id, decision) {
    try {
      await global.DTMS_API.approvePublication(id, decision);
      await reloadServer("publications");
      notify(decision === 1 ? "Đã thẩm định hợp lệ" : "Đã từ chối công bố", "Kết quả thẩm định đã được lưu trên máy chủ.");
    } catch (error) {
      showServerError("Không cập nhật được thẩm định", error);
    }
  }

  // ---- Đề tài luận án (GET/POST/PUT /api/Detailuanans; tệp purpose=luanan, tối đa 50MB) ----
  function renderServerTopics() {
    const mount = serverMount("panel-m09", "topics");
    if (!mount) return;
    const isNcs = currentUser.code === "NCS";
    const rows = SERVER.topics.map((topic) => `<tr>
      <td><strong>${escapeHtml(topic.tenDeTaiVn)}</strong><div ${MUTED}>${escapeHtml(topic.tenDeTaiEn)}</div><div ${MUTED}>NCS ${escapeHtml(topic.maNcs)}${topic.soQddieuChinh ? ` · QĐ điều chỉnh ${escapeHtml(topic.soQddieuChinh)}` : ""}</div></td>
      <td>${escapeHtml(topic.lanChinhSua ?? 0)}</td>
      <td>${topic.trangThaiKhoa ? `<span class="status-pill is-purple">Đã khóa</span>` : `<span class="status-pill is-blue">Đang mở</span>`}</td>
      <td><div class="candidate-actions">${fileButton(topic.fileToanVan, "📄 Toàn văn")}${fileButton(topic.fileTomTat, "📄 Tóm tắt")}</div></td>
      <td>${isNcs && !topic.trangThaiKhoa ? serverButton("Sửa", "topic-edit", topic.maDeTai) : `<span ${MUTED}>—</span>`}</td>
    </tr>`).join("");
    mount.innerHTML = `<div class="mgmt-card">
      <div class="mgmt-card-header"><h3>Đề tài luận án</h3>${isNcs ? serverButton("+ Đăng ký đề tài", "topic-new", "", "btn-mgmt-primary") : `<span class="role-pill-badge">${SERVER.topics.length} đề tài</span>`}</div>
      <p ${MUTED}>Dữ liệu lấy từ máy chủ. Đề tài bị khóa thì nghiên cứu sinh không sửa được. Tệp luận án tối đa 50MB (PDF/Word).</p>
      <div class="mgmt-table-wrapper"><table class="mgmt-table">
        <thead><tr><th>Tên đề tài</th><th>Lần chỉnh sửa</th><th>Trạng thái</th><th>Tệp</th><th>Thao tác</th></tr></thead>
        <tbody>${rows || emptyRow(5)}</tbody>
      </table></div>
    </div>`;
  }

  function openTopicForm(topic) {
    const form = byId("form-thesis-topic");
    if (!form) return;
    resetFormUi(form);
    delete form.dataset.editingId;
    form.dataset.fullTextUrl = "";
    form.dataset.summaryUrl = "";
    byId("thesis-topic-modal-title").textContent = topic ? "Cập nhật đề tài luận án" : "Đăng ký đề tài luận án";
    byId("thesis-topic-file-note").hidden = !topic;
    if (topic) {
      form.dataset.editingId = String(topic.maDeTai);
      form.dataset.fullTextUrl = topic.fileToanVan || "";
      form.dataset.summaryUrl = topic.fileTomTat || "";
      byId("thesis-title-vn-input").value = topic.tenDeTaiVn || "";
      byId("thesis-title-en-input").value = topic.tenDeTaiEn || "";
      byId("thesis-decision-input").value = topic.soQddieuChinh || "";
    }
  }

  async function submitServerThesisTopic(event, form) {
    if (!requireRoles(["NCS"])) return;
    if (!global.DTMS_UI.validate(form)) return;
    const editingId = form.dataset.editingId;
    const fullText = byId("thesis-fulltext-input").files[0];
    const summary = byId("thesis-summary-input").files[0];
    setBusy(form, true);
    try {
      // Tệp mới thì tải lên trước (purpose=luanan); không chọn thì giữ nguyên tệp đã nộp.
      const fileToanVan = fullText ? (await global.DTMS_API.uploadFile(fullText, "luanan")).fileUrl : form.dataset.fullTextUrl || null;
      const fileTomTat = summary ? (await global.DTMS_API.uploadFile(summary, "luanan")).fileUrl : form.dataset.summaryUrl || null;
      const body = {
        tenDeTaiVn: byId("thesis-title-vn-input").value.trim(), tenDeTaiEn: byId("thesis-title-en-input").value.trim(),
        soQddieuChinh: byId("thesis-decision-input").value.trim() || null, fileToanVan, fileTomTat
      };
      if (editingId) await global.DTMS_API.updateThesisTopic(editingId, body); else await global.DTMS_API.createThesisTopic(body);
      closeModal("modal-thesis-topic");
      resetFormUi(form);
      delete form.dataset.editingId;
      await reloadServer("topics");
      notify(editingId ? "Đã cập nhật đề tài" : "Đã đăng ký đề tài", "Đề tài luận án đã được lưu trên máy chủ.");
    } catch (error) {
      showServerError("Không lưu được đề tài", error);
    } finally { setBusy(form, false); }
  }

  // ---- Minh chứng ngoại ngữ (GET/POST/PUT /api/Chungchingoaingus, PUT /{id}/duyet; tệp purpose=minhchung) ----
  function renderServerCertificates() {
    const mount = serverMount("panel-m01", "certificates", "end");
    if (!mount) return;
    const code = currentUser.code;
    const rows = SERVER.certificates.map((cert) => {
      const actions = [];
      if (code === "NCS" && cert.trangThaiDuyet !== 1) actions.push(serverButton("Sửa", "cert-edit", cert.maChungChi));
      if (code === "PDT") {
        if (cert.trangThaiDuyet !== 1) actions.push(serverButton("✓ Duyệt", "cert-approve", cert.maChungChi, "btn-mgmt-success", 'data-decision="1"'));
        if (cert.trangThaiDuyet !== -1) actions.push(serverButton("✕ Từ chối", "cert-approve", cert.maChungChi, "btn-mgmt-outline-danger", 'data-decision="-1"'));
      }
      return `<tr>
        <td><strong>${escapeHtml(cert.tenChungChi)}</strong><div ${MUTED}>NCS ${escapeHtml(cert.maNcs)}</div></td>
        <td>${escapeHtml(cert.diemSo)}</td>
        <td style="white-space:nowrap;">${formatDate(cert.ngayCap)}</td>
        <td style="white-space:nowrap;">${formatDate(cert.ngayHetHan)}</td>
        <td>${escapeHtml(cert.noiCap)}</td>
        <td>${fileButton(cert.fileMinhChung, "📄 Minh chứng")}</td>
        <td>${approvalPill(cert.trangThaiDuyet, ["Đã duyệt", "Không đạt", "Chờ PĐT duyệt"])}</td>
        <td><div class="candidate-actions">${actions.join("") || `<span ${MUTED}>—</span>`}</div></td>
      </tr>`;
    }).join("");
    mount.innerHTML = `<div class="mgmt-card">
      <div class="mgmt-card-header"><h3>Minh chứng ngoại ngữ</h3>${code === "NCS" ? serverButton("+ Nộp minh chứng", "cert-new", "", "btn-mgmt-primary") : `<span class="role-pill-badge">${SERVER.certificates.length} minh chứng</span>`}</div>
      <p ${MUTED}>Dữ liệu lấy từ máy chủ. Nghiên cứu sinh nộp, Phòng Đào tạo duyệt; minh chứng đã duyệt thì không sửa được.</p>
      <div class="mgmt-table-wrapper"><table class="mgmt-table">
        <thead><tr><th>Chứng chỉ</th><th>Điểm / bậc</th><th>Ngày cấp</th><th>Hết hạn</th><th>Nơi cấp</th><th>Minh chứng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>${rows || emptyRow(8)}</tbody>
      </table></div>
    </div>`;
  }

  function openCertificateForm(cert) {
    const form = byId("form-language-cert");
    if (!form) return;
    resetFormUi(form);
    delete form.dataset.editingId;
    form.dataset.fileUrl = "";
    byId("language-cert-modal-title").textContent = cert ? "Cập nhật minh chứng ngoại ngữ" : "Nộp minh chứng ngoại ngữ";
    byId("language-cert-file-note").hidden = !cert;
    byId("cert-file-input").required = !cert; // sửa mà không chọn tệp mới thì giữ tệp cũ
    if (cert) {
      form.dataset.editingId = String(cert.maChungChi);
      form.dataset.fileUrl = cert.fileMinhChung || "";
      byId("cert-name-input").value = cert.tenChungChi || "";
      byId("cert-score-input").value = cert.diemSo || "";
      byId("cert-issued-input").value = String(cert.ngayCap || "").slice(0, 10);
      byId("cert-expiry-input").value = String(cert.ngayHetHan || "").slice(0, 10);
      byId("cert-issuer-input").value = cert.noiCap || "";
    }
  }

  async function submitServerCertificate(event, form) {
    if (!requireRoles(["NCS"])) return;
    if (!global.DTMS_UI.validate(form)) return;
    const issued = byId("cert-issued-input").value;
    const expiry = byId("cert-expiry-input").value;
    if (expiry && expiry < issued) { global.DTMS_UI.fieldError(byId("cert-expiry-input"), "Ngày hết hạn phải sau ngày cấp."); return; }
    const editingId = form.dataset.editingId;
    const file = byId("cert-file-input").files[0];
    setBusy(form, true);
    try {
      const fileMinhChung = file ? (await global.DTMS_API.uploadFile(file, "minhchung")).fileUrl : form.dataset.fileUrl || "";
      const body = {
        tenChungChi: byId("cert-name-input").value.trim(), diemSo: byId("cert-score-input").value.trim(),
        ngayCap: issued, ngayHetHan: expiry || null, noiCap: byId("cert-issuer-input").value.trim(), fileMinhChung
      };
      if (editingId) await global.DTMS_API.updateLanguageCertificate(editingId, body); else await global.DTMS_API.createLanguageCertificate(body);
      closeModal("modal-language-cert");
      resetFormUi(form);
      delete form.dataset.editingId;
      await reloadServer("certificates");
      notify(editingId ? "Đã cập nhật minh chứng" : "Đã nộp minh chứng", "Minh chứng ngoại ngữ đã được lưu trên máy chủ và chờ Phòng Đào tạo duyệt.");
    } catch (error) {
      showServerError("Không lưu được minh chứng", error);
    } finally { setBusy(form, false); }
  }

  async function approveServerCertificate(id, decision) {
    if (!requireRoles(["PDT"])) return;
    try {
      await global.DTMS_API.approveLanguageCertificate(id, decision);
      await reloadServer("certificates");
      notify(decision === 1 ? "Đã duyệt minh chứng" : "Đã từ chối minh chứng", "Kết quả đã được lưu trên máy chủ.");
    } catch (error) {
      showServerError("Không cập nhật được duyệt minh chứng", error);
    }
  }

  // ---- Tệp: chỉ tải được khi có token nên tải về dạng blob rồi lưu ----
  async function downloadServerFile(fileUrl) {
    try {
      const { blob, fileName } = await global.DTMS_API.downloadFile(fileUrl);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (error) {
      showServerError("Không tải được tệp", error);
    }
  }

  // Mở biểu mẫu ở chế độ sửa: openModal không đặt lại biểu mẫu về trạng thái "tạo mới" khi cờ này bật.
  function openForEdit(modalId, prepare) {
    openingForEdit = true;
    try { prepare(); openModal(modalId); } finally { openingForEdit = false; }
  }

  // Mở biểu mẫu "tạo mới" (không phải sửa): xóa trạng thái sửa còn sót lại của lần mở trước.
  function prepareFreshServerForm(modalId) {
    if (modalId === "modal-edit-plan") openPlanForm(null);
    else if (modalId === "modal-thesis-topic") openTopicForm(null);
    else if (modalId === "modal-language-cert") openCertificateForm(null);
    else if (modalId === "modal-review-progress") prepareReviewModal(null);
    else if (modalId === "modal-declare-pub") { const form = byId("form-declare-pub"); delete form.dataset.editingId; delete form.dataset.fileUrl; }
  }

  // "Upload phiên bản luận án mới" ghi vào đề tài luận án (tệp toàn văn, purpose=luanan, tối đa 50MB).
  function openThesisUpload() {
    if (!requireRoles(["NCS"])) return;
    const topic = [...SERVER.topics].sort((a, b) => b.maDeTai - a.maDeTai)[0];
    if (!topic) {
      notify("Chưa có đề tài", "Hãy đăng ký đề tài luận án trước, rồi đính kèm tệp toàn văn.");
      openModal("modal-thesis-topic");
      return;
    }
    if (topic.trangThaiKhoa) { notify("Đề tài đã khóa", "Đề tài luận án đã bị khóa nên không thể tải thêm tệp."); return; }
    openForEdit("modal-thesis-topic", () => openTopicForm(topic));
  }

  const SERVER_FORMS = {
    "form-edit-plan": submitServerPlan,
    "form-submit-progress": submitServerProgress,
    "form-thesis-topic": submitServerThesisTopic,
    "form-language-cert": submitServerCertificate
  };

  function handleServerClick(event) {
    const button = event.target.closest("[data-server-action]");
    if (!button || button.disabled) return;
    const { serverAction: action, id, decision, fileUrl } = button.dataset;
    const find = (list, key) => list.find((item) => String(item[key]) === String(id));
    if (action === "file-download") downloadServerFile(fileUrl);
    else if (action === "plan-edit") { const plan = find(SERVER.plans, "maKeHoach"); if (plan && requireRoles(["NCS"])) openForEdit("modal-edit-plan", () => openPlanForm(plan)); }
    else if (action === "plan-approve") approveServerPlan(id, Number(decision));
    else if (action === "report-review") openServerReportReview(id);
    else if (action === "pub-edit") editServerPublication(id);
    else if (action === "pub-approve") approveServerPublication(id, Number(decision));
    else if (action === "topic-new") openModal("modal-thesis-topic");
    else if (action === "topic-edit") { const topic = find(SERVER.topics, "maDeTai"); if (topic) openForEdit("modal-thesis-topic", () => openTopicForm(topic)); }
    else if (action === "cert-new") openModal("modal-language-cert");
    else if (action === "cert-edit") { const cert = find(SERVER.certificates, "maChungChi"); if (cert) openForEdit("modal-language-cert", () => openCertificateForm(cert)); }
    else if (action === "cert-approve") approveServerCertificate(id, Number(decision));
  }

  function initServerIntegration() {
    document.addEventListener("click", handleServerClick);
    // Token hết hạn hoặc bị thu hồi khi đang dùng: về màn hình đăng nhập.
    global.addEventListener("dtms:unauthorized", () => {
      if (global.DTMS_DATA.getString(SESSION_USER_KEY, "")) logout("expired");
    });
    renderServerViews();
    if (backendSession()) syncFromServer();
  }

  // EXPORT GLOBAL API
  global.DTMS_MANAGEMENT = {
    init: initManagement,
    logout, showIntegrationInfo, queueReminder, printProfile,
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
    openWorkspace,
    resetWorkspaceData,
    // Tương thích với lời gọi từ các bản cũ; giao diện dùng resetWorkspaceData.
    resetDemoData: resetWorkspaceData
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initManagement);
  } else {
    initManagement();
  }

})(window);
