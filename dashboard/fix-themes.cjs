const fs = require('fs');

// 1. Fix Layout.css (Sky Blue gradient for light mode)
let layoutCss = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');
layoutCss = layoutCss.replace(
  'background: var(--bg-light);',
  'background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%);'
);
layoutCss = layoutCss.replace(
  '.dark {',
  '.app-layout.dark { background: #0b1121; }\n.dark {'
);
fs.writeFileSync('dashboard/src/components/Layout.css', layoutCss, 'utf8');


// 2. Fix BulkSender.css (Dark mode support)
const bulkDarkCss = `
/* DARK MODE OVERRIDES */
.dark .modern-glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border-color: rgba(255, 255, 255, 0.05); color: #f8fafc; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
.dark .panel-title { color: #f8fafc; }
.dark .step-label { color: #e2e8f0; }
.dark .modern-action-row { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.1); }
.dark .modern-action-row:hover { background: rgba(15, 23, 42, 0.9); border-color: #0ea5e9; }
.dark .action-info { color: #cbd5e1; }
.dark .text-xl { color: #f8fafc; }
.dark .modern-settings { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.1); }
.dark .checkbox-text { color: #e2e8f0; }
.dark .input-hint { color: #94a3b8; }
.dark .modern-stats .stat-box { background: rgba(15, 23, 42, 0.6); box-shadow: none; }
.dark .modern-stats .stat-label { color: #cbd5e1; }
.dark .modern-progress { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.1); }
.dark .progress-header { color: #e2e8f0; }
.dark .progress-bar-bg { background: rgba(255, 255, 255, 0.1); }
.dark .modern-log { background: rgba(15, 23, 42, 0.4); }
.dark .modern-log-item { background: rgba(30, 41, 59, 0.8); border-color: rgba(255, 255, 255, 0.05); color: #f8fafc; }
.dark .log-name { color: #f8fafc; }
.dark .modern-modal { background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
.dark .modal-header { background: #0f172a; border-bottom-color: rgba(255, 255, 255, 0.05); }
.dark .modal-header h3 { color: #f8fafc; }
.dark .modal-footer { background: #0f172a; border-top-color: rgba(255, 255, 255, 0.05); }
.dark .modern-textarea, .dark select.input-field, .dark input.input-field { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #f8fafc !important; }
.dark .modern-textarea:focus, .dark select.input-field:focus, .dark input.input-field:focus { background: rgba(15, 23, 42, 0.9) !important; border-color: #0ea5e9 !important; }
.dark .modal-close { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
.dark .modal-close:hover { background: #ef4444; color: white; border-color: #ef4444; }
.dark .modern-upload-btn { background: rgba(14, 165, 233, 0.15); border-color: rgba(14, 165, 233, 0.3); color: #38bdf8; }
.dark .modern-upload-btn:hover { background: rgba(14, 165, 233, 0.25); color: #7dd3fc; }
.dark .page-title { color: #ffffff; }
.dark .page-subtitle { color: #94a3b8; }
`;
fs.appendFileSync('dashboard/src/pages/BulkSender.css', bulkDarkCss, 'utf8');


// 3. Fix Scheduler.css (Dark mode support)
const schedulerDarkCss = `
/* DARK MODE OVERRIDES */
.dark .scheduler-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
.dark .card-title { color: #f8fafc; }
.dark .scheduled-item { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); }
.dark .scheduled-item .target-num { color: #f8fafc; }
.dark .scheduled-item .item-msg { color: #cbd5e1; }
.dark .input-field { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
.dark .input-field:focus { border-color: #0ea5e9; }
.dark .type-btn { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
.dark .type-btn.active { background: rgba(14, 165, 233, 0.2); border-color: #0ea5e9; color: #38bdf8; }
.dark .scheduler-warning { background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); color: #fcd34d; }
.dark .list-header .btn-clear { color: #94a3b8; }
.dark .list-header .btn-clear:hover { color: #f8fafc; }
.dark .page-title { color: #ffffff; }
.dark .page-subtitle { color: #94a3b8; }
`;
fs.appendFileSync('dashboard/src/pages/Scheduler.css', schedulerDarkCss, 'utf8');