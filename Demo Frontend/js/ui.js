/* Thành phần dùng chung cho giao diện HTML hiện có, không phụ thuộc framework. */
(function (global, document) {
  'use strict';
  const tables = new WeakMap();
  const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });
  const fold = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const workflowFields = {
    'modal-edit-plan':['semester','expectedEndDate','objectives','expectedOutputs'],
    'modal-change-supervisor':['changeType','currentSupervisor','proposedSupervisor','reason','attachment'],
    'modal-submit-essay':['title','abstract','attachment'],
    'modal-submit-outline':['title','scope','methods','outlineAttachment','explanationAttachment'],
    'modal-register-topic':['topicNumber','title','supervisor','expectedMonth','attachment'],
    'modal-submit-progress':['period','submissionDate','completedWork','difficulties','nextPlan','attachment'],
    'modal-change-topic-title':['currentTitle','newTitleVi','newTitleEn','reason','attachment'],
    'modal-upload-thesis-version':['version','changeNotes','attachment'],
    'modal-submit-post-defense':['thesisAttachment','explanationAttachment','universityReceiptNo','nationalReceiptNo'],
    'modal-create-change-request':['changeType','reason','attachment']
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  function fieldError(control, message) {
    control.setCustomValidity(message);
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    let error = control.parentElement.querySelector('#' + CSS.escape(control.id + '-error'));
    if (!error) {
      error = document.createElement('span');
      error.id = control.id + '-error'; error.className = 'field-error'; error.setAttribute('aria-live', 'polite');
      control.insertAdjacentElement('afterend', error);
      control.setAttribute('aria-describedby', [control.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
    }
    error.textContent = message;
    return !message;
  }
  function validate(form) {
    let first;
    for (const input of form.querySelectorAll('input,select,textarea')) {
      if (input.disabled || input.readOnly || ['submit','button','hidden','checkbox','radio'].includes(input.type)) continue;
      input.setCustomValidity('');
      let message = '';
      if (input.required && !(input.type === 'file' ? input.files.length : input.value.trim())) message = 'Vui lòng nhập hoặc chọn thông tin này.';
      else if (input.type === 'email' && input.value && input.validity.typeMismatch) message = 'Email chưa đúng định dạng.';
      else if ((input.type === 'tel' || input.id.includes('phone')) && input.value && (!/^\+?\d[\d .()-]+$/.test(input.value.trim()) || input.value.replace(/\D/g,'').length<9 || input.value.replace(/\D/g,'').length>15)) message = 'Nhập số điện thoại từ 9–15 chữ số.';
      else if (input.type === 'number' && input.value && !input.validity.valid) message = 'Giá trị phải nằm trong khoảng ' + input.min + '–' + input.max + '.';
      else if (input.type === 'file' && input.files.length) {
        const file = input.files[0];
        const max = Number(input.dataset.maxMb || 15);
        const accepts = input.accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (file.size > max * 1024 * 1024) message = 'Tệp không được lớn hơn ' + max + ' MB.';
        else if (accepts.length && !accepts.some(ext => ext.startsWith('.') ? file.name.toLowerCase().endsWith(ext) : file.type === ext || (ext.endsWith('/*') && file.type.startsWith(ext.slice(0,-1))))) message = 'Định dạng tệp được phép: ' + input.accept;
        else if (!file.size) message = 'Tệp đang rỗng. Hãy chọn tệp có nội dung.';
      }
      fieldError(input, message);
      if (message && !first) first = input;
    }
    if (first) { first.focus(); first.scrollIntoView({ block:'center' }); return false; }
    return true;
  }
  function prepareForms() {
    document.querySelectorAll('form').forEach((form, fi) => {
      form.noValidate = true;
      const workflow=form.closest('.mgmt-modal')?.id;
      const fields=workflowFields[workflow];
      if(!form.id)form.id=workflow?workflow.replace('modal-','form-'):'dtms-form-'+fi;
      form.querySelectorAll('input,select,textarea').forEach((input, i) => {
        input.dataset.legacyName=input.id||'form-'+fi+'-field-'+i;
        if (!input.id) input.id = form.id+'-'+(fields?.[i]||i);
        if (!input.name) input.name = fields?.[i]||input.id;
        const label = input.closest('.mgmt-form-group')?.querySelector('label:not(.mgmt-upload-zone)');
        if (label && !label.htmlFor) label.htmlFor = input.id;
        if ((input.type === 'text' || input.tagName === 'TEXTAREA') && !input.hasAttribute('maxlength')) input.maxLength = 4000;
        if(input.name==='expectedMonth')input.type='month';
        if (input.type === 'file') {
          input.style.removeProperty('display');
          input.required = !input.closest('.mgmt-form-group')?.textContent.includes('(nếu có)');
          const hint = input.closest('label')?.querySelector('.file-name-display');
          const max = input.closest('.mgmt-form-group')?.textContent.match(/(\d+)\s*MB/i)?.[1];
          if (max) input.dataset.maxMb = max;
          if(hint)hint.dataset.original=hint.textContent;
        }
      });
    });
  }
  let lastFocus;
  let activeModal;
  function syncDialogs() {
    const open = [...document.querySelectorAll('.mgmt-modal.is-open,.hologram-modal.is-open')].at(-1);
    document.querySelector('.os-shell').inert = Boolean(open);
    for (const modal of document.querySelectorAll('.mgmt-modal,.hologram-modal')) {
      const visible = modal === open;
      modal.setAttribute('aria-hidden', String(!visible));
      modal.inert = !visible;
      modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
      const heading = modal.querySelector('h3,h2');
      if (heading) { if (!heading.id) heading.id = (modal.id || 'inspector') + '-title'; modal.setAttribute('aria-labelledby', heading.id); }
    }
    if (open !== activeModal) {
      if (open) {
        if (!activeModal) lastFocus = document.activeElement;
        activeModal = open;
        (open.querySelector('input:not([readonly]),select,textarea,button,[tabindex="0"]') || open).focus();
      } else {
        activeModal = null;
        if (lastFocus?.isConnected && !lastFocus.closest('[hidden]')) lastFocus.focus();
      }
    }
    document.body.classList.toggle('dialog-open', Boolean(open));
  }
  function tableControls(table) {
    if (tables.has(table) || !table.tBodies[0]) return;
    const wrapper = table.closest('.mgmt-table-wrapper') || table.parentElement;
    wrapper.classList.add('table-scroll');
    wrapper.tabIndex = 0; wrapper.setAttribute('role','region'); wrapper.setAttribute('aria-label','Bảng dữ liệu, có thể cuộn ngang');
    const bar = document.createElement('div'); bar.className = 'table-controls';
    bar.innerHTML = '<label>Tìm trong bảng<input type="search" placeholder="Tên, mã, nội dung…"></label><label>Lọc trạng thái<select data-table-filter><option value="">Tất cả</option></select></label><label>Mỗi trang<select data-page-size><option>5</option><option>10</option><option>20</option></select></label>';
    wrapper.before(bar);
    const footer = document.createElement('div'); footer.className = 'table-pagination';
    footer.innerHTML = '<span aria-live="polite"></span><div><button type="button" aria-label="Trang trước">← Trước</button><b></b><button type="button" aria-label="Trang sau">Sau →</button></div>';
    wrapper.after(footer);
    const state = { page:1, size:5, sort:-1, direction:1, q:'', filter:'', bar, footer };
    tables.set(table, state);
    const statusText = row => [...row.querySelectorAll('.status-pill')].map(s => s.textContent.trim());
    function render() {
      const body = table.tBodies[0];
      body.querySelector('[data-empty-row]')?.remove();
      const rows = [...body.rows];
      const options = [...new Set(rows.flatMap(statusText))].sort(collator.compare);
      const filter = bar.querySelector('[data-table-filter]');
      const old = filter.value;
      filter.innerHTML = '<option value="">Tất cả</option>' + options.map(o => '<option>' + escape(o) + '</option>').join('');
      filter.value = options.includes(old) ? old : '';
      state.filter = filter.value;
      filter.parentElement.hidden = options.length < 2;
      const matches = rows.filter(row => fold([...row.cells].map(c => c.textContent).join(' ')).includes(fold(state.q)) && (!state.filter || statusText(row).includes(state.filter)));
      if (state.sort >= 0) matches.sort((a,b) => {
        const left=a.cells[state.sort]?.textContent.trim()||'', right=b.cells[state.sort]?.textContent.trim()||'';
        const date=value=>{const match=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2}))?$/);return match?Date.UTC(+match[3],+match[2]-1,+match[1],+(match[4]||0),+(match[5]||0),+(match[6]||0)):NaN;};
        const l=date(left),r=date(right);
        return state.direction*(Number.isFinite(l)&&Number.isFinite(r)?l-r:collator.compare(left,right));
      });
      const pages = Math.max(1, Math.ceil(matches.length/state.size));
      state.page = Math.min(state.page, pages);
      rows.forEach(row => row.hidden = true);
      // Reorder without cloning: preserve listeners, IDs and user controls.
      matches.forEach((row, i) => { body.append(row); row.hidden = i < (state.page-1)*state.size || i >= state.page*state.size; });
      if (!matches.length) {
        const row = body.insertRow(); row.dataset.emptyRow = ''; row.insertCell().colSpan = table.tHead?.rows[0].cells.length || 1;
        row.cells[0].textContent = 'Không có dữ liệu phù hợp. Thử đổi từ khóa hoặc bộ lọc.';
      }
      footer.querySelector('span').textContent = matches.length + ' / ' + rows.length + ' bản ghi';
      footer.querySelector('b').textContent = state.page + ' / ' + pages;
      const buttons = footer.querySelectorAll('button'); buttons[0].disabled = state.page===1; buttons[1].disabled = state.page===pages;
      observer.takeRecords();
    }
    const observer = new MutationObserver(render);
    observer.observe(table.tBodies[0], { childList:true, subtree:true, characterData:true });
    state.refresh = render;
    bar.querySelector('input').addEventListener('input', e => { state.q=e.target.value.trim(); state.page=1; render(); });
    bar.querySelector('[data-table-filter]').addEventListener('change', e => { state.filter=e.target.value; state.page=1; render(); });
    bar.querySelector('[data-page-size]').addEventListener('change', e => { state.size=Number(e.target.value); state.page=1; render(); });
    footer.querySelectorAll('button').forEach((button,i) => button.addEventListener('click', () => { state.page+=i?1:-1; render(); }));
    table.querySelectorAll('thead th').forEach((th,i) => {
      th.scope='col';
      if (/Thao tác|Hành động|Action/i.test(th.textContent)) return;
      const button = document.createElement('button'); button.type='button'; button.className='table-sort'; button.textContent=th.textContent.trim()+' ↕';
      th.replaceChildren(button);
      button.addEventListener('click', () => { state.direction=state.sort===i ? -state.direction : 1; state.sort=i; state.page=1; table.querySelectorAll('th').forEach(h=>h.removeAttribute('aria-sort')); th.setAttribute('aria-sort',state.direction===1?'ascending':'descending'); render(); });
    });
    render();
  }
  function init() {
    prepareForms();
    document.addEventListener('submit', event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.submitting || !validate(form)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      form.dataset.submitting='true';
      const buttons = [...form.querySelectorAll('[type="submit"]')];
      buttons.forEach(b => b.disabled=true);
      setTimeout(() => { delete form.dataset.submitting; buttons.forEach(b=>b.disabled=false); }, 400);
    }, true);
    document.addEventListener('input', e => { if (e.target.matches('input,textarea,select') && e.target.id) fieldError(e.target,''); });
    document.addEventListener('change', e => { if (e.target.matches('input,select') && e.target.id) fieldError(e.target,''); });
    document.addEventListener('reset',event=>setTimeout(()=>{event.target.querySelectorAll('[aria-invalid]').forEach(input=>fieldError(input,''));event.target.querySelectorAll('.file-name-display[data-original]').forEach(hint=>{hint.textContent=hint.dataset.original;hint.style.removeProperty('color');});},0));
    document.querySelectorAll('.mgmt-upload-zone').forEach(zone=>{
      zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('is-dragging');});
      zone.addEventListener('dragleave',()=>zone.classList.remove('is-dragging'));
      zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('is-dragging');const input=zone.querySelector('input[type="file"]');if(!input||!event.dataTransfer.files.length)return;const transfer=new DataTransfer();transfer.items.add(event.dataTransfer.files[0]);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
    });
    document.querySelectorAll('table.mgmt-table').forEach(tableControls);
    const dialogObserver = new MutationObserver(syncDialogs);
    document.querySelectorAll('.mgmt-modal,.hologram-modal').forEach(m => dialogObserver.observe(m, { attributes:true, attributeFilter:['class'] }));
    syncDialogs();
    document.addEventListener('keydown', event => {
      if (event.key==='Escape') {
        if (activeModal) activeModal.classList.remove('is-open');
        closeMenu();
        document.querySelector('[data-contact-hub]')?.classList.remove('is-open');
        document.querySelector('[data-ai-chat-window]')?.classList.remove('is-open');
      }
      const trap=activeModal || (document.body.classList.contains('menu-open')?document.querySelector('.os-dock'):null);
      if (trap && event.key==='Tab') {
        const nodes = [...trap.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(n => !n.disabled && !n.closest('[hidden]') && n.getClientRects().length);
        if (!nodes.length) return;
        const first=nodes[0], last=nodes.at(-1);
        if (event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
      }
      if ((event.key===' ' || event.key==='Enter') && event.target.matches('[role="button"]:not(button):not(a)')) { event.preventDefault(); event.target.click(); }
    });
    document.querySelectorAll('[onclick]:not(button):not(a),[data-switch-view]:not(button):not(a)').forEach(el => { el.setAttribute('role','button'); el.tabIndex=0; });
    const menu=document.querySelector('[data-menu-toggle]');
    const nav=document.querySelector('.os-dock');
    const mobile=matchMedia('(max-width:768px)');
    const syncMenu=()=>nav.inert=mobile.matches&&!document.body.classList.contains('menu-open');
    syncMenu();mobile.addEventListener('change',syncMenu);
    menu?.addEventListener('click', () => { const open=document.body.classList.toggle('menu-open'); menu.setAttribute('aria-expanded',String(open)); document.querySelector('[data-menu-backdrop]').hidden=!open; syncMenu(); if(open)nav.querySelector('button').focus(); });
    document.querySelector('[data-menu-backdrop]')?.addEventListener('click',closeMenu);
    document.addEventListener('click',e=>{ if(e.target.closest('[data-dock-target]')) closeMenu(); });
    document.querySelector('[data-input-code]')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.querySelector('[data-verify-btn]').click();}});
    document.querySelector('[data-input-name]')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.querySelector('[data-verify-btn]').click();}});
    document.querySelectorAll('.dock-item').forEach(b=>b.setAttribute('aria-label',b.dataset.tooltipVi||b.dataset.tooltip));
  }
  function closeMenu() { const wasOpen=document.body.classList.contains('menu-open'); document.body.classList.remove('menu-open'); document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false'); const b=document.querySelector('[data-menu-backdrop]'); if(b)b.hidden=true; if(matchMedia('(max-width:768px)').matches)document.querySelector('.os-dock').inert=true; if(wasOpen)document.querySelector('[data-menu-toggle]').focus(); }
  global.DTMS_UI = Object.freeze({ validate, fieldError, escape, fold, prepareForms, refreshTables:()=>document.querySelectorAll('table.mgmt-table').forEach(t=>tables.get(t)?.refresh()) });
  document.addEventListener('DOMContentLoaded', init);
})(window, document);
