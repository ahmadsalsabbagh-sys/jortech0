const fs = require('fs');

// Patch App.tsx
let appTsx = fs.readFileSync('dashboard/src/App.tsx', 'utf8');
if (!appTsx.includes('const Scheduler')) {
  appTsx = appTsx.replace("const BulkSender = lazy", "const Scheduler = lazy(() => import('./pages/Scheduler').then(m => ({ default: m.Scheduler })));\nconst BulkSender = lazy");
  appTsx = appTsx.replace("<Route path=\"bulk-sender\" element={<BulkSender />} />", "<Route path=\"bulk-sender\" element={<BulkSender />} />\n              <Route path=\"scheduler\" element={<Scheduler />} />");
  fs.writeFileSync('dashboard/src/App.tsx', appTsx, 'utf8');
}

// Patch Layout.tsx
let layoutTsx = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');
if (!layoutTsx.includes('CalendarClock')) {
  layoutTsx = layoutTsx.replace('Megaphone,', 'Megaphone,\n  CalendarClock,');
}
if (!layoutTsx.includes('scheduler')) {
  layoutTsx = layoutTsx.replace("{ to: '/bulk-sender', icon: Megaphone, key: 'bulkSender' as const, adminOnly: false },", "{ to: '/bulk-sender', icon: Megaphone, key: 'bulkSender' as const, adminOnly: false },\n    { to: '/scheduler', icon: CalendarClock, key: 'scheduler' as const, adminOnly: false },");
  fs.writeFileSync('dashboard/src/components/Layout.tsx', layoutTsx, 'utf8');
}

// Patch i18n
function patchLang(file, en) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/^\uFEFF/, '');
  let data = JSON.parse(content);
  
  if (!data.layout) data.layout = {};
  if (!data.layout.nav) data.layout.nav = {};
  data.layout.nav.scheduler = en ? 'Scheduler' : 'جدولة الرسائل';
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

patchLang('dashboard/src/i18n/locales/en.json', true);
patchLang('dashboard/src/i18n/locales/ar.json', false);