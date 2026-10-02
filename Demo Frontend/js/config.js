/**
 * Cấu hình tích hợp DTMS.
 * Chỉ cần cập nhật các giá trị tại đây khi Backend và các trang chuyên biệt sẵn sàng.
 */
window.DTMS_CONFIG = Object.freeze({
  API_BASE_URL: "",
  API_TIMEOUT_MS: 8000,
  ENDPOINTS: Object.freeze({
    PUBLIC_THESES: "/api/public/theses",
  }),
  ROUTES: Object.freeze({
    login: "",
    degreeLookup: "",
  }),
});
