const fs = require('fs');

// Fix BulkSender.tsx
let bulk = fs.readFileSync('dashboard/src/pages/BulkSender.tsx', 'utf8');
bulk = bulk.replace(/sessionsApi/g, 'sessionApi');
bulk = bulk.replace(/messagingApi/g, 'messageApi');
bulk = bulk.replace(/status === 'WORKING'/g, "status === 'ready'");
fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', bulk, 'utf8');

// Fix Scheduler.tsx
let sched = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');
sched = sched.replace(/sessionsApi/g, 'sessionApi');
sched = sched.replace(/messagingApi/g, 'messageApi');
sched = sched.replace(/status === 'WORKING'/g, "status === 'ready'");
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', sched, 'utf8');

// Fix i18n
function fixI18n(file, en) {
  let content = fs.readFileSync(file, 'utf8');
  let data = JSON.parse(content);
  
  if (!data.nav) data.nav = {};
  data.nav.bulkSender = en ? 'Bulk Sender' : 'الإرسال الجماعي';
  data.nav.scheduler = en ? 'Scheduler' : 'جدولة الرسائل';
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

fixI18n('dashboard/src/i18n/locales/en.json', true);
fixI18n('dashboard/src/i18n/locales/ar.json', false);
