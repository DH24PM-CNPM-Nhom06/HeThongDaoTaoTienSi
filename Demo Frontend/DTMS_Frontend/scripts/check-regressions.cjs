// Các lỗi phát hiện ngày 18/10/2026. Chỉ dùng context riêng và API mock.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(path.dirname(process.execPath), '..', 'node_modules', 'playwright')); }
const channel = process.env.DTMS_BROWSER || 'chromium';
const base = process.env.DTMS_URL || 'http://127.0.0.1:4173';
const key = 'DTMS_MANAGEMENT_APP_STATE_V2';
const results = [];
const file = { name: 'minh-chung.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 Test fixture') };
const state = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
async function check(name, fn) {
  try { await fn(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message); }
}
(async () => {
  const browser = await (playwright[channel] || playwright.chromium).launch({
    headless: true, ...(playwright[channel] ? {} : { channel }),
    ...(channel === 'firefox' && process.env.DTMS_FIREFOX_EXECUTABLE ? { executablePath: process.env.DTMS_FIREFOX_EXECUTABLE } : {}),
  });
  async function isolated(fn, settings) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    if (settings) await context.addInitScript(settings => { window.DTMS_RUNTIME_CONFIG = settings; }, settings);
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    try { await page.goto(base); await page.waitForTimeout(100); await fn(page); }
    finally { await context.close(); }
  }
  const role = (page, value) => page.evaluate(value => DTMS_MANAGEMENT.switchRole(value), value);
  const open = async (page, id) => { await page.evaluate(id => DTMS_MANAGEMENT.openModal(id), id); await page.waitForTimeout(50); };
  const submit = async (page, id) => { await page.locator('#' + id + ' [type="submit"]').click(); await page.waitForTimeout(430); };
  await check('Tên tệp chứa HTML không thực thi trong toast và lịch sử', () => isolated(async page => {
    await open(page, 'modal-leave-request');
    await page.fill('#leave-duration-input', '06 tháng');
    await page.fill('#leave-reason-input', 'Kiểm tra tên tệp');
    await page.setInputFiles('#leave-file-input', { ...file, name: '<img src=x onerror=window.__executed=1>.pdf' });
    await submit(page, 'form-leave-request');
    assert.equal(await page.evaluate(() => window.__executed), undefined);
    assert.equal(await page.locator('[data-toast-region] img,#leave-history-tbody img').count(), 0);
  }));
  await check('Mở đường dẫn trực tiếp, Back/Forward và 10 trang tách', () => isolated(async page => {
    await page.goto(base + '/#lookup');
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'), 'lookup');
    await page.evaluate(() => switchView('notifications')); await page.goBack();
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'), 'lookup');
    await page.goForward();
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'), 'notifications');
    for (const view of ['home', 'profile', 'management', 'roles', 'roadmap', 'notifications', 'public', 'lookup', 'citations', 'about']) {
      await page.goto(base + '/pages/' + view + '.html');
      await page.waitForURL('**/index.html#' + view);
      await page.waitForFunction(view => document.querySelector('.os-view.is-active')?.dataset.view === view, view);
    }
  }));
  await check('Quota đủ 4/4 không tự giảm sau reload', () => isolated(async page => {
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ advisorsQuota: { 'GS.TS. Trần Văn Hướng': { title: 'GS', max: 4, count: 4 } } })), key);
    await page.reload(); await role(page, 'PDT');
    assert.match(await page.locator('#assign-nhd-main-select option').first().textContent(), /4\/4/);
    assert.equal((await state(page)).advisorsQuota['GS.TS. Trần Văn Hướng'].count, 4);
  }));
  await check('Chấm chuyên đề lưu điểm/nhận xét và giữ sau reload', () => isolated(async page => {
    await role(page, 'NHD'); await page.evaluate(() => DTMS_MANAGEMENT.handleGradeTopic(1));
    await page.selectOption('#topic-candidate', 'NCS. Nguyễn Văn Bình');
    await page.fill('#topic-score-input', '2'); await page.fill('#topic-grade-comment', 'Chưa đạt, cần chỉnh sửa');
    await submit(page, 'form-grade-topic');
    assert.equal((await state(page)).topics[0].score, '2.0');
    assert.equal((await state(page)).topics[0].status, 'failed');
    await page.reload();
    assert.match(await page.locator('#topic-score-1').textContent(), /2\.0/);
    assert.match(await page.locator('[data-topic-grade-history]').textContent(), /2\.0/);
  }));
  await check('Không đánh giá hồ sơ ngoài phạm vi NHD', () => isolated(async page => {
    await role(page, 'NHD'); await page.evaluate(() => DTMS_MANAGEMENT.handleGradeTopic(1));
    assert(await page.locator('#topic-candidate option[value="NCS. Lê Thị Mai"]').isDisabled());
    await page.evaluate(() => { document.querySelector('#topic-candidate').value = 'NCS. Lê Thị Mai'; document.querySelector('#topic-score-input').value = '10'; document.querySelector('#topic-grade-comment').value = 'Ngoài phân công'; document.querySelector('#form-grade-topic').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    assert.match(await page.locator('[data-toast-region]').textContent(), /ngoài phạm vi/i);
  }));
  await check('Nộp lại tiểu luận hủy hiệu lực kết quả Đạt cũ', () => isolated(async page => {
    await open(page, 'modal-submit-essay');
    await page.locator('#modal-submit-essay input[type=text]').fill('Tiểu luận phiên bản mới');
    await page.locator('#modal-submit-essay textarea').fill('Nội dung mới cần được chấm lại');
    await page.setInputFiles('#modal-submit-essay input[type=file]', file);
    await submit(page, 'form-submit-essay');
    assert.equal((await state(page)).essayResult.status, 'pending');
    assert.equal((await state(page)).essayResult.avg, '');
  }));
  await check('Gửi workflow kép chỉ tạo một bản ghi và dùng một khóa chính', () => isolated(async page => {
    await open(page, 'modal-edit-plan');
    await page.locator('#modal-edit-plan textarea').fill('Kế hoạch kiểm thử gửi kép');
    await page.locator('#form-edit-plan [type=submit]').dblclick({ delay: 20 }); await page.waitForTimeout(450);
    assert.equal((await state(page)).workflowSubmissions.length, 1);
    assert.equal(await page.evaluate(() => localStorage.getItem('DTMS_WORKFLOW_SUBMISSIONS_V1')), null);
  }));
  await check('Migration yêu cầu cũ không làm mất dữ liệu', () => isolated(async page => {
    await page.evaluate(() => localStorage.setItem('DTMS_WORKFLOW_SUBMISSIONS_V1', JSON.stringify([{ id: 'OLD-1', workflow: 'modal-edit-plan', title: 'Kế hoạch cũ', role: 'NCS', submittedAt: '2026-10-01T00:00:00Z', values: { objectives: 'Nội dung cần giữ' } }])));
    await page.reload();
    assert.match(await page.locator('[data-workflow="modal-edit-plan"]').textContent(), /Nội dung cần giữ/);
    await open(page, 'modal-edit-profile'); await page.fill('#profile-phone-input', '0987654321'); await submit(page, 'form-edit-profile');
    assert.equal((await state(page)).workflowSubmissions[0].id, 'OLD-1');
    assert.equal((await state(page)).schemaVersion, 3);
  }));
  await check('Thông báo tìm không dấu, lọc và sắp xếp ngày', () => isolated(async page => {
    await page.evaluate(() => switchView('notifications'));
    const controls = page.locator('[data-view=notifications] .collection-controls');
    await controls.locator('input').fill('minh chung dien tu');
    assert.equal(await page.locator('.notice-list .notice-card').count(), 1);
    await controls.locator('input').fill('');
    await controls.locator('select').nth(1).selectOption('oldest');
    assert.match(await page.locator('.notice-list time').first().textContent(), /01\/10\/2026/);
    await controls.locator('select').first().selectOption('NHẮC VIỆC');
    assert.equal(await page.locator('.notice-list .notice-card').count(), 1);
  }));
  await check('Ba báo cáo CSV có nội dung riêng và dữ liệu hiện hành', () => isolated(async page => {
    await role(page, 'PDT');
    const contents = [];
    for (const name of ['BaoCao_KiemDinh.csv', 'ThongKe_TienDo.csv', 'DuLieu_BaCongKhai.csv']) {
      const pending = page.waitForEvent('download');
      await page.evaluate(name => DTMS_MANAGEMENT.handleExportReport(name), name);
      const download = await pending;
      contents.push(fs.readFileSync(await download.path(), 'utf8'));
      assert.equal(download.suggestedFilename(), name);
    }
    assert.equal(new Set(contents).size, 3);
    assert.match(contents[0], /Tín chỉ đã đạt/);
    assert.match(contents[1], /Nguyễn Văn Bình/);
    assert.doesNotMatch(contents[2], /nvbinh_ncs@/);
  }));
  await check('Các form và ảnh campus có nhãn/tài nguyên hợp lệ', () => isolated(async page => {
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(input => !input.labels?.length && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')).map(input => input.id)), []);
    await page.evaluate(() => switchView('home'));
    await page.locator('img').evaluate(image => image.scrollIntoView());
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  }));
  for (const scenario of ['valid', 'not-found', 'invalid-schema', 'mismatched', 'http-error', 'invalid-json']) {
    await check('Tra cứu GET đúng hợp đồng: ' + scenario, () => isolated(async page => {
      let requests = 0;
      await page.route('**/api/Public/diploma?**', async route => {
        requests++;
        assert.equal(route.request().method(), 'GET');
        const url = new URL(route.request().url());
        assert.equal(url.searchParams.get('code'), 'TEST-001');
        if (scenario === 'http-error') return route.fulfill({ status: 500, json: {} });
        if (scenario === 'invalid-json') return route.fulfill({ contentType: 'application/json', body: '{bad' });
        if (scenario === 'invalid-schema') return route.fulfill({ json: { unexpected: true } });
        if (scenario === 'not-found') return route.fulfill({ json: { isValid: false, data: null } });
        await new Promise(resolve => setTimeout(resolve, 200));
        return route.fulfill({ json: { isValid: true, data: { soHieuBang: scenario === 'mismatched' ? 'OTHER' : 'TEST-001', hoTen: 'Nguyễn Văn Kiểm Thử', nganhDaoTao: 'Ngành mẫu', soVaoSoGoc: 'SG-001', ngayCap: '2026-01-20' } } });
      });
      await page.evaluate(() => switchView('lookup'));
      await page.fill('[data-input-code]', 'TEST-001'); await page.fill('[data-input-name]', 'Nguyễn Văn Kiểm Thử');
      await page.locator('[data-verify-btn]').click();
      await page.evaluate(() => document.querySelector('[data-degree-lookup-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
      await page.waitForFunction(() => document.querySelector('[data-degree-lookup-form]').getAttribute('aria-busy') === 'false');
      assert.equal(requests, 1);
      if (scenario === 'valid') assert.match(await page.locator('[data-foil-card]').textContent(), /SG-001/);
      else assert.equal(await page.locator('[data-foil-card]').textContent(), '');
    }, { API_BASE_URL: base, DEGREE_SERVICE_READY: true }));
  }
  await check('24 màn hình và các modal ở 4 viewport không tràn', () => isolated(async page => {
    const geometry = [];
    await role(page, 'PDT');
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['home', 'profile', 'management', 'roles', 'roadmap', 'notifications', 'public', 'lookup', 'citations', 'about']) {
        await page.evaluate(view => switchView(view), view);
        assert(await page.evaluate(() => document.body.scrollWidth <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1), view + ' ' + width);
      }
      await page.evaluate(() => switchView('management'));
      for (let n = 1; n <= 14; n++) {
        const id = 'm' + String(n).padStart(2, '0');
        await page.evaluate(id => DTMS_MANAGEMENT.switchModuleTab(id), id);
        assert(await page.evaluate(() => document.body.scrollWidth <= innerWidth + 1), id + ' ' + width);
      }
      for (const id of await page.locator('.mgmt-modal').evaluateAll(elements => elements.map(element => element.id))) {
        const roles = await page.locator('#' + id).getAttribute('data-allowed-roles');
        await role(page, roles?.split(',')[0] || 'PDT'); await open(page, id);
        const dimensions = await page.locator('#' + id + ' .mgmt-modal-dialog').evaluate(element => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, scroll: element.scrollWidth, client: element.clientWidth }; });
        assert(dimensions.left >= -1 && dimensions.right <= width + 1 && dimensions.scroll <= dimensions.client + 1, id + ' ' + width + ' ' + JSON.stringify(dimensions));
        geometry.push({ width, modal: id, ...dimensions }); await page.keyboard.press('Escape');
      }
    }
    fs.writeFileSync('docs/TEST_MODAL_' + channel + '.json', JSON.stringify(geometry, null, 2));
    await role(page, 'PDT');
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => { switchView('management'); DTMS_MANAGEMENT.switchModuleTab('m01'); scrollTo(0, 0); });
      await page.waitForTimeout(350); await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(60); await page.screenshot({ path: 'docs/final-' + width + '-' + channel + '.png', fullPage: false });
    }
  }));
  await browser.close();
  fs.writeFileSync('docs/TEST_REGRESSIONS_' + channel + '.json', JSON.stringify({ browser: channel, date: new Date().toISOString(), api: 'mocked; not a live backend', results }, null, 2));
  const failed = results.filter(result => !result.passed);
  console.log(`${results.length - failed.length}/${results.length} regressions passed (${channel})`);
  process.exitCode = failed.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
