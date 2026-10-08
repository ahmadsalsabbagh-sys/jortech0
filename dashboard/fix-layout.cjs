const fs = require('fs');
let layout = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');
layout = layout.replace(/onLogout, userRole/g, 'onLogout');
fs.writeFileSync('dashboard/src/components/Layout.tsx', layout, 'utf8');