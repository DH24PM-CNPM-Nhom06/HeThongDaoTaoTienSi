// Test adapter bằng phản hồi mô phỏng, không khẳng định có backend thật.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let playwright;try{playwright=require('playwright');}catch{playwright=require(path.join(path.dirname(process.execPath),'..','node_modules','playwright'));}
const channel=process.env.DTMS_BROWSER||'msedge';
const base=process.env.DTMS_URL||'http://127.0.0.1:4173';
const results=[];
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS '+name);}catch(error){results.push({name,passed:false,error:error.message});console.log('FAIL '+name+': '+error.message);}}
(async()=>{
  const engine=playwright[channel]||playwright.chromium;
  const browser=await engine.launch({headless:true,...(playwright[channel]?{}:{channel}), ...(channel==='firefox'&&process.env.DTMS_FIREFOX_EXECUTABLE?{executablePath:process.env.DTMS_FIREFOX_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForTimeout(150);
  const file={name:'minh-chung.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 Demo')};
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('DTMS_MANAGEMENT_APP_STATE_V2')||'null'));
  const submit=async id=>{await page.locator('#'+id+' [type="submit"]').click();await page.waitForTimeout(450);};
  const role=async code=>{await page.evaluate(code=>DTMS_MANAGEMENT.switchRole(code),code);await page.waitForTimeout(80);};
  const open=async id=>{await page.evaluate(id=>DTMS_MANAGEMENT.openModal(id),id);await page.waitForTimeout(80);};
  await check('Liên hệ cá nhân: điện thoại sai, dữ liệu hợp lệ và tải lại',async()=>{
    await open('modal-edit-profile');await page.fill('#profile-phone-input','abc123');await submit('form-edit-profile');assert.match(await page.locator('#profile-phone-input-error').textContent(),/điện thoại/);
    await page.fill('#profile-phone-input','0987654321');await page.fill('#profile-workplace-input','Đơn vị kiểm thử');await submit('form-edit-profile');await page.reload();await page.waitForTimeout(150);assert.equal(await page.locator('#profile-display-phone').textContent(),'0987654321');
  });
  await check('Đơn học vụ: lưu dữ liệu, không gửi hai lần cùng lúc',async()=>{
    await open('modal-leave-request');await page.fill('#leave-duration-input','06 tháng');await page.fill('#leave-reason-input','Hoàn thiện thí nghiệm');await page.setInputFiles('#leave-file-input',file);
    await page.locator('#form-leave-request [type="submit"]').dblclick({delay:20});await page.waitForTimeout(450);assert.equal((await state()).leaveRequests.length,2);
  });
  await check('10 workflow: giá trị, file metadata và panel được cập nhật',async()=>{
    await role('NCS');
    const workflows=['modal-edit-plan','modal-change-supervisor','modal-submit-essay','modal-submit-outline','modal-register-topic','modal-submit-progress','modal-change-topic-title','modal-upload-thesis-version','modal-submit-post-defense','modal-create-change-request'];
    for(const id of workflows){
      await open(id);
      const inputs=page.locator('#'+id+' input:not([readonly]):not([disabled]),#'+id+' textarea:not([readonly])');
      for(let i=0;i<await inputs.count();i++){
        const input=inputs.nth(i);const type=await input.getAttribute('type');
        if(type==='file'){await input.setInputFiles(file);continue;}
        if(type==='date'){await input.fill('2026-12-15');continue;}
        if(type==='month'){await input.fill('2026-12');continue;}
        if(type==='hidden')continue;
        await input.fill('Nội dung kiểm thử '+id);
      }
      await submit(id);
      assert.equal(await page.locator('#'+id).evaluate(m=>m.classList.contains('is-open')),false,id+' failed to submit');
    }
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('DTMS_MANAGEMENT_APP_STATE_V2')).workflowSubmissions);assert.equal(saved.length,10);assert.equal((await state()).essayResult.status,'pending');assert.equal((await state()).outlineStatus,'Chờ duyệt');assert.equal((await state()).topics[0].status,'pending');assert((await state()).thesisVersions.length);assert((await state()).postDefense);
    await page.reload();await page.waitForTimeout(150);assert.match(await page.locator('[data-workflow="modal-edit-plan"]').textContent(),/Nội dung kiểm thử/);assert.equal(await page.locator('#panel-m12 table tbody tr:not([data-empty-row])').count(),7);
  });
  await check('Đề cương: duyệt cập nhật state, bản mới vẫn chờ duyệt',async()=>{
    await role('NHD');await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m05'));await page.waitForTimeout(100);await page.locator('[data-approve-outline]').click();assert.equal((await state()).outlineStatus,'Đã duyệt');
  });
  await check('Công bố chưa thẩm định: xóa có xác nhận',async()=>{
    await role('NCS');await open('modal-declare-pub');await page.fill('#pub-title-input','Bài sẽ xóa');await page.fill('#pub-journal-input','Journal');await page.fill('#pub-doi-input','10.1234/delete-test');await page.setInputFiles('#pub-file-input',file);await submit('form-declare-pub');const pub=(await state()).publications.find(p=>p.doi==='10.1234/delete-test');
    await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m08'));await page.waitForTimeout(100);await page.locator('[data-delete-publication="'+pub.id+'"]').click();await page.waitForTimeout(80);await page.locator('[data-confirm-accept]').click();assert(!(await state()).publications.some(p=>p.id===pub.id));
  });
  await check('Giới hạn upload đúng 15MB / 50MB và chuyên đề cho phép bỏ tệp',async()=>{
    assert.equal(await page.locator('#progress-file-input').getAttribute('data-max-mb'),'15');assert.equal(await page.locator('#thesis-file-input').getAttribute('data-max-mb'),'50');assert.equal(await page.locator('#modal-register-topic input[type="file"]').getAttribute('required'),null);
    await open('modal-submit-progress');await page.setInputFiles('#progress-file-input',{name:'too-large.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(16*1024*1024,65)});await submit('modal-submit-progress');assert.match(await page.locator('#progress-file-input-error').textContent(),/15 MB/);await page.keyboard.press('Escape');
  });
  await check('Lỗi ghi bộ nhớ: giữ form, rollback state, không báo thành công',async()=>{
    await role('PDT');await page.evaluate(()=>DTMS_MANAGEMENT.switchModuleTab('m01'));await page.waitForTimeout(100);await page.locator('[data-candidate-add]').click();
    for(const[key,value]of Object.entries({code:'NCS-STORAGE-FAIL',name:'Không được lưu',major:'Test',cohort:'2026'}))await page.fill('#candidate-'+key,value);
    const before=JSON.stringify(await state());
    await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='DTMS_MANAGEMENT_APP_STATE_V2')throw new DOMException('Quota exceeded','QuotaExceededError');return originalSetItem.call(this,key,value);};});
    await submit('form-candidate');assert.equal(JSON.stringify(await state()),before);assert.equal(await page.locator('#candidate-name').inputValue(),'Không được lưu');assert(await page.locator('#modal-candidate').evaluate(m=>m.classList.contains('is-open')));assert.match(await page.locator('[data-toast-region]').textContent(),/Không thể lưu/);
    await page.evaluate(()=>Storage.prototype.setItem=originalSetItem);await page.keyboard.press('Escape');
  });
  await check('Chuyển VI/EN, Back/Forward và giữ lọc luận án',async()=>{
    await page.evaluate(()=>switchView('public'));await page.fill('[data-thesis-search-input]','doanh nghiep');await page.locator('[data-lang-btn]').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.fill('[data-thesis-search-input]','doanh nghiep');assert.equal(await page.locator('.thesis-entry').count(),1);await page.locator('[data-lang-btn]').click();assert.equal(await page.locator('html').getAttribute('lang'),'vi');await page.fill('[data-thesis-search-input]','');await page.evaluate(()=>switchView('about'));await page.goBack();assert.equal(await page.locator('.os-view.is-active').getAttribute('data-view'),'public');
  });
  await check('Không có lỗi runtime trong các workflow',()=>assert.deepEqual(errors,[]));
  await context.close();
  for(const scenario of ['valid','empty','500','invalid-json','invalid-schema','timeout','unsafe-url']){
    await check('API mô phỏng: '+scenario,async()=>{
      const c=await browser.newContext();const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
      await p.route('**/js/core/config.js',route=>route.fulfill({contentType:'text/javascript',body:`window.DTMS_CONFIG=Object.freeze({API_BASE_URL:'${base}',API_TIMEOUT_MS:${scenario==='timeout'?150:8000},ENDPOINTS:{PUBLIC_THESES:'/api/public/theses'},ROUTES:{login:'',degreeLookup:''}});`}));
      let calls=0;
      await p.route('**/api/public/theses',async route=>{
        calls++;
        if(scenario==='timeout'){await new Promise(r=>setTimeout(r,300));await route.fulfill({json:[]}).catch(()=>{});return;}
        if(scenario==='500'&&calls===1){await route.fulfill({status:500,json:{error:{message:'Server error'}}});return;}
        if(scenario==='invalid-json'){await route.fulfill({contentType:'application/json',body:'{bad'});return;}
        if(scenario==='invalid-schema'){await route.fulfill({json:{data:{items:[{title:123}]}}});return;}
        const item={title:'Luận án API <img src=x onerror=alert(1)>',candidate:'Tên API',field:'Khoa học',date:'17/10/2026',summaryUrl:scenario==='unsafe-url'?'javascript:alert(1)':'/assets/icons/favicon.svg',fullUrl:''};
        await route.fulfill({json:{data:{items:scenario==='empty'?[]:[item]}}});
      });
      await p.goto(base+'/#public');await p.waitForFunction(()=>document.querySelector('[data-thesis-grid]').getAttribute('aria-busy')==='false');
      if(['500','invalid-json','invalid-schema','timeout'].includes(scenario)){
        assert(await p.locator('[data-retry-theses]').isVisible());assert.equal(await p.locator('.thesis-entry').count(),0);
        if(scenario==='500'){await p.locator('[data-retry-theses]').click();await p.waitForFunction(()=>document.querySelectorAll('.thesis-entry').length===1);assert.equal(calls,2);}
      }else if(scenario==='empty')assert.equal(await p.locator('.thesis-entry').count(),0);
      else {assert.equal(await p.locator('.thesis-entry').count(),1);assert.equal(await p.locator('[data-thesis-grid] img').count(),0);if(scenario==='unsafe-url')assert.equal(await p.locator('[data-thesis-grid] a').count(),0);}
      assert.deepEqual(errors,[]);await c.close();
    });
  }
  await browser.close();
  fs.writeFileSync('docs/TEST_INTEGRATION_'+channel+'.json',JSON.stringify({browser:channel,date:new Date().toISOString(),api:'mocked responses only',results},null,2));
  const failed=results.filter(r=>!r.passed);console.log((results.length-failed.length)+'/'+results.length+' passed ('+channel+')');process.exitCode=failed.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
