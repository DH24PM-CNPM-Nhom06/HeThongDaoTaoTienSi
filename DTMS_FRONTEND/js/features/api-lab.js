/* DTMS API Lab: chỉ đọc Swagger, dùng token chung với giao diện gốc.
   Không tự gửi request ghi dữ liệu. Không lưu mật khẩu, không xuất JWT vào log. */
(function initializeApiLab(global, document) {
  "use strict";
  const inventory = Array.isArray(global.DTMS_API_MANIFEST) ? global.DTMS_API_MANIFEST : [];
  const readOnlyMethods = new Set(["GET", "HEAD", "OPTIONS"]);
  const TOKEN_KEY = "jwt_token";
  const maskKeys = /^(?:token|accessToken|refreshToken|password|newPassword|matKhauHash|authorization|secret|resetToken|resetTokenHash)$/i;
  let endpoints = inventory.map(v => ({...v, source: "Bản mã nguồn tham khảo"}));
  let swagger = null;
  let selected = null;
  let lastOutput = "";
  let requestBusy = false;
  const $ = id => document.getElementById(id);
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const safeString = v => String(v ?? "");
  function baseUrl() {
    const raw = $("api-lab-url").value.trim().replace(/\/$/, "");
    const candidate = new URL(raw);
    const configured = new URL(global.DTMS_CONFIG.API_BASE_URL || "https://localhost:7143");
    // Bảo vệ bearer token: không cho gửi sang máy chủ ngoài ý muốn.
    if (!(["localhost", "127.0.0.1", "::1", "[::1]"].includes(candidate.hostname) || candidate.hostname === configured.hostname)) {
      throw new Error("Chỉ cho phép backend localhost hoặc máy chủ đã cấu hình trong js/core/config.js.");
    }
    if (!["https:", "http:"].includes(candidate.protocol)) throw new Error("Địa chỉ backend phải là HTTP(S).");
    if (candidate.pathname !== "/" || candidate.search || candidate.hash || candidate.username || candidate.password) throw new Error("Chỉ nhập origin backend, ví dụ https://localhost:7143.");
    return candidate.origin;
  }
  const routeKey = (method, path) => method.toUpperCase() + " " + path.toLowerCase().replace(/:[a-z][a-z\d_]*/ig, "");
  function authToken() { try { return global.localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } }
  function updateAuth() {
    $("api-lab-auth-state").textContent = authToken() ? "Đã có JWT trong trình duyệt" : "Chưa có JWT";
  }
  function sanitize(value, depth=0) {
    if (depth > 10) return "[truncated]";
    if (Array.isArray(value)) return value.slice(0,300).map(x => sanitize(x,depth+1));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,maskKeys.test(k) ? "[đã ẩn]" : sanitize(v,depth+1)]));
    }
    return value;
  }
  function showOutput(info, payload, note="") {
    const content = payload === undefined || payload === "" ? "(Phản hồi rỗng)" : typeof payload === "string" ? payload : JSON.stringify(sanitize(payload),null,2);
    lastOutput = content;
    $("api-lab-result-status").textContent = info;
    $("api-lab-response").textContent = content;
    $("api-lab-response-note").textContent = note;
  }
  function labelInput(group, label, fieldName, required, initial) {
    const wrapper = el("label","api-lab-field");
    wrapper.append(document.createTextNode(label + (required ? " *" : "")));
    const inp = el("input");
    inp.name = fieldName;
    inp.dataset.paramName = fieldName;
    inp.autocomplete = "off";
    inp.value = initial || "";
    inp.required = required;
    inp.placeholder = fieldName;
    wrapper.append(inp);
    group.append(wrapper);
    return inp;
  }
  function getLiveOp(item) {
    if (!swagger?.paths) return null;
    const key = routeKey(item.method,item.path);
    for (const [path, pathItem] of Object.entries(swagger.paths)) {
      if (routeKey(item.method,path) === key) return { path, operation:pathItem[item.method.toLowerCase()] || null, pathItem };
    }
    return null;
  }
  function deref(schema, depth=0) {
    if (!schema || depth>7) return {};
    if (schema.$ref) {
      const p=schema.$ref.split("/");
      const key=p[p.length-1];
      return deref(swagger?.components?.schemas?.[key] || swagger?.definitions?.[key] || {},depth+1);
    }
    return schema;
  }
  function placeholder(schema, depth=0, seen=new Set()) {
    if (depth>5) return null;
    schema=deref(schema);
    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;
    if (schema.enum?.length) return schema.enum[0];
    if (schema.allOf) return Object.assign({},...schema.allOf.map(s => placeholder(s,depth+1,seen)).filter(v=>v && typeof v==="object" && !Array.isArray(v)));
    if (schema.oneOf?.length || schema.anyOf?.length) return placeholder((schema.oneOf||schema.anyOf)[0],depth+1,seen);
    if (schema.type==="array") return [];
    if (schema.type==="integer" || schema.type==="number") return 0;
    if (schema.type==="boolean") return false;
    if (schema.format==="date") return "2026-11-18";
    if (schema.format==="date-time") return "2026-11-18T08:00:00";
    if (schema.type==="string") return "";
    if (schema.properties) {
      const obj={};
      for (const [k,v] of Object.entries(schema.properties).slice(0,45)) obj[k]=placeholder(v,depth+1,seen);
      return obj;
    }
    return {};
  }
  function selectedBodySpec() {
    const live=getLiveOp(selected);
    if (/^\/api\/File\/upload$/i.test(selected?.path || "") && !live?.operation?.requestBody) {
      return {kind:"multipart",schema:{type:"object",properties:{file:{type:"string",format:"binary"}}}};
    }
    const requestBody=live?.operation?.requestBody;
    if (!requestBody) return {kind: selected?.method === "POST" || selected?.method === "PUT" || selected?.method === "PATCH" ? "json" : "none",schema:null};
    const obj=requestBody.$ref ? deref(requestBody) : requestBody;
    const content=obj?.content || {};
    if (content["multipart/form-data"]) return {kind:"multipart",schema:content["multipart/form-data"].schema};
    const json=Object.entries(content).find(([k])=>k.toLowerCase().includes("json"));
    if (json) return {kind:"json",schema:json[1].schema};
    return {kind:"none",schema:null};
  }
  function setupBody() {
    const spec=selectedBodySpec();
    const bodyZone=$("api-lab-body-zone"), uploadZone=$("api-lab-upload-zone");
    bodyZone.hidden = spec.kind==="none";
    uploadZone.hidden = spec.kind!=="multipart";
    bodyZone.querySelector("label").textContent = spec.kind==="multipart" ? "Các trường multipart khác (JSON object, tùy chọn)" : "Request body (JSON)";
    const draft=spec.schema ? placeholder(spec.schema) : {};
    $("api-lab-json").value = spec.kind==="none" ? "" : JSON.stringify(draft && typeof draft==="object" ? draft : {},null,2);
    $("api-lab-file").value="";
  }
  function setSelection(item) {
    selected=item;
    $("api-lab-selected-method").textContent=item.method;
    $("api-lab-selected-method").dataset.method=item.method;
    $("api-lab-selected-title").textContent=item.path;
    $("api-lab-roles").textContent = (item.roles ? "Quyền tham khảo: " + item.roles + ". " : "") + "Quyền được kiểm tra thực tế tại backend.";
    $("api-lab-extra-query").value="";
    $("api-lab-allow-write").checked=false;
    const pathFields=$("api-lab-path-fields"),queryFields=$("api-lab-query-fields");
    pathFields.replaceChildren();queryFields.replaceChildren();
    const live=getLiveOp(item);
    for (const [,key] of item.path.matchAll(/\{([^}]+)\}/g)) {
      labelInput(pathFields,"Tham số đường dẫn",key.split(":")[0],true);
    }
    const parameters=[...(live?.pathItem?.parameters || []),...(live?.operation?.parameters || [])];
    for (const p of parameters) {
      if (p.in==="query") labelInput(queryFields,"Query",p.name,Boolean(p.required),p.example || p.schema?.default);
    }
    setupBody();
    showOutput("Chưa gửi request", "Chọn tham số, kiểm tra nội dung rồi nhấn Gửi yêu cầu.");
    renderList();
  }
  function renderList() {
    const filter=$("api-lab-search").value.trim().toLowerCase(),method=$("api-lab-method").value;
    const filtered=endpoints.filter(item=>(!method || item.method===method) && (!filter || [item.path,item.controller,item.roles,item.method].join(" ").toLowerCase().includes(filter)));
    $("api-lab-counter").textContent = filtered.length + "/" + endpoints.length + " API";
    const host=$("api-lab-list");host.replaceChildren();
    const fragment=document.createDocumentFragment();
    for (const item of filtered) {
      const b=el("button","api-lab-item");b.type="button";
      b.classList.toggle("is-selected",Boolean(selected && routeKey(item.method,item.path)===routeKey(selected.method,selected.path)));
      const badge=el("span","api-lab-method",item.method);badge.dataset.method=item.method;
      const txt=el("span","api-lab-item-text");
      txt.append(el("span","api-lab-item-path",item.path),el("span","api-lab-item-controller",item.controller||item.operationId||"API"));
      b.append(badge,txt);
      b.addEventListener("click",()=>setSelection(item));
      fragment.append(b);
    }
    host.append(fragment);
  }
  function renderSwagger(spec) {
    const fallback=new Map(inventory.map(x=>[routeKey(x.method,x.path),x]));
    const found=[];
    for (const [path,pathItem] of Object.entries(spec.paths || {})) {
      for (const method of ["get","post","put","patch","delete","head","options"]) {
        if (!pathItem[method]) continue;
        const val=pathItem[method], old=fallback.get(routeKey(method,path));
        found.push({method:method.toUpperCase(),path,roles:old?.roles||"",controller:old?.controller||val.tags?.[0]||"",operationId:val.operationId||"",source:"Swagger live"});
      }
    }
    if (!found.length) throw new Error("Swagger không có danh mục paths hợp lệ.");
    endpoints=found;
    selected=null;
    $("api-lab-source").textContent="Swagger live";
    $("api-lab-state").textContent=`Đã tải ${found.length} API từ backend`;
    renderList();setSelection(found[0]);
  }
  async function loadSwagger() {
    const btn=$("api-lab-sync");btn.disabled=true;
    $("api-lab-state").textContent="Đang đọc Swagger...";
    try {
      const base=baseUrl();
      $("api-lab-swagger").href=base+"/swagger";
      const controller=new AbortController();
      const timeout=global.setTimeout(()=>controller.abort(),10000);
      let resp;
      try { resp=await fetch(base+"/swagger/v1/swagger.json",{signal:controller.signal,cache:"no-store",headers:{"Accept":"application/json"}}); }
      finally { global.clearTimeout(timeout); }
      if (!resp.ok) throw new Error("Swagger HTTP " + resp.status + ". Có thể backend chưa chạy ở môi trường Development.");
      const data=await resp.json();
      if (!data.paths || typeof data.paths!=="object") throw new Error("Swagger trả cấu trúc không hợp lệ.");
      swagger=data;renderSwagger(swagger);
    } catch (err) {
      swagger=null;
      endpoints=inventory.map(v=>({...v,source:"Danh mục tham khảo"}));
      $("api-lab-source").textContent="Bản tham khảo từ backend";
      $("api-lab-state").textContent="Chưa tải được Swagger: " + (err?.message||"Lỗi kết nối");
      renderList();if (endpoints.length)setSelection(endpoints[0]);
    } finally {btn.disabled=false;}
  }
  function makeRequestPath() {
    let path=selected.path;
    const pathInputs=Array.from($("api-lab-path-fields").querySelectorAll("input"));
    for (const inp of pathInputs) {
      if (!inp.value.trim()) throw new Error("Vui lòng nhập tham số đường dẫn: "+inp.name);
      if (/\bint\b/i.test(selected.path.match(new RegExp("\\{"+inp.name+"(:[^}]*)?\\}","i"))?.[0]||"") && !/^\d+$/.test(inp.value.trim())) throw new Error("Tham số "+inp.name+" cần là số nguyên dương.");
      path=path.replace(new RegExp("\\{"+inp.name+"(?::[^}]+)?\\}","i"),encodeURIComponent(inp.value.trim()));
    }
    if (/\{/.test(path)) throw new Error("Đường dẫn còn thiếu tham số.");
    const query=new URLSearchParams();
    for (const input of $("api-lab-query-fields").querySelectorAll("input")) {
      const value=input.value.trim();
      if (!value && input.required) throw new Error("Thiếu query: "+input.name);
      if (value)query.set(input.name,value);
    }
    const extra=$("api-lab-extra-query").value.trim().replace(/^\?/,'');
    if (extra) for (const [key,value] of new URLSearchParams(extra).entries()) query.set(key,value);
    if (query.toString()) path += "?"+query.toString();
    return path;
  }
  async function runRequest(event) {
    event.preventDefault();
    if (!selected || requestBusy) return;
    const method=selected.method;
    if (!readOnlyMethods.has(method) && !$("api-lab-allow-write").checked) {
      showOutput("CHƯA GỬI", "Bạn cần đánh dấu cho phép request ghi dữ liệu trước khi thực hiện " + method + ".");return;
    }
    if (!readOnlyMethods.has(method) && !global.confirm("Gửi " + method + " " + selected.path + " tới backend? Thao tác có thể thay đổi CSDL gốc và không hoàn tác được.")) return;
    let path,spec,body,headers={"Accept":"application/json, */*"};
    try {
      path=makeRequestPath();spec=selectedBodySpec();
      const raw=$("api-lab-json").value.trim();
      if (spec.kind==="json" && raw) { body=JSON.stringify(JSON.parse(raw));headers["Content-Type"]="application/json"; }
      if (spec.kind==="multipart") {
        const form=new FormData();const file=$("api-lab-file").files[0];
        if (!file) throw new Error("Chọn file để upload.");
        const schema=deref(spec.schema);const properties=schema.properties||{};
        const fileProperty=Object.keys(properties).find(name=>deref(properties[name]).format==="binary") || "file";
        form.append(fileProperty,file,file.name);
        if (raw) {
          const extras=JSON.parse(raw);
          if (!extras || Array.isArray(extras) || typeof extras!=="object") throw new Error("Multipart fields phải là JSON object.");
          for (const [key,value] of Object.entries(extras)) {
            if (key===fileProperty || value===null || value===undefined) continue;
            form.append(key,typeof value==="object"?JSON.stringify(value):String(value));
          }
        }
        body=form;
      }
    } catch(err) {showOutput("CHƯA GỬI", "Dữ liệu nhập không hợp lệ: "+err.message);return;}
    const btn=$("api-lab-send");btn.disabled=true;requestBusy=true;
    const started=performance.now();
    const ctrl=new AbortController(), timeout=global.setTimeout(()=>ctrl.abort(),45000);
    try {
      const token=authToken();
      // Endpoint đăng nhập/khôi phục công khai: không gửi token cũ.
      const publicAuth=/^\/api\/Auth\/(?:login|quen-mat-khau|dat-lai-mat-khau)(?:\?|$)/i.test(path);
      if (token && !publicAuth) headers.Authorization="Bearer "+token;
      const response=await fetch(baseUrl()+path,{method,headers,body,signal:ctrl.signal,credentials:global.DTMS_CONFIG.API_CREDENTIALS});
      const type=(response.headers.get("content-type")||"").toLowerCase();
      const elapsed=Math.round(performance.now()-started);
      let payload;
      if (response.status===204) payload={"message":"Không có nội dung (204)."};
      else if (type.includes("json")) {
        try {payload=await response.json();}catch{payload="JSON phản hồi không hợp lệ.";}
      } else if (response.ok && (type.includes("octet-stream") || type.includes("pdf") || type.includes("spreadsheet") || type.includes("zip") || type.includes("image/"))) {
        const blob=await response.blob();
        const disposition=response.headers.get("content-disposition")||"";
        const name=disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)?.[1] || path.split("?")[0].split("/").pop() || "dtms-download";
        const objectUrl=URL.createObjectURL(blob);
        try {
          const a=document.createElement("a");a.href=objectUrl;a.download=decodeURIComponent(name);a.hidden=true;document.body.append(a);a.click();a.remove();
        } finally {global.setTimeout(()=>URL.revokeObjectURL(objectUrl),1500);}
        payload={file:name,bytes:blob.size,contentType:type,message:"Đã yêu cầu trình duyệt tải tệp."};
      } else payload=await response.text();
      const note=(response.ok?"Thành công":"Backend từ chối hoặc xử lý lỗi")+" · "+elapsed+" ms · "+method+" "+path;
      showOutput("HTTP "+response.status+" "+(response.statusText||""),payload,note);
    } catch(err) {
      showOutput("KHÔNG CÓ HTTP STATUS",err.name==="AbortError"?"Quá thời gian 45 giây.":"Không kết nối được backend: "+err.message,
        "Kiểm tra backend https://localhost:7143, HTTPS dev certificate và CORS. Đây chưa phải lỗi nghiệp vụ API.");
    } finally {global.clearTimeout(timeout);requestBusy=false;btn.disabled=false;}
  }
  async function login(event) {
    event.preventDefault();
    const form=event.currentTarget;
    if (form.dataset.submitting) return;
    const username=form.elements.username.value.trim(),password=form.elements.password.value;
    if (!username || !password) return;
    const button=form.querySelector('[type="submit"]');
    const controller=new AbortController();
    const timeout=global.setTimeout(()=>controller.abort(),global.DTMS_CONFIG.API_TIMEOUT_MS);
    form.dataset.submitting="true";
    button.disabled=true;
    try {
      const response=await fetch(baseUrl()+"/api/Auth/login",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({Username:username,Password:password}),credentials:global.DTMS_CONFIG.API_CREDENTIALS,signal:controller.signal});
      const data=await response.json().catch(()=>null);
      if (!response.ok) throw new Error(data?.message||data?.Message||"HTTP "+response.status);
      const payload=data?.data||data||{}, token=payload.token||payload.Token||payload.accessToken||payload.AccessToken;
      if (!token || typeof token!=="string") throw new Error("API đăng nhập không trả JWT.");
      global.localStorage.setItem(TOKEN_KEY,token);
      const user=payload.user||payload.User;
      if (user && typeof user==="object") {
        const maVaiTro=user.maVaiTro||user.MaVaiTro;
        const roles=user.roles||user.Roles||[maVaiTro].filter(Boolean);
        const mappedRoles=roles.map(r=>r==="TBM"?"BM":r);
        global.localStorage.setItem("dtms-user",JSON.stringify({...user,maVaiTro:maVaiTro==="TBM"?"BM":maVaiTro,roles:mappedRoles}));
      } else {
        global.localStorage.removeItem("dtms-user");
      }
      form.elements.password.value="";
      updateAuth();
      $("api-lab-state").textContent="Đăng nhập thành công: "+username;
      showOutput("LOGIN OK", "Đã nhận JWT từ backend. Token được ẩn khỏi bảng phản hồi.");
    } catch(err) {
      form.elements.password.value="";
      showOutput("LOGIN FAILED", "Đăng nhập chưa thành công: "+(err.name==="AbortError"?"Quá thời gian chờ backend.":err.message));
    } finally {
      global.clearTimeout(timeout);
      delete form.dataset.submitting;
      button.disabled=false;
    }
  }
  function init() {
    if (!$('api-lab-view')) return;
    $("api-lab-url").value=global.DTMS_CONFIG.API_BASE_URL||"https://localhost:7143";
    $("api-lab-sync").addEventListener("click",loadSwagger);
    $("api-lab-search").addEventListener("input",renderList);
    $("api-lab-method").addEventListener("change",renderList);
    $("api-lab-request-form").addEventListener("submit",runRequest);
    $("api-lab-login").addEventListener("submit",login);
    $("api-lab-signout").addEventListener("click",()=>{
      global.DTMS_API?.logout?.();
      global.localStorage.removeItem("dtms-user");
      updateAuth();showOutput("JWT đã xóa","Token trên trình duyệt đã được xóa. Token server có thể vẫn còn hiệu lực tới lúc hết hạn.");
    });
    $("api-lab-copy").addEventListener("click",async()=>{
      if (!lastOutput) return;
      try {await navigator.clipboard.writeText(lastOutput);$("api-lab-response-note").textContent="Đã sao chép phản hồi (các trường nhạy cảm được ẩn).";}
      catch {$("api-lab-response-note").textContent="Không sao chép được trong trình duyệt này.";}
    });
    updateAuth();renderList();if(endpoints.length)setSelection(endpoints[0]);
    let loaded=false;
    document.addEventListener("dtms:view-change",event=>{
      if (event.detail?.view==="api-lab" && !loaded){loaded=true;loadSwagger();}
      if (event.detail?.view==="api-lab") updateAuth();
    });
    if (location.hash==="#api-lab") {loaded=true;loadSwagger();}
  }
  document.addEventListener("DOMContentLoaded",init);
})(window, document);
