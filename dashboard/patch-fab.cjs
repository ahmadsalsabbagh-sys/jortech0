const fs = require('fs');

const newLayout = `import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Smartphone, MessageSquare, Webhook, Key, FileText,
  ClipboardList, LogOut, Send, Megaphone, CalendarClock, Server,
  Puzzle, Sun, Moon, X, Languages, Grid, Settings
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useRole } from '../hooks/useRole';
import { resolveSupportedLanguage } from '../i18n';
import type { UserRole } from '../types/role';
import './Layout.css';

export function Layout({ onLogout }: { onLogout: () => void; userRole: UserRole | null }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, scoped } = useRole();
  const lang = resolveSupportedLanguage(i18n.language);
  const isAr = lang === 'ar';
  const isEn = !isAr;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // FAB Settings State
  const [fabOpacity, setFabOpacity] = useState(() => Number(localStorage.getItem('fab_opacity')) || 1);
  const [fabSize, setFabSize] = useState(() => Number(localStorage.getItem('fab_size')) || 56);
  const [fabPos, setFabPos] = useState(() => localStorage.getItem('fab_pos') || 'br');

  useEffect(() => {
    localStorage.setItem('fab_opacity', fabOpacity.toString());
    localStorage.setItem('fab_size', fabSize.toString());
    localStorage.setItem('fab_pos', fabPos);
  }, [fabOpacity, fabSize, fabPos]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: isEn ? 'Dashboard' : 'الرئيسية' },
    { to: '/sessions', icon: Smartphone, label: isEn ? 'Sessions' : 'الجلسات' },
    { to: '/chats', icon: MessageSquare, label: isEn ? 'Chats' : 'المحادثات' },
    { to: '/bulk-sender', icon: Megaphone, label: isEn ? 'Bulk Sender' : 'الإرسال الجماعي' },
    { to: '/scheduler', icon: CalendarClock, label: isEn ? 'Scheduler' : 'جدولة الرسائل' },
    { to: '/webhooks', icon: Webhook, label: isEn ? 'Webhooks' : 'الويب هوك' },
    { to: '/templates', icon: FileText, label: isEn ? 'Templates' : 'القوالب' },
    { to: '/message-tester', icon: Send, label: isEn ? 'Tester' : 'اختبار الرسائل' },
  ];

  if (isAdmin && !scoped) {
    navItems.push(
      { to: '/api-keys', icon: Key, label: isEn ? 'API Keys' : 'مفاتيح API' },
      { to: '/infrastructure', icon: Server, label: isEn ? 'Servers' : 'البنية التحتية' },
      { to: '/plugins', icon: Puzzle, label: isEn ? 'Plugins' : 'الإضافات' }
    );
  }
  if (isAdmin) {
    navItems.push({ to: '/logs', icon: ClipboardList, label: isEn ? 'Logs' : 'السجلات' });
  }

  const toggleLang = () => i18n.changeLanguage(isAr ? 'en' : 'ar');

  // Compute positioning style for the FAB container dynamically
  const getContainerStyle = () => {
    const isMobile = window.innerWidth <= 768;
    const baseOffset = isMobile ? '1.2rem' : '2.5rem';
    
    let style: any = { zIndex: 100, position: 'fixed' };
    
    if (fabPos === 'br') {
      style.bottom = baseOffset;
      style.right = baseOffset;
      style.left = 'auto';
      style.top = 'auto';
    } else if (fabPos === 'bl') {
      style.bottom = baseOffset;
      style.left = baseOffset;
      style.right = 'auto';
      style.top = 'auto';
    } else if (fabPos === 'tr') {
      style.top = isMobile ? '70px' : '90px'; // clear navbar
      style.right = baseOffset;
      style.left = 'auto';
      style.bottom = 'auto';
    } else if (fabPos === 'tl') {
      style.top = isMobile ? '70px' : '90px';
      style.left = baseOffset;
      style.right = 'auto';
      style.bottom = 'auto';
    }
    return style;
  };

  // Determine floating menu transform origin based on position
  const getMenuClass = () => {
    let classes = "floating-menu dark-glass ";
    if (fabPos === 'bl' || fabPos === 'tl') classes += "menu-left ";
    if (fabPos === 'tr' || fabPos === 'tl') classes += "menu-top ";
    return classes;
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
      <div className={\`floating-nav-container \${isMenuOpen ? 'open' : ''}\`} style={getContainerStyle()}>
        <div className="floating-overlay" onClick={() => { setIsMenuOpen(false); setShowSettings(false); }}></div>
        
        <div className={getMenuClass()}>
          <div className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>{showSettings ? (isEn ? 'FAB Settings' : 'إعدادات الزر') : (isEn ? 'Main Menu' : 'لوحة التحكم')}</h3>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '5px' }}
            >
              {showSettings ? <X size={20} /> : <Settings size={20} />}
            </button>
          </div>
          
          {showSettings ? (
            <div className="fab-settings" style={{ padding: '1rem 0' }}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  {isEn ? 'Size (px)' : 'حجم الزر'} : {fabSize}
                </label>
                <input type="range" min="40" max="90" step="2" value={fabSize} onChange={e => setFabSize(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  {isEn ? 'Transparency' : 'الشفافية'} : {Math.round(fabOpacity * 100)}%
                </label>
                <input type="range" min="0.2" max="1" step="0.1" value={fabOpacity} onChange={e => setFabOpacity(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  {isEn ? 'Position' : 'المكان'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button onClick={() => setFabPos('tr')} style={{ padding: '0.5rem', background: fabPos==='tr' ? '#0ea5e9':'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px' }}>{isEn?'Top Right':'أعلى اليمين'}</button>
                  <button onClick={() => setFabPos('tl')} style={{ padding: '0.5rem', background: fabPos==='tl' ? '#0ea5e9':'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px' }}>{isEn?'Top Left':'أعلى اليسار'}</button>
                  <button onClick={() => setFabPos('br')} style={{ padding: '0.5rem', background: fabPos==='br' ? '#0ea5e9':'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px' }}>{isEn?'Bottom Right':'أسفل اليمين'}</button>
                  <button onClick={() => setFabPos('bl')} style={{ padding: '0.5rem', background: fabPos==='bl' ? '#0ea5e9':'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px' }}>{isEn?'Bottom Left':'أسفل اليسار'}</button>
                </div>
              </div>

            </div>
          ) : (
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
          )}
        </div>

        <button 
          className="fab-main" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ width: fabSize, height: fabSize, opacity: fabOpacity }}
        >
          {isMenuOpen ? <X className="fab-icon-svg" /> : <Grid className="fab-icon-svg" />}
        </button>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('dashboard/src/components/Layout.tsx', newLayout, 'utf8');

let css = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');
// Fix Layout.css positioning
const cssFixes = `
/* Positioning Fixes for Settings */
.floating-nav-container {
  /* removing hardcoded absolute bottom/right since it's dynamic now */
}
.floating-menu {
  bottom: 100%;
  margin-bottom: 20px;
  right: 0;
}
.floating-menu.menu-left {
  right: auto;
  left: 0;
  transform-origin: bottom left;
}
.floating-menu.menu-top {
  bottom: auto;
  top: 100%;
  margin-top: 20px;
  transform-origin: top right;
}
.floating-menu.menu-top.menu-left {
  transform-origin: top left;
}
`;

css += cssFixes;
// Strip out existing hardcoded .floating-nav-container and .fab-main position rules to prevent conflicts
css = css.replace(/\.floating-nav-container \{\s*position: fixed;\s*bottom: 2\.5rem;\s*right: 2\.5rem;\s*z-index: 100;\s*\}/, '');
css = css.replace(/\.rtl \.floating-nav-container \{\s*right: auto;\s*left: 2\.5rem;\s*\}/, '');
css = css.replace(/bottom: 80px;/, 'bottom: calc(100% + 20px);'); // make floating menu relative to fab

fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');

console.log('Layout patched for FAB settings');