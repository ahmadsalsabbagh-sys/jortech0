const fs = require('fs');
let bulk = fs.readFileSync('dashboard/src/pages/BulkSender.tsx', 'utf8');
bulk = bulk.replace("const messages = numberList.map(chatId => ({ chatId, text: message }));", "const messages = numberList.map(chatId => ({ chatId, type: 'text', content: { text: message } }));");
fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', bulk, 'utf8');