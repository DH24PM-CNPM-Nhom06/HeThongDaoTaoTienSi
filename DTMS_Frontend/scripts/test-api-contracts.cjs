// Kiểm thử hợp đồng API (Giai đoạn 2): DTMS_API gọi đúng URL + body theo DOCX/backend.
// Chạy: node scripts/test-api-contracts.cjs  (không cần backend thật — fetch được giả lập).
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
let passed = 0, failed = 0;
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log("  ✓ " + name); }
  else { failed++; console.log("  ✗ " + name + (extra ? " — " + extra : "")); }
}

// ---------- Giả lập trình duyệt tối thiểu ----------
const calls = [];
const store = new Map([["jwt_token", "fake-token"]]);
const sandbox = {
  console,
  AbortController,
  setTimeout: (fn) => 0,
  clearTimeout: () => {},
  URLSearchParams,
  FormData: class { constructor() { this.parts = []; } append(k, v) { this.parts.push([k, v]); } },
  CustomEvent: class { constructor(type) { this.type = type; } },
  dispatchEvent: () => true,
  fetch: async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", headers: options.headers || {}, body: options.body || null });
    const isXlsx = String(url).includes("/canhbao/xuat");
    const headers = {
      get: (name) => {
        if (name.toLowerCase() === "content-disposition") return 'attachment; filename="canhbao_hocvu_20261114.xlsx"';
        return isXlsx ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/json";
      },
    };
    if (String(url).includes("/conflict")) {
      return { status: 409, ok: false, headers, json: async () => ({ success: false, message: "Đã có điểm cho môn học này." }) };
    }
    if (String(url).includes("/no-content")) {
      return { status: 204, ok: true, headers, json: async () => null };
    }
    return {
      status: 200, ok: true, headers,
      json: async () => [{ maNcs: "NCS01" }],
      blob: async () => Buffer.from("xlsx-bytes"),
    };
  },
};
sandbox.window = sandbox;
sandbox.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
sandbox.DTMS_RUNTIME_CONFIG = { API_BASE_URL: "https://localhost:7143" };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "js/core/config.js"), "utf8"), sandbox, { filename: "config.js" });
vm.runInContext(fs.readFileSync(path.join(root, "js/core/api.js"), "utf8"), sandbox, { filename: "api.js" });
const API = sandbox.DTMS_API;

function lastCall() { return calls[calls.length - 1]; }
function bodyOf(call) { try { return JSON.parse(call.body); } catch { return null; } }

