// Kiểm tra tĩnh chức năng M01; không gọi backend và không thay đổi CSDL.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'js/modules/management.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const api = fs.readFileSync(path.join(root, 'js/core/api.js'), 'utf8');
const cases = [
  ['ADMIN được nhận diện', /ADMIN: \{ id: "usr_admin", code: "ADMIN"/.test(js)],
  ['ADMIN/PDT có quyền quản lý hồ sơ', /const canManage = \["ADMIN", "PDT"\]\.includes\(currentUser\.code\)/.test(js)],
  ['NCS không được thêm hồ sơ', /if \(!maNcs && !canManage\)/.test(js)],
  ['Có kiểm tra vai trò ở thao tác ghi', /async function submitServerCandidate\(event\) \{[\s\S]{0,130}if \(!\["ADMIN", "PDT"\]/.test(js)],
  ['Mã NCS trong form cá nhân có ID riêng', /id="profile-code-readonly" readonly/.test(html)],
  ['Tên NCS trong form cá nhân là chỉ đọc', /id="profile-name-readonly" readonly/.test(html)],
  ['Mã NCS trong form cá nhân được lấy từ API', /profileCodeInput\.value = candidateCode/.test(js)],
  ['Cập nhật liên hệ dùng Profile/me', /updateProfile: body => request\("\/api\/Profile\/me"/.test(api)],
  ['Tạo NCS đi qua NcsImport', /importCandidates: list => request\("\/api\/NcsImport"/.test(api)],
  ['Sửa NCS qua DTO PUT', /updateCandidate: \(maNcs, body\) => request\("\/api\/Nghiencuusinhs\/"/.test(api)],
  ['Lấy ngành/hạn từ danh sách NCS', /const majorCode = pick\(ownRecord, "maNganh"/.test(js) && /deadlineStd\.textContent = formatDate\(pick\(ownRecord/.test(js)],
  ['Có ô người hướng dẫn chính', /id="profile-display-supervisor"/.test(html)],
  ['Không giả dữ liệu CCCD, địa chỉ', /Chưa có trường dữ liệu trong API/.test(js)],
  ['Có gợi ý mã ngành', /id="candidate-major-options"/.test(html)],
];
for (const [name, success] of cases) { assert.ok(success, name); console.log('PASS ' + name); }
console.log(`${cases.length}/${cases.length} kiểm tra tĩnh PASS; không thay thế test giao diện/API thực tế.`);
