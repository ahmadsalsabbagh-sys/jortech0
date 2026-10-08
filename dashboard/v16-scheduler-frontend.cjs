const fs = require('fs');
let tsx = fs.readFileSync('dashboard/src/pages/Scheduler.tsx', 'utf8');

// Replace standard local state logic with server API logic.
// We'll just patch the handleSchedule function to send to the server.
const patch = `
  const handleScheduleServer = async () => {
    if (!selectedSession || !targetNumber || !messageText || !date || !time) {
      toast.error(isEn ? 'Please fill all fields' : 'الرجاء تعبئة جميع الحقول');
      return;
    }

    // Convert local date/time to ISO string
    const dateTimeStr = \`\${date}T\${time}:00\`;
    let scheduledDate;
    try {
      scheduledDate = new Date(dateTimeStr);
    } catch(e) {
      toast.error('Invalid Date/Time');
      return;
    }

    if (scheduledDate <= new Date()) {
      toast.error(isEn ? 'Time must be in the future' : 'يجب أن يكون الوقت في المستقبل');
      return;
    }

    try {
      // Send to the new Scheduler Daemon running on port 2887
      const SCHEDULER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('3000', '2887');
      const response = await fetch(\`\${SCHEDULER_URL}/api/schedule\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: selectedSession,
          chatId: targetNumber.includes('@') ? targetNumber : \`\${targetNumber.replace(/[^0-9]/g, '')}@c.us\`,
          message: messageText,
          scheduledAt: scheduledDate.toISOString()
        })
      });

      if (response.ok) {
        toast.success(isEn ? 'Scheduled successfully! You can safely close the browser.' : 'تمت الجدولة بنجاح! يمكنك إغلاق المتصفح الآن وسيتكفل السيرفر بالباقي.');
        setMessageText('');
        // We can reload the local list by fetching from the server if we want, but for now we'll just alert
      } else {
        toast.error(isEn ? 'Failed to schedule' : 'حدث خطأ أثناء الجدولة في السيرفر');
      }
    } catch (err) {
      console.error(err);
      toast.error(isEn ? 'Cannot connect to Scheduler Daemon (Port 2887)' : 'تعذر الاتصال بسيرفر الجدولة الخلفي (تأكد من تشغيله)');
    }
  };
`;

tsx = tsx.replace('const handleSchedule = () => {', patch + '\n  const handleSchedule = () => { handleScheduleServer(); return; // bypass old local logic\n');
fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', tsx, 'utf8');