(async () => {
  console.log("== URL + body của các API Giai đoạn 2 ==");
  await API.listScores();
  check("GET /api/Ketquahocphans", lastCall().url === "https://localhost:7143/api/Ketquahocphans" && lastCall().headers.Authorization === "Bearer fake-token");
  await API.createScore({ maNcs: "NCS01", maMonHoc: "ENV801", diemChuyenCan: 9, diemGiuaKy: 8, diemThiCuoiKy: 8.5 });
  check("POST /api/Ketquahocphans không gửi DiemTongKet (backend tự tính)", lastCall().method === "POST" && !("diemTongKet" in bodyOf(lastCall())) && bodyOf(lastCall()).diemThiCuoiKy === 8.5);
  await API.lockScore(7);
  check("PUT /api/Ketquahocphans/7/khoa", lastCall().url.endsWith("/api/Ketquahocphans/7/khoa") && lastCall().method === "PUT");
  await API.unlockScore(7);
  check("PUT /api/Ketquahocphans/7/mo-khoa", lastCall().url.endsWith("/api/Ketquahocphans/7/mo-khoa"));
  await API.registerCourse({ maMonHoc: "ENV801", namHoc: "2025-2026", hocKy: 1, loaiHocPhan: "BAT_BUOC" });
  check("POST /api/Dangkyhocphan", lastCall().url.endsWith("/api/Dangkyhocphan") && bodyOf(lastCall()).loaiHocPhan === "BAT_BUOC");
  await API.listRegistrations("2025-2026", 1);
  check("GET /api/Dangkyhocphan?namHoc=2025-2026&hocKy=1", lastCall().url === "https://localhost:7143/api/Dangkyhocphan?namHoc=2025-2026&hocKy=1");
  await API.listRegistrationPeriods();
  check("GET /api/Dangkyhocphan/dot", lastCall().url.endsWith("/api/Dangkyhocphan/dot"));
  await API.createRegistrationPeriod({ namHoc: "2025-2026", hocKy: 1, tuNgay: "2026-01-01", denNgay: "2026-01-31" });
  check("POST /api/Dangkyhocphan/dot", lastCall().method === "POST");
  await API.createRequest({ loaiYeuCau: "GIA_HAN", noiDung: "Xin gia hạn", soThangGiaHan: 6 });
  check("POST /api/Yeucauhocvu (GIA_HAN 6 tháng)", lastCall().url.endsWith("/api/Yeucauhocvu") && bodyOf(lastCall()).soThangGiaHan === 6);
  await API.getRequestDetail(5);
  check("GET /api/Yeucauhocvu/5 (kèm bước duyệt)", lastCall().url.endsWith("/api/Yeucauhocvu/5"));
  await API.approveRequest(5, { trangThai: 1, yKien: null });
  check("PUT /api/Yeucauhocvu/5/duyet {trangThai:1}", lastCall().method === "PUT" && bodyOf(lastCall()).trangThai === 1);
  await API.createAssessment({ maNcs: "NCS01", loaiDanhGia: "TIEU_LUAN", tenNoiDung: "Tiểu luận tổng quan", maHoiDong: 12, diemTrungBinh: 8.2, ketLuan: 1 });
  check("POST /api/Danhgiagiaidoan (TIEU_LUAN, ketLuan 1)", lastCall().url.endsWith("/api/Danhgiagiaidoan") && bodyOf(lastCall()).loaiDanhGia === "TIEU_LUAN" && bodyOf(lastCall()).maHoiDong === 12);
  await API.listAssessments("NCS01");
  check("GET /api/Danhgiagiaidoan?maNcs=NCS01", lastCall().url.endsWith("/api/Danhgiagiaidoan?maNcs=NCS01"));
  await API.listSubjects();
  check("GET /api/Monhocs", lastCall().url.endsWith("/api/Monhocs"));
  await API.listMajors();
  check("GET /api/Nganhdaotaos", lastCall().url.endsWith("/api/Nganhdaotaos"));
  await API.listCtdt("CNTT");
  check("GET /api/Ctdt?maNganh=CNTT", lastCall().url.endsWith("/api/Ctdt?maNganh=CNTT"));
  await API.getComparison("NCS01");
  check("GET /api/Doichieu/NCS01", lastCall().url.endsWith("/api/Doichieu/NCS01"));
  await API.listWarnings();
  check("GET /api/Hocvu/canhbao", lastCall().url.endsWith("/api/Hocvu/canhbao"));
  await API.getStats();
  check("GET /api/Hocvu/thongke", lastCall().url.endsWith("/api/Hocvu/thongke"));
  const xlsx = await API.exportWarnings();
  check("GET /api/Hocvu/canhbao/xuat trả blob + tên file từ Content-Disposition", lastCall().url.endsWith("/api/Hocvu/canhbao/xuat") && xlsx.fileName === "canhbao_hocvu_20261114.xlsx" && Buffer.isBuffer(xlsx.blob));
  await API.getGraduationReview();
  check("GET /api/Totnghiep/xet", lastCall().url.endsWith("/api/Totnghiep/xet"));
  await API.approveGraduationBulk({ maNcs: ["NCS01", "NCS02"] });
  check("POST /api/Totnghiep/duyet-hang-loat {maNcs:[...]}", lastCall().method === "POST" && bodyOf(lastCall()).maNcs.length === 2);
  await API.checkCouncil(12);
  check("GET /api/Hoidongtruong/12/kiem-tra", lastCall().url.endsWith("/api/Hoidongtruong/12/kiem-tra"));
  await API.castVote(12, true);
  check("POST /api/Hoidongtruong/12/bo-phieu {dongY:true}", lastCall().method === "POST" && bodyOf(lastCall()).dongY === true);
  await API.getCouncilResult(12);
  check("GET /api/Hoidongtruong/12/ket-qua", lastCall().url.endsWith("/api/Hoidongtruong/12/ket-qua"));
  await API.listReviewers();
  check("GET /api/Phanbiendoclaps", lastCall().url.endsWith("/api/Phanbiendoclaps"));
  await API.updateReviewerComment(3, { ketQua: 1, fileNhanXet: null });
  check("PUT /api/Phanbiendoclaps/3/nhanxet {ketQua:1}", lastCall().method === "PUT" && bodyOf(lastCall()).ketQua === 1);
  await API.getDegreeStatus("NCS01");
  check("GET /api/Capbang/NCS01", lastCall().url.endsWith("/api/Capbang/NCS01"));
  await API.submitExplanation("NCS01", "/api/File/abc.pdf");
  check("POST /api/Capbang/NCS01/giai-trinh {fileUrl}", lastCall().method === "POST" && bodyOf(lastCall()).fileUrl === "/api/File/abc.pdf");
  await API.recordDeposit("NCS01", { bienNhanTvqg: "NL-1", bienNhanTvtruong: "BN-1" });
  check("POST /api/Capbang/NCS01/luu-chieu", lastCall().url.endsWith("/api/Capbang/NCS01/luu-chieu"));
  await API.publishThesis("NCS01");
  check("POST /api/Capbang/NCS01/cong-khai", lastCall().url.endsWith("/api/Capbang/NCS01/cong-khai"));
  await API.conferDegree("NCS01", { soQdCapBang: "128/QĐ-ĐHAG", soHieuBang: "TS-1", soVaoSoGoc: "SG-1" });
  check("PUT /api/Capbang/NCS01/cap-bang đủ 3 số", lastCall().method === "PUT" && bodyOf(lastCall()).soHieuBang === "TS-1");
  await API.importCandidates([{ maNcs: "NCS99", hoTen: "Test", email: "t@x.vn" }]);
  check("POST /api/NcsImport nhận mảng JSON", lastCall().method === "POST" && Array.isArray(bodyOf(lastCall())));
  await API.listCandidates();
  check("GET /api/Nghiencuusinhs", lastCall().url.endsWith("/api/Nghiencuusinhs"));
  await API.listLecturers();
  check("GET /api/Giangviens", lastCall().url.endsWith("/api/Giangviens"));
  await API.createAssignment({ maNcs: "NCS01", maGv: "GV01", vaiTro: 1, soQuyetDinh: "450/QĐ-ĐHAG", ngayHieuLuc: "2026-01-01", trangThai: true });
  check("POST /api/Phanconghuongdans {vaiTro:1}", lastCall().method === "POST" && bodyOf(lastCall()).vaiTro === 1);
  await API.listFluctuations();
  check("GET /api/Biendonghocvus", lastCall().url.endsWith("/api/Biendonghocvus"));

  console.log("== Lỗi máy chủ được giữ nguyên thông báo ==");
  const conflictFetch = sandbox.fetch;
  sandbox.fetch = async (url, options = {}) => ({
    status: 409, ok: false,
    headers: { get: () => "application/json" },
    json: async () => ({ success: false, message: "NCS này đã có điểm cho môn học này. Hãy sửa bản ghi hiện có." }),
  });
  try {
    await API.createScore({ maNcs: "NCS01", maMonHoc: "ENV801", diemChuyenCan: 9, diemGiuaKy: 8, diemThiCuoiKy: 8 });
    check("409 trả đúng thông báo của máy chủ", false);
  } catch (error) {
    check("409 trả đúng thông báo của máy chủ", error.status === 409 && String(error.detail || error.message).includes("đã có điểm"));
  }
  sandbox.fetch = conflictFetch;

  console.log("== Đối chiếu management.js ↔ index.html ↔ api.js ==");
  const mgmt = fs.readFileSync(path.join(root, "js/modules/management.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const apiSrc = fs.readFileSync(path.join(root, "js/core/api.js"), "utf8");
  // Mọi id mà code đọc qua byId()/getElementById() phải tồn tại trong index.html
  // hoặc được chính management.js tạo trong mount (id="..." trong template).
  const ids = new Set([...mgmt.matchAll(/byId\("([^"]+)"\)/g)].map(m => m[1])
    .concat([...mgmt.matchAll(/getElementById\("([^"]+)"\)/g)].map(m => m[1])));
  const missingIds = [...ids].filter(id => !html.includes(`id="${id}"`) && !mgmt.includes(`id="${id}"`));
  check("Mọi id đọc từ JS đều có trong index.html hoặc do mount tạo ra", missingIds.length === 0, missingIds.join(", "));
  // Mọi DTMS_API.xxx mà management.js gọi phải tồn tại trong api.js.
  const apiCalls = new Set([...mgmt.matchAll(/DTMS_API\.([A-Za-z]+)/g)].map(m => m[1]));
  const apiDefs = new Set([...apiSrc.matchAll(/^\s{4}([A-Za-z]+):/gm)].map(m => m[1])
    .concat([...apiSrc.matchAll(/(?:async )?function ([A-Za-z]+)\(/g)].map(m => m[1])));
  const missingApi = [...apiCalls].filter(name => !apiDefs.has(name));
  check("Mọi DTMS_API.xxx gọi từ management.js đều được định nghĩa", missingApi.length === 0, missingApi.join(", "));
  // Mọi data-server-action trong JS phải có nhánh xử lý trong handleServerClick.
  const actions = new Set([...mgmt.matchAll(/"([a-z-]+)",\s*(?:"[a-z-]+")?\)/g)].map(m => m[1]));
  const dispatchSrc = mgmt.slice(mgmt.indexOf("function handleServerClick"));
  const missingActions = [...new Set([...mgmt.matchAll(/serverButton\("[^"]+", "([a-z-]+)"/g)].map(m => m[1])
    .concat([...mgmt.matchAll(/data-server-action="([a-z-]+)"/g)].map(m => m[1])))]
    .filter(a => !dispatchSrc.includes(`"${a}"`));
  check("Mọi server-action đều có nhánh trong handleServerClick", missingActions.length === 0, missingActions.join(", "));

  // Cổng đăng nhập phải kiểm tra phiên thật (!sessionUser()), không chỉ cờ
  // 'dtms-signed-out' — cờ này chỉ được đặt khi đăng xuất, trình duyệt mới
  // mở lần đầu không có cờ nên bấm "Truy cập hệ thống" không mở được modal.
  check("openWorkspace mở modal-login khi chưa có phiên", mgmt.includes("function openWorkspace() {\n    if (!sessionUser()) openModal('modal-login');"));
  check("canAccessView chặn management/profile khi chưa có phiên", mgmt.includes("['management', 'profile'].includes(viewId) && !sessionUser()"));
  check("switchModuleTab mở modal-login khi chưa có phiên", mgmt.includes("function switchModuleTab(moduleId) {\n    if (!sessionUser()) { openModal(\"modal-login\"); return; }"));
  check("openModal chuyển về modal-login khi chưa có phiên", mgmt.includes("if (MODAL_ACCESS[modalId] && !sessionUser()) { openModal('modal-login'); return; }"));

  // Dashboard theo vai trò: nghiệp vụ lấy từ tab phân hệ (không còn danh sách rỗng),
  // thẻ hồ sơ + số liệu lấy từ dữ liệu máy chủ khi đã đăng nhập thật.
  check("Dashboard không còn dùng ROLE_DASHBOARDS rỗng", !mgmt.includes("const ROLE_DASHBOARDS"));
  check("Nghiệp vụ dashboard lấy từ tab phân hệ", mgmt.includes("document.querySelectorAll(\".mgmt-tab-btn\")"));
  check("Thẻ hồ sơ dashboard dùng dữ liệu máy chủ", mgmt.includes("priorityTitle = [code, major,"));
  check("Số liệu dashboard NCS có tín chỉ + GPA", mgmt.includes("Tín chỉ đã đạt") && mgmt.includes("earnedCourseCredits()"));
  check("Dashboard vẽ lại sau khi tải xong dữ liệu máy chủ", mgmt.includes("renderRoleDashboard();") && mgmt.includes("renderWorkflowUI();\n  }\n\n  // ---- Hồ sơ"));
  // Các thẻ ghi cứng "Chưa có dữ liệu" phải được cập nhật từ dữ liệu máy chủ.
  check("Nhãn 2 thẻ hồ sơ M01 đổi khi có dữ liệu", mgmt.includes("profile-personal-pill") && mgmt.includes("profile-training-pill"));
  check("Ngày sinh/giới tính/đối tượng đầu vào điền từ hồ sơ NCS", mgmt.includes("profile-display-birth") && mgmt.includes("profile-display-audience"));
  check("Nhãn 2 thẻ M05 đếm lượt chấm từ API", mgmt.includes('kind + "-card-status"') && mgmt.includes("records.length"));
  check("Card thống kê mẫu M13 ẩn khi có phiên máy chủ", mgmt.includes('"panel-m13"'));

  // Rà soát vòng 2 (14/11/2026): các khối vẽ từ dữ liệu mẫu lọt vào phiên máy chủ.
  check("Thống kê M01 ở phiên máy chủ lấy từ hồ sơ NCS + yêu cầu đã duyệt", mgmt.includes('approvedCount("GIA_HAN")') && mgmt.includes('approvedCount("TAM_DUNG")'));
  check("Điểm TB tiểu luận ở phiên máy chủ lấy từ lần chấm mới nhất", mgmt.includes('const avg = pick(essay, "diemTrungBinh", "DiemTrungBinh");'));
  check("Vòng lặp chuyên đề mẫu không chạy ở phiên máy chủ", mgmt.includes("if (!backendSession()) APP_STATE.topics.forEach"));
  check("Bảng tiến độ mẫu không ghi đè ở phiên máy chủ", mgmt.includes("if(progress && !backendSession())"));
  check("renderWorkflowUI vẽ lại sau khi tải xong dữ liệu máy chủ", mgmt.includes("renderWorkflowUI();\n  }\n\n  // ---- Hồ sơ"));
  check("Chi tiết M05 điền tên tiểu luận/đề cương + biên bản từ API", mgmt.includes('kind + "-title-display"') && mgmt.includes("essay-minutes-display"));
  check("Bảng chuyên đề M06 điền từ API đánh giá giai đoạn", mgmt.includes("#panel-m06 table tbody"));
  check("Card phiên bản M09 ẩn khi có phiên máy chủ", mgmt.includes('title.startsWith("3.")'));

  // Sửa theo DOCX + gộp phần Vinh đã sửa (15/11/2026): ids M01 dùng tên của Vinh,
  // bộ chọn vai trò cho tài khoản nhiều vai trò, mã 423, danh sách ngành.
  check("Ids hồ sơ M01 dùng tên của Vinh (pill, birth, citizen, address, audience, deadline)", ["profile-personal-pill", "profile-training-pill", "profile-display-birth", "profile-display-citizen", "profile-display-address", "profile-display-audience", "profile-display-deadline-std"].every((id) => html.includes(`id="${id}"`)));
  check("Bộ chọn vai trò ở thanh trên, chỉ hiện khi có từ 2 vai trò", html.includes('id="topbar-role-select"') && mgmt.includes("function renderRoleSwitcher()") && mgmt.includes("roles.length < 2"));
  check("Đổi vai trò vẽ lại dữ liệu máy chủ", mgmt.includes("renderRoleSwitcher();") && mgmt.includes("if (backendSession() && SERVER.loaded) renderServerViews();"));
  check("Lỗi 423 có thông báo tài khoản tạm khóa (DOCX §1)", apiSrc.includes('423: "Tài khoản tạm khóa'));
  check("Danh sách ngành lấy từ GET /api/Nganhdaotaos", apiSrc.includes('listMajors') && apiSrc.includes("/api/Nganhdaotaos") && mgmt.includes('majors: "listMajors"') && mgmt.includes("function majorName("));

  console.log(`\nKết quả: ${passed} đạt, ${failed} lỗi.`);
  process.exit(failed ? 1 : 0);
})().catch((error) => { console.error("Harness lỗi:", error); process.exit(1); });
