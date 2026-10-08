const fs = require('fs');

const css = `:root {
  --primary: #0ea5e9;
  --bg-light: #f8fafc;
  --text-main: #0f172a;
}

.app-layout.dark { background: #0b1121; }
.dark {
  --bg-light: #0f172a;
  --text-main: #f8fafc;
}

.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  font-family: 'Tajawal', 'Cairo', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* TOP NAVBAR */
.top-navbar {
  height: 80px;
  background: #0b1121;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 4px 25px rgba(0,0,0,0.2);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: white;
  padding: 2px;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
}

.brand-logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #ffffff;
}

.brand-badge {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.5);
  color: #38bdf8;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

/* NAV ACTION PILLS */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nav-divider {
  width: 1px;
  height: 35px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.5rem;
}

.nav-pill-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  height: 42px;
  padding: 0 1.2rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-pill-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.pill-icon {
  width: 18px !important;
  height: 18px !important;
  stroke: #ffffff !important;
  stroke-width: 2.5px !important;
  fill: none;
}

.pill-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

.user-profile-pill {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.3);
  padding: 0.3rem 1rem 0.3rem 0.3rem;
  border-radius: 30px;
}
.rtl .user-profile-pill {
  padding: 0.3rem 0.3rem 0.3rem 1rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #0ea5e9;
}

.logout-pill {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
.logout-pill:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: #ef4444;
  color: #ffffff;
}
.logout-pill:hover .pill-icon {
  stroke: #ffffff !important;
}
.logout-pill .pill-icon {
  stroke: #fca5a5 !important;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* FLOATING NAV */
.floating-nav-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}
.rtl .floating-nav-container {
  right: auto;
  left: 2rem;
}

.fab-main {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  border: none;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 102;
}

.fab-icon-svg {
  width: 26px !important;
  height: 26px !important;
  stroke: #ffffff !important;
  stroke-width: 2.5px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main:hover {
  transform: scale(1.08) rotate(5deg);
  box-shadow: 0 15px 35px rgba(14, 165, 233, 0.6);
}

.floating-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(11, 17, 33, 0.5);
  backdrop-filter: blur(5px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.floating-nav-container.open .floating-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* DARK GLASS MENU */
.floating-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: max-content;
  min-width: 300px;
  max-width: calc(100vw - 3rem);
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
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.floating-menu::-webkit-scrollbar { width: 4px; }
.floating-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

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
  grid-template-columns: repeat(4, 1fr);
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
}

/* -------------------------------------------
   MOBILE & TABLET OPTIMIZATIONS
   ------------------------------------------- */
@media (max-width: 768px) {
  /* Navbar Fixes (Ultra Compact) */
  .top-navbar {
    height: 60px;
    padding: 0 0.8rem;
    gap: 0.4rem;
  }
  
  .nav-brand {
    gap: 0.4rem;
    flex-shrink: 1; /* allow shrinking if absolutely needed */
    overflow: hidden;
  }
  .brand-logo-img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
  .brand-logo {
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .brand-badge {
    display: none; /* Hide official badge completely on mobile */
  }

  .nav-actions {
    gap: 0.4rem;
    flex-shrink: 0;
  }
  .nav-pill-btn {
    padding: 0 0.5rem;
    height: 34px;
    border-radius: 12px;
  }
  .nav-pill-btn .pill-text {
    display: none; /* Hide all text in buttons */
  }
  .pill-icon {
    width: 16px !important;
    height: 16px !important;
  }
  
  .user-profile-pill {
    display: none; /* Hide user avatar pill to save massive space */
  }
  .nav-divider {
    margin: 0 0.2rem;
    height: 20px;
  }
  
  /* FAB & Floating Menu Mobile Fixes */
  .floating-nav-container {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  .rtl .floating-nav-container {
    right: auto;
    left: 1.5rem;
  }
  
  .fab-main {
    width: 56px;
    height: 56px;
  }
  .fab-icon-svg {
    width: 22px !important;
    height: 22px !important;
  }

  .floating-menu {
    bottom: 70px;
    width: max-content;
    max-width: calc(100vw - 2.5rem);
    padding: 1rem;
    max-height: 55vh; /* Ensure it stays short */
  }
  
  .menu-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 0.3rem !important;
  }
  .menu-item {
    padding: 0.4rem 0.2rem;
    gap: 0.4rem;
  }
  .item-icon {
    width: 36px;
    height: 36px;
  }
  .menu-svg-icon {
    width: 16px !important;
    height: 16px !important;
  }
  .item-label {
    font-size: 0.65rem;
  }
}

/* Animated FAB Button states */
.floating-nav-container.open .fab-main {
  transform: rotate(180deg) scale(1.05);
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5);
}
.floating-nav-container.open .fab-icon-svg {
  transform: rotate(90deg);
}
`;
fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');

console.log('Layout CSS optimized and fixed');