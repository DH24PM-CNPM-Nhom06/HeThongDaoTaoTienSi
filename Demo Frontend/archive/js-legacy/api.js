(function initializeApi(global) {
  "use strict";

  const config = global.DTMS_CONFIG;

  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  async function request(path, options = {}) {
    if (!config.API_BASE_URL) {
      return { status: "unavailable", data: [] };
    }

    const controller = new AbortController();
    const timeoutId = global.setTimeout(() => controller.abort(), config.API_TIMEOUT_MS);

    try {
      const response = await fetch(`${config.API_BASE_URL}${path}`, {
        ...options,
        credentials: config.API_CREDENTIALS || "same-origin",
        headers: { Accept: "application/json", ...options.headers },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError("Không thể tải dữ liệu từ hệ thống.", response.status);
      }

      if (response.status === 204) return { status: "success", data: null };
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new ApiError("API không trả dữ liệu JSON hợp lệ.", 502);
      try { return { status: "success", data: await response.json() }; }
      catch { throw new ApiError("Không đọc được dữ liệu JSON từ API.", 502); }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("Kết nối đã quá thời gian chờ.", 408);
      }
      if (error instanceof TypeError) throw new ApiError("Không thể kết nối API. Kiểm tra mạng, địa chỉ máy chủ và CORS.", 0);
      throw error;
    } finally {
      global.clearTimeout(timeoutId);
    }
  }

  function getPublicTheses() {
    return request(config.ENDPOINTS.PUBLIC_THESES);
  }

  global.DTMS_API = Object.freeze({ getPublicTheses, request, ApiError });
})(window);
