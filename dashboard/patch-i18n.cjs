const fs = require('fs');

function patchLang(file, en) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/^\uFEFF/, '');
  let data = JSON.parse(content);
  
  if (!data.layout) data.layout = {};
  if (!data.layout.nav) data.layout.nav = {};
  data.layout.nav.bulkSender = en ? 'Bulk Sender' : 'الإرسال الجماعي';
  
  if (!data.bulkSender) {
    if (en) {
      data.bulkSender = {
        title: "Bulk Sender",
        subtitle: "Send messages to multiple contacts with delays",
        sessionSelect: "Select Session",
        targetNumbers: "Target Numbers (one per line, e.g. 96279...)",
        messageText: "Message Content",
        delayLabel: "Delay between messages (seconds)",
        randomizeDelay: "Randomize delay (adds +/- 50%)",
        sendBtn: "Start Sending",
        sending: "Sending...",
        success: "Batch started successfully!",
        error: "Failed to send",
        requiredFields: "Session, Numbers, and Message are required"
      };
    } else {
      data.bulkSender = {
        title: "الإرسال الجماعي",
        subtitle: "إرسال رسائل لعدة جهات اتصال مع مسافات زمنية لتجنب الحظر",
        sessionSelect: "اختر الجلسة",
        targetNumbers: "أرقام المستلمين (رقم بكل سطر بصيغة دولية، مثل 96279...)",
        messageText: "نص الرسالة",
        delayLabel: "التأخير الزمني بين الرسائل (بالثواني)",
        randomizeDelay: "تأخير عشوائي (يضيف أو ينقص 50%)",
        sendBtn: "بدء الإرسال",
        sending: "جاري الإرسال...",
        success: "تم بدء الإرسال بنجاح!",
        error: "فشل الإرسال",
        requiredFields: "الجلسة، الأرقام، ونص الرسالة مطلوبين"
      };
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

patchLang('dashboard/src/i18n/locales/en.json', true);
patchLang('dashboard/src/i18n/locales/ar.json', false);