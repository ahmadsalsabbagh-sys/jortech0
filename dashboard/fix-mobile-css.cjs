const fs = require('fs');

// 1. Fix Layout.css (The FAB and Floating Menu Mobile App-like view)
let layoutCSS = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

const oldMediaLayout = `@media (max-width: 768px) {
  .top-navbar { padding: 0 1rem; }
  .nav-pill-btn .pill-text { display: none; }
  .user-profile-pill .pill-text { display: none; }
  .floating-menu { width: 340px; right: -15px; }
  .rtl .floating-menu { right: auto; left: -15px; }
  .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
}`;

const newMediaLayout = `@media (max-width: 768px) {
  .top-navbar { padding: 0 1rem; }
  .nav-pill-btn .pill-text { display: none; }
  .user-profile-pill .pill-text { display: none; }
  
  /* Make menu an app-like bottom sheet on mobile */
  .floating-menu { 
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    border-radius: 30px 30px 0 0 !important;
    padding: 2rem 1.5rem 6rem 1.5rem !important;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5) !important;
    transform: translateY(100%) !important;
    transform-origin: center bottom !important;
  }
  .rtl .floating-menu {
    transform-origin: center bottom !important;
  }
  .floating-nav-container.open .floating-menu {
    transform: translateY(0) !important;
  }
  
  .menu-grid { 
    grid-template-columns: repeat(3, 1fr) !important; 
    gap: 1rem !important; 
  }
  
  .fab-main {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
  }
  .rtl .fab-main {
    right: auto;
    left: 1.5rem;
  }
}`;

layoutCSS = layoutCSS.replace(oldMediaLayout, newMediaLayout);

// Also fix Desktop cutoff for floating menu (expand towards center)
layoutCSS = layoutCSS.replace('width: 420px;', 'width: 420px; max-width: calc(100vw - 40px);');

fs.writeFileSync('dashboard/src/components/Layout.css', layoutCSS, 'utf8');

// 2. Fix Login.css (Scroll and stacking issues)
let loginCSS = fs.readFileSync('dashboard/src/pages/Login.css', 'utf8');

// Replace fixed with relative for container so it scrolls
loginCSS = loginCSS.replace(/position: fixed;\s*top: 0; left: 0; right: 0; bottom: 0;/g, 'position: relative;');
loginCSS = loginCSS.replace(/overflow: hidden;/g, 'overflow: hidden; display: flex; flex-direction: row;');

const oldMediaLogin = `@media (max-width: 768px) {
  .login-card {
    height: auto;
    min-height: 700px;
  }
  .login-blue-panel,
  .login-white-panel {
    position: static;
    width: 100% !important;
    transform: none !important;
  }
  .login-blue-panel {
    padding: 2rem;
  }
  .login-white-panel {
    padding: 2rem;
  }
}`;

const newMediaLogin = `@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
    min-height: 100vh;
    overflow-y: auto;
  }
  .login-card {
    height: auto;
    min-height: 700px;
    flex-direction: column !important;
    overflow: visible;
  }
  .login-blue-panel,
  .login-white-panel {
    position: static !important;
    width: 100% !important;
    transform: none !important;
    height: auto !important;
  }
  .login-blue-panel {
    padding: 2rem;
    border-radius: 20px 20px 0 0;
  }
  .login-white-panel {
    padding: 2rem 1.5rem;
    border-radius: 0 0 20px 20px;
  }
  .login-logo-wrapper {
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
  }
}`;

loginCSS = loginCSS.replace(oldMediaLogin, newMediaLogin);

// If it couldn't find old media login, just append it
if (!loginCSS.includes('padding: 1rem;')) {
  loginCSS += '\n' + newMediaLogin;
}

fs.writeFileSync('dashboard/src/pages/Login.css', loginCSS, 'utf8');

console.log('Mobile CSS adjustments applied');