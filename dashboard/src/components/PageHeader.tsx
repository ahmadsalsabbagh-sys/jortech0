import type { ReactNode } from 'react';
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
