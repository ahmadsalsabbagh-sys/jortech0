const fs = require('fs');
let css = fs.readFileSync('dashboard/src/index.css', 'utf8');

// Replace the basic one with the cross-browser one
css = css.replace(/\/\* Global Desktop Zoom[\s\S]*\}\n\}\n/, '');

css += `\n/* Global Desktop Zoom Scale for Pro UI */
@media (min-width: 1024px) {
  body {
    zoom: 0.80;
  }
}
/* Firefox fallback */
@-moz-document url-prefix() {
  @media (min-width: 1024px) {
    body {
      transform: scale(0.80);
      transform-origin: top center;
      width: 125vw;
      height: 125vh;
      overflow-x: hidden;
    }
  }
}\n`;

fs.writeFileSync('dashboard/src/index.css', css, 'utf8');
console.log('Added robust zoom');