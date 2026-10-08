const fs = require('fs');

let loginPath = 'dashboard/src/pages/Login.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');
loginContent = loginContent.replace(/<img[^>]*src=\"https:\/\/www\.jortechjo\.com\/uploads\/settings\/69ff8042503c0\.png\"[^>]*>/, '<img src=\"/JORTech.ICO\" alt=\"JOR Tech\" className=\"logo-icon\" style={{ maxHeight: \"80px\", width: \"auto\", objectFit: \"contain\", marginBottom: \"10px\" }} />');
fs.writeFileSync(loginPath, loginContent, 'utf8');

let layoutPath = 'dashboard/src/components/Layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(/<img[^>]*src=\"https:\/\/www\.jortechjo\.com\/uploads\/settings\/69ff8042503c0\.png\"[^>]*>/g, '<img src=\"/JORTech.ICO\" alt=\"JOR Tech\" className=\"sidebar-logo\" style={{ objectFit: \"contain\", height: \"40px\" }} />');
fs.writeFileSync(layoutPath, layoutContent, 'utf8');

console.log('Fixed img tags.');