<p align="center">
  <img src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" alt="JOR Tech Logo" width="180"/>
</p>

<h1 align="center">📘 JOR Tech Gateway - Documentation</h1>
<p align="center">
  <strong>دليل التوثيق الفني والهندسي لنظام إدارة وأتمتة الواتساب</strong><br/>
  <strong>منصة وأكاديمية JOR Tech | إشراف وتطوير: أ. أحمد الصباغ</strong>
</p>

<p align="center">
  <a href="https://www.jortechjo.com">منصة JOR Tech</a> •
  <a href="https://www.instagram.com/jortech.jo">إنستغرام المنصة</a> •
  <a href="https://www.instagram.com/ahmad.alsabbagh_">إنستغرام أ. أحمد</a> •
  <a href="#documentation-map">فهرس الوثائق</a> •
  <a href="#quick-start">التشغيل السريع</a> •
  <a href="#api-example">أمثلة API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-JOR%20Tech-blue.svg" alt="JOR Tech"/>
  <img src="https://img.shields.io/badge/Lead-Ahmad%20Al--Sabbagh-orange.svg" alt="Lead"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"/>
  <img src="https://img.shields.io/badge/Node-22_LTS-brightgreen.svg" alt="Node"/>
  <img src="https://img.shields.io/badge/Docker-Ready-blue.svg" alt="Docker"/>
</p>

---

## 🗺️ فهرس التوثيق الكامل (Documentation Map)

| No  | وثيقة الشرح (Document)                                                  | الوصف والهدف (Description)                                                        |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 01  | [Project Overview](./01-project-overview.md)                             | الرؤية العامة للنظام وأهدافه ونطاق عمله                                            |
| 02  | [Requirements Specification](./02-requirements-specification.md)         | متطلبات النظام الوظيفية والتقنية                                                   |
| 03  | [System Architecture](./03-system-architecture.md)                       | المعمارية البرمجية وتدفق البيانات بين الموديولات                                   |
| 04  | [Security Design](./04-security-design.md)                               | معايير الأمان، المصادقة، والحد من استهلاك الـ API                                  |
| 05  | [Database Design](./05-database-design.md)                               | هيكلية وتصميم قواعد البيانات والتخزين                                              |
| 06  | [API Specification](./06-api-specification.md)                           | المرجع الكامل لجميع مسارات الـ REST API وبروتوكول WebSocket                         |
| 07  | [API Collection](./07-api-collection.md)                                 | أمثلة لطلبات الـ API وجاهزية الاستيراد إلى Postman                                 |
| 08  | [Development Guidelines](./08-development-guidelines.md)                 | معايير كتابة الأكواد والمساهمة البرمجية                                            |
| 09  | [Testing Strategy](./09-testing-strategy.md)                             | استراتيجيات الفحص وضمان جودة النظام                                               |
| 10  | [DevOps & Infrastructure](./10-devops-infrastructure.md)                 | بيئة Docker وإعدادات السيرفرات السحابية                                            |
| 11  | [Operational Runbooks](./11-operational-runbooks.md)                     | أدلة التشغيل والصيانة والنسخ الاحتياطي                                             |
| 12  | [Troubleshooting FAQ](./12-troubleshooting-faq.md)                       | المشكلات الشائعة والحلول الفورية                                                  |
| 13  | [Horizontal Scaling](./13-horizontal-scaling.md)                         | توسيع السيرفرات للتعامل مع ضغط المحادثات العالي                                   |
| 14  | [Migration Guide](./14-migration-guide.md)                               | دليل ترقية ونقل قواعد البيانات                                                     |
| 15  | [Project Roadmap](./15-project-roadmap.md)                               | خطة التطوير والميزات المستقبلية                                                    |
| 16  | [Risk Management](./16-risk-management.md)                               | إدارة مخاطر حظر الأرقام وطرق تجنبها                                                |
| 17  | [Dashboard Design](./17-dashboard-design.md)                             | تصميم واجهة المستخدم React للوحة التحكم                                            |
| 18  | [SDK Design](./18-sdk-design.md)                                         | تصميم حزم التطوير البرمجية (SDKs)                                                  |
| 19  | [Plugin Architecture](./19-plugin-architecture.md)                       | معمارية نظام الإضافات وتوسيع القدرات                                               |
| 20  | [Community Guidelines](./20-community-guidelines.md)                     | إرشادات المجتمع والتعاون                                                           |
| 21  | [Glossary](./21-glossary.md)                                             | معجم المصطلحات التقنية المستخدمة                                                   |
| 22  | [n8n Integration](./22-n8n-integration.md)                               | ربط منصة n8n للأتمتة مع نظام الواتساب                                              |
| 23  | [Community Integrations](./23-community-integrations.md)                 | ربط الأدوات الخارجية مع النظام                                                     |
| 24  | [MCP Integration](./24-mcp-integration.md)                               | دعم بروتوكول Model Context Protocol لبوتات AI                                      |
| 25  | [Integration Fabric](./25-integration-fabric.md)                         | معالجة وتوزيع الـ Webhooks الواردة                                                 |
| 26  | [Global Search](./26-global-search.md)                                   | البحث الموحد في سجلات الرسائل عبر كل الجلسات                                      |
| 27  | [Plugin Search Providers](./27-plugin-search-providers.md)               | تطوير إضافات البحث المتقدم                                                         |
| 28  | [Multitenancy](./28-multitenancy.md)                                     | تصميم النظام لخدمة أكثر من جهة أو مؤسسة                                            |
| 29  | [Engine Capability Matrix](./29-engine-capability-matrix.md)             | مقارنة قدرات محركات الربط (Baileys مقابل wwebjs)                                  |
| 30  | [Plugin Sandboxing](./30-plugin-sandboxing.md)                           | عزل الإضافات وضمان أمان الخادم                                                     |
| 31  | [Session Lifecycle](./31-session-lifecycle-design.md)                    | دورة حياة الجلسات وإدارة الاستقرار البرمجي                                         |

