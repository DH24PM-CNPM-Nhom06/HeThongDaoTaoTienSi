const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, firefox, webkit } = require('playwright');

const base = new URL(process.env.DTMS_URL || 'http://127.0.0.1:4173').origin;
const channel = process.env.DTMS_BROWSER || 'chromium';
const roles = ['NCS', 'NHD', 'BM', 'KHOA', 'PDT', 'BGH', 'HOIDONG', 'ADMIN'];

function launch(browser = channel) {
  const engines = { chromium, firefox, webkit };
  const engine = engines[browser] || chromium;
  return engine.launch({
    headless: true,
    ...(engines[browser] ? {} : { channel: browser }),
    ...(browser === 'firefox' && process.env.DTMS_FIREFOX_EXECUTABLE
      ? { executablePath: process.env.DTMS_FIREFOX_EXECUTABLE }
      : {})
  });
}

function reportPath(name) {
  const directory = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(directory, { recursive: true });
  return path.join(directory, name);
}

function writeReport(name, results) {
  fs.writeFileSync(reportPath(name), JSON.stringify({ browser: channel, results }, null, 2));
}

async function configureContext(context, { role, localState, settings, api,
  allowFile = false, language } = {}) {
  // Chỉ cấp phiên thử trong context riêng. Không phục hồi phiên sau khi đăng xuất.
  await context.addInitScript(({ base, role, roles, localState, settings, allowFile, language }) => {
    const isFile = allowFile && location.protocol === 'file:';
    if (!isFile && location.origin !== base) return;
    window.DTMS_RUNTIME_CONFIG = { API_BASE_URL: isFile ? '' : base, ...settings };
    if (language) localStorage.setItem('dtms-language', language);
    if (sessionStorage.getItem('dtms-test-initialized')) return;
    sessionStorage.setItem('dtms-test-initialized', 'true');
    if (localState) localStorage.setItem('DTMS_MANAGEMENT_APP_STATE_V3', JSON.stringify(localState));
    if (role) {
      const user = { maNguoiDung: 1, hoTen: 'Tài khoản kiểm thử', email: 'dtms@example.test', maVaiTro: role, roles };
      localStorage.setItem('dtms-user', JSON.stringify(user));
      sessionStorage.setItem('dtms-role', role);
      if (!localState) localStorage.setItem('jwt_token', 'dtms-test-token');
    }
  }, { base, role, roles, localState, settings, allowFile, language });
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (allowFile && url.protocol === 'file:') return route.continue();
    if (url.origin !== base) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    if (api) {
      const response = api(request, url, route);
      if (response) return response;
    }
    return request.method() === 'GET'
      ? route.fulfill({ json: { data: [] } })
      : route.fulfill({ status: 501, json: { message: 'Chưa có phản hồi API giả lập cho yêu cầu này.' } });
  });
}

async function runChecks(name, cases) {
  const browser = await launch();
  const results = [];
  try {
    for (const [label, test, options] of cases) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
      try {
        await configureContext(context, options);
        const page = await context.newPage();
        page.setDefaultTimeout(4500);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await test(page);
        assert.deepEqual(errors, [], 'Lỗi JavaScript trong trình duyệt');
        results.push({ name: label, passed: true });
        console.log('PASS ' + label);
      } catch (error) {
        results.push({ name: label, passed: false, error: error.message });
        console.error('FAIL ' + label + ': ' + error.message);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  writeReport(name + '-' + channel + '.json', results);
  const passed = results.filter(result => result.passed).length;
  console.log(passed + '/' + results.length + ' ' + name + ' (' + channel + ')');
  if (passed !== results.length) process.exitCode = 1;
}

module.exports = { base, channel, launch, configureContext, reportPath, writeReport, runChecks };
