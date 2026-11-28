// Chạy demo thuần HTML: node scripts/serve.cjs [port]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/plain' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }

  if (pathname === '/runtime-config.js') {
    const runtimeConfig = process.env.DTMS_API_BASE_URL
      ? { API_BASE_URL: process.env.DTMS_API_BASE_URL }
      : {};
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('window.DTMS_RUNTIME_CONFIG = Object.assign(window.DTMS_RUNTIME_CONFIG || {}, ' + JSON.stringify(runtimeConfig) + ');');
    return;
  }

  let file;
  file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (file === root) file = path.join(root, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
if (require.main === module) {
  const port = Number(process.env.PORT || process.argv[2]) || 4173;
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host, () => console.log('DTMS: http://127.0.0.1:' + server.address().port));
}

module.exports = server;
