(function initializeNotifications(global, document) {
  "use strict";

  function createNoticeModal() {
    // Dialog độc lập, chỉ trình bày dữ liệu mẫu ở frontend.
    const overlay = document.createElement("div");
    overlay.className = "notice-detail-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="notice-detail-dialog" role="dialog" aria-modal="true"
               aria-labelledby="notice-detail-title" aria-describedby="notice-detail-intro">
        <header class="notice-detail-header">
          <div class="notice-detail-heading">
            <span class="dtms-demo-tag">THÔNG BÁO MINH HỌA</span>
            <div class="notice-detail-category" data-notice-detail-category></div>
            <h2 id="notice-detail-title" data-notice-detail-title></h2>
          </div>
          <button type="button" class="notice-detail-close" data-notice-detail-close
                  aria-label="Đóng thông báo" title="Đóng">×</button>
        </header>
        <div class="notice-detail-scroll">
          <div class="notice-detail-info">
            <span><b>Ngày đăng:</b> <time data-notice-detail-date></time></span>
            <span><b>Đơn vị:</b> <span data-notice-detail-unit></span></span>
          </div>
          <p class="notice-detail-intro" id="notice-detail-intro" data-notice-detail-intro></p>
          <h3>Nội dung chi tiết</h3>
          <div class="notice-detail-paragraphs" data-notice-detail-paragraphs></div>
          <div class="notice-detail-disclaimer" role="note">
            Đây là nội dung được biên soạn để minh họa giao diện, không phải thông báo chính thức
            và không quy định thời hạn thực tế.
          </div>
        </div>
        <footer class="notice-detail-footer">
          <span>Không có tệp đính kèm trong bản minh họa.</span>
          <button type="button" class="notice-detail-done" data-notice-detail-done>Đóng thông báo</button>
        </footer>
      </section>`;
    document.body.appendChild(overlay);

    const dialog = overlay.querySelector(".notice-detail-dialog");
    const closeButton = overlay.querySelector("[data-notice-detail-close]");
    const doneButton = overlay.querySelector("[data-notice-detail-done]");
    let previousFocus = null;
    let previousOverflow = "";

    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
      previousFocus = null;
    }

    function open(item) {
      if (!overlay.hidden) close();
      previousFocus = document.activeElement;
      overlay.querySelector("[data-notice-detail-category]").textContent = item.category;
      overlay.querySelector("[data-notice-detail-title]").textContent = item.title;
      const date = overlay.querySelector("[data-notice-detail-date]");
      date.textContent = item.date;
      const [day, month, year] = item.date.split("/");
      date.dateTime = `${year}-${month}-${day}`;
      overlay.querySelector("[data-notice-detail-unit]").textContent = item.unit;
      overlay.querySelector("[data-notice-detail-intro]").textContent = item.description;
      const paragraphs = overlay.querySelector("[data-notice-detail-paragraphs]");
      const texts = Array.isArray(item.details) && item.details.length ? item.details : [item.description];
      paragraphs.replaceChildren(...texts.map(text => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
      }));
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      overlay.hidden = false;
      closeButton.focus();
    }

    for (const button of [closeButton, doneButton]) button.addEventListener("click", close);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", event => {
      if (overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        // Giữ tiêu điểm ở trong modal, hỗ trợ bàn phím.
        const controls = [closeButton, doneButton];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    global.addEventListener("hashchange", close);
    return { open, close };
  }

  function renderNotice(item, openModal) {
    const card = document.createElement("article");
    card.className = "notice-card notice-card-clickable" + (item.featured ? " notice-card-featured" : "");
    const tag = document.createElement("div");
    tag.className = "notice-tag";
    const category = document.createElement("span");
    category.textContent = item.category;
    const time = document.createElement("time");
    time.textContent = item.date;
    const [day, month, year] = item.date.split("/");
    time.dateTime = `${year}-${month}-${day}`;
    tag.append(category, time);
    const demo = document.createElement("span");
    demo.className = "dtms-demo-tag";
    demo.textContent = "THÔNG BÁO MINH HỌA";
    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const description = document.createElement("p");
    description.textContent = item.description;
    const meta = document.createElement("div");
    meta.className = "notice-meta";
    const unit = document.createElement("strong");
    unit.textContent = item.unit;
    const source = document.createElement("span");
    source.textContent = "Chưa phát hành chính thức";
    const action = document.createElement("button");
    action.type = "button";
    action.className = "notice-view-detail";
    action.textContent = "Xem chi tiết";
    action.setAttribute("aria-haspopup", "dialog");
    action.setAttribute("aria-label", `Xem chi tiết thông báo: ${item.title}`);
    meta.append(unit, source, action);
    card.append(tag, demo, heading, description, meta);
    // Nhấn bất kỳ vị trí nào của thẻ, hoặc dùng nút khi thao tác bàn phím.
    card.addEventListener("click", () => openModal(item));
    return card;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.querySelector(".notice-list");
    if (!mount || !global.DTMS_COLLECTIONS) return;
    const items = global.DTMS_SAMPLE_CONTENT?.notifications || [];
    const modal = createNoticeModal();
    const list = global.DTMS_COLLECTIONS.create({
      mount,
      text: item => `${item.title} ${item.description} ${item.category} ${item.unit} ${(item.details || []).join(" ")}`,
      category: item => item.category,
      renderItem: item => renderNotice(item, modal.open),
      filterLabel: "Loại thông báo",
      sorters: [
        { label: "Mới nhất", value: "newest", compare: (a, b) => b.date.split("/").reverse().join("").localeCompare(a.date.split("/").reverse().join("")) },
        { label: "Cũ nhất", value: "oldest", compare: (a, b) => a.date.split("/").reverse().join("").localeCompare(b.date.split("/").reverse().join("")) },
        { label: "Tiêu đề A–Z", value: "title", compare: (a, b) => a.title.localeCompare(b.title, "vi") }
      ]
    });
    list.setItems(items);
    const banner = document.querySelector("[data-notice-demo-note]");
    if (banner) banner.textContent = `${items.length} thông báo minh họa đang được hiển thị. Nhấn “Xem chi tiết” để đọc nội dung. Không có thông báo nào được ghi vào CSDL hoặc phát hành chính thức.`;
  });
})(window, document);
