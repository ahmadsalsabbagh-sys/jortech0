const fs = require('fs');
let appTsx = fs.readFileSync('dashboard/src/App.tsx', 'utf8');
if (!appTsx.includes('const BulkSender')) {
  appTsx = appTsx.replace("const MessageTester = lazy", "const BulkSender = lazy(() => import('./pages/BulkSender').then(m => ({ default: m.BulkSender })));\nconst MessageTester = lazy");
  fs.writeFileSync('dashboard/src/App.tsx', appTsx, 'utf8');
}