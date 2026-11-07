(function initializeDegreeLookup(global, document) {
  "use strict";
  const fold = value => global.DTMS_UI.fold(value).replace(/\s+/g, " ").trim();
  let pending = false;
  function init() {
    const form = document.querySelector("[data-degree-lookup-form]");
    const button = form?.querySelector("[data-verify-btn]");
    const status = form?.querySelector("[data-degree-status]");
    const card = document.querySelector("[data-foil-card]");
    if (!form || !button || !card) return;
    const codeInput = form.querySelector("[data-input-code]");
    const nameInput = form.querySelector("[data-input-name]");
    codeInput.required = nameInput.required = true;
    codeInput.maxLength = 100;
    nameInput.maxLength = 200;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (pending || !global.DTMS_UI.validate(form)) return;
      const code = codeInput.value.trim(), name = nameInput.value.trim();
      card.replaceChildren();
      card.classList.remove("is-active");
      pending = true;
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      status.textContent = "Đang đối chiếu thông tin văn bằng…";
      try {
        const response = await global.DTMS_API.verifyDegree({ code, name });
        const valid = response?.isValid ?? response?.IsValid;
        if (valid === false) { status.textContent = "Không tìm thấy văn bằng khớp mã và họ tên."; return; }
        const data = response?.data ?? response?.Data;
        const record = data && {
          code: data.soHieuBang ?? data.SoHieuBang,
          name: data.hoTen ?? data.HoTen,
          major: data.nganhDaoTao ?? data.NganhDaoTao,
          register: data.soVaoSoGoc ?? data.SoVaoSoGoc,
          date: data.ngayCap ?? data.NgayCap,
        };
        if (valid !== true || !record || !Object.values(record).every(value => typeof value === "string" && value.trim())
          || fold(record.code) !== fold(code) || fold(record.name) !== fold(name) || Number.isNaN(Date.parse(record.date))) {
          throw new Error("Phản hồi văn bằng không đúng hợp đồng hoặc không khớp thông tin tra cứu.");
        }
        const heading = document.createElement("h3");
        heading.textContent = "Kết quả đối chiếu văn bằng";
        card.append(heading);
        for (const [label, value] of [["Họ và tên", record.name], ["Ngành đào tạo", record.major], ["Số hiệu bằng", record.code], ["Số vào sổ", record.register], ["Ngày cấp", record.date]]) {
          const paragraph = document.createElement("p"), strong = document.createElement("strong");
          strong.textContent = label + ": ";
          paragraph.append(strong, document.createTextNode(value));
          card.append(paragraph);
        }
        card.classList.add("is-active");
        status.textContent = "Máy chủ trả về bản ghi khớp mã và họ tên. Liên hệ đơn vị cấp bằng nếu cần xác nhận chính thức.";
      } catch (error) {
        status.textContent = error.status === 404 ? "Không tìm thấy văn bằng khớp mã và họ tên."
          : error.name === "ApiUnavailableError" ? "Dịch vụ xác minh văn bằng hiện chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ đơn vị cấp bằng."
          : error.message || "Không thể tra cứu. Vui lòng thử lại.";
      } finally {
        pending = false;
        button.disabled = false;
        form.setAttribute("aria-busy", "false");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})(window, document);
