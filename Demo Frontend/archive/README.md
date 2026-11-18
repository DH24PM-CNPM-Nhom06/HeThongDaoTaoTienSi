# Lưu trữ — code không còn được tải (14/11/2026)

Các file trong thư mục này từng nằm trong repo nhưng **không được `index.html` hay bất kỳ file nào đang chạy tham chiếu** (đã kiểm tra bằng grep toàn bộ `index.html`, `pages/`, `scripts/`, `js/`):

- `js-legacy/`: `app.js`, `management.js`, `config.js`, `api.js` (bản cũ, trước kiến trúc `js/core/` + `js/modules/`), `home.js` (bản `js/legacy/`), `root-home.js` (bản `js/` gốc).
- `css-legacy/`: `home.css`, `style.css`, `responsive.css` (bản `css/legacy/`), `root-home.css`, `root-style.css` (bản `css/` gốc).

Giữ lại để đối chiếu, không xóa hẳn. Muốn khôi phục một file: chép ngược lại đúng đường dẫn cũ và kiểm tra lại bằng `npm run check`.
