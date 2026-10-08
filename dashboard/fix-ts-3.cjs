const fs = require('fs');

// 1. Fix Scheduler.tsx
let sched = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');
sched = sched.replace(/const { t, i18n } = useTranslation\(\);/g, 'const { i18n } = useTranslation();');
sched = sched.replace(/const g = groups\.find\(x => x\.id === selectedGroup\);\n\s*if \(g && g\.name\) \{ targetName = g\.name \|\| ''; \}/g, "const g = groups.find(x => x.id === selectedGroup);\n      targetName = (g && g.name) ? g.name : finalTarget;");
// Just in case it's on one line:
sched = sched.replace(/if \(g && g\.name\) \{ targetName = g\.name \|\| ''; \}/g, "targetName = (g && g.name) ? g.name : finalTarget;");
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', sched, 'utf8');

// 2. Fix BulkSender.tsx
let bulk = fs.readFileSync('dashboard/src/pages/BulkSender.tsx', 'utf8');
bulk = bulk.replace(/const { t, i18n } = useTranslation\(\);/g, 'const { i18n } = useTranslation();');
bulk = bulk.replace(/const { t } = useTranslation\(\);/g, '');
fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', bulk, 'utf8');

console.log('Fixed TS errors again');