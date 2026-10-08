const fs = require('fs');

let layout = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

// 1. Completely rewrite the Floating Menu & Grid
// We find where floating-menu starts and where @keyframes pop-in ends, or just do a massive replace.
// Actually, it's safer to use regex to replace specific blocks, or split the file.
// Let's replace everything from .floating-menu { to .menu-item.active .item-label {

// Since Regex for huge blocks can be flaky, I will find the indices and slice.

const startIndex = layout.indexOf('.floating-menu {');
const endIndexStr = '.menu-item.active .item-label {\n  color: #38bdf8;\n}';
const endIndex = layout.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  const before = layout.substring(0, startIndex);
  const after = layout.substring(endIndex + endIndexStr.length);

  const expertUI = `.floating-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: calc(100vw - 2rem); /* Dynamic width with margins */
  max-width: 400px; /* Elegant desktop size */
  max-height: calc(100vh - 120px); /* Prevents overlapping top navbar on tiny screens */
  overflow-y: auto; /* Adds scroll only if screen is extremely short */
  border-radius: 20px;
  padding: 1.2rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  box-shadow: 0 15px 35px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1);
  z-index: 101;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
}

/* Custom Scrollbar for the menu if it overflows */
.floating-menu::-webkit-scrollbar {
  width: 4px;
}
.floating-menu::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

.rtl .floating-menu {
  right: auto;
  left: 0;
  transform-origin: bottom left;
}

.floating-nav-container.open .floating-menu {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.menu-header {
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.8rem;
}
.menu-header h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}
.menu-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns on desktop */
  gap: 0.5rem;
  justify-content: center;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.6rem 0.2rem;
  border-radius: 14px;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateY(10px);
  background: transparent;
}

.floating-nav-container.open .menu-item {
  animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes pop-in {
  to { opacity: 1; transform: translateY(0); }
}

.item-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-svg-icon {
  width: 18px !important;
  height: 18px !important;
  stroke: #38bdf8 !important;
  stroke-width: 2px !important;
  transition: all 0.2s;
}

.item-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  color: #f1f5f9;
  transition: color 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}
.menu-item:hover .item-icon {
  background: #0ea5e9;
  border-color: #38bdf8;
  box-shadow: 0 5px 15px rgba(14, 165, 233, 0.4);
  transform: scale(1.05);
}
.menu-item:hover .menu-svg-icon {
  stroke: #ffffff !important;
}
.menu-item:hover .item-label {
  color: #ffffff;
}

.menu-item.active {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.3);
}
.menu-item.active .item-icon {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 5px 15px rgba(14, 165, 233, 0.4);
  border-color: transparent;
}
.menu-item.active .menu-svg-icon {
  stroke: #ffffff !important;
}
.menu-item.active .item-label {
  color: #38bdf8;
}`;
  
  layout = before + expertUI + after;
}

// 2. Fix the Mobile View (Top Navbar & FAB positioning)
const mobileRegex = /@media\s*\(max-width:\s*768px\)[\s\S]*?\.rtl\s*\.fab-main\s*\{\s*right:\s*auto;\s*left:\s*1\.2rem;\s*\}\s*\}/;
const mobileExpert = `@media (max-width: 768px) {
  .top-navbar { padding: 0 0.8rem; height: 60px; }
  .brand-logo { font-size: 1.1rem; }
  .brand-logo-img { width: 32px; height: 32px; }
  .nav-pill-btn { padding: 0 0.5rem; height: 32px; }
  .nav-pill-btn .pill-text { display: none; }
  .user-profile-pill { padding: 0.2rem; }
  .user-profile-pill .pill-text { display: none; }
  .nav-divider { margin: 0 0.2rem; }
  
  /* Compact grid for mobile */
  .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  
  .floating-menu {
    width: calc(100vw - 2.4rem); /* fit perfectly above fab */
    max-width: 340px;
    bottom: 75px; 
    padding: 1rem;
  }
  .fab-main {
    bottom: 1.2rem;
    right: 1.2rem;
    width: 56px;
    height: 56px;
  }
  .rtl .fab-main {
    right: auto;
    left: 1.2rem;
  }
}`;

layout = layout.replace(mobileRegex, mobileExpert);

fs.writeFileSync('dashboard/src/components/Layout.css', layout, 'utf8');
console.log('Layout updated with Expert UI fixes');