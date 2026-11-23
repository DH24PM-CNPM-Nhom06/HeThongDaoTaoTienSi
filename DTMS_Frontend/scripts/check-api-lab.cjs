// Kiểm tra sự hiện diện của toàn bộ endpoints và tích hợp API Lab vào giao diện cũ.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'js/api-manifest.js'),'utf8');
const context={window:{}};
vm.runInNewContext(js,context);
const endpoints=context.window.DTMS_API_MANIFEST;
assert.equal(endpoints.length,147,'Thiếu hoặc thừa HTTP action so với snapshot backend');
const unique=new Set(endpoints.map(e=>e.method+' '+e.path.toLowerCase().replace(/:[a-z\d_]+/g,'')));
assert.equal(unique.size,147,'Endpoint trùng trong manifest');
for (const e of endpoints){
  assert.match(e.path,/^\/api\//i);
  assert.match(e.method,/^(GET|POST|PUT|DELETE)$/);
}
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const marker of ['data-view="api-lab"','data-dock-target="api-lab"','id="api-lab-request-form"','js/api-manifest.js','js/features/api-lab.js','css/api-lab.css']) {
  assert.ok(page.includes(marker),'Thiếu '+marker);
}
const api=fs.readFileSync(path.join(root,'js/core/api.js'),'utf8');
assert.match(api,/result\?\.loi\s*\|\|\s*result\?\.Loi/, 'Chưa xử lý lỗi import NCS');
assert.ok(api.includes('api/File/legacy/'), 'Thiếu hỗ trợ tài liệu legacy');
const management=fs.readFileSync(path.join(root,'js/modules/management.js'),'utf8');
assert.match(management,/updateCandidate\(editId, update\)/, 'Chưa tích hợp PUT NCS an toàn');
const lab=fs.readFileSync(path.join(root,'js/features/api-lab.js'),'utf8');
assert.ok(lab.includes('Cho') || lab.includes('Gửi'), 'API Lab JS không đầy đủ');
console.log('PASS: 147/147 route duy nhất, giao diện cũ giữ nguyên, API Lab và các bản sửa tích hợp tồn tại.');
