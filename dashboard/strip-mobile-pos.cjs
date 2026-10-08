const fs = require('fs');
let css = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

// Strip out hardcoded mobile positions for FAB and Menu because it's dynamic now
css = css.replace(/bottom: 75px; \/\* sit nicely above the fab on mobile \*\//g, '');
css = css.replace(/\.fab-main \{\s*bottom: 1\.2rem;\s*right: 1\.2rem;\s*width: 56px;\s*height: 56px;\s*\}/g, '.fab-main { width: 56px; height: 56px; }');
css = css.replace(/\.rtl \.fab-main \{\s*right: auto;\s*left: 1\.2rem;\s*\}/g, '');

fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');
console.log('Mobile FAB positions stripped');