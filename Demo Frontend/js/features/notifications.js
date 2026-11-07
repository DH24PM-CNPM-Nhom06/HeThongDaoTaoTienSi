(function initializeNotifications(global, document) {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.querySelector(".notice-list");
    if (!mount) return;
    const items = [...mount.querySelectorAll(".notice-card")].map(card => {
      const date = card.querySelector("time");
      const [day, month, year] = date.textContent.trim().split("/");
      date.dateTime = `${year}-${month}-${day}`;
      return { card, category: card.querySelector(".notice-tag").firstChild.textContent.trim(), date: date.dateTime };
    });
    const list = global.DTMS_COLLECTIONS.create({
      mount,
      text: item => item.card.textContent,
      category: item => item.category,
      renderItem: item => item.card.cloneNode(true),
      filterLabel: "Loại thông báo",
      sorters: [
        { label: "Mới nhất", value: "newest", compare: (a, b) => b.date.localeCompare(a.date) },
        { label: "Cũ nhất", value: "oldest", compare: (a, b) => a.date.localeCompare(b.date) },
        { label: "Tiêu đề A–Z", value: "title", compare: (a, b) => a.card.querySelector("h3").textContent.localeCompare(b.card.querySelector("h3").textContent, "vi") },
      ],
    });
    list.setItems(items);
  });
})(window, document);
