/**
 * Cấu hình tích hợp DTMS.
 * Chỉ cần cập nhật các giá trị tại đây khi Backend và các trang chuyên biệt sẵn sàng.
 */
(function configureDTMS(global) {
  "use strict";
  const settings = global.DTMS_RUNTIME_CONFIG || {};
  global.DTMS_CONFIG = Object.freeze({
    // Mặc định trỏ tới backend .NET khi chạy local. Ghi đè bằng DTMS_RUNTIME_CONFIG.API_BASE_URL khi triển khai
    // (đặt "" để tắt kết nối API).
    API_BASE_URL: String(settings.API_BASE_URL ?? "https://localhost:7143").replace(/\/$/, ""),
    API_TIMEOUT_MS: Number(settings.API_TIMEOUT_MS) > 0 ? Number(settings.API_TIMEOUT_MS) : 8000,
    API_CREDENTIALS: settings.API_CREDENTIALS || "same-origin",
    // API trong ZIP trả IsValid=true cố định. Chỉ bật khi backend đã bỏ stub.
    DEGREE_SERVICE_READY: settings.DEGREE_SERVICE_READY === true,
    ENDPOINTS: Object.freeze({
      PUBLIC_THESES: settings.ENDPOINTS?.PUBLIC_THESES || "/api/public/theses",
      DEGREE_LOOKUP: settings.ENDPOINTS?.DEGREE_LOOKUP || "/api/Public/diploma",
      LOGIN: "/api/Auth/login",
    }),
  });
})(window);
