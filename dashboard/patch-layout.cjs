const fs = require('fs');

let layoutTsx = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');

// Add Megaphone icon import
if (!layoutTsx.includes('Megaphone')) {
  layoutTsx = layoutTsx.replace('Send,', 'Send,\n  Megaphone,');
}

// Add Nav item
if (!layoutTsx.includes('bulk-sender')) {
  layoutTsx = layoutTsx.replace("{ to: '/message-tester', icon: Send, key: 'messageTester' as const, adminOnly: false },", "{ to: '/message-tester', icon: Send, key: 'messageTester' as const, adminOnly: false },\n    { to: '/bulk-sender', icon: Megaphone, key: 'bulkSender' as const, adminOnly: false },");
}

fs.writeFileSync('dashboard/src/components/Layout.tsx', layoutTsx, 'utf8');