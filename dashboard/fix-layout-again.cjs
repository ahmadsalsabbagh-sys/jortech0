const fs = require('fs');

let layout = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

// 1. Fix Top Navbar overlap on mobile
const topNavOld = `.nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }`;
const topNavNew = `.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }
  .nav-brand .brand-badge {
    display: none; /* Hide version badge on very small screens to save space */
  }
  @media (min-width: 480px) {
    .nav-brand .brand-badge { display: inline-block; }
    .nav-brand { gap: 1rem; }
  }`;
layout = layout.replace(topNavOld, topNavNew);

// Make nav-actions shrinkable
layout = layout.replace('.nav-actions {\n    display: flex;\n    align-items: center;\n    gap: 0.8rem;\n  }', 
`.nav-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: nowrap;
  }
  @media (min-width: 480px) { .nav-actions { gap: 0.8rem; } }`);

// 2. Completely overhaul floating-menu and menu-grid to be beautifully compact and responsive
const floatingMenuRegex = /\.floating-menu \{[\s\S]*?transform-origin:\s*bottom left;\n\}/;
const compactFloatingMenu = `.floating-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: max-content;
  min-width: 280px;
  max-width: calc(100vw - 3rem); /* Safe margins on any screen */
  border-radius: 24px;
  padding: 1.2rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1);
  z-index: 101;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
}
.rtl .floating-menu {
  right: auto;
  left: 0;
  transform-origin: bottom left;
}`;
layout = layout.replace(floatingMenuRegex, compactFloatingMenu);

// Fix grid to auto-fit
layout = layout.replace(/\.menu-grid \{[\s\S]*?gap:\s*1rem;\n\}/, 
`.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
  gap: 0.5rem;
  justify-content: center;
}`);

// Scale down icons and items to be tidy
layout = layout.replace(/padding:\s*1rem 0\.5rem;/g, 'padding: 0.8rem 0.4rem;');
layout = layout.replace(/width:\s*56px;\s*height:\s*56px;/g, 'width: 46px;\n  height: 46px;');
layout = layout.replace(/font-size:\s*0\.8rem;/g, 'font-size: 0.75rem;');

// 3. Remove the old mobile bottom-sheet override
const mobileOverrideRegex = /@media\s*\(max-width:\s*768px\)[\s\S]*?\.rtl\s*\.fab-main\s*\{\s*right:\s*auto;\s*left:\s*1\.5rem;\s*\}\s*\}/;
layout = layout.replace(mobileOverrideRegex, `@media (max-width: 768px) {
  .top-navbar { padding: 0 0.8rem; }
  .brand-logo { font-size: 1.2rem; }
  .brand-logo-img { width: 36px; height: 36px; }
  .nav-pill-btn { padding: 0 0.6rem; height: 36px; }
  .nav-pill-btn .pill-text { display: none; }
  .user-profile-pill { padding: 0.2rem; }
  .user-profile-pill .pill-text { display: none; }
  
  .floating-menu {
    bottom: 75px; /* sit nicely above the fab on mobile */
  }
  .fab-main {
    bottom: 1.2rem;
    right: 1.2rem;
    width: 60px;
    height: 60px;
  }
  .rtl .fab-main {
    right: auto;
    left: 1.2rem;
  }
}`);

fs.writeFileSync('dashboard/src/components/Layout.css', layout, 'utf8');
console.log('Layout updated successfully for ultra-responsiveness');