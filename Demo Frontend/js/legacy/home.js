(function initializeHome(global, document) {
  "use strict";

  const config = global.DTMS_CONFIG;
  const api = global.DTMS_API;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");
  const header = document.querySelector("[data-header]");
  const toastRegion = document.querySelector("[data-toast-region]");
  const thesisSearchInput = document.querySelector("[data-thesis-search]");
  const cyberLookupBtn = document.querySelector("[data-cyber-lookup-btn]");
  const lookupResultBox = document.querySelector("[data-lookup-result]");

  let loadedThesesList = [];

  function setMenu(open) {
    if (!navigation || !menuToggle) return;
    navigation.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Đóng menu điều hướng" : "Mở menu điều hướng");
    document.body.classList.toggle("menu-open", open);
  }

  function showToast(title, message) {
    if (!toastRegion) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v5m0 3h.01" /></svg>
      <div><strong></strong><p></p></div>`;
    toast.querySelector("strong").textContent = title;
    toast.querySelector("p").textContent = message;
    toastRegion.append(toast);

    global.setTimeout(() => {
      toast.classList.add("is-leaving");
      global.setTimeout(() => toast.remove(), 200);
    }, 4500);
  }

  function handleConfiguredRoute(routeName) {
    const target = config ? config.ROUTES[routeName] : null;
    if (target) {
      global.location.assign(target);
      return;
    }

    const messages = {
      login: ["Chưa cấu hình trang đăng nhập", "Đường dẫn đăng nhập sẽ hoạt động khi Backend và Auth Portal sẵn sàng."],
      degreeLookup: ["Chức năng đang được phát triển", "Đường dẫn tra cứu chính thức chưa được cấu hình trong js/core/config.js."],
    };
    if (messages[routeName]) {
      showToast(...messages[routeName]);
    }
  }

  function normalizeTheses(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function createStateMarkup(type, title, description) {
    const icon = type === "error"
      ? '<path d="M12 9v4m0 4h.01M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />'
      : '<path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Zm0 0A2.5 2.5 0 0 1 6.5 17H18M8 7h6m-6 4h6" />';
    return `<div class="${type}-state"><span class="state-icon"><svg aria-hidden="true" viewBox="0 0 24 24">${icon}</svg></span><div><strong>${title}</strong><p>${description}</p></div></div>`;
  }

  function safeText(value, fallback = "Chưa cập nhật") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function safePublicUrl(value) {
    if (typeof value !== "string") return "";
    try {
      const url = new URL(value, global.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function renderTheses(panel, theses) {
    if (theses.length === 0) {
      panel.innerHTML = createStateMarkup("empty", "Không tìm thấy luận án phù hợp", "Không có kết quả khớp với từ khóa tìm kiếm của bạn.");
      return;
    }

    const list = document.createElement("div");
    list.className = "thesis-list";

    theses.forEach((thesis) => {
      const item = document.createElement("article");
      item.className = "thesis-item";

      const info = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = safeText(thesis.title, "Luận án chưa cập nhật tên");
      
      const meta = document.createElement("p");
      meta.className = "thesis-meta";
      [
        ["Nghiên cứu sinh", thesis.candidateName],
        ["Ngành", thesis.field],
        ["Ngày bảo vệ dự kiến", thesis.expectedDefenseDate],
      ].forEach(([label, value]) => {
        if (!value) return;
        const span = document.createElement("span");
        span.textContent = `${label}: ${value}`;
        meta.append(span);
      });
      info.append(title, meta);

      const links = document.createElement("div");
      links.className = "thesis-links";
      [
        ["📄 Tóm tắt PDF", thesis.summaryUrl],
        ["📚 Toàn văn PDF", thesis.fullTextUrl]
      ].forEach(([label, value]) => {
        const url = safePublicUrl(value);
        if (!url) return;
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = label;
        links.append(anchor);
      });
      
      item.append(info, links);
      list.append(item);
    });

    panel.replaceChildren(list);
  }

  async function loadPublicTheses() {
    const panel = document.querySelector("[data-thesis-panel]");
    if (!panel) return;
    try {
      const result = await api.getPublicTheses();
      loadedThesesList = normalizeTheses(result.data);
      
      if (result.status === "unavailable") {
        panel.innerHTML = createStateMarkup("empty", "Chưa có thông tin luận án công khai", "Kết nối Backend chưa được cấu hình. Khu vực này sẽ tự động hiển thị dữ liệu khi API sẵn sàng.");
      } else if (loadedThesesList.length === 0) {
        panel.innerHTML = createStateMarkup("empty", "Chưa có thông tin luận án công khai", "Hiện chưa có dữ liệu được xác nhận đủ điều kiện công bố.");
      } else {
        renderTheses(panel, loadedThesesList);
      }
    } catch (error) {
      panel.innerHTML = createStateMarkup("error", "Không thể tải thông tin luận án", "Vui lòng thử lại sau hoặc liên hệ đơn vị quản trị hệ thống.");
      console.error("DTMS public theses error:", error);
    } finally {
      panel.setAttribute("aria-busy", "false");
    }
  }

  // Real-time Thesis Search
  if (thesisSearchInput) {
    thesisSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const panel = document.querySelector("[data-thesis-panel]");
      if (!panel || loadedThesesList.length === 0) return;

      if (!query) {
        renderTheses(panel, loadedThesesList);
        return;
      }

      const filtered = loadedThesesList.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const candidate = (item.candidateName || "").toLowerCase();
        const field = (item.field || "").toLowerCase();
        return title.includes(query) || candidate.includes(query) || field.includes(query);
      });

      renderTheses(panel, filtered);
    });
  }

  // Cyber Degree Lookup Terminal Demo
  if (cyberLookupBtn && lookupResultBox) {
    cyberLookupBtn.addEventListener("click", () => {
      const codeInput = document.querySelector("[data-input-code]");
      const nameInput = document.querySelector("[data-input-name]");

      const codeVal = codeInput ? codeInput.value.trim() : "";
      const nameVal = nameInput ? nameInput.value.trim() : "";

      if (!codeVal && !nameVal) {
        showToast("Vui lòng nhập thông tin", "Hãy nhập Số hiệu bằng hoặc Họ tên để trải nghiệm thử chức năng tra cứu.");
        lookupResultBox.classList.remove("is-active");
        return;
      }

      const nameDisplay = nameVal || "Nguyễn Văn A";
      const codeDisplay = codeVal || "TS-AGU-2025-001";

      lookupResultBox.innerHTML = `
        <strong style="color: #10b981; display: flex; align-items: center; gap: 6px;">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          KẾT QUẢ MÔ PHỎNG XÁC THỰC SỔ GỐC:
        </strong>
        <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 0.84rem;">
          Họ tên: <strong>${nameDisplay}</strong> · Số hiệu: <strong>${codeDisplay}</strong><br />
          Học vị: <strong>Tiến sĩ Khoa học Môi trường</strong> · Đơn vị cấp: <strong>Trường ĐH An Giang (ĐHQG-HCM)</strong>
        </p>
      `;
      lookupResultBox.classList.add("is-active");
      showToast("Xác thực mô phỏng thành công", "Thông tin văn bằng đã được đối soát với dữ liệu sổ gốc.");
    });
  }

  // Header & Menu listeners
  if (menuToggle) {
    menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  }

  if (navigation) {
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) setMenu(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle &&
      menuToggle.getAttribute("aria-expanded") === "true" &&
      !navigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenu(false);
    }
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) handleConfiguredRoute(routeButton.dataset.route);
  });

  if (header) {
    global.addEventListener("scroll", () => header.classList.toggle("is-scrolled", global.scrollY > 8), { passive: true });
  }

  global.addEventListener("resize", () => {
    if (global.innerWidth > 860) setMenu(false);
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navigationLinks = [...document.querySelectorAll(".nav-link[href^='#']")];
  if ("IntersectionObserver" in global && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-30% 0px -60%", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }

  const currentYearEl = document.querySelector("[data-current-year]");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  loadPublicTheses();
})(window, document);

