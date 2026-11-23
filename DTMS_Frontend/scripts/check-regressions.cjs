const assert = require('node:assert/strict');
const { readFileSync, writeFileSync } = require('node:fs');
const { base, channel, reportPath, runChecks } = require('./browser-test.cjs');

const view = page => page.locator('.os-view.is-active');
const file = { name: '<b>minh-chung.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 fixture') };
const cases = [
  ['Đường dẫn trực tiếp, Back/Forward và 10 trang tách', async page => {
    await page.goto(base + '/#lookup');
    assert.equal(await view(page).getAttribute('data-view'), 'lookup');
    await page.evaluate(() => switchView('notifications'));
    await page.goBack();
    await page.locator('.os-view.is-active[data-view=lookup]').waitFor();
    await page.goForward();
    await page.locator('.os-view.is-active[data-view=notifications]').waitFor();
    for (const name of ['home', 'profile', 'management', 'roles', 'roadmap', 'notifications', 'public', 'lookup', 'citations', 'about']) {
      await page.goto(base + '/pages/' + name + '.html');
      await page.waitForURL('**/index.html#' + name);
      const destination = name === 'roles' ? 'home' : name;
      await page.locator('.os-view.is-active[data-view=' + destination + ']').waitFor();
    }
  }, { role: 'PDT' }],
  ['Tên tệp được hiển thị dưới dạng văn bản và chỉ lưu một yêu cầu', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.openModal('modal-leave-request'));
    await page.fill('#leave-duration-input', '06 tháng');
    await page.fill('#leave-reason-input', 'Kiểm tra tên tệp');
    await page.setInputFiles('#leave-file-input', file);
    await page.locator('#form-leave-request [type=submit]').dblclick({ delay: 20 });
    await page.locator('#modal-leave-request').waitFor({ state: 'hidden' });
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('DTMS_MANAGEMENT_APP_STATE_V3')));
    assert.equal(state.leaveRequests.length, 1);
    assert.equal(state.leaveRequests[0].fileName, file.name);
    assert.equal(await page.locator('#leave-history-tbody b,[data-toast-region] b').count(), 0);
  }, { role: 'NCS', localState: {} }],
  ['Thông báo tìm không dấu, sắp xếp và đóng chi tiết bằng bàn phím', async page => {
    await page.goto(base + '/#notifications');
    const controls = view(page).locator('.collection-controls');
    await controls.locator('input').fill('cong quan ly dao tao tien si');
    const cards = page.locator('.notice-list .notice-card');
    assert.equal(await cards.count(), 1);
    await cards.locator('button').click();
    await page.locator('.notice-detail-dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.locator('.notice-detail-dialog').waitFor({ state: 'hidden' });
    await controls.locator('input').fill('');
    await controls.locator('select').nth(1).selectOption('oldest');
    assert.match(await cards.first().locator('time').textContent(), /01\/10\/2026/);
  }],
  ['Xuất CSV có nội dung đúng và tải bản sao JSON', async page => {
    await page.goto(base + '/#management');
    const names = ['BaoCao_KiemDinh.csv', 'ThongKe_TienDo.csv', 'DuLieu_BaCongKhai.csv'];
    const contents = [];
    for (const name of names) {
      const result = page.waitForEvent('download');
      await page.evaluate(name => DTMS_MANAGEMENT.handleExportReport(name), name);
      const downloaded = await result;
      assert.equal(downloaded.suggestedFilename(), name);
      contents.push(readFileSync(await downloaded.path(), 'utf8'));
    }
    assert.equal(new Set(contents).size, 3);
    assert.match(contents[0], /Tín chỉ đã đạt/);
    assert.match(contents[1], /Ứng viên kiểm thử/);
    assert.doesNotMatch(contents[2], /dtms@example.test/);
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m01'));
    const backup = page.waitForEvent('download');
    await page.locator('[data-backup-data]').click();
    assert.equal((await backup).suggestedFilename(), 'DTMS_Backup.json');
  }, { role: 'PDT', localState: { candidates: [
    { id: 'ncs-01', code: 'TEST-001', name: 'Ứng viên kiểm thử', major: 'Kiểm thử', email: 'dtms@example.test' }
  ] } }],
  ['API Lab chuyển từ danh mục tĩnh sang Swagger', async page => {
    let calls = 0;
    await page.route('**/swagger/v1/swagger.json', route => {
      if (++calls === 1) return route.fulfill({ status: 503 });
      return route.fulfill({ json: {
        openapi: '3.0.0',
        paths: { '/api/example': { get: { tags: ['Example'], summary: 'Kiểm thử Swagger' } } }
      } });
    });
    await page.goto(base + '/#api-lab');
    await page.getByText('Bản tham khảo từ backend', { exact: true }).waitFor();
    assert.match(await page.locator('#api-lab-counter').textContent(), /147/);
    await page.locator('#api-lab-url').fill(base);
    await page.locator('#api-lab-sync').click();
    await page.locator('#api-lab-list').getByText('/api/example', { exact: true }).waitFor();
    assert.match(await page.locator('#api-lab-source').textContent(), /Swagger/);
  }],
  ['Các tab và modal hiển thị không tràn ở 4 viewport', async page => {
    await page.goto(base + '/#management');
    const geometry = [];
    const tabs = page.locator('.mgmt-tab-btn:visible');
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const module of await tabs.evaluateAll(items => items.map(item => item.dataset.targetModule))) {
        await page.evaluate(module => DTMS_MANAGEMENT.switchModuleTab(module), module);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), module + ' tràn ở ' + width);
      }
      for (const modal of ['modal-edit-profile', 'modal-leave-request', 'modal-edit-plan', 'modal-submit-progress', 'modal-candidate']) {
        const role = modal === 'modal-candidate' ? 'PDT' : 'NCS';
        await page.evaluate(({ role, modal }) => {
          DTMS_MANAGEMENT.switchRole(role);
          DTMS_MANAGEMENT.openModal(modal);
        }, { role, modal });
        const dialog = page.locator('#' + modal + ' .mgmt-modal-dialog');
        await dialog.waitFor();
        const rect = await dialog.boundingBox();
        assert(rect.x >= -1 && rect.x + rect.width <= width + 1, modal + ' tràn ở ' + width);
        geometry.push({ width, modal, left: rect.x, right: rect.x + rect.width });
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
      }
      await page.evaluate(() => DTMS_MANAGEMENT.switchRole('PDT'));
    }
    writeFileSync(reportPath('modal-' + channel + '.json'), JSON.stringify(geometry, null, 2));
  }, { role: 'PDT' }]
];

