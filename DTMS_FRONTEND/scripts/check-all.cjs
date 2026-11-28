const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');
const server = require('./serve.cjs');

const args = process.argv.slice(2);
const profileOnly = args.includes('--profile');
const browsers = args.filter(arg => arg !== '--profile');
if (!browsers.length) browsers.push(process.env.DTMS_BROWSER || 'chromium');

function run(script, browser, base) {
  const child = spawn(process.execPath, [path.join(__dirname, script)], {
    env: { ...process.env, DTMS_BROWSER: browser, DTMS_URL: base },
    stdio: 'inherit',
    windowsHide: true
  });
  return once(child, 'close').then(([code]) => code === 0);
}

async function main() {
  let base = process.env.DTMS_URL;
  if (!base) {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = 'http://127.0.0.1:' + server.address().port;
  }

  const scripts = [
    ...(profileOnly ? [] : ['check-frontend.cjs', 'check-integration.cjs', 'check-regressions.cjs']),
    'check-profile-layout.cjs'
  ];
  try {
    for (const browser of browsers) {
      for (const script of scripts) {
        if (!(await run(script, browser, base))) process.exitCode = 1;
      }
    }
  } finally {
    if (server.listening) server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
