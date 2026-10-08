const fs = require('fs');
let css = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

css = css.replace(/width: 28px !important;/g, 'width: 45% !important;');
css = css.replace(/height: 28px !important;/g, 'height: 45% !important;');

fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');