for (const scenario of ['valid', 'not-found', 'invalid-schema', 'mismatched', 'http-error', 'invalid-json']) {
  let requests = 0;
  cases.push(['Tra cứu văn bằng ' + scenario, async page => {
    await page.goto(base + '/#lookup');
    await page.fill('[data-input-code]', 'TEST-001');
    await page.fill('[data-input-name]', 'Người kiểm thử');
    await page.locator('[data-verify-btn]').click();
    await page.locator('[data-degree-lookup-form][aria-busy=false]').waitFor();
    assert.equal(requests, 1);
    const card = page.locator('[data-foil-card]');
    if (scenario === 'valid') assert.match(await card.textContent(), /SG-001/);
    else assert.equal(await card.textContent(), '');
  }, { api(request, url, route) {
    if (url.pathname !== '/api/Public/diploma') return;
    requests++;
    assert.equal(request.method(), 'GET');
    assert.equal(url.searchParams.get('code'), 'TEST-001');
    assert.equal(url.searchParams.get('name'), 'Người kiểm thử');
    if (scenario === 'http-error') return route.fulfill({ status: 500, json: {} });
    if (scenario === 'invalid-json') return route.fulfill({ contentType: 'application/json', body: '{bad' });
    if (scenario === 'invalid-schema') return route.fulfill({ json: { unexpected: true } });
    if (scenario === 'not-found') return route.fulfill({ json: { isValid: false, data: null } });
    return route.fulfill({ json: { isValid: true, data: {
      soHieuBang: scenario === 'mismatched' ? 'OTHER' : 'TEST-001', hoTen: 'Người kiểm thử',
      nganhDaoTao: 'Ngành mẫu', soVaoSoGoc: 'SG-001', ngayCap: '2026-01-20'
    } } });
  } }]);
}

runChecks('regressions', cases).catch(error => { console.error(error); process.exitCode = 1; });
