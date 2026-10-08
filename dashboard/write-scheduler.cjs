const fs = require('fs');

const tsx = `import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Send, Trash2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sessionsApi, messagingApi, type Session } from '../services/api';
import './Scheduler.css';

interface ScheduledMessage {
  id: string;
  sessionId: string;
  targetNumber: string;
  message: string;
  scheduledTime: number; // timestamp
  status: 'pending' | 'sent' | 'failed';
}

export function Scheduler() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en' || i18n.resolvedLanguage === 'en';
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [targetNumber, setTargetNumber] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [scheduledList, setScheduledList] = useState<ScheduledMessage[]>(() => {
    try {
      const saved = localStorage.getItem('jor_tech_scheduled_msgs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(console.error);
    
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      // Check for pending messages that are due
      setScheduledList(prev => {
        let hasChanges = false;
        const updated = [...prev];
        
        updated.forEach(msg => {
          if (msg.status === 'pending' && now >= msg.scheduledTime) {
            // It's time to send!
            hasChanges = true;
            msg.status = 'sent'; // Optimistically set to prevent double send
            
            messagingApi.sendText(msg.sessionId, {
              chatId: msg.targetNumber.includes('@') ? msg.targetNumber : \`\${msg.targetNumber}@c.us\`,
              text: msg.message
            }).catch(err => {
              console.error('Scheduled send failed', err);
              // We could mark it failed, but let's just keep it simple
            });
          }
        });
        
        if (hasChanges) {
          localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSchedule = () => {
    if (!selectedSession || !targetNumber || !message || !date || !time) return;
    
    const scheduleDate = new Date(\`\${date}T\${time}\`);
    if (scheduleDate.getTime() <= Date.now()) {
      alert(isEn ? 'Please select a future time' : 'يرجى اختيار وقت في المستقبل');
      return;
    }

    const newMessage: ScheduledMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: selectedSession,
      targetNumber,
      message,
      scheduledTime: scheduleDate.getTime(),
      status: 'pending'
    };

    const updated = [...scheduledList, newMessage];
    setScheduledList(updated);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));
    
    setTargetNumber('');
    setMessage('');
  };

  const handleSendNow = async (id: string) => {
    const msg = scheduledList.find(m => m.id === id);
    if (!msg || msg.status !== 'pending') return;

    // Mark as sent immediately to prevent double click
    const updated = scheduledList.map(m => m.id === id ? { ...m, status: 'sent' as const } : m);
    setScheduledList(updated);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));

    try {
      await messagingApi.sendText(msg.sessionId, {
        chatId: msg.targetNumber.includes('@') ? msg.targetNumber : \`\${msg.targetNumber}@c.us\`,
        text: msg.message
      });
    } catch (err) {
      console.error(err);
      alert(isEn ? 'Failed to send immediately' : 'فشل الإرسال الفوري');
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(isEn ? 'Delete this scheduled message?' : 'هل أنت متأكد من حذف هذه الرسالة المجدولة؟')) return;
    const updated = scheduledList.filter(m => m.id !== id);
    setScheduledList(updated);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));
  };

  const clearHistory = () => {
    const pendingOnly = scheduledList.filter(m => m.status === 'pending');
    setScheduledList(pendingOnly);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(pendingOnly));
  };

  const formatCountdown = (target: number, current: number) => {
    const diff = target - current;
    if (diff <= 0) return isEn ? 'Sent' : 'تم الإرسال';
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    if (d > 0) return \`\${d}d \${h}h \${m}m\`;
    if (h > 0) return \`\${h}h \${m}m \${s}s\`;
    return \`\${m}m \${s}s\`;
  };

  return (
    <div className="page-container scheduler-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEn ? 'Message Scheduler' : 'جدولة الرسائل'}</h1>
          <p className="page-subtitle">{isEn ? 'Schedule messages to users and groups' : 'قم بتجهيز رسائلك لترسل تلقائياً في الوقت المحدد'}</p>
        </div>
      </header>
      
      <div className="scheduler-warning">
        <AlertCircle size={20} />
        <span>{isEn 
          ? 'Note: This tool runs inside your browser. You must keep this dashboard open for scheduled messages to send.' 
          : 'ملاحظة هامة: هذه الأداة تعمل من خلال المتصفح. يجب أن تبقى لوحة التحكم مفتوحة لكي يتم إرسال الرسائل في وقتها.'}</span>
      </div>

      <div className="scheduler-grid">
        {/* Form Column */}
        <div className="scheduler-card form-card">
          <h3 className="card-title">{isEn ? 'New Schedule' : 'جدولة جديدة'}</h3>
          
          <div className="form-group">
            <label>{isEn ? 'Session' : 'اختر الجلسة'}</label>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="input-field">
              <option value="" disabled>{isEn ? 'Select Session' : 'اختر الجلسة'}</option>
              {sessions.filter(s => s.status === 'WORKING').map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{isEn ? 'Target Number/Group ID' : 'رقم المستلم أو معرف القروب'}</label>
            <input 
              type="text" 
              value={targetNumber} 
              onChange={e => setTargetNumber(e.target.value)} 
              className="input-field" 
              placeholder={isEn ? "e.g. 962791234567" : "مثال: 962791234567"} 
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>{isEn ? 'Message' : 'نص الرسالة'}</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="input-field scheduler-textarea" 
              placeholder={isEn ? "Write your message..." : "اكتب رسالتك هنا..."} 
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Calendar size={16}/> {isEn ? 'Date' : 'التاريخ'}</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="input-field" 
              />
            </div>
            <div className="form-group flex-1">
              <label><Clock size={16}/> {isEn ? 'Time' : 'الوقت'}</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="input-field" 
              />
            </div>
          </div>

          <button 
            className="btn btn-primary schedule-btn" 
            onClick={handleSchedule}
            disabled={!selectedSession || !targetNumber || !message || !date || !time}
          >
            <Calendar size={18} /> {isEn ? 'Schedule Message' : 'جدولة الرسالة'}
          </button>
        </div>

        {/* List Column */}
        <div className="scheduler-card list-card">
          <div className="list-header">
            <h3 className="card-title">{isEn ? 'Scheduled Messages' : 'الرسائل المجدولة'}</h3>
            <button className="btn-clear" onClick={clearHistory}>{isEn ? 'Clear Sent' : 'مسح المرسل'}</button>
          </div>
          
          <div className="scheduled-list">
            {scheduledList.length === 0 ? (
              <div className="empty-state">
                <Clock size={40} />
                <p>{isEn ? 'No scheduled messages yet' : 'لا توجد رسائل مجدولة حالياً'}</p>
              </div>
            ) : (
              scheduledList.map(msg => (
                <div key={msg.id} className={\`scheduled-item \${msg.status}\`}>
                  <div className="item-header">
                    <span className="target-num">{msg.targetNumber}</span>
                    <span className={\`status-badge \${msg.status}\`}>
                      {msg.status === 'pending' ? (
                        <><Clock size={14}/> {formatCountdown(msg.scheduledTime, currentTime)}</>
                      ) : (
                        <><CheckCircle2 size={14}/> {isEn ? 'Sent' : 'تم الإرسال'}</>
                      )}
                    </span>
                  </div>
                  <p className="item-msg">{msg.message}</p>
                  
                  {msg.status === 'pending' && (
                    <div className="item-actions">
                      <button className="action-btn send-now" onClick={() => handleSendNow(msg.id)} title={isEn ? "Send Now" : "إرسال فوري"}>
                        <Zap size={16} /> {isEn ? 'Send Now' : 'إرسال فوري'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(msg.id)} title={isEn ? "Delete" : "حذف"}>
                        <Trash2 size={16} /> {isEn ? 'Delete' : 'حذف'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const css = `
