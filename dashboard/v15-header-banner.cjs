const fs = require('fs');
let css = fs.readFileSync('dashboard/src/components/PageHeader.css', 'utf8');

const bannerCss = `
.modern-page-header {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(24px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 24px !important;
  padding: 1.5rem 2rem !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 2px 0 rgba(255,255,255,0.5) !important;
  margin-bottom: 2.5rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all 0.3s ease;
}

[data-theme='dark'] .modern-page-header,
.dark .modern-page-header {
  background: rgba(30, 41, 59, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
}

.modern-page-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(14, 165, 233, 0.1) !important;
}
`;

// Replace the old transparent block
css = css.replace(/\.modern-page-header\s*\{[\s\S]*?gap:\s*1rem;\s*\}/, bannerCss);

// Let's also make SURE the icon is absolutely visible
if (!css.includes('display: flex !important;')) {
    css = css.replace('.page-header__icon-container {', '.page-header__icon-container {\n  display: flex !important;\n  visibility: visible !important;\n');
}

fs.writeFileSync('dashboard/src/components/PageHeader.css', css, 'utf8');