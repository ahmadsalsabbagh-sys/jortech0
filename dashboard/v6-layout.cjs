const fs = require('fs');

const tsx = `import { useState, useEffect, useRef } from 'react';
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
import './Layout.css';

export function Layout() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { role, isSuperAdmin, logout } = useRole();
  const lang = resolveSupportedLanguage(i18n.language);
  const isAr = lang === 'ar';
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/sessions', icon: Smartphone, label: t('nav.sessions') },
    { to: '/chats', icon: MessageSquare, label: t('nav.chats') },
    { to: '/bulk-sender', icon: Megaphone, label: t('nav.bulkSender', 'الإرسال الجماعي') },
    { to: '/scheduler', icon: CalendarClock, label: t('nav.scheduler', 'جدولة الرسائل') },
    { to: '/webhooks', icon: Webhook, label: t('nav.webhooks') },
    { to: '/templates', icon: FileText, label: t('nav.templates') },
    { to: '/api-keys', icon: Key, label: t('nav.apiKeys') },
    { to: '/message-tester', icon: Send, label: t('nav.messageTester', 'Message Tester') },
    { to: '/logs', icon: ClipboardList, label: t('nav.logs') },
  ];

  if (isSuperAdmin) {
    navItems.push(
      { to: '/infrastructure', icon: Server, label: t('nav.infrastructure', 'Infrastructure') },
      { to: '/plugins', icon: Puzzle, label: t('nav.plugins', 'Plugins') }
    );
  }

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar');
  };

  return (
    <div className={\`app-layout \${theme} \${isAr ? 'rtl' : 'ltr'}\`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Navbar matching JOR Tech theme */}
      <header className="top-navbar">
        <div className="nav-brand">
          <span className="brand-logo">JOR Tech</span>
          <span className="brand-badge">OFFICIAL</span>
        </div>
        
        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={toggleLang} title={isAr ? 'English' : 'العربية'}>
            <Languages size={20} />
          </button>
          <button className="nav-icon-btn" onClick={toggleTheme} title={t('nav.theme')}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-profile">
            <div className="avatar">
              <img src="https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff" alt="User" />
            </div>
            <button className="logout-btn" onClick={logout} title={t('nav.logout')}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button & Animated Menu */}
      <div className={\`floating-nav-container \${isMenuOpen ? 'open' : ''}\`}>
        {/* Overlay */}
        <div className="floating-overlay" onClick={() => setIsMenuOpen(false)}></div>
        
        {/* The Grid Menu */}
        <div className="floating-menu">
          <div className="menu-grid">
            {navItems.map((item, index) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => \`menu-item \${isActive ? 'active' : ''}\`}
                onClick={() => setIsMenuOpen(false)}
                style={{ '--delay': \`\${index * 0.03}s\` } as React.CSSProperties}
              >
                <div className="item-icon"><item.icon size={24} /></div>
                <span className="item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* The Main FAB Button */}
        <button 
          className="fab-main" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Grid size={28} />}
        </button>
      </div>
    </div>
  );
}
`;

const css = `
:root {
  --primary: #0ea5e9;
  --primary-dark: #0284c7;
  --bg-dark: #0f172a;
  --bg-light: #f0f9ff;
  --text-main: #0f172a;
  --glass-bg: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(255, 255, 255, 0.5);
}

.dark {
  --bg-light: #0f172a;
  --text-main: #f8fafc;
  --glass-bg: rgba(15, 23, 42, 0.9);
  --glass-border: rgba(30, 41, 59, 0.5);
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
  height: 70px;
  background: var(--bg-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.brand-badge {
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid #0ea5e9;
  color: #38bdf8;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(15deg);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-inline-start: 1rem;
  padding-inline-start: 1rem;
  border-inline-start: 1px solid rgba(255,255,255,0.1);
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #0ea5e9;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.content-wrapper {
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  color: white;
  border: none;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 102;
}

.fab-main:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(14, 165, 233, 0.5);
}

.floating-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.floating-nav-container.open .floating-overlay {
  opacity: 1;
  pointer-events: auto;
}

.floating-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 340px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  z-index: 101;
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-main);
  padding: 0.8rem 0.5rem;
  border-radius: 16px;
  transition: all 0.2s;
  opacity: 0;
  transform: translateY(10px);
}

.floating-nav-container.open .menu-item {
  animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes pop-in {
  to { opacity: 1; transform: translateY(0); }
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(14, 165, 233, 0.05);
}
.menu-item:hover .item-icon {
  background: #0ea5e9;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(14, 165, 233, 0.3);
}

.menu-item.active .item-icon {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: white;
  box-shadow: 0 8px 15px rgba(14, 165, 233, 0.3);
}

.item-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .floating-menu { width: 300px; right: -10px; }
  .rtl .floating-menu { right: auto; left: -10px; }
  .menu-grid { gap: 0.5rem; }
}
`;

fs.writeFileSync('dashboard/src/components/Layout.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');
