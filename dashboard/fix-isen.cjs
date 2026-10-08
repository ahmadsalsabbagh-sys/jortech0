const fs = require('fs');
const file = 'dashboard/src/components/Layout.tsx';
let text = fs.readFileSync(file, 'utf8');
text = text.replace('const isAr = lang === \'ar\';', 'const isAr = lang === \'ar\';\n  const isEn = !isAr;');
fs.writeFileSync(file, text, 'utf8');