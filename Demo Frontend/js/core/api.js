(function initializeApi(global) {
  "use strict";
  const config = global.DTMS_CONFIG;
  const TOKEN_KEY = "jwt_token";
  class ApiError extends Error {
    constructor(message, status = 0, fieldErrors = [], detail = "") {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.fieldErrors = fieldErrors;
      this.detail = detail; // Thông báo lỗi cụ thể do máy chủ trả về (nếu có)
    }
  }
  function getToken() {
    try { return global.localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
  }
  function setToken(token) {
    try { global.localStorage.setItem(TOKEN_KEY, token); return true; } catch { return false; }
  }
  function clearToken() {
    try { global.localStorage.removeItem(TOKEN_KEY); } catch { /* bộ nhớ bị chặn: không còn gì để xóa */ }
  }
  async function request(path, options = {}) {
    // skipAuth: không gắn Bearer token (dùng cho đăng nhập). errorMessages: thông báo riêng theo mã HTTP.
    // timeoutMs: ghi đè thời gian chờ mặc định (tải tệp lớn cần lâu hơn 8 giây).
    const { skipAuth = false, errorMessages = {}, timeoutMs, ...fetchOptions } = options;
    if (!config.API_BASE_URL) {
      const error = new ApiError("Dịch vụ chưa được cấu hình. Vui lòng liên hệ quản trị hệ thống.");
      error.name = "ApiUnavailableError";
      throw error;
    }
    const controller = new AbortController();
    const timeoutId = global.setTimeout(() => controller.abort(), timeoutMs || config.API_TIMEOUT_MS);
    try {
      const headers = { Accept: "application/json", ...fetchOptions.headers };
      const token = skipAuth ? "" : getToken();
      if (token) headers.Authorization = "Bearer " + token;
      const response = await fetch(config.API_BASE_URL + path, {
        ...fetchOptions,
        credentials: config.API_CREDENTIALS,
        headers,
        signal: controller.signal,
      });
      if (response.status === 204) return null;
      let result;
      if ((response.headers.get("content-type") || "").includes("json")) {
        try { result = await response.json(); }
        catch { throw new ApiError("Máy chủ trả dữ liệu JSON không hợp lệ.", 502); }
      } else if (response.ok) {
        throw new ApiError("API không trả dữ liệu JSON.", 502);
      }
      if (!response.ok) {
        const messages = {
          401: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
          403: "Bạn không có quyền thực hiện thao tác này.",
          404: "Không tìm thấy dữ liệu được yêu cầu.",
          409: "Dữ liệu đã tồn tại hoặc đã được cập nhật. Vui lòng tải lại.",
          422: "Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra biểu mẫu.",
        };
        // Lỗi kiểm tra dữ liệu của ASP.NET ([ApiController]) nằm trong result.errors: { Trường: ["thông báo"] }
        const validationMessages = result?.errors && typeof result.errors === "object" ? Object.values(result.errors).flat().filter(item => typeof item === "string") : [];
        const serverMessage = [result?.message, result?.Message, result?.error?.message, validationMessages.join(" ")].find(value => typeof value === "string" && value.trim()) || "";
        // Token hết hạn hoặc bị thu hồi trong lúc đang dùng: xóa token và báo cho giao diện đăng xuất.
        if (response.status === 401 && token) {
          clearToken();
          global.dispatchEvent(new CustomEvent("dtms:unauthorized"));
        }
        throw new ApiError(errorMessages[response.status] || messages[response.status] || "Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.", response.status, result?.error?.fieldErrors || [], serverMessage.trim());
      }
      return result;
    } catch (error) {
      if (error.name === "AbortError") throw new ApiError("Kết nối quá thời gian chờ. Vui lòng thử lại.", 408);
      if (error instanceof TypeError) throw new ApiError("Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
      throw error;
    } finally {
      global.clearTimeout(timeoutId);
    }
  }
  function getPublicTheses() { return request(config.ENDPOINTS.PUBLIC_THESES); }
  function verifyDegree({ code, name }) {
    if (!config.DEGREE_SERVICE_READY) {
      const error = new ApiError("Dịch vụ xác thực văn bằng chưa sẵn sàng; API bàn giao đang trả dữ liệu tạm.");
      error.name = "ApiUnavailableError";
      return Promise.reject(error);
    }
    return request(config.ENDPOINTS.DEGREE_LOOKUP + "?" + new URLSearchParams({ code, name }).toString());
  }
  function submit(path, payload) {
    return request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  }
  // Đăng nhập: POST /api/Auth/login { Username, Password }. Thành công thì lưu JWT vào localStorage["jwt_token"].
  // Trả về { token, user } với user.maVaiTro / user.hoTen (chấp nhận cả camelCase và PascalCase của DTO ASP.NET).
  async function login(username, password) {
    const result = await request(config.ENDPOINTS.LOGIN, {
      method: "POST",
      skipAuth: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: username, Password: password }),
      errorMessages: { 400: "Vui lòng nhập đầy đủ email và mật khẩu.", 401: "Email hoặc mật khẩu không đúng.", 422: "Vui lòng nhập đầy đủ email và mật khẩu." },
    });
    if (result && (result.success === false || result.isSuccess === false)) {
      throw new ApiError(result.message || "Đăng nhập không thành công.", 401, [], typeof result.message === "string" ? result.message : "");
    }
    const payload = result?.data ?? result ?? {};
    const token = payload.token ?? payload.Token ?? payload.accessToken ?? payload.AccessToken ?? payload.jwt;
    const rawUser = payload.user ?? payload.User;
    if (typeof token !== "string" || !token.trim() || !rawUser || typeof rawUser !== "object") {
      throw new ApiError("Máy chủ trả dữ liệu đăng nhập không hợp lệ.", 502);
    }
    if (!setToken(token.trim())) throw new ApiError("Trình duyệt đang chặn lưu trữ nên không thể giữ phiên đăng nhập.");
    const maVaiTro = rawUser.maVaiTro ?? rawUser.MaVaiTro;
    // roles: toàn bộ mã vai trò giao diện của tài khoản (vd GV01 -> ["BM","NHD"]). Thiếu thì dùng vai trò chính.
    const rolesRaw = rawUser.roles ?? rawUser.Roles;
    const roles = [...new Set((Array.isArray(rolesRaw) ? rolesRaw : []).filter(code => typeof code === "string" && code.trim()).map(code => code.trim()))];
    if (!roles.length && typeof maVaiTro === "string" && maVaiTro.trim()) roles.push(maVaiTro.trim());
    const user = { ...rawUser, maVaiTro, hoTen: rawUser.hoTen ?? rawUser.HoTen, roles };
    return { token: token.trim(), user };
  }
  function logout() { clearToken(); }

  // ---- Nghiệp vụ cần đăng nhập (xem request_2): hồ sơ, kế hoạch, báo cáo, công bố, đề tài, ngoại ngữ ----
  // API trả mảng trần hoặc { success, data }, nên chuẩn hóa về mảng.
  const asList = result => Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : Array.isArray(result?.items) ? result.items : [];
  const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  // Quy tắc tệp tải lên: trùng với FileController của backend (đuôi cho phép + dung lượng tối đa).
  const UPLOAD_RULES = Object.freeze({
    baocao: { ext: ["pdf", "doc", "docx"], maxBytes: 10 * 1024 * 1024, label: "báo cáo tiến độ" },
    minhchung: { ext: ["pdf", "jpg", "jpeg", "png"], maxBytes: 10 * 1024 * 1024, label: "minh chứng" },
    luanan: { ext: ["pdf", "doc", "docx"], maxBytes: 50 * 1024 * 1024, label: "luận án" },
  });
  function checkUpload(file, purpose) {
    const rule = UPLOAD_RULES[purpose];
    if (!rule) return "Mục đích tệp không hợp lệ.";
    if (!file || !file.size) return "Vui lòng chọn một tệp hợp lệ.";
    const ext = String(file.name || "").split(".").pop().toLowerCase();
    if (!rule.ext.includes(ext)) return "Định dạng không được phép. Chấp nhận: ." + rule.ext.join(", .") + ".";
    if (file.size > rule.maxBytes) return "Dung lượng tệp vượt quá giới hạn " + rule.maxBytes / 1024 / 1024 + "MB.";
    return "";
  }
  // POST /api/File/upload?purpose=...  -> { fileUrl, fileName }. maNcs chỉ cần khi người tải không phải NCS.
  async function uploadFile(file, purpose, maNcs) {
    const problem = checkUpload(file, purpose);
    if (problem) throw new ApiError(problem, 400, [], problem);
    const form = new FormData();
    form.append("file", file);
    const query = new URLSearchParams({ purpose });
    if (maNcs) query.set("maNcs", maNcs);
    const result = await request("/api/File/upload?" + query.toString(), { method: "POST", body: form, timeoutMs: 180000 });
    const fileUrl = result?.fileUrl ?? result?.FileUrl;
    if (typeof fileUrl !== "string" || !fileUrl) throw new ApiError("Máy chủ không trả đường dẫn tệp sau khi tải lên.", 502);
    return { fileUrl, fileName: result?.fileName ?? result?.FileName ?? file.name };
  }
  // Tệp chỉ tải được khi có token, nên không dùng được thẻ <a href> trực tiếp: tải về dạng blob rồi mở.
  async function downloadFile(fileUrl) {
    if (typeof fileUrl !== "string" || !fileUrl.startsWith("/api/File/")) throw new ApiError("Đường dẫn tệp không hợp lệ.", 400);
    const token = getToken();
    let response;
    try {
      response = await fetch(config.API_BASE_URL + fileUrl, { headers: token ? { Authorization: "Bearer " + token } : {}, credentials: config.API_CREDENTIALS });
    } catch { throw new ApiError("Không thể kết nối máy chủ để tải tệp."); }
    if (response.status === 401) { clearToken(); global.dispatchEvent(new CustomEvent("dtms:unauthorized")); throw new ApiError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.", 401); }
    if (!response.ok) throw new ApiError(response.status === 404 ? "Không tìm thấy tệp hoặc bạn không có quyền tải tệp này." : "Không tải được tệp.", response.status);
    return { blob: await response.blob(), fileName: fileUrl.split("/").pop() };
  }

  const resources = {
    getProfile: () => request("/api/Profile/me"),
    updateProfile: body => request("/api/Profile/me", json("PUT", body)),
    listPlans: async () => asList(await request("/api/Kehoachhoctaps")),
    createPlan: body => request("/api/Kehoachhoctaps", json("POST", body)),
    updatePlan: (id, body) => request("/api/Kehoachhoctaps/" + encodeURIComponent(id), json("PUT", body)),
    approvePlan: (id, body) => request("/api/Kehoachhoctaps/" + encodeURIComponent(id) + "/duyet", json("PUT", body)),
    listProgressReports: async () => asList(await request("/api/Baocaotiendoes")),
    createProgressReport: body => request("/api/Baocaotiendoes", json("POST", body)),
    reviewProgressReport: (id, body) => request("/api/Baocaotiendoes/" + encodeURIComponent(id) + "/nhanxet", json("PUT", body)),
    listPublications: async () => asList(await request("/api/Congbokhoahocs")),
    createPublication: body => request("/api/Congbokhoahocs", json("POST", body)),
    updatePublication: (id, body) => request("/api/Congbokhoahocs/" + encodeURIComponent(id), json("PUT", body)),
    approvePublication: (id, trangThaiDuyet) => request("/api/Congbokhoahocs/" + encodeURIComponent(id) + "/duyet", json("PUT", { trangThaiDuyet })),
    listThesisTopics: async () => asList(await request("/api/Detailuanans")),
    createThesisTopic: body => request("/api/Detailuanans", json("POST", body)),
    updateThesisTopic: (id, body) => request("/api/Detailuanans/" + encodeURIComponent(id), json("PUT", body)),
    listLanguageCertificates: async () => asList(await request("/api/Chungchingoaingus")),
    createLanguageCertificate: body => request("/api/Chungchingoaingus", json("POST", body)),
    updateLanguageCertificate: (id, body) => request("/api/Chungchingoaingus/" + encodeURIComponent(id), json("PUT", body)),
    approveLanguageCertificate: (id, trangThaiDuyet) => request("/api/Chungchingoaingus/" + encodeURIComponent(id) + "/duyet", json("PUT", { trangThaiDuyet })),
  };

  global.DTMS_API = Object.freeze({ request, getPublicTheses, verifyDegree, submit, login, logout, getToken, uploadFile, downloadFile, checkUpload, ApiError, ...resources });
})(window);
