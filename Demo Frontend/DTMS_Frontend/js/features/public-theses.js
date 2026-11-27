(function initializePublicTheses(global, document) {
  "use strict";
  const sampleTheses = global.DTMS_SAMPLE_CONTENT?.theses || [];
  let list, grid, status, modeNote, modeButton;
  let mode = "demo", state = "idle", requestRevision = 0;
  function safeLink(url) {
    if (typeof url !== "string" || !url.trim()) return "";
    try {
      const parsed = new URL(url, global.DTMS_CONFIG.API_BASE_URL ? global.DTMS_CONFIG.API_BASE_URL + "/" : global.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch { return ""; }
  }
  function dateValue(value) {
    const parts = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return Date.parse(parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : value) || 0;
  }
  function renderItem(item) {
    const row = document.createElement("article");
    row.className = "thesis-entry";
    const body = document.createElement("div"), title = document.createElement("h3"), details = document.createElement("p");
    if (mode === "demo") {
      const badge = document.createElement("span");
      badge.className = "dtms-demo-tag";
      badge.textContent = "LUẬN ÁN MINH HỌA";
      body.append(badge);
    }
    title.textContent = item.title;
    details.className = "thesis-meta";
    details.textContent = `${item.candidate} · ${item.field} · ${item.date}`;
    body.append(title, details);
    const actions = document.createElement("div");
    actions.className = "thesis-actions";
    for (const [source, label] of [[item.summaryUrl, "Tóm tắt PDF"], [item.fullUrl, "Toàn văn"]]) {
      const url = safeLink(source);
      if (!url) continue;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      actions.append(link);
    }
    if (!actions.children.length) actions.textContent = mode === "demo" ? "Tệp PDF chưa được cung cấp (mẫu)" : "Chưa có tệp công khai";
    row.append(body, actions);
    return row;
  }
  function updateModeUI() {
    if (modeButton) modeButton.textContent = mode === "demo" ? "Xem dữ liệu từ API" : "Xem dữ liệu minh họa";
    if (modeNote) {
      modeNote.textContent = mode === "demo"
        ? "Đang xem dữ liệu MINH HỌA tạo riêng trên frontend. Tên, đề tài, ngày bảo vệ chỉ phục vụ thử giao diện; không phải hồ sơ thật."
        : "Đang xem dữ liệu lấy từ backend. Nếu API lỗi, giao diện sẽ báo lỗi thay vì hiển thị dữ liệu giả như dữ liệu thật.";
    }
  }
  function showDemo() {
    requestRevision++; // Bỏ qua kết quả API cũ khi người dùng quay về chế độ mẫu.
    mode = "demo";
    state = "ready";
    updateModeUI();
    list.setItems(sampleTheses);
    status.textContent = `${sampleTheses.length} luận án minh họa, không ghi vào cơ sở dữ liệu.`;
  }
  async function loadReal() {
    if (state === "loading") return;
    const revision = ++requestRevision;
    mode = "api";
    state = "loading";
    updateModeUI();
    grid.setAttribute("aria-busy", "true");
    status.textContent = "Đang tải danh sách luận án từ backend…";
    list.setItems([]);
    try {
      if (!global.DTMS_CONFIG.API_BASE_URL) throw new Error("Chưa cấu hình địa chỉ API backend.");
      const response = await global.DTMS_API.getPublicTheses();
      if (revision !== requestRevision || mode !== "api") return;
      const body = response && Object.hasOwn(response, "data") ? response.data : response;
      const raw = Array.isArray(body) ? body : body?.items;
      if (!Array.isArray(raw)) throw new Error("Danh sách luận án không đúng hợp đồng API.");
      const values = raw.map(item => ({
        title: item.tenDeTaiVn || item.tenDeTaiEn || item.title || "",
        candidate: item.hoTen || item.candidate || "",
        field: item.maNganh || item.field || "Chưa cập nhật",
        date: item.ngayBaoVe || item.date || "",
        summaryUrl: item.summaryUrl,
        fullUrl: item.fullUrl
      }));
      if (values.some(item => !["title", "candidate", "field", "date"].every(key => typeof item[key] === "string" && item[key].trim())
          || !dateValue(item.date) || ["summaryUrl", "fullUrl"].some(key => item[key] != null && typeof item[key] !== "string"))) {
        throw new Error("Danh sách luận án không đúng hợp đồng API.");
      }
      list.setItems(values);
      state = "ready";
      status.textContent = values.length ? `Đã tải ${values.length} bản ghi từ API backend.` : "Backend chưa có luận án công khai.";
    } catch (error) {
      if (revision !== requestRevision || mode !== "api") return;
      state = "error";
      list.setItems([]);
      status.textContent = `API: ${error?.message || "Không thể tải luận án."} Bạn có thể chọn “Xem dữ liệu minh họa”.`;
    } finally {
      if (revision === requestRevision) grid.removeAttribute("aria-busy");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    grid = document.querySelector("[data-thesis-grid]");
    status = document.querySelector("[data-thesis-status]");
    modeNote = document.querySelector("[data-thesis-mode-note]");
    modeButton = document.querySelector("[data-thesis-mode-switch]");
    if (!grid || !status) return;
    const search = document.querySelector("[data-thesis-search-input]");
    search.setAttribute("aria-label", "Tìm luận án theo tên, ngành hoặc nghiên cứu sinh");
    search.type = "search";
    list = global.DTMS_COLLECTIONS.create({
      mount: grid, search,
      text: item => `${item.title} ${item.candidate} ${item.field}`,
      category: item => item.field,
      renderItem, filterLabel: "Ngành đào tạo",
      sorters: [
        { label: "Mới nhất", value: "newest", compare: (a, b) => dateValue(b.date) - dateValue(a.date) },
        { label: "Tiêu đề A–Z", value: "title", compare: (a, b) => a.title.localeCompare(b.title, "vi") },
        { label: "Tên NCS A–Z", value: "candidate", compare: (a, b) => a.candidate.localeCompare(b.candidate, "vi") }
      ]
    });
    modeButton?.addEventListener("click", () => mode === "demo" ? loadReal() : showDemo());
    showDemo();
  });
  global.DTMS_PUBLIC_THESES = Object.freeze({ render() { if (state === "ready") list?.render(); } });
})(window, document);
