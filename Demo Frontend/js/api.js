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
        headers: { Accept: "application/json", ...options.headers },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError("Không thể tải dữ liệu từ hệ thống.", response.status);
      }

      return { status: "success", data: await response.json() };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("Kết nối đã quá thời gian chờ.", 408);
      }
      throw error;
    } finally {
      global.clearTimeout(timeoutId);
    }
  }

  function getPublicTheses() {
    return request(config.ENDPOINTS.PUBLIC_THESES);
  }

  global.DTMS_API = Object.freeze({ getPublicTheses });
})(window);
