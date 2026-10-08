const fs = require('fs');

// Update BulkSender.tsx
let bulkTsx = fs.readFileSync('dashboard/src/pages/BulkSender.tsx', 'utf8');
bulkTsx = bulkTsx.replace(
  /<header className="page-header theme-v2-header">[\s\S]*?<\/header>/,
  `<PageHeader title={isEn ? 'Bulk Sender' : 'الإرسال الجماعي والتكرار'} subtitle={isEn ? 'Advanced sender with anti-ban and duplication bypass' : 'أداة الإرسال القوية للرسائل والمكررة بتصميم عصري'} />`
);
if (!bulkTsx.includes('import { PageHeader }')) {
  bulkTsx = bulkTsx.replace('import * as XLSX', 'import { PageHeader } from \'../components/PageHeader\';\nimport * as XLSX');
}
fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', bulkTsx, 'utf8');

// Update Scheduler.tsx
let schedTsx = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');
schedTsx = schedTsx.replace(
  /<header className="page-header">[\s\S]*?<\/header>/,
  `<PageHeader title={isEn ? 'Message Scheduler' : 'جدولة الرسائل'} subtitle={isEn ? 'Prepare messages to be sent automatically at specific times' : 'قم بتجهيز رسائلك لترسل تلقائياً في الوقت المحدد'} />`
);
if (!schedTsx.includes('import { PageHeader }')) {
  schedTsx = schedTsx.replace('import { sessionApi', 'import { PageHeader } from \'../components/PageHeader\';\nimport { sessionApi');
}
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', schedTsx, 'utf8');