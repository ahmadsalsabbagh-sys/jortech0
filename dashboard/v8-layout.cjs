const fs = require('fs');

const tsx = `import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Webhook,
  Key,
  FileText,
  ClipboardList,
  LogOut,
  Send,
  Megaphone,
  CalendarClock,
  Server,
  Puzzle,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Languages,
  Grid
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useRole } from '../hooks/useRole';
import { resolveSupportedLanguage } from '../i18n';
import type { UserRole } from '../types/role';
import './Layout.css';

export function Layout({ onLogout, userRole }: { onLogout: () => void; userRole: UserRole | null }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, scoped } = useRole();
  const lang = resolveSupportedLanguage(i18n.language);
  const isAr = lang === 'ar';
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard', 'لوحة التحكم') },
    { to: '/sessions', icon: Smartphone, label: t('nav.sessions', 'أرقام الواتساب') },
    { to: '/chats', icon: MessageSquare, label: t('nav.chats', 'المحادثات') },
    { to: '/bulk-sender', icon: Megaphone, label: t('nav.bulkSender', 'الإرسال الجماعي') },
    { to: '/scheduler', icon: CalendarClock, label: t('nav.scheduler', 'جدولة الرسائل') },
    { to: '/webhooks', icon: Webhook, label: t('nav.webhooks', 'الربط البرمجي') },
    { to: '/templates', icon: FileText, label: t('nav.templates', 'القوالب') },
    { to: '/message-tester', icon: Send, label: t('nav.messageTester', 'اختبار الإرسال') },
  ];

  if (isAdmin && !scoped) {
    navItems.push(
      { to: '/api-keys', icon: Key, label: t('nav.apiKeys', 'مفاتيح API') },
      { to: '/infrastructure', icon: Server, label: t('nav.infrastructure', 'الخوادم') },
      { to: '/plugins', icon: Puzzle, label: t('nav.plugins', 'الإضافات') }
    );
  }
  if (isAdmin) {
    navItems.push({ to: '/logs', icon: ClipboardList, label: t('nav.logs', 'السجلات') });
  }

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar');
  };

  return (
    <div className={\`app-layout \${theme} \${isAr ? 'rtl' : 'ltr'}\`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-brand">
          <img src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" alt="JOR Tech" className="brand-logo-img" />
          <span className="brand-logo">JOR Tech</span>
          <span className="brand-badge">OFFICIAL</span>
        </div>
        
        <div className="nav-actions">
          <button className="nav-pill-btn" onClick={toggleLang}>
            <Languages className="pill-icon" />
            <span className="pill-text">{isAr ? 'English' : 'عربي'}</span>
          </button>
          
          <button className="nav-pill-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="pill-icon" /> : <Moon className="pill-icon" />}
            <span className="pill-text">{isEn ? 'Theme' : 'المظهر'}</span>
          </button>

          <div className="nav-divider"></div>

          <div className="user-profile-pill">
            <img src="https://ui-avatars.com/api/?name=AD&background=0ea5e9&color=fff" alt="User" className="user-avatar" />
            <span className="pill-text">{isEn ? 'Admin' : 'المدير'}</span>
          </div>

          <button className="nav-pill-btn logout-pill" onClick={onLogout}>
            <LogOut className="pill-icon" />
            <span className="pill-text">{isEn ? 'Logout' : 'خروج'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button & Animated Menu */}
      <div className={\`floating-nav-container \${isMenuOpen ? 'open' : ''}\`}>
        <div className="floating-overlay" onClick={() => setIsMenuOpen(false)}></div>
        
        <div className="floating-menu dark-glass">
          <div className="menu-header">
            <h3>{isEn ? 'Main Menu' : 'القائمة الرئيسية'}</h3>
            <p>{isEn ? 'Choose a tool to start' : 'اختر الأداة التي تريد العمل عليها'}</p>
          </div>
          <div className="menu-grid">
            {navItems.map((item, index) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => \`menu-item \${isActive ? 'active' : ''}\`}
                onClick={() => setIsMenuOpen(false)}
                style={{ '--delay': \`\${index * 0.04}s\` } as React.CSSProperties}
              >
                <div className="item-icon"><item.icon className="menu-svg-icon" /></div>
                <span className="item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <button className="fab-main" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="fab-icon-svg" /> : <Grid className="fab-icon-svg" />}
        </button>
      </div>
    </div>
  );
}
`;

const css = `
:root {
  --primary: #0ea5e9;
  --bg-light: #f8fafc;
  --text-main: #0f172a;
}

.dark {
  --bg-light: #0f172a;
  --text-main: #f8fafc;
}

.app-layout {
  min-height: 100vh;
  background: var(--bg-light);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  font-family: 'Tajawal', 'Cairo', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* TOP NAVBAR */
.top-navbar {
  height: 80px;
  background: #0b1121; /* Deep premium dark blue */
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: white;
  padding: 3px;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
}

.brand-logo {
  font-size: 1.6rem;
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
  width: 34px;
  height: 34px;
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
  bottom: 2.5rem;
  right: 2.5rem;
  z-index: 100;
}
.rtl .floating-nav-container {
  right: auto;
  left: 2.5rem;
}

.fab-main {
  width: 70px;
  height: 70px;
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
  width: 28px !important;
  height: 28px !important;
  stroke: #ffffff !important;
  stroke-width: 2.5px !important;
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
.dark-glass {
  background: rgba(15, 23, 42, 0.85) !important;
  backdrop-filter: blur(24px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

.floating-menu {
  position: absolute;
  bottom: 90px;
  right: 0;
  width: 420px;
  border-radius: 28px;
  padding: 1.8rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05);
  z-index: 101;
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
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
  margin-bottom: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 1rem;
}
.menu-header h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffffff;
}
.menu-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  padding: 1rem 0.5rem;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(15px);
  background: transparent;
}

.floating-nav-container.open .menu-item {
  animation: pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes pop-in {
  to { opacity: 1; transform: translateY(0); }
}

.item-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-svg-icon {
  width: 24px !important;
  height: 24px !important;
  stroke: #38bdf8 !important; /* Bright light blue */
  stroke-width: 2px !important;
  transition: all 0.3s;
}

.item-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.3;
  color: #f1f5f9;
  transition: color 0.3s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
}
.menu-item:hover .item-icon {
  background: #0ea5e9;
  border-color: #38bdf8;
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.4);
  transform: scale(1.1);
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
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.4);
  border-color: transparent;
}
.menu-item.active .menu-svg-icon {
  stroke: #ffffff !important;
}
.menu-item.active .item-label {
  color: #38bdf8;
}

@media (max-width: 768px) {
  .top-navbar { padding: 0 1rem; }
  .nav-pill-btn .pill-text { display: none; }
  .user-profile-pill .pill-text { display: none; }
  .floating-menu { width: 340px; right: -15px; }
  .rtl .floating-menu { right: auto; left: -15px; }
  .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
}
`;

fs.writeFileSync('dashboard/src/components/Layout.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');
