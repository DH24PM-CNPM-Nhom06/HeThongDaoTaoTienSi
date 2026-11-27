// Kiểm thử trên trình duyệt thật. Không thêm framework vào frontend.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let playwright;
try { playwright=require('playwright'); } catch { playwright=require(path.join(path.dirname(process.execPath),'..','node_modules','playwright')); }
const channel=process.env.DTMS_BROWSER||'msedge';
const base=process.env.DTMS_URL||'http://127.0.0.1:4173';
const stateKey='DTMS_MANAGEMENT_APP_STATE_V2';
const results=[];
const errors=[];
let activeBrowser;
function check(name,fn){return Promise.resolve().then(fn).then(()=>{results.push({name,passed:true});console.log('PASS '+name);},error=>{results.push({name,passed:false,error:error.message});console.log('FAIL '+name+': '+error.message);});}
(async()=>{
  const engine=playwright[channel]||playwright.chromium;
  const browser=activeBrowser=await engine.launch({headless:true,...(playwright[channel]?{}:{channel}), ...(channel==='firefox'&&process.env.DTMS_FIREFOX_EXECUTABLE?{executablePath:process.env.DTMS_FIREFOX_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.setDefaultTimeout(8000);
  page.on('pageerror',error=>errors.push(error.message));
  const responseErrors=[];
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)responseErrors.push(r.status()+' '+r.url());});
  const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),stateKey);
  const role=async code=>{await page.evaluate(code=>DTMS_MANAGEMENT.switchRole(code),code);await page.waitForTimeout(60);};
  const open=async id=>{await page.evaluate(id=>DTMS_MANAGEMENT.openModal(id),id);await page.waitForTimeout(60);};
  const submit=async id=>{await page.locator('#'+id+' [type="submit"]').click();await page.waitForTimeout(450);};
  const file={name:'minh-chung.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nDemo test file')};
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForTimeout(250);
  await check('HTML, tài nguyên và handler tĩnh',async()=>{
    const inventory=await page.evaluate(()=>{
      const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);
      return {duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),missingHandlers:[...document.querySelectorAll('[onclick]')].flatMap(n=>[...n.getAttribute('onclick').matchAll(/DTMS_MANAGEMENT\.([\w]+)/g)].map(m=>m[1])).filter(k=>typeof DTMS_MANAGEMENT[k]!=='function'),main:document.querySelectorAll('main').length,tables:document.querySelectorAll('table.mgmt-table').length,controls:document.querySelectorAll('.table-controls:not(.collection-controls)').length};
    });
    assert.deepEqual(inventory.duplicates,[]);assert.deepEqual(inventory.missingHandlers,[]);assert.equal(inventory.main,1);assert.equal(inventory.tables,inventory.controls);assert.deepEqual(responseErrors,[]);
  });
  await check('Phiên làm việc, đăng xuất, chặn vào quản trị và tải lại',async()=>{
    await page.locator('[data-logout]').click();
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'),'home');
    await page.reload();await page.waitForTimeout(150);
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'),'home');
    await page.evaluate(()=>switchView('management'));await page.waitForTimeout(80);
    assert(await page.locator('#modal-login').evaluate(n=>n.classList.contains('is-open')));
    await page.fill('#login-username','khong-co@example.test');await submit('form-login');
    assert(await page.locator('#login-error').isVisible());
    await page.fill('#login-username','pmdang_pdt@agu.edu.vn');await submit('form-login');
    assert.equal(await page.locator('#topbar-role-badge').textContent(),'PDT');
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'),'management');
  });
  await check('Nút bàn làm việc, trạng thái kết thúc phiên và ghi nhớ email tương thích dữ liệu cũ',async()=>{
    assert.equal(await page.locator('.demo-notice').count(),0);
    await page.evaluate(()=>switchView('profile'));
    await page.locator('.btn-login-os').click();
    assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'),'management');
    assert.equal(await page.locator('#modal-login').isVisible(),false);
    await page.locator('[data-logout]').click();
    assert.equal(await page.locator('#topbar-user-badge').isVisible(),false);
    assert.equal(await page.locator('[data-role-switcher]').isVisible(),false);
    await page.locator('.btn-login-os').click();
    assert.equal(await page.locator('#modal-login').isVisible(),true);
    await page.fill('#login-username','pmdang_pdt@agu.edu.vn');
    await page.check('#remember-email');await submit('form-login');
    assert.equal(await page.evaluate(()=>DTMS_DATA.read('dtms-remembered-email','')),'pmdang_pdt@agu.edu.vn');
    await page.reload();await open('modal-login');
    assert.equal(await page.locator('#login-username').inputValue(),'pmdang_pdt@agu.edu.vn');
    assert.equal(await page.locator('#remember-email').isChecked(),true);
    await page.locator('#modal-login [data-close-modal]').click();
    await page.evaluate(()=>{DTMS_DATA.remove('dtms-remembered-email');DTMS_DATA.write('dtms-demo-email','tvhuong@agu.edu.vn');});
    await page.reload();await open('modal-login');
    assert.equal(await page.locator('#login-username').inputValue(),'tvhuong@agu.edu.vn');
    await page.locator('#modal-login [data-close-modal]').click();
  });
  await check('CRUD NCS, validation mã/email, lưu sau tải lại, hủy xóa',async()=>{
    await page.locator('[data-candidate-add]').click();await page.waitForTimeout(80);
    await submit('form-candidate');assert(await page.locator('#candidate-code-error').isVisible());
    for(const [key,value]of Object.entries({code:'NCS-2023-ENV01',name:'NCS Kiểm thử',major:'Công nghệ thông tin',cohort:'2026-Đ1',email:'test@example.test',phone:'0912345678'}))await page.fill('#candidate-'+key,value);
    await submit('form-candidate');assert.match(await page.locator('#candidate-code-error').textContent(),/tồn tại/);
    await page.fill('#candidate-code','NCS-TEST-01');await submit('form-candidate');
    assert.equal((await read()).candidates.length,4);
    await page.reload();await page.waitForTimeout(150);
    const candidate=(await read()).candidates.find(c=>c.code==='NCS-TEST-01');assert(candidate);
    await page.locator('[data-candidate-view="'+candidate.id+'"]').click();await page.fill('#candidate-name','NCS Đã chỉnh sửa');await submit('form-candidate');
    assert.equal((await read()).candidates.find(c=>c.id===candidate.id).name,'NCS Đã chỉnh sửa');
    await page.locator('[data-candidate-delete="'+candidate.id+'"]').click();await page.waitForTimeout(80);await page.locator('#modal-confirm [data-close-modal]').first().click();
    assert.equal((await read()).candidates.length,4);
    await page.locator('[data-candidate-delete="'+candidate.id+'"]').click();await page.waitForTimeout(80);await page.locator('[data-confirm-accept]').click();
    assert.equal((await read()).candidates.length,3);
  });
  await check('Tìm không dấu, lọc rỗng, sắp xếp và phân trang',async()=>{
    const search=page.locator('#panel-m01 .mgmt-input-search');
    await search.fill('le thi mai');await page.waitForTimeout(50);
    assert.equal(await page.locator('#candidates-table tbody tr:not([hidden]):not([data-empty-row])').count(),1);
    await search.fill('');await page.selectOption('#panel-m01 .mgmt-select-filter','paused');await page.waitForTimeout(50);
    assert.equal(await page.locator('#candidates-table [data-empty-row]').count(),1);
    await page.selectOption('#panel-m01 .mgmt-select-filter','');await page.waitForTimeout(50);
    await page.locator('#candidates-table th').nth(1).locator('button').click();
    assert.equal(await page.locator('#candidates-table th').nth(1).getAttribute('aria-sort'),'ascending');
    await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m14'));await page.waitForTimeout(120);
    const footer=page.locator('#audit-log-tbody').locator('xpath=ancestor::table/..').locator('xpath=following-sibling::div[contains(@class,"table-pagination")]');
    assert.match(await footer.textContent(),/bản ghi/);
    const next=footer.locator('button').last();if(await next.isEnabled()){await next.click();assert.match(await footer.locator('b').textContent(),/^2/);}
  });
  await check('Quyền handler và phạm vi danh sách NCS',async()=>{
    await role('NCS');const before=JSON.stringify(await read());
    await page.evaluate(()=>{DTMS_MANAGEMENT.handleGradeProgressReport(1,'revise');DTMS_MANAGEMENT.resetDemoData();DTMS_MANAGEMENT.handleApprovePlan();DTMS_MANAGEMENT.handleConferDegree();DTMS_MANAGEMENT.switchModuleTab('m14');});
    assert.equal(JSON.stringify(await read()),before);
    assert.equal(await page.locator('#candidates-table tbody tr:not([data-empty-row])').count(),1);
    assert.equal(await page.locator('#panel-m14').isVisible(),false);
    await role('NHD');assert.equal(await page.locator('#candidates-table tbody tr:not([data-empty-row])').count(),1);
  });
  await check('Kế hoạch: lưu form, duyệt đúng NHD → BM → PDT',async()=>{
    await role('NCS');await open('modal-edit-plan');
    await page.locator('#modal-edit-plan textarea').fill('Mục tiêu kiểm thử có lưu trạng thái');await submit('modal-edit-plan');
    assert.equal((await read()).planStage,0);
    assert.match(await page.locator('[data-workflow="modal-edit-plan"]').textContent(),/Mục tiêu kiểm thử/);
    await role('PDT');await page.evaluate(()=>DTMS_MANAGEMENT.handleApprovePlan());assert.equal((await read()).planStage,0);
    await role('NHD');await page.evaluate(()=>DTMS_MANAGEMENT.handleApprovePlan());assert.equal((await read()).planStage,1);
    await role('BM');await page.evaluate(()=>DTMS_MANAGEMENT.handleApprovePlan());assert.equal((await read()).planStage,2);
    await role('PDT');await page.evaluate(()=>DTMS_MANAGEMENT.handleApprovePlan());assert.equal((await read()).planStage,3);
  });
  await check('Phân công: lưu dữ liệu, chặn trùng, không tăng quota lặp',async()=>{
    await role('PDT');await open('modal-assign-supervisor');await submit('form-assign-supervisor');
    const quota=(await read()).advisorsQuota['GS.TS. Trần Văn Hướng'].count;
    await open('modal-assign-supervisor');await submit('form-assign-supervisor');
    assert.equal((await read()).advisorsQuota['GS.TS. Trần Văn Hướng'].count,quota);
    await page.keyboard.press('Escape');
  });
  await check('Học phần: đăng ký/hủy lưu sau tải lại',async()=>{
    await role('NCS');await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m04'));await page.waitForTimeout(150);
    const button=page.locator('[onclick*="handleToggleCourse"]');await button.click();assert((await read()).registeredCourses.includes('ENV809'));
    await page.reload();await page.waitForTimeout(150);await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m04'));await page.waitForTimeout(150);
    await button.click();assert(!(await read()).registeredCourses.includes('ENV809'));
  });
  await check('Tiểu luận: nhập thiếu/sai khoảng và điểm đúng',async()=>{
    await role('NHD');await open('modal-grade-essay');await page.selectOption('#essay-candidate','NCS. Nguyễn Văn Bình');await page.selectOption('#essay-work-select',{index:1});await page.fill('#essay-grade-comment','Nhận xét kiểm thử');await page.fill('#essay-score-1','11');await submit('form-grade-essay');assert(await page.locator('#essay-score-1-error').isVisible());
    for(let i=1;i<=3;i++)await page.fill('#essay-score-'+i,'6');await submit('form-grade-essay');assert.equal((await read()).essayResult.status,'fail');
  });
  await check('Chuyên đề: điểm thấp không được đánh dấu đạt',async()=>{
    await role('NHD');await page.evaluate(()=>DTMS_MANAGEMENT.handleGradeTopic(1));await page.selectOption('#topic-candidate','NCS. Nguyễn Văn Bình');await page.fill('#topic-score-input','4.5');await page.fill('#topic-grade-comment','Điểm thấp cần sửa');await submit('form-grade-topic');
    assert.equal((await read()).topics[0].status,'failed');
  });
  await check('Công bố: thêm, trùng DOI, sửa, thẩm định và bảo vệ dữ liệu',async()=>{
    await role('NCS');await open('modal-declare-pub');
    await page.fill('#pub-title-input','Publication <img src=x onerror=alert(1)>');await page.fill('#pub-journal-input','Journal Demo');await page.fill('#pub-doi-input','10.1234/test.2026');await page.setInputFiles('#pub-file-input',file);await submit('form-declare-pub');
    const pub=(await read()).publications.find(p=>p.doi==='10.1234/test.2026');assert(pub);assert.equal(await page.locator('#pub-table-tbody img').count(),0);
    await open('modal-declare-pub');await page.fill('#pub-title-input','Trùng DOI');await page.fill('#pub-journal-input','Journal Demo');await page.fill('#pub-doi-input',pub.doi);await page.setInputFiles('#pub-file-input',file);await submit('form-declare-pub');assert.match(await page.locator('#pub-doi-input-error').textContent(),/đã có/);await page.keyboard.press('Escape');
    await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m08'));await page.waitForTimeout(100);await page.locator('[data-edit-publication="'+pub.id+'"]').click();await page.fill('#pub-title-input','Đã sửa công bố');await page.setInputFiles('#pub-file-input',file);await submit('form-declare-pub');
    assert.equal((await read()).publications.find(p=>p.id===pub.id).title,'Đã sửa công bố');
    await role('PDT');page.once('dialog',d=>d.accept('0.8'));await page.evaluate(id=>DTMS_MANAGEMENT.verifyPublication(id),pub.id);assert((await read()).publications.find(p=>p.id===pub.id).verified);
    await role('NCS');assert.equal(await page.locator('[data-delete-publication="'+pub.id+'"]').count(),0);
  });
  await check('Tệp sai định dạng, thiếu tệp, nộp báo cáo và đánh giá',async()=>{
    await role('NCS');await open('modal-submit-progress');await submit('modal-submit-progress');assert(await page.locator('#progress-file-input-error').isVisible());
    await page.setInputFiles('#progress-file-input',{name:'bad.exe',mimeType:'application/octet-stream',buffer:Buffer.from('bad')});await submit('modal-submit-progress');assert.match(await page.locator('#progress-file-input-error').textContent(),/Định dạng/);
    await page.setInputFiles('#progress-file-input',file);await submit('modal-submit-progress');assert.equal((await read()).progressReports.find(r=>r.period===5).status,'pending');
    await role('NHD');await page.evaluate(()=>DTMS_MANAGEMENT.handleGradeProgressReport(5));await page.selectOption('#progress-review-candidate','NCS. Nguyễn Văn Bình');await page.selectOption('#progress-review-result','revision');await page.fill('#progress-review-comment','Cần bổ sung minh chứng');await submit('form-review-progress');assert.equal((await read()).progressReports.find(r=>r.period===5).status,'revise');
  });
  await check('Checklist không tự coi đủ 24 tín chỉ; chặn cấp bằng thiếu điều kiện',async()=>{
    await role('BGH');const before=(await read()).degreeConferred;await page.evaluate(()=>DTMS_MANAGEMENT.handleConferDegree());assert.equal((await read()).degreeConferred,before);
    assert.match(await page.locator('#defense-checklist-container').textContent(),/12\/24/);
  });
  await check('Modal bàn phím: focus, Tab, Escape và trả focus',async()=>{
    await role('NCS');const button=page.locator('#topbar-user-badge');await button.focus();await button.press('Enter');await page.waitForTimeout(100);
    assert(await page.locator('#modal-role-switcher').evaluate(m=>m.contains(document.activeElement)));
    await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');assert(await page.locator('#modal-role-switcher').evaluate(m=>m.contains(document.activeElement)));
    await page.keyboard.press('Escape');await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>document.activeElement.id),'topbar-user-badge');
  });
  await check('Tra cứu không báo hợp lệ khi dịch vụ chưa sẵn sàng',async()=>{
    await page.evaluate(()=>switchView('lookup'));
    await page.fill('[data-input-code]','KHONG-TON-TAI');await page.fill('[data-input-name]','Tên kiểm thử');await page.locator('[data-verify-btn]').click();await page.waitForTimeout(100);
    assert.match(await page.locator('[data-degree-status]').textContent(),/Dịch vụ xác minh văn bằng hiện chưa khả dụng/);assert.equal(await page.locator('[data-foil-card]').textContent(),'');
  });
  await check('Xuất CSV và sao lưu JSON có tệp thật',async()=>{
    await role('PDT');const download=page.waitForEvent('download');await page.evaluate(()=>DTMS_MANAGEMENT.handleExportReport('BaoCao_KiemDinh.csv'));const artifact=await download;assert.equal(artifact.suggestedFilename(),'BaoCao_KiemDinh.csv');const content=fs.readFileSync(await artifact.path(),'utf8');assert.match(content,/Tín chỉ đã đạt/);assert.match(content,/6\.00/);
    await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m01'));await page.waitForTimeout(80);const backup=page.waitForEvent('download');await page.locator('[data-backup-data]').click();assert.equal((await backup).suggestedFilename(),'DTMS_Backup.json');
  });
  await check('Responsive: 9 kích thước × 10 view + 14 module; menu mobile',async()=>{
    await role('PDT');
    for(const width of [320,360,390,430,768,1024,1366,1440,1920]) {
      await page.setViewportSize({width,height:900});
      for(const view of ['home','profile','management','roles','roadmap','notifications','public','lookup','citations','about']) {
        await page.evaluate(view=>switchView(view),view);await page.waitForTimeout(25);
        const overflow=await page.evaluate(()=>({body:document.body.scrollWidth,root:document.documentElement.scrollWidth,width:innerWidth}));
        assert(overflow.body<=width+1&&overflow.root<=width+1,`${view} ${width}: ${JSON.stringify(overflow)}`);
      }
      await page.evaluate(()=>switchView('management'));
      for(let n=1;n<=14;n++){
        await page.evaluate(id=>DTMS_MANAGEMENT.switchModuleTab(id),'m'+String(n).padStart(2,'0'));await page.waitForTimeout(20);
        assert(await page.evaluate(()=>document.body.scrollWidth<=innerWidth+1),'m'+n+' overflows '+width);
      }
      if(width<=768){await page.locator('[data-menu-toggle]').click();await page.waitForFunction(()=>document.querySelector('.os-dock').getBoundingClientRect().left>=-1);await page.locator('[data-menu-backdrop]').click({position:{x:width-10,y:100}});}
    }
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{switchView('management');DTMS_MANAGEMENT.switchModuleTab('m01');});await page.waitForTimeout(250);await page.screenshot({path:'docs/test-mobile-'+channel+'.png',fullPage:true});
    await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);await page.screenshot({path:'docs/test-desktop-'+channel+'.png',fullPage:true});
  });
  await check('Không có JavaScript runtime error',()=>assert.deepEqual(errors,[]));
  await context.close();
  await check('JSON thiếu trường/hỏng không làm crash và có bản recovery',async()=>{
    const c=await browser.newContext();const p=await c.newPage();const e=[];p.on('pageerror',error=>e.push(error.message));await p.goto(base);await p.evaluate(key=>localStorage.setItem(key,'{broken'),stateKey);await p.reload();await p.waitForTimeout(100);assert.deepEqual(e,[]);assert(await p.evaluate(key=>Object.keys(localStorage).some(k=>k.startsWith(key+'_RECOVERY_')),stateKey));await p.evaluate(key=>localStorage.setItem(key,JSON.stringify({profile:{phone:'0999999999'},planStage:99,candidates:[null]})),stateKey);await p.reload();await p.waitForTimeout(100);assert.deepEqual(e,[]);await c.close();
  });
  await browser.close();
  fs.writeFileSync('docs/TEST_RESULTS_'+channel+'.json',JSON.stringify({browser:channel,date:new Date().toISOString(),results},null,2));
  const failed=results.filter(r=>!r.passed);console.log(`${results.length-failed.length}/${results.length} passed (${channel})`);process.exitCode=failed.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await activeBrowser?.close();});