### أمثلة جاهزة للتطبيق (Implementation Examples)

| الدليل                                                                         | الوصف                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [Session Phone-Number Pairing](./examples/session-phone-number-pairing.md)     | ربط رقم الواتساب عبر كود الهاتف بدلاً من مسح الـ QR                       |
| [Chat History Limits](./examples/chat-history-limits.md)                       | فهم حدود تخزين المحادثات المحلية ومزامنة السجلات                           |
| [Webhook Signature Verification](./examples/webhook-signature-verification.md) | التحقق من توقيع HMAC للويبهوك في Node.js و Python                         |
| [n8n Appointment Booking Workflow](./examples/n8n-appointment-booking.md)      | بناء نظام حجز مواعيد تلقائي بالواتساب عبر n8n                             |
| [n8n to Discord Workflow](./examples/n8n/README.md)                            | تحويل رسائل الواتساب الواردة إلى ديسكورد آلياً                           |

---

## ⚡ التشغيل السريع (Quick Start)

### الخيار الأول: تشغيل عبر Docker (المفضل للإنتاج)

```bash
# استنساخ المستودع
git clone https://github.com/ahmadsalsabbagh-sys/jor-tech.git
cd jor-tech

# تشغيل الحاوية
docker compose up -d
روابط الوصول إلى النظام:
لوحة التحكم (Dashboard): http://localhost:2785
واجهة البرمجة (API): http://localhost:2785/api
توثيق Swagger التفاعلي: http://localhost:2785/api/docs
الخيار الثاني: بيئة التطوير المحلية (Local Development)
code
Bash
# تثبيت الاعتماديات
npm ci

# تشغيل بيئة التطوير
npm run dev
رابط لوحة التحكم في وضع التطوير (Vite): http://localhost:2886
🔐 مفتاح الأمان (API Key)
يقوم النظام عند أول تشغيل بتوليد مفتاح أمان إداري ثابت لحماية العمليات.
في بيئة Docker، يمكنك قراءته عبر الأمر:
code
Bash
docker exec openwa-api cat /app/data/.api-key
أو يمكنك تثبيت مفتاحك السري الدائم في متغيرات البيئة عبر وضع:
code
Env
API_MASTER_KEY=AhmadSabbaghSuperSecretKey2026OpenWA
📡 أمثلة الاستخدام (API Example)
إنشاء جلسة جديدة:
code
Bash
curl -X POST http://localhost:2785/api/sessions \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "jor-tech-support"}'
إرسال رسالة واتساب:
code
Bash
curl -X POST http://localhost:2785/api/sessions/{sessionId}/messages/send-text \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "962791036401@c.us",
    "text": "مرحباً بك في منصة وأكاديمية JOR Tech! تم استلام رسالتك وسيتم الرد عليك فوراً."
  }'
🌐 الاتصال المباشر عبر WebSocket (Socket.IO)
code
JavaScript
import { io } from 'socket.io-client';

const socket = io('http://localhost:2785/events', {
  extraHeaders: { 'X-API-Key': 'YOUR_API_KEY' },
  transports: ['websocket'],
});

socket.on('connect', () => {
  socket.emit('message', {
    type: 'subscribe',
    sessionId: 'YOUR_SESSION_ID',
    events: ['message.received', 'session.status'],
    requestId: 'req_001',
  });
});

socket.on('message', msg => {
  if (msg.type === 'event') {
    console.log('حدث جديد وارد:', msg.payload.event, msg.payload.data);
  }
});
📄 الترخيص وحقوق العمل (License)
مرخص تحت رخصة MIT License الحرة والمفتوحة المصدر.
<div align="center">
الموقع الرسمي لمنصة وأكاديمية JOR Tech · إنستغرام أ. أحمد الصباغ
توثيق البنية التحتية لمنصة JOR Tech · تم التطوير والتجهيز بإشراف: أ. أحمد الصباغ 🇯🇴✨
</div>
