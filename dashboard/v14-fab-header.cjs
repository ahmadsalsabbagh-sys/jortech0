const fs = require('fs');

// 1. Fix FAB animation in Layout.css
let layoutCss = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');
if (!layoutCss.includes('transform: rotate(180deg)')) {
  layoutCss += `
/* Animated FAB Button */
.floating-nav-container.open .fab-main {
  transform: rotate(180deg) scale(1.05);
  background: linear-gradient(135deg, #ef4444, #b91c1c); /* Turn red when open */
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5);
}
.fab-icon-svg {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.floating-nav-container.open .fab-icon-svg {
  transform: rotate(90deg);
}
`;
  fs.writeFileSync('dashboard/src/components/Layout.css', layoutCss, 'utf8');
}

// 2. Enhance PageHeader CSS to guarantee visibility
let pageHeaderCss = fs.readFileSync('dashboard/src/components/PageHeader.css', 'utf8');
pageHeaderCss = pageHeaderCss.replace('.page-header__icon-container {', `.page-header__icon-container {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;`);
fs.writeFileSync('dashboard/src/components/PageHeader.css', pageHeaderCss, 'utf8');

// 3. Let's explicitly check PageHeader.tsx to make sure it's correct
let phTsx = fs.readFileSync('dashboard/src/components/PageHeader.tsx', 'utf8');
// Just in case, let's make sure the icon is absolutely there.
if (!phTsx.includes('page-header__icon-container')) {
  console.log("CRITICAL ERROR: PageHeader does not have icon container");
}