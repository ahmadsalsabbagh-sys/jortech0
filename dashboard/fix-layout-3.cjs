const fs = require('fs');
let layout = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

layout = layout.replace(/transform:\s*translateY\(20px\)\s*scale\(0\.95\);\s*transform-origin:\s*bottom right;/g, 
`transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;`);

fs.writeFileSync('dashboard/src/components/Layout.css', layout, 'utf8');