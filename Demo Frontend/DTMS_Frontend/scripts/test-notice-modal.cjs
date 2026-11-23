"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname,"..");
const samples = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root,"js/demo/sample-content.js"),"utf8"), samples);
const items = samples.window.DTMS_SAMPLE_CONTENT.notifications;
assert.equal(items.length,8);
for (const item of items) {
  assert(Array.isArray(item.details) && item.details.length >= 3, `Thiếu nội dung chi tiết: ${item.title}`);
  assert(item.details.every(text => typeof text === "string" && text.length > 60));
}
const source = fs.readFileSync(path.join(root,"js/features/notifications.js"),"utf8");
const css = fs.readFileSync(path.join(root,"css/pages/management-responsive.css"),"utf8");
for (const token of ["aria-modal=\"true\"", "data-notice-detail-close", "data-notice-detail-done", "aria-haspopup", "Escape", "event.target === overlay", "previousFocus.focus()", "[data-notice-detail-paragraphs]"]) {
  assert(source.includes(token), `Thiếu chức năng: ${token}`);
}
assert(css.includes(".notice-detail-dialog") && css.includes(".notice-detail-overlay[hidden]"));
console.log("PASS: 8 thông báo có nội dung chi tiết, modal + điều khiển đóng và CSS đầy đủ.");
