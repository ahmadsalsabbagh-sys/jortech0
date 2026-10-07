<p align="center">
  <img src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" alt="JOR Tech Logo" width="160"/>
</p>

<h1 align="center">🖥️ JOR Tech - WhatsApp Dashboard</h1>
<p align="center">
  <strong>لوحة التحكم التفاعلية المتقدمة لإدارة وأتمتة الواتساب والذكاء الاصطناعي</strong><br/>
  <strong>منصة وأكاديمية JOR Tech | إشراف وتطوير: أ. أحمد الصباغ</strong>
</p>

<p align="center">
  <a href="https://www.jortechjo.com">منصة JOR Tech</a> •
  <a href="https://www.instagram.com/jortech.jo">إنستغرام المنصة</a> •
  <a href="https://www.instagram.com/ahmad.alsabbagh_">إنستغرام أ. أحمد</a> •
  <a href="#-features">الميزات</a> •
  <a href="#️-tech-stack">التقنيات المستخدمة</a> •
  <a href="#-getting-started">التشغيل والتطوير</a>
</p>

---

## 💡 عن لوحة التحكم (About the Dashboard)

واجهة مستخدم عصرية وسريعة الاستجابة مصممة بتقنيات **React & Vite** لإدارة العمليات اليومية في **منصة وأكاديمية JOR Tech**:
* **إدارة ومراقبة الجلسات:** ربط أرقام الواتساب ومسح كود QR بشكل لحظي.
* **إدارة بوتات الذكاء الاصطناعي والإضافات:** التحكم في إعدادات نماذج Groq وتوجيهات البوت (System Prompt).
* **إدارة مفاتيح الـ API والصلاحيات:** توليد وتخصيص مفاتيح وصول محددة للمشرفين والمجموعات.
* **مراقبة البنية التحتية:** تتبع أداء السيرفر السحابي، الذاكرة، والتخزين.

---

## ✨ ميزات اللوحة (Features)

- **Session Management** - إنشاء، تشغيل، ومراقبة جلسات الواتساب المتعددة.
- **QR Code Authentication** - عرض كود الربط اللحظي لتسجيل الدخول بسهولة وسرعة.
- **AI & Plugins Control** - تثبيت وإعداد ملحقات الأتمتة والذكاء الاصطناعي.
- **Webhook Configuration** - ضبط واختبار روابط تدفق البيانات والأحداث اللحظية.
- **API Key Management** - إدارة مفاتيح الربط وتحديد الصلاحيات والمجموعات المسموح بها.
- **Real-time Live Sync** - مزامنة حية لحالة الرسائل والجلسات عبر WebSocket (Socket.IO).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

| التقنية (Technology) | الدور والوظيفة (Purpose)            |
| -------------------- | ----------------------------------- |
| **React 19**         | بناء واجهات المستخدم التفاعلية      |
| **TypeScript**       | أمان وتدقيق أنواع البيانات برمجياً   |
| **Vite 8**           | بيئة البناء والتطوير فائقة السرعة    |
| **React Router 7**   | إدارة التنقل بين الصفحات والمسارات  |
| **TanStack Query**   | إدارة ومزامنة بيانات السيرفر والتخزين |
| **TanStack Table**   | عرض الجداول والبيانات المتقدمة      |
| **Socket.IO Client** | الاتصال اللحظي المباشر بالأحداث      |
| **Lucide React**     | الأيقونات العصرية للواجهة           |

---

## 🚀 التشغيل والتطوير (Getting Started)

### المتطلبات الأساسية (Prerequisites)
- بيئة تشغيل **Node.js 22 LTS+**
- مدير الحزم **npm**

### تشغيل بيئة التطوير المحلية (Local Development)

```bash
# تثبيت حزم واجهة التحكم
npm install

# بدء سيرفر التطوير اللحظي
npm run dev
ستكون لوحة التحكم متاحة على: http://localhost:2886
(تتصل اللوحة تلقائياً عبر ميزة الـ Proxy بـ API السيرفر الخلفي على المنفذ :2785).
بناء نسخة الإنتاج النهائية (Production Build)
code
Bash
# بناء ملفات الواجهة للإنتاج
npm run build

# معاينة البناء
npm run preview
في بيئة الإنتاج السحابية (Render أو Docker)، يتم تقديم الملفات الناتجة (dist/) مباشرة من خادم NestJS على نفس المنفذ دون الحاجة لسيرفر واجهة منفصل.
📁 هيكلية مجلدات الواجهة (Project Structure)
code
Code
dashboard/
├── src/
│   ├── components/     # المكونات الرسومية القابلة لإعادة الاستخدام
│   ├── pages/          # صفحات لوحة التحكم (الجلسات، الإضافات، السجلات)
│   ├── hooks/          # خطافات React المخصصة
│   ├── services/       # دوال الاتصال بالـ API
│   ├── types/          # تعريفات TypeScript
│   ├── utils/          # أدوات ودوال مساعدة
│   ├── App.tsx         # المكون الجذري للتطبيق
│   ├── App.css         # الأنماط والتنسيقات العامة
│   └── main.tsx        # نقطة انطلاق واجهة React
├── public/             # الأصول الثابتة والشعارات
├── index.html          # الصفحة الأساسية للتطبيق
└── vite.config.ts      # إعدادات Vite
🔗 ربط واجهة التحكم بالسيرفر (API Connection)
افتراضياً، تتصل اللوحة بنفس نطاق السيرفر المضيف (Single-Origin). في حال تشغيل الواجهة على استضافة منفصلة تماماً، يمكن ضبط المتغيرات البيئية عند البناء:
code
Bash
VITE_API_URL=https://your-api-server.onrender.com
VITE_WS_URL=https://your-api-server.onrender.com
📄 الترخيص (License)
مرخص تحت رخصة MIT License الحرة والمفتوحة المصدر.
<div align="center">
الموقع الرسمي لمنصة وأكاديمية JOR Tech · إنستغرام أ. أحمد الصباغ
لوحة تحكم منصة وأكاديمية JOR Tech · تم التطوير والتجهيز بإشراف: أ. أحمد الصباغ 🇯🇴✨
</div>
