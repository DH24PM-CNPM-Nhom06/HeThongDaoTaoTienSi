// Kiểm tra mã và tài nguyên mà không cần cài thư viện bên ngoài.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(absolute) : [absolute];
  });
}

const sources = [...filesIn(path.join(root, 'js')), ...filesIn(path.join(root, 'scripts'))]
  .filter(file => /\.(?:js|cjs)$/.test(file));
for (const file of sources) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, `${path.relative(root, file)}: ${result.error?.message || result.stderr}`);
}

let assets = 0;
const pages = [path.join(root, 'index.html'), ...filesIn(path.join(root, 'pages')).filter(file => file.endsWith('.html'))];
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) continue;
    const location = decodeURIComponent(url.split(/[?#]/)[0]);
    assert.ok(fs.existsSync(path.resolve(path.dirname(file), location)), `${path.relative(root, file)}: thiếu ${url}`);
    assets++;
  }
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(!/class="[^"]*\bdemo-notice\b/.test(index), 'Không đưa banner thử nghiệm vào giao diện chính.');
assert.ok(!/\bdemo\b|dùng thử/i.test(index.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ')), 'Nhãn giao diện cần dùng thuật ngữ học vụ.');
JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
console.log(`Đạt: ${sources.length} tệp JavaScript, ${pages.length} trang HTML, ${assets} tham chiếu tài nguyên và cấu hình package.`);
