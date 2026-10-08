import { useState } from 'react';
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
  const isEn = !isAr;
  
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
    <div className={`app-layout ${theme} ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
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
      <div className={`floating-nav-container ${isMenuOpen ? 'open' : ''}`}>
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
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ '--delay': `${index * 0.04}s` } as React.CSSProperties}
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
