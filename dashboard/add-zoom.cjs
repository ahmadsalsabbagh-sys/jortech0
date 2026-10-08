const fs = require('fs');
let css = fs.readFileSync('dashboard/src/index.css', 'utf8');

if (!css.includes('zoom:')) {
  css += `\n\n/* Global Desktop Zoom Scale for Pro UI */\n@media (min-width: 1024px) {\n  body {\n    zoom: 0.8;\n  }\n}\n`;
  fs.writeFileSync('dashboard/src/index.css', css, 'utf8');
  console.log('Added global zoom to index.css');
} else {
  console.log('Zoom already exists');
}