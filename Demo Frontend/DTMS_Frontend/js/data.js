/* Lớp lưu trữ dữ liệu và tùy chọn giao diện. Không lưu mật khẩu hoặc nội dung tệp. */
(function (global) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  function merge(defaults, saved) {
    if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : clone(defaults);
    if (defaults && typeof defaults === 'object') {
      const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      const result = { ...source };
      for (const key of Object.keys(defaults)) result[key] = merge(defaults[key], source[key]);
      return result;
    }
    return typeof saved === typeof defaults && saved !== null ? saved : defaults;
  }
  function read(key, defaults, storage) {
    try {
      storage ||= global.localStorage;
      const raw = storage.getItem(key);
      if (!raw) return clone(defaults);
      try { return merge(defaults, JSON.parse(raw)); }
      catch {
        // Giữ nguyên bản hỏng trước khi dùng dữ liệu mẫu, không xóa dữ liệu người dùng.
        storage.setItem(key + '_RECOVERY_' + Date.now(), raw);
        global.setTimeout(() => global.showToast?.('Khôi phục dữ liệu', 'Dữ liệu cũ sai định dạng đã được giữ trong khóa RECOVERY. Đang hiển thị dữ liệu khởi tạo.'), 0);
      }
    } catch {
      global.setTimeout(() => global.showToast?.('Không truy cập được bộ nhớ', 'Trình duyệt đang chặn lưu trữ. Thay đổi sẽ không được báo là đã lưu.'), 0);
    }
    return clone(defaults);
  }
  function write(key, value, storage) {
    try { (storage || global.localStorage).setItem(key, JSON.stringify(value)); return true; }
    catch { global.showToast?.('Không thể lưu dữ liệu', 'Bộ nhớ trình duyệt bị chặn hoặc đã đầy. Dữ liệu nhập được giữ để bạn thử lại.'); return false; }
  }
  function csv(rows) {
    return '\uFEFF' + rows.map(row => row.map(value => {
      let text = String(value ?? '');
      if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    }).join(',')).join('\r\n');
  }
  const volatilePreferences=new Map();
  function getString(key, fallback='', session=false) {
    try { return (session?global.sessionStorage:global.localStorage).getItem(key) ?? volatilePreferences.get((session?'session:':'local:')+key) ?? fallback; }
    catch { return volatilePreferences.get((session?'session:':'local:')+key) ?? fallback; }
  }
  function setString(key, value, session=false) {
    volatilePreferences.set((session?'session:':'local:')+key,String(value));
    try { (session?global.sessionStorage:global.localStorage).setItem(key,String(value));return true; }
    catch { return false; }
  }
  function remove(key,session=false) {
    volatilePreferences.delete((session?'session:':'local:')+key);
    try { (session?global.sessionStorage:global.localStorage).removeItem(key);return true; }
    catch { return false; }
  }
  global.DTMS_DATA = Object.freeze({ read, write, clone, csv, getString, setString, remove });
})(window);
