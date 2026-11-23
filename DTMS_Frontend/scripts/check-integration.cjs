const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const { base, runChecks } = require('./browser-test.cjs');

const thesis = {
  title: 'Luận án API <b>Kiểm thử</b>',
  candidate: 'Nghiên cứu sinh kiểm thử',
  field: 'Khoa học',
  date: '17/10/2026',
  summaryUrl: '/assets/icons/favicon.svg',
  fullUrl: ''
};
const cases = ['valid', 'empty', '500', 'invalid-json', 'invalid-schema', 'timeout', 'unsafe-url'].map(scenario => {
  let calls = 0;
  const failed = ['500', 'invalid-json', 'invalid-schema', 'timeout'].includes(scenario);
  return ['Luận án từ API giả lập ' + scenario, async page => {
    await page.goto(base + '/#public');
    assert.equal(calls, 0);
    assert.equal(await page.locator('.thesis-entry').count(), 5);

    const mode = page.locator('[data-thesis-mode-switch]');
    await mode.click();
    const status = page.locator('[data-thesis-status]');
    await page.waitForFunction(() => {
      const grid = document.querySelector('[data-thesis-grid]');
      return !grid.hasAttribute('aria-busy') && /^(Đã tải|Backend|API:)/.test(document.querySelector('[data-thesis-status]').textContent);
    });
    assert.equal(calls, 1);
    const items = page.locator('.thesis-entry');
    if (failed || scenario === 'empty') {
      assert.equal(await items.count(), 0);
      assert.match(await status.textContent(), failed ? /^API:/ : /chưa có luận án/);
      await mode.click();
      assert.equal(await items.count(), 5);
      if (scenario === '500') {
        await mode.click();
        await page.locator('.thesis-entry').waitFor();
        assert.equal(calls, 2);
      }
    } else {
      assert.equal(await items.count(), 1);
      assert.equal(await items.locator('h3').textContent(), thesis.title);
      assert.equal(await items.locator('h3 b').count(), 0);
      assert.equal(await items.locator('a').count(), scenario === 'unsafe-url' ? 0 : 1);
    }
  }, {
    settings: { API_TIMEOUT_MS: scenario === 'timeout' ? 150 : 8000 },
    api(request, url, route) {
      if (url.pathname !== '/api/public/theses') return;
      assert.equal(request.method(), 'GET');
      calls++;
      if (scenario === '500' && calls === 1) return route.fulfill({ status: 500, json: { message: 'Kiểm thử 500' } });
      if (scenario === 'invalid-json') return route.fulfill({ contentType: 'application/json', body: '{bad' });
      if (scenario === 'invalid-schema') return route.fulfill({ json: { data: { items: [{ title: 123 }] } } });
      if (scenario === 'timeout') return delay(450).then(() => route.fulfill({ json: [] }).catch(() => {}));
      const item = scenario === 'unsafe-url' ? { ...thesis, summaryUrl: 'file:///test.pdf' } : thesis;
      return route.fulfill({ json: { data: { items: scenario === 'empty' ? [] : [item] } } });
    }
  }];
});

const candidate = {
  maNcs: 'TEST-001', hoTen: 'Hồ sơ kiểm thử', maNganh: 'TEST', ngaySinh: '1990-01-01',
  gioiTinh: true, doiTuongDauVao: 1, soQdtrungTuyen: 'QD-001', ngayNhapHoc: '2026-09-01',
  ngayHetHanChuan: '2029-09-01', ngayHetHanToiDa: '2031-09-01', trangThaiHocVu: 1
};

let updatedCandidate;
cases.push(
  ['PDT sửa đúng DTO hồ sơ và tải lại dữ liệu', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m01'));
    const edit = page.locator('[data-candidate-view="TEST-001"]');
    await edit.click();
    const form = page.locator('#form-candidate');
    assert.equal(await form.locator('#candidate-code').getAttribute('readonly'), '');
    await form.locator('#candidate-name').fill('Hồ sơ đã sửa');
    await form.locator('#candidate-save').click();
    await page.locator('#modal-candidate').waitFor({ state: 'hidden' });
    await page.getByText('Hồ sơ đã sửa', { exact: true }).waitFor();
    assert.deepEqual(updatedCandidate, {
      hoTen: 'Hồ sơ đã sửa', ngaySinh: candidate.ngaySinh, gioiTinh: candidate.gioiTinh,
      maNganh: candidate.maNganh, doiTuongDauVao: candidate.doiTuongDauVao,
      soQdtrungTuyen: candidate.soQdtrungTuyen, ngayNhapHoc: candidate.ngayNhapHoc
    });
  }, { role: 'PDT', api(request, url, route) {
    if (!url.pathname.startsWith('/api/Nghiencuusinhs')) return;
    assert.equal(request.headers().authorization, 'Bearer dtms-test-token');
    if (request.method() === 'PUT') {
      assert.equal(url.pathname, '/api/Nghiencuusinhs/TEST-001');
      updatedCandidate = request.postDataJSON();
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: { data: [{ ...candidate, ...updatedCandidate }] } });
  } }],
  ['NCS xem hồ sơ theo quyền chỉ đọc', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m01'));
    await page.locator('[data-candidate-view="TEST-001"]').click();
    assert.equal(await page.locator('#candidate-name').getAttribute('readonly'), '');
    assert.equal(await page.locator('#candidate-save').isVisible(), false);
    assert.equal(await page.locator('[data-candidate-delete]').count(), 0);
  }, { role: 'NCS', api(request, url, route) {
    if (url.pathname === '/api/Nghiencuusinhs') return route.fulfill({ json: { data: [candidate] } });
  } }]
);

runChecks('integration', cases).catch(error => { console.error(error); process.exitCode = 1; });
