(function initializePublicTheses(global, document) {
  "use strict";
  const initialTheses = [];
  let list, state = "idle", grid, status;
  function safeLink(url) {
    if (typeof url !== "string" || !url.trim()) return "";
    try {
      const parsed = new URL(url, global.DTMS_CONFIG.API_BASE_URL ? global.DTMS_CONFIG.API_BASE_URL + "/" : global.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch { return ""; }
  }
  function dateValue(value) {
    const parts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return Date.parse(parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : value) || 0;
  }
  function renderItem(item) {
    const row = document.createElement("article");
    row.className = "thesis-entry";
    const body = document.createElement("div"), title = document.createElement("h3"), details = document.createElement("p");
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
    if (!actions.children.length) actions.textContent = "Chưa có tệp công khai";
    row.append(body, actions);
    return row;
  }
  async function load() {
    if (state === "loading") return;
    state = "loading";
    grid.setAttribute("aria-busy", "true");
    status.textContent = "Đang tải danh sách luận án…";
    grid.replaceChildren();
    try {
      if (!global.DTMS_CONFIG.API_BASE_URL) {
        list.setItems(initialTheses);
        state = "local";
        status.textContent = "Danh mục luận án. Kết quả xác minh học vị được tra cứu tại mục Tra cứu văn bằng.";
        return;
      }
      const response = await global.DTMS_API.getPublicTheses();
      const body = response && Object.hasOwn(response, "data") ? response.data : response;
      const raw = Array.isArray(body) ? body : body?.items;
      if (!Array.isArray(raw)) throw new Error("Danh sách luận án không đúng hợp đồng API.");
      // Backend trả { maNcs, hoTen, maNganh, tenDeTaiVn, tenDeTaiEn, ngayBaoVe } (DOCX §10):
      // ánh xạ về dạng giao diện { title, candidate, field, date } trước khi kiểm hợp đồng.
      // summaryUrl/fullUrl không có trong API nên hai liên kết này được ẩn.
      const values = raw.map(item => ({
        title: item.tenDeTaiVn || item.tenDeTaiEn || item.title || "",
        candidate: item.hoTen || item.candidate || "",
        field: item.maNganh || item.field || "Chưa cập nhật",
        date: item.ngayBaoVe || item.date || "",
        summaryUrl: item.summaryUrl,
        fullUrl: item.fullUrl
      }));
      if (values.some(item => !item || !["title", "candidate", "field", "date"].every(key => typeof item[key] === "string" && item[key].trim())
        || !dateValue(item.date) || ["summaryUrl", "fullUrl"].some(key => item[key] != null && typeof item[key] !== "string"))) {
        throw new Error("Danh sách luận án không đúng hợp đồng API.");
      }
      list.setItems(values);
      state = "ready";
      status.textContent = values.length ? "Dữ liệu luận án được trả về từ máy chủ." : "Chưa có luận án công khai.";
    } catch (error) {
      if (error && [401, 403, 404].includes(error.status)) {
        // Danh sách công khai không truy cập được (vd chưa có dữ liệu): hiển thị "chưa có dữ liệu" thay vì báo lỗi.
        // Với danh sách công khai, 401 không phải "hết phiên", nên không hiện thông báo hết phiên làm việc.
        list.setItems([]);
        state = "ready";
        status.textContent = "Chưa có dữ liệu luận án công khai.";
        return;
      }
      state = "error";
      list.setItems([]);
      grid.replaceChildren();
      status.textContent = error.message || "Không thể tải luận án.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "btn-mgmt btn-mgmt-primary";
      retry.dataset.retryTheses = "";
      retry.textContent = "Thử lại";
      retry.addEventListener("click", load);
      grid.append(retry);
    } finally {
      grid.setAttribute("aria-busy", "false");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    grid = document.querySelector("[data-thesis-grid]");
    status = document.querySelector("[data-thesis-status]");
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
        { label: "Tên NCS A–Z", value: "candidate", compare: (a, b) => a.candidate.localeCompare(b.candidate, "vi") },
      ],
    });
    load();
  });
  global.DTMS_PUBLIC_THESES = Object.freeze({ render() { if (["ready", "local"].includes(state)) list?.render(); } });
})(window, document);
