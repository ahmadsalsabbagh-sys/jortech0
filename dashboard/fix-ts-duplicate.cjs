const fs = require('fs');
let layout = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');

layout = layout.replace(/let style: any = \{ zIndex: 100, position: 'fixed' \};/g, '/* style already declared */');

fs.writeFileSync('dashboard/src/components/Layout.tsx', layout, 'utf8');
console.log('Fixed TS duplicate declaration');