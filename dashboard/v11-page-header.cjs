const fs = require('fs');

const tsx = `import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Webhook,
  Key,
  FileText,
  ClipboardList,
  Send,
  Megaphone,
  CalendarClock,
  Server,
  Puzzle,
  Zap
} from 'lucide-react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  icon?: any;
}

export function PageHeader({ title, subtitle, badge, actions, icon: CustomIcon }: PageHeaderProps) {
  const location = useLocation();
  const path = location.pathname;

  let Icon = CustomIcon || Zap;
  
  if (!CustomIcon) {
    if (path === '/') Icon = LayoutDashboard;
    else if (path.includes('/sessions')) Icon = Smartphone;
    else if (path.includes('/chats')) Icon = MessageSquare;
    else if (path.includes('/bulk-sender')) Icon = Megaphone;
    else if (path.includes('/scheduler')) Icon = CalendarClock;
    else if (path.includes('/webhooks')) Icon = Webhook;
    else if (path.includes('/templates')) Icon = FileText;
    else if (path.includes('/api-keys')) Icon = Key;
    else if (path.includes('/message-tester')) Icon = Send;
    else if (path.includes('/logs')) Icon = ClipboardList;
    else if (path.includes('/infrastructure')) Icon = Server;
    else if (path.includes('/plugins')) Icon = Puzzle;
  }

  return (
    <header className="page-header modern-page-header">
      <div className="page-header__main">
        <div className="page-header__icon-container">
          <Icon className="page-header__icon" />
        </div>
        <div className="page-header__title-group">
          <div className="page-header__title-row">
            <h1>{title}</h1>
            {badge && <span className="page-header__badge">{badge}</span>}
          </div>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
`;

const css = `
.modern-page-header {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  padding: 0 !important;
  margin-bottom: 2.5rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header__main {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.page-header__icon-container {
  width: 55px;
  height: 55px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-header__icon {
  width: 28px;
  height: 28px;
  color: #ffffff;
  stroke-width: 2px;
}

.page-header__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.page-header__title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modern-page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
}
[data-theme='dark'] .modern-page-header h1,
.dark .modern-page-header h1 {
  color: #f8fafc;
}

.page-header__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
}
[data-theme='dark'] .page-header__subtitle,
.dark .page-header__subtitle {
  color: #94a3b8;
}

.page-header__badge {
  display: inline-flex;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

@media (max-width: 600px) {
  .page-header__main {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

fs.writeFileSync('dashboard/src/components/PageHeader.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/components/PageHeader.css', css, 'utf8');
