const fs = require('fs');

// 1. Fix Layout.tsx TS error
let layoutTsx = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');
layoutTsx = layoutTsx.replace(/const \{ t, i18n \} = useTranslation\(\);/g, 'const { i18n } = useTranslation();');
fs.writeFileSync('dashboard/src/components/Layout.tsx', layoutTsx, 'utf8');

// 2. Restore Mobile Navbar Items and shrink them instead of hiding
let layoutCss = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

const oldMobileNav = `  /* Navbar Fixes (Ultra Compact) */
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
  }`;

const newMobileNav = `  /* Navbar Fixes (Shrunk, not hidden) */
  .top-navbar {
    height: auto;
    min-height: 60px;
    padding: 0.5rem;
    gap: 0.4rem;
    flex-wrap: wrap; /* allow wrapping if screen is incredibly small */
    justify-content: space-between;
  }
  
  .nav-brand {
    gap: 0.3rem;
  }
  .brand-logo-img {
    width: 28px;
    height: 28px;
  }
  .brand-logo {
    font-size: 0.9rem;
  }
  .brand-badge {
    display: inline-block;
    font-size: 0.5rem;
    padding: 0.1rem 0.3rem;
    letter-spacing: 0.5px;
  }

  .nav-actions {
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .nav-pill-btn {
    padding: 0 0.4rem;
    height: 30px;
    border-radius: 8px;
    gap: 0.2rem;
  }
  .nav-pill-btn .pill-text {
    display: inline-block;
    font-size: 0.65rem;
  }
  .pill-icon {
    width: 14px !important;
    height: 14px !important;
  }
  
  .user-profile-pill {
    display: flex;
    padding: 0.15rem 0.4rem 0.15rem 0.15rem;
    gap: 0.3rem;
    height: 30px;
  }
  .rtl .user-profile-pill {
    padding: 0.15rem 0.15rem 0.15rem 0.4rem;
  }
  .user-avatar {
    width: 22px;
    height: 22px;
  }
  .user-profile-pill .pill-text {
    font-size: 0.65rem;
    display: inline-block;
  }
  .nav-divider {
    margin: 0 0.1rem;
    height: 20px;
  }`;

layoutCss = layoutCss.replace(oldMobileNav, newMobileNav);

fs.writeFileSync('dashboard/src/components/Layout.css', layoutCss, 'utf8');
console.log('Mobile Navbar restored and scaled down. TS fixed.');