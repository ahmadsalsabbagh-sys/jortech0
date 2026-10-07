<p align="center">
  <img src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" alt="JOR Tech Logo" width="180"/>
</p>

<h1 align="center">🚀 JOR Tech - WhatsApp AI Gateway</h1>
<p align="center">
  <strong>نظام إدارة وأتمتة الواتساب الذكي والمدعوم بالذكاء الاصطناعي</strong><br/>
  <strong>منصة وأكاديمية JOR Tech | إشراف وتطوير: أ. أحمد الصباغ</strong>
</p>

<p align="center">
  <a href="https://www.jortechjo.com">منصة JOR Tech</a> •
  <a href="https://www.instagram.com/jortech.jo">إنستغرام JOR Tech</a> •
  <a href="https://www.instagram.com/ahmad.alsabbagh_">إنستغرام أ. أحمد</a> •
  <a href="#-عن-المشروع-about-jor-tech">عن المشروع</a> •
  <a href="#-الميزات-features">الميزات</a> •
  <a href="#-التشغيل-السريع-quick-start">التشغيل السريع</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-JOR%20Tech-blue.svg" alt="JOR Tech"/>
  <img src="https://img.shields.io/badge/Lead-Ahmad%20Al--Sabbagh-orange.svg" alt="Lead"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"/>
  <img src="https://img.shields.io/badge/Node-22_LTS-brightgreen.svg" alt="Node"/>
  <img src="https://img.shields.io/badge/Docker-Ready-blue.svg" alt="Docker"/>
  <img src="https://img.shields.io/badge/AI-Groq%20%26%20OpenAI%20Enabled-purple.svg" alt="AI"/>
</p>

---

## 💡 عن المشروع (About JOR Tech WhatsApp Gateway)

هذا النظام هو البنية التحتية البرمجية المخصصة لأتمتة التواصل وإدارة الرسائل في **منصة وأكاديمية JOR Tech** (المنصة الرائدة في تعليم الذكاء الاصطناعي، البرمجة، وتصميم المواقع الرقمية والحلول التقنية الحديثة).

تم بناء وتطوير هذا النظام بإشراف وتطوير **أ. أحمد الصباغ** ليقدم حلولاً ذكية متكاملة:
* **خدمة الطلاب والعملاء:** الرد اللحظي والذكي على مدار الساعة على استفسارات الدورات والخدمات البرمجية.
* **ردود ذكية معتمدة على نماذج LLM:** مدعوم بمحركات الذكاء الاصطناعي الفائقة عبر **Groq** و **OpenAI**.
* **أتمتة المجموعات وقنوات التواصل:** تسهيل إرسال التنبيهات والإعلانات وإدارة المحادثات الجماعية بكفاءة.
* **تحكم وأمان كامل (Self-Hosted):** يعمل بشكل مستقل 100% على خوادمنا السحابية الخاصة لضمان سرية البيانات والرسائل.

| الخاصية | الوصف |
| :--- | :--- |
| 🔓 **مفتوح المصدر بالكامل (100% Open Source)** | تحكم كامل في الكود، بدون رسوم اشتراك، وبدون قيود تجارية |
| 🤖 **ذكاء اصطناعي فائق السرعة** | متكامل مع نماذج Groq المتطورة لتوليد الردود بدقة خلال أجزاء من الثانية |
| 🖥️ **لوحة تحكم تفاعلية حديثة** | واجهة React متطورة لإدارة الجلسات ومفاتيح الـ API والرسائل |
| 🔹 **دعم الجلسات المتعددة (Multi-Session)** | تشغيل أكثر من رقم واتساب في وقت واحد على نفس الخادم |
| 🐳 **جاهز لبيئة Docker & Cloud** | يعمل بسلاسة على Render, Docker, Kubernetes, VPS |
| 🧩 **نظام الإضافات القابل للتوسيع** | دعم ربط منصات Typebot, Chatwoot, n8n, ومسجلات Google Sheets |

---

## 🎯 الميزات التقنية (Core Features)

### 1. إدارة المراسلات (Messaging Engine)
* إرسال واستقبال الرسائل النصية، الصور، المستندات، والتسجيلات الصوتية.
* دعم تحويل الرسائل الصوتية (Voice Notes) إلى نصوص والرد عليها آلياً عبر الذكاء الاصطناعي.
* دعم أتمتة الردود داخل المجموعات والمحادثات الفردية بدقة فائقة.
* متابعة حالة تسليم الرسائل لحظياً (قيد الإرسال، تم التسليم، تمت القراءة).

### 2. الأمان وضبط الصلاحيات (Security & Scoping)
* **مفاتيح API مخصصة (Session-scoped & Chat-scoped):** إمكانية إعطاء مفاتيح مخصصة للمشرفين أو للبوتات محددة بمحادثات أو مجموعات معينة دون كشف باقي أرقام وبيانات النظام.
* حماية متقدمة للأرقام مع نظام محاكاة الكتابة البشرية (`SIMULATE_TYPING`) وتحديد أقصى عدد رسائل في الساعة (`Rate Limiting`).

---

## 🚀 التشغيل السريع (Quick Start)

### الطريقة الأولى: عبر Docker (مستحسن للإنتاج)

```bash
# استنساخ المستودع
git clone https://github.com/ahmadsalsabbagh-sys/jor-tech.git
cd jor-tech

# تشغيل الحاوية عبر Docker Compose
docker compose up -d

# الوصول إلى لوحة التحكم:
# Dashboard: http://localhost:2785
# API: http://localhost:2785/api
# Swagger Docs: http://localhost:2785/api/docs
