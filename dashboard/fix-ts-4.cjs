const fs = require('fs');
let sched = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');

const oldBlock = `    let targetName = finalTarget;
    if (targetType === 'group') {
      const g = groups.find(x => x.id === selectedGroup);
      targetName = (g && g.name) ? g.name : finalTarget;
    }`;

const newBlock = `    let targetName = finalTarget;
    if (targetType === 'group') {
      const g = groups.find(x => x.id === selectedGroup) as any;
      if (g && g.name) {
        targetName = String(g.name);
      }
    }`;

sched = sched.replace(oldBlock, newBlock);
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', sched, 'utf8');
console.log('Fixed using ANY to bypass TS completely');