(function initializeAssistant(global, document) {
  "use strict";
  function isVietnamese() { return (global.DTMS_DATA.getString("dtms-language") || "VI") === "VI"; }

  function init() {
    const chatWindow = document.querySelector("[data-ai-chat-window]");
    const closeBtn = document.querySelector("[data-ai-chat-close]");
    const sendBtn = document.querySelector("[data-ai-chat-send]");
    const inputField = document.querySelector("[data-ai-chat-input]");
    const chatBody = document.querySelector("[data-ai-chat-body]");
    const chipsContainer = document.querySelector("[data-ai-chips]");
    if (!chatWindow) return;
    closeBtn?.addEventListener("click", () => chatWindow.classList.remove("is-open"));

    function generateResponse(userText) {
      const text = userText.toLowerCase().trim();
      const isVI = isVietnamese();
      if (text.includes("dtms là gì") || text.includes("dtms") || text.includes("what is dtms")) return isVI
        ? "DTMS là Cổng thông tin Quản lý Đào tạo Tiến sĩ Số của Trường Đại học An Giang - ĐHQG-HCM, giúp quản lý toàn bộ hồ sơ, chuyên đề và bảo vệ luận án."
        : "DTMS is the Doctoral Training Management System OS at An Giang University (VNU-HCM), managing candidate profiles, topics, and degree defenses.";
      if (text.includes("quy trình") || text.includes("bước") || text.includes("process") || text.includes("6 bước")) return isVI
        ? "Quy trình gồm 06 bước: 01. Hồ sơ NCS → 02. Kế hoạch đào tạo → 03. Chuyên đề TS → 04. Công bố bài báo → 05. Đánh giá Luận án → 06. Cấp bằng Tiến sĩ."
        : "The process comprises 06 stages: 01. Candidate Profile → 02. Training Plan → 03. Doctoral Topics → 04. Publications → 05. Thesis Evaluation → 06. PhD Degree Issue.";
      if (text.includes("điều kiện") || text.includes("bảo vệ") || text.includes("bài báo") || text.includes("requirement")) return isVI
        ? "Mở phân hệ M10 để xem bảng kiểm điều kiện bảo vệ từ hồ sơ đã lưu. Tín chỉ, chuyên đề, công bố và các điều kiện chính thức cần được nhà trường xác nhận theo chương trình đào tạo."
        : "Open module M10 to review the saved defense checklist. Official defense requirements must be confirmed for the applicable curriculum.";
      if (text.includes("tra cứu") || text.includes("văn bằng") || text.includes("bằng") || text.includes("degree") || text.includes("lookup")) return isVI
        ? "Chọn mục Tra cứu, nhập cả số hiệu văn bằng và họ tên. Dịch vụ chưa sẵn sàng sẽ không trả kết luận văn bằng hợp lệ."
        : "Select Degree lookup, enter both the degree code and recipient name. Verification requires a working register service.";
      return isVI
        ? "Xin chào! Tôi là Trợ lý AI Mini của DTMS. Bạn có thể hỏi tôi về Quy trình 6 bước, Điều kiện bảo vệ luận án hoặc Cách tra cứu văn bằng Tiến sĩ."
        : "Hello! I am DTMS Mini AI Assistant. Feel free to ask me about the 6-stage process, defense requirements, or degree verification.";
    }

    function appendMessage(sender, text) {
      if (!chatBody) return;
      const message = document.createElement("div");
      message.className = `ai-msg ${sender === "user" ? "ai-msg-user" : "ai-msg-bot"}`;
      message.textContent = text;
      if(chatBody.children.length >= 40)chatBody.firstElementChild.remove();
      chatBody.append(message);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function send(text) {
      const userMessage = String(text || inputField?.value.trim() || "").slice(0, 2000);
      if (!userMessage) return;
      appendMessage("user", userMessage);
      if (inputField) inputField.value = "";
      global.setTimeout(() => appendMessage("bot", generateResponse(userMessage)), 400);
    }

    sendBtn?.addEventListener("click", () => send());
    inputField?.addEventListener("keydown", (event) => { if (event.key === "Enter") send(); });
    chipsContainer?.addEventListener("click", (event) => {
      const chip = event.target.closest(".ai-chip");
      if (chip) send(chip.textContent.trim());
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
