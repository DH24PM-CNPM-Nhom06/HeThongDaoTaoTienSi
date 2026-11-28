/* Bộ danh sách thẻ dùng chung cho thông báo và luận án. */
(function initializeCollections(global, document) {
  "use strict";
  function create({ mount, search, text, category, renderItem, sorters, filterLabel }) {
    let items = [], page = 1, size = 5;
    const controls = document.createElement("div");
    controls.className = "table-controls collection-controls";
    const field = (label, control) => {
      const element = document.createElement("label");
      element.append(document.createTextNode(label), control);
      controls.append(element);
    };
    if (!search) {
      search = document.createElement("input");
      search.type = "search";
      search.placeholder = "Nhập từ khóa…";
      field("Tìm kiếm", search);
    }
    const filter = document.createElement("select");
    const sort = document.createElement("select");
    const pageSize = document.createElement("select");
    field(filterLabel, filter);
    field("Sắp xếp", sort);
    field("Mỗi trang", pageSize);
    sorters.forEach(({ label, value }) => sort.add(new Option(label, value)));
    [5, 10, 20].forEach(value => pageSize.add(new Option(value, value)));
    mount.before(controls);
    const footer = document.createElement("div");
    footer.className = "table-pagination";
    const count = document.createElement("span");
    count.setAttribute("aria-live", "polite");
    const actions = document.createElement("div");
    const previous = document.createElement("button");
    const next = document.createElement("button");
    const current = document.createElement("b");
    previous.type = next.type = "button";
    previous.textContent = "← Trước";
    next.textContent = "Sau →";
    previous.setAttribute("aria-label", "Trang trước");
    next.setAttribute("aria-label", "Trang sau");
    actions.append(previous, current, next);
    footer.append(count, actions);
    mount.after(footer);
    function render() {
      const q = global.DTMS_UI.fold(search.value.trim());
      const results = items.filter(item => (!q || global.DTMS_UI.fold(text(item)).includes(q)) && (!filter.value || category(item) === filter.value));
      const sorter = sorters.find(entry => entry.value === sort.value) || sorters[0];
      results.sort(sorter.compare);
      const pages = Math.max(1, Math.ceil(results.length / size));
      page = Math.min(page, pages);
      const nodes = results.slice((page - 1) * size, page * size).map(renderItem);
      if (!nodes.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "Không có dữ liệu phù hợp. Thử đổi từ khóa hoặc bộ lọc.";
        nodes.push(empty);
      }
      mount.replaceChildren(...nodes);
      count.textContent = `${results.length} / ${items.length} bản ghi`;
      current.textContent = `${page} / ${pages}`;
      previous.disabled = page === 1;
      next.disabled = page === pages;
    }
    for (const control of [search, filter, sort, pageSize]) {
      control.addEventListener(control === search ? "input" : "change", () => { page = 1; size = Number(pageSize.value); render(); });
    }
    previous.addEventListener("click", () => { page--; render(); });
    next.addEventListener("click", () => { page++; render(); });
    return Object.freeze({
      render,
      setItems(values) {
        items = [...values];
        const selected = filter.value;
        filter.replaceChildren(new Option("Tất cả", ""));
        [...new Set(items.map(category))].sort((a, b) => a.localeCompare(b, "vi")).forEach(value => filter.add(new Option(value, value)));
        if ([...filter.options].some(option => option.value === selected)) filter.value = selected;
        page = 1;
        render();
      },
    });
  }
  global.DTMS_COLLECTIONS = Object.freeze({ create });
})(window, document);
