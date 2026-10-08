const fs = require('fs');
let layout = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

// Inject the ultra-compact mobile menu logic inside the existing media query
const mobileCompactMenu = `
  /* Ultra-compact phone menu (less than half screen, 4 columns like desktop) */
  .menu-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.3rem !important; }
  .floating-menu {
    padding: 0.8rem !important;
    max-height: 45vh !important; /* Strictly less than half the screen */
  }
  .menu-item { padding: 0.4rem 0.2rem !important; gap: 0.3rem !important; }
  .item-icon { width: 34px !important; height: 34px !important; }
  .menu-svg-icon { width: 16px !important; height: 16px !important; }
  .item-label { font-size: 0.65rem !important; }
  .menu-header { margin-bottom: 0.5rem !important; padding-bottom: 0.5rem !important; }
  .menu-header h3 { font-size: 0.95rem !important; }
`;

// Insert it right before the closing bracket of @media (max-width: 768px)
const insertTarget = `.rtl .fab-main {
    right: auto;
    left: 1.2rem;
  }`;

layout = layout.replace(insertTarget, insertTarget + '\n' + mobileCompactMenu);

fs.writeFileSync('dashboard/src/components/Layout.css', layout, 'utf8');
console.log('Mobile menu made ultra compact');