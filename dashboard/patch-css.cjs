const fs = require('fs');
let css = fs.readFileSync('dashboard/src/pages/Login.css', 'utf8');
css = css.replace(
  '.logo-icon-large {\n  width: 130%;\n  height: 130%;\n  object-fit: cover;\n  transform: scale(1.1);\n}',
  '.logo-icon-large {\n  width: 90%;\n  height: 90%;\n  object-fit: contain;\n  transform: none;\n}'
);
fs.writeFileSync('dashboard/src/pages/Login.css', css, 'utf8');