const fs = require('fs');

let indexCss = fs.readFileSync('dashboard/src/index.css', 'utf8');

const typographyFix = `
/* =========================================
   PREMIUM TYPOGRAPHY & TEXT DESIGN
   ========================================= */

/* Force clean font rendering and apply Cairo strictly to EVERYTHING */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body, html {
  font-family: 'Cairo', 'Tajawal', system-ui, sans-serif !important;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Cairo', 'Tajawal', system-ui, sans-serif !important;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

/* Ensure inputs, buttons, and textareas inherit the beautiful font */
input, select, textarea, button {
  font-family: 'Cairo', 'Tajawal', system-ui, sans-serif !important;
}

/* Beautify the main page titles (like لوحة التحكم, الإرسال الجماعي) */
.page-title, .modern-page-header h1 {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 2px 10px rgba(0,0,0,0.03);
  font-weight: 900 !important;
}
[data-theme='dark'] .page-title,
.dark .page-title,
[data-theme='dark'] .modern-page-header h1,
.dark .modern-page-header h1 {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 2px 15px rgba(255,255,255,0.1);
}

/* Beautify panel titles inside the cards (like 1. رقم الواتساب المرسل) */
.panel-title, .card-title, .step-label {
  font-weight: 800 !important;
  letter-spacing: 0;
}

.step-label {
  font-size: 1.1rem !important;
  color: #1e293b;
}
.dark .step-label {
  color: #f1f5f9;
}

/* Refine all generic labels and hints */
label {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}
.dark label {
  color: #cbd5e1;
}

p, span, div {
  line-height: 1.6;
}

/* Modernize standard text blocks */
.text-muted, .page-subtitle, .page-header__subtitle {
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.2px;
}
.dark .text-muted, .dark .page-subtitle, .dark .page-header__subtitle {
  color: #94a3b8;
}
`;

// Append it if not already there
if (!indexCss.includes('PREMIUM TYPOGRAPHY')) {
  fs.writeFileSync('dashboard/src/index.css', indexCss + '\n' + typographyFix, 'utf8');
}