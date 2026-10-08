const fs = require('fs');

// 1. Fix Layout.tsx
let layout = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');
layout = layout.replace(/Monitor,\s*/g, '');
layout = layout.replace(/Menu,\s*/g, '');
layout = layout.replace(/const userRole = localStorage.getItem\('jor_tech_role'\);/g, ''); // or similar unused
fs.writeFileSync('dashboard/src/components/Layout.tsx', layout, 'utf8');

// 2. Fix BulkSender.tsx
let bulk = fs.readFileSync('dashboard/src/pages/BulkSender.tsx', 'utf8');
bulk = bulk.replace(/Send,\s*/g, '');
bulk = bulk.replace(/Play,\s*/g, '');
bulk = bulk.replace(/const { t } = useTranslation\(\);/g, '');
fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', bulk, 'utf8');

// 3. Fix Scheduler.tsx
let sched = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');
sched = sched.replace(/Send,\s*/g, '');
sched = sched.replace(/const { t } = useTranslation\(\);/g, '');

// Fix handleScheduleServer implementation in Scheduler.tsx
sched = sched.replace(/messageText/g, 'message');
sched = sched.replace(/setMessageText/g, 'setMessage');
sched = sched.replace(/toast\.error\(/g, 'alert(');
sched = sched.replace(/toast\.success\(/g, 'alert(');

// Fix targetName / g undefined issue
sched = sched.replace(/let targetName = '';/g, 'let targetName: string = "";');
sched = sched.replace(/if \(g && g\.name\) targetName = g\.name;/g, 'if (g && g.name) { targetName = g.name; }');
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', sched, 'utf8');
console.log('Fixed TS errors');