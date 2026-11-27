// Hồi quy lỗi tên nghiệp vụ bị ép vào cột 30px trên trang Profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(path.dirname(process.execPath), '..', 'node_modules', 'playwright')); }

const root = path.resolve(__dirname, '..');
const base = process.env.DTMS_URL || 'http://127.0.0.1:4173';
const engines = process.argv.slice(2);
if (!engines.length) engines.push('chromium');
const roles = ['NCS', 'NHD', 'BM', 'KHOA', 'PDT', 'BGH', 'HOIDONG'];
const widths = [360, 768, 1024, 1440, 1920];
const results = [];

async function inspect(page) {
  // Đồng bộ hai khung hình để resize và media query đã được trình duyệt áp dụng.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.evaluate(() => {
    const dashboard = document.querySelector('[data-role-dashboard]');
    const buttons = [...dashboard.querySelectorAll('[data-dashboard-module]')];
    return {
      tag: dashboard.tagName,
      visible: dashboard.getBoundingClientRect().height > 0,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      buttons: buttons.map(button => {
        const label = button.querySelector('.role-action-label');
        const index = button.querySelector('.role-action-index');
        const arrow = button.querySelector('.role-action-arrow');
        const box = button.getBoundingClientRect();
        const textBox = label?.getBoundingClientRect();
        return {
          module: button.dataset.dashboardModule,
          children: button.children.length,
          number: index?.textContent,
          width: textBox?.width || 0,
          height: box.height,
          textFits: !!label && label.scrollWidth <= label.clientWidth + 1,
          order: !!index && !!arrow && index.getBoundingClientRect().right < textBox.left && textBox.right < arrow.getBoundingClientRect().left,
          withinCard: !!textBox && textBox.left >= box.left && textBox.right <= box.right,
        };
      }),
    };
  });
}

function verify(layout) {
  assert.equal(layout.tag, 'SECTION');
  assert.equal(layout.visible, true, 'Dashboard phải mở trên mobile');
  assert.equal(layout.overflow, false, 'Trang bị tràn ngang');
  assert.ok(layout.buttons.length > 0, 'Thiếu nghiệp vụ theo vai trò');
  layout.buttons.forEach((button, index) => {
    assert.equal(button.children, 3, 'Nút phải có số, nhãn và mũi tên');
    assert.equal(button.number, String(index + 1).padStart(2, '0'));
    assert.ok(button.width >= 110, `Tên chức năng bị ép thành cột hẹp (${button.width}px)`);
    assert.ok(button.height <= 120, 'Thẻ quá cao do chữ xuống dòng bất thường');
    assert.equal(button.textFits, true, 'Chữ tràn khỏi cột tên');
    assert.equal(button.order, true, 'Sai thứ tự số, tên và mũi tên');
    assert.equal(button.withinCard, true, 'Tên nằm ngoài thẻ');
  });
}

(async () => {
  for (const engine of engines) {
    let browser;
    const errors = [];
    const start = results.length;
    try {
      browser = await (playwright[engine] || playwright.chromium).launch({
        headless: true,
        ...(playwright[engine] ? {} : { channel: engine }),
        ...(engine === 'firefox' && process.env.DTMS_FIREFOX_EXECUTABLE ? { executablePath: process.env.DTMS_FIREFOX_EXECUTABLE } : {}),
      });
      for (const language of ['VI', 'EN']) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        await context.addInitScript(language => localStorage.setItem('dtms-language', language), language);
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/index.html#profile');
        await page.evaluate(() => document.fonts.ready);
        for (const width of widths) {
          await page.setViewportSize({ width, height: 1000 });
          for (const role of roles) {
            const test = { engine, language, width, role, protocol: 'http' };
            try {
              await page.evaluate(role => { DTMS_MANAGEMENT.switchRole(role, true); switchView('profile'); }, role);
              const layout = await inspect(page);
              verify(layout);
              if (engine === 'chromium' && language === 'VI' && role === 'NCS' && [360, 1440].includes(width)) {
                await page.screenshot({ path: path.join(root, 'docs', `profile-fixed-${width}.png`), fullPage: true });
              }
              // Thử nhấn từng nghiệp vụ ở desktop, gồm cả các vai trò có quyền khác nhau.
              if (width === 1440) {
                for (const button of layout.buttons) {
                  await page.locator(`[data-dashboard-module="${button.module}"]`).click();
                  assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'), 'management');
                  assert.equal(await page.locator('.mgmt-panel.is-active').getAttribute('id'), 'panel-' + button.module);
                  await page.evaluate(() => switchView('profile'));
                }
              }
              results.push({ ...test, passed: true });
            } catch (error) { results.push({ ...test, passed: false, error: error.message }); }
          }
        }
        await context.close();
      }
      // Người dùng đang mở index.html trực tiếp qua file:// trong Edge.
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '#profile');
      await page.evaluate(() => document.fonts.ready);
      for (const width of [360, 1440]) {
        const test = { engine, language: 'VI', width, role: 'NCS', protocol: 'file' };
        try {
          await page.setViewportSize({ width, height: 1000 });
          verify(await inspect(page));
          results.push({ ...test, passed: true });
        } catch (error) { results.push({ ...test, passed: false, error: error.message }); }
      }
      await context.close();
      assert.equal(errors.length, 0, errors.join('\n'));
    } catch (error) { results.push({ engine, passed: false, error: error.message }); }
    finally { if (browser) await browser.close(); }
    const current = results.slice(start);
    console.log(`${engine}: ${current.filter(test => test.passed).length}/${current.length} đạt`);
    current.filter(test => !test.passed).forEach(test => console.log(JSON.stringify(test)));
  }
  const report = { generatedAt: new Date().toISOString(), scope: 'Profile action card layout and navigation; HTTP and file URLs; isolated browser contexts', results };
  fs.writeFileSync(path.join(root, 'docs', 'TEST_PROFILE_LAYOUT_2026-10-18.json'), JSON.stringify(report, null, 2));
  if (results.some(test => !test.passed)) process.exitCode = 1;
})();
