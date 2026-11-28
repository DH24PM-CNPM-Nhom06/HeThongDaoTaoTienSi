const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const { base, channel, reportPath, runChecks } = require('./browser-test.cjs');

const email = 'dtms@example.test';
const password = 'mock-password';
const token = 'dtms-test-token';
const user = { maNguoiDung: 1, hoTen: 'Tài khoản kiểm thử', maVaiTro: 'NCS', roles: ['NCS'] };
const activeView = '.os-view.is-active';

function loginCase(formId, view, userSelector, passwordSelector) {
  let completeFirst;
  const firstResponse = new Promise(resolve => { completeFirst = resolve; });
  const requests = [];
  return ['Đăng nhập chậm, gửi một lần và cho thử lại trong ' + view, async page => {
    await page.goto(base + '/#' + view);
    const form = page.locator('#' + formId);
    const submit = form.locator('[type=submit]');
    await form.locator(userSelector).fill(email);
    await form.locator(passwordSelector).fill(password);

    const first = page.waitForRequest('**/api/Auth/login');
    await submit.click();
    await first;
    try {
      // Vượt mốc khóa 400 ms của các form đồng bộ khi API vẫn chưa phản hồi.
      await delay(500);
      assert.equal(await submit.isDisabled(), true);
      await form.evaluate(element => element.requestSubmit());
      assert.equal(requests.length, 1);
    } finally {
      completeFirst();
    }
    await form.locator('[type=submit]:enabled').waitFor();
    if (view === 'management') assert.match(await page.locator('#login-error').textContent(), /Thông tin không đúng/);
    else assert.match(await page.locator('#api-lab-response').textContent(), /Đăng nhập chưa thành công/);

    await form.locator(passwordSelector).fill(password);
    if (view === 'management') await page.locator('#remember-email').check();
    await submit.click();
    await page.waitForFunction(value => localStorage.getItem('jwt_token') === value, token);
    assert.equal(requests.length, 2);
    for (const request of requests) assert.deepEqual(request, { Username: email, Password: password });
    if (view === 'management') {
      await page.locator('#modal-login').waitFor({ state: 'hidden' });
      assert.equal(await page.locator(activeView).getAttribute('data-view'), 'management');
      assert.equal(await page.locator('#topbar-role-badge').textContent(), 'NCS');
      assert.equal(await page.evaluate(() => DTMS_DATA.read('dtms-remembered-email', '')), email);
      await page.reload();
      assert.equal(await page.locator(activeView).getAttribute('data-view'), 'management');
      await page.locator('[data-logout]').click();
      assert.equal(await page.evaluate(() => localStorage.getItem('jwt_token')), null);
      await page.reload();
      assert.equal(await page.locator(activeView).getAttribute('data-view'), 'home');
      await page.evaluate(() => switchView('profile'));
      await page.locator('#modal-login').waitFor();
      assert.equal(await page.locator('#login-username').inputValue(), email);
    }
  }, {
    api(request, url, route) {
      if (url.pathname !== '/api/Auth/login') return;
      requests.push(request.postDataJSON());
      return requests.length === 1
        ? firstResponse.then(() => route.fulfill({ status: 401, json: { message: 'Thông tin không đúng' } }))
        : route.fulfill({ json: { token, user } });
    }
  }];
}

const cases = [
  ['HTML, tài nguyên và handler', async page => {
    const badResponses = [];
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) badResponses.push(response.url());
    });
    await page.goto(base + '/#home');
    assert.equal(await page.locator('main').count(), 1);
    const invalid = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
      const handlers = [...document.querySelectorAll('[onclick]')].flatMap(node =>
        [...node.getAttribute('onclick').matchAll(/DTMS_MANAGEMENT\.(\w+)/g)].map(match => match[1]));
      return {
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        missingHandlers: handlers.filter(name => typeof DTMS_MANAGEMENT[name] !== 'function')
      };
    });
    assert.deepEqual(invalid, { duplicateIds: [], missingHandlers: [] });
    assert.deepEqual(badResponses, []);
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  }],
  loginCase('form-login', 'management', '#login-username', '#login-password'),
  loginCase('api-lab-login', 'api-lab', '[name=username]', '[name=password]'),
  ['Chặn phiên hết hạn khi backend trả 401', async page => {
    await page.goto(base + '/#management');
    await page.locator('.os-view.is-active[data-view=home]').waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('jwt_token')), null);
  }, { role: 'NCS', api(request, url, route) {
    if (url.pathname === '/api/Profile/me') return route.fulfill({ status: 401, json: {} });
  } }],
  ['Responsive ở 9 viewport và mở menu mobile', async page => {
    await page.goto(base + '/#management');
    for (const width of [320, 360, 390, 430, 768, 1024, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['home', 'profile', 'management', 'roadmap', 'notifications', 'public', 'lookup', 'citations', 'about', 'api-lab']) {
        await page.evaluate(view => switchView(view), view);
        assert.equal(await page.locator(activeView).getAttribute('data-view'), view);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), view + ' tràn ở ' + width);
      }
      if (width <= 768) {
        const toggle = page.locator('[data-menu-toggle]');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => switchView('management'));
    await page.screenshot({ path: reportPath('mobile-' + channel + '.png') });
  }, { role: 'PDT' }],
  ['Khôi phục khi bộ nhớ chứa JSON hỏng', async page => {
    const key = 'DTMS_MANAGEMENT_APP_STATE_V3';
    await page.goto(base + '/#home');
    await page.evaluate(key => localStorage.setItem(key, '{broken'), key);
    await page.reload();
    assert(await page.evaluate(key => Object.keys(localStorage).some(name => name.startsWith(key + '_RECOVERY_')), key));
  }]
];

runChecks('frontend', cases).catch(error => { console.error(error); process.exitCode = 1; });