.scheduler-page {
  max-width: 1200px;
  margin: 0 auto;
}

.scheduler-warning {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.scheduler-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .scheduler-grid {
    grid-template-columns: 1fr;
  }
}

.scheduler-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.card-title {
  margin: 0;
  color: #0052D4;
  font-size: 1.2rem;
  font-weight: 800;
}

.scheduler-textarea {
  min-height: 120px;
  resize: vertical;
}

.schedule-btn {
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background: #0072ff;
  border-radius: 8px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.schedule-btn:hover:not(:disabled) {
  background: #0052D4;
  transform: translateY(-2px);
}

.schedule-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-clear {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}

.btn-clear:hover {
  color: #ef4444;
}

.scheduled-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #94a3b8;
  gap: 1rem;
}

.scheduled-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.scheduled-item.sent {
  opacity: 0.7;
  background: #f1f5f9;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-num {
  font-weight: 700;
  color: #0f172a;
  direction: ltr;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #ffedd5;
}

.status-badge.sent {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.item-msg {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.item-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.action-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.action-btn.send-now {
  background: #e0f2fe;
  color: #0369a1;
}

.action-btn.send-now:hover {
  background: #bae6fd;
}

.action-btn.delete {
  background: #fee2e2;
  color: #b91c1c;
}

.action-btn.delete:hover {
  background: #fecaca;
}
`;

fs.writeFileSync('dashboard/src/pages/Scheduler.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/pages/Scheduler.css', css, 'utf8');