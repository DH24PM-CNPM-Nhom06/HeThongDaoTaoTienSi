const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
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

const m05Topics = [
  { maNcs: 'NCS01', maDeTai: 9, fileTieuLuan: '/api/File/old.pdf' },
  {
    maNcs: 'NCS01', maDeTai: 10, fileTieuLuan: '/uploads/ncs01/tieu-luan.pdf',
    fileDeCuong: '/api/File/de-cuong.pdf'
  },
  { maNcs: 'NCS02', maDeTai: 11 }
];
const m05Assessments = [
  { maNcs: 'NCS01', maDanhGia: 9, loaiDanhGia: 1, fileBienBan: '/api/File/old-minutes.pdf' },
  { maNcs: 'NCS01', maDanhGia: 10, loaiDanhGia: 1, fileBienBan: '/api/File/bien-ban.pdf' },
  {
    maNcs: 'NCS01', maDanhGia: 11, loaiDanhGia: 2, fileGiaiTrinh: '/api/File/giai-trinh.pdf',
    fileBienBan: '/api/File/outline-minutes.pdf'
  },
  { maNcs: 'NCS02', maDanhGia: 12, loaiDanhGia: 1, fileBaoCao: '/api/File/ncs02-essay.pdf' }
];

function mockM05(request, url, route) {
  if (url.pathname === '/api/Profile/me') return route.fulfill({ json: { maNcs: 'NCS01' } });
  if (url.pathname === '/api/Detailuanans') return route.fulfill({ json: m05Topics });
  if (url.pathname === '/api/Danhgiagiaidoan') return route.fulfill({ json: m05Assessments });
  if (!url.pathname.startsWith('/api/File/')) return;
  assert.equal(request.headers().authorization, 'Bearer dtms-test-token');
  return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n' + url.pathname });
}

cases.push(
  ['M05 tải đúng bốn tệp của NCS, gồm đường dẫn cũ và mới', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m05'));
    await page.getByText('4/4 tệp có thể tải.', { exact: true }).waitFor();
    assert.equal(await page.locator('#m05-candidate-field').isVisible(), false);
    const paths = {
      essay: '/api/File/legacy/NCS01/tieu-luan.pdf',
      minutes: '/api/File/bien-ban.pdf',
      outline: '/api/File/de-cuong.pdf',
      explanation: '/api/File/giai-trinh.pdf'
    };
    for (const [kind, path] of Object.entries(paths)) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#m05-download-' + kind).click()
      ]);
      assert.equal(download.suggestedFilename(), path.split('/').pop());
      assert.equal(readFileSync(await download.path(), 'utf8'), '%PDF-1.4\n' + path);
    }
  }, { role: 'NCS', api: mockM05 }],
  ['M05 đổi hồ sơ và tắt nút chưa có tệp', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m05'));
    const select = page.locator('#m05-candidate-select');
    await page.getByText('4/4 tệp có thể tải.', { exact: true }).waitFor();
    await select.selectOption('NCS02');
    await page.getByText('1/4 tệp có thể tải.', { exact: true }).waitFor();
    assert.equal(await page.locator('#m05-download-essay').getAttribute('data-file-url'), '/api/File/ncs02-essay.pdf');
    for (const kind of ['minutes', 'outline', 'explanation']) {
      const button = page.locator('#m05-download-' + kind);
      assert.equal(await button.isDisabled(), true);
      assert.equal(await button.getAttribute('data-file-url'), null);
    }
  }, { role: 'PDT', api: mockM05 }]
);

cases.push(
  ['M02 tải CSV đúng các học phần API trả về', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m02'));
    const table = page.locator('#panel-m02 [data-server-view="ctdt"] table').first();
    await table.getByText('Phương pháp, "chuyên sâu"', { exact: true }).waitFor();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#ctdt-download').click()
    ]);
    assert.equal(download.suggestedFilename(), 'Khung_CTDT.csv');
    assert.equal(readFileSync(await download.path(), 'utf8'), [
      '\uFEFF"Mã ngành","Mã học phần","Tên học phần","Số tín chỉ","Loại học phần","Đối tượng đầu vào"',
      '"KTPM","HP01","Phương pháp, ""chuyên sâu""","3","BAT_BUOC","1"'
    ].join('\r\n'));
  }, { role: 'NHD', api(request, url, route) {
    if (url.pathname !== '/api/Ctdt') return;
    assert.equal(request.headers().authorization, 'Bearer dtms-test-token');
    return route.fulfill({ json: [{
      maNganh: 'KTPM', maMonHoc: 'HP01', tenMonHoc: 'Phương pháp, "chuyên sâu"',
      soTinChi: 3, loaiHocPhan: 'BAT_BUOC', doiTuongDauVao: 1
    }] });
  } }],
  ['M02 tắt nút tải khi khung CTĐT rỗng', async page => {
    await page.goto(base + '/#management');
    await page.evaluate(() => DTMS_MANAGEMENT.switchModuleTab('m02'));
    await page.locator('#panel-m02 [data-server-view="ctdt"]').getByText('Chưa có dữ liệu.', { exact: true }).waitFor();
    assert.equal(await page.locator('#ctdt-download').isDisabled(), true);
  }, { role: 'NCS' }]
);

runChecks('integration', cases).catch(error => { console.error(error); process.exitCode = 1; });
