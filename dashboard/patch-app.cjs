const fs = require('fs');

let appTsx = fs.readFileSync('dashboard/src/App.tsx', 'utf8');
if (!appTsx.includes('BulkSender')) {
  appTsx = appTsx.replace("import { MessageTester } from './pages/MessageTester';", "import { MessageTester } from './pages/MessageTester';\nimport { BulkSender } from './pages/BulkSender';");
  appTsx = appTsx.replace("<Route path=\"message-tester\" element={<MessageTester />} />", "<Route path=\"message-tester\" element={<MessageTester />} />\n              <Route path=\"bulk-sender\" element={<BulkSender />} />");
  fs.writeFileSync('dashboard/src/App.tsx', appTsx, 'utf8');
}