const fs = require('fs');
let sched = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');
sched = sched.replace(/if \(g && g\.name\) \{ targetName = g\.name; \}/g, "if (g && g.name) { targetName = g.name || ''; }");
sched = sched.replace(/if \(g && g\.name\) targetName = g\.name;/g, "if (g && g.name) targetName = g.name || '';");
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', sched, 'utf8');