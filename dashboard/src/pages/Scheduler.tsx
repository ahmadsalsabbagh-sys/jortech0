import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Trash2, Zap, AlertCircle, CheckCircle2, Users, Phone } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { sessionApi, messageApi, type Session } from '../services/api';
import './Scheduler.css';

interface ScheduledMessage {
  id: string;
  sessionId: string;
  targetNumber: string;
  targetName?: string;
  message: string;
  scheduledTime: number; // timestamp
  status: 'pending' | 'sent' | 'failed';
}

export function Scheduler() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en' || i18n.resolvedLanguage === 'en';
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  
  const [targetType, setTargetType] = useState<'number' | 'group'>('number');
  const [targetNumber, setTargetNumber] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState<{ id: string; name?: string }[]>([]);
  
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
    sessionApi.list().then(data => setSessions(Array.isArray(data) ? data : [])).catch(console.error);
    
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      setScheduledList(prev => {
        let hasChanges = false;
        const updated = [...prev];
        
        updated.forEach(msg => {
          if (msg.status === 'pending' && now >= msg.scheduledTime) {
            hasChanges = true;
            msg.status = 'sent';
            
            const chatId = msg.targetNumber.includes('@') ? msg.targetNumber : `${msg.targetNumber}@c.us`;
            messageApi.sendText(msg.sessionId, chatId, msg.message).catch(err => {
              console.error('Scheduled send failed', err);
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

  useEffect(() => {
    if (selectedSession) {
      sessionApi.getGroups(selectedSession)
        .then(res => setGroups(Array.isArray(res) ? res : []))
        .catch(console.error);
    } else {
      setGroups([]);
    }
  }, [selectedSession]);

  
  const handleScheduleServer = async () => {
    if (!selectedSession || !targetNumber || !message || !date || !time) {
      alert(isEn ? 'Please fill all fields' : 'الرجاء تعبئة جميع الحقول');
      return;
    }

    // Convert local date/time to ISO string
    const dateTimeStr = `${date}T${time}:00`;
    let scheduledDate;
    try {
      scheduledDate = new Date(dateTimeStr);
    } catch(e) {
      alert('Invalid Date/Time');
      return;
    }

    if (scheduledDate <= new Date()) {
      alert(isEn ? 'Time must be in the future' : 'يجب أن يكون الوقت في المستقبل');
      return;
    }

    try {
      // Send to the new Scheduler Daemon running on port 2887
      const SCHEDULER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('3000', '2887');
      const response = await fetch(`${SCHEDULER_URL}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: selectedSession,
          chatId: targetNumber.includes('@') ? targetNumber : `${targetNumber.replace(/[^0-9]/g, '')}@c.us`,
          message: message,
          scheduledAt: scheduledDate.toISOString()
        })
      });

      if (response.ok) {
        alert(isEn ? 'Scheduled successfully! You can safely close the browser.' : 'تمت الجدولة بنجاح! يمكنك إغلاق المتصفح الآن وسيتكفل السيرفر بالباقي.');
        setMessage('');
        // We can reload the local list by fetching from the server if we want, but for now we'll just alert
      } else {
        alert(isEn ? 'Failed to schedule' : 'حدث خطأ أثناء الجدولة في السيرفر');
      }
    } catch (err) {
      console.error(err);
      alert(isEn ? 'Cannot connect to Scheduler Daemon (Port 2887)' : 'تعذر الاتصال بسيرفر الجدولة الخلفي (تأكد من تشغيله)');
    }
  };

  const handleSchedule = () => { handleScheduleServer(); return; // bypass old local logic

    const finalTarget = targetType === 'group' ? selectedGroup : targetNumber;
    if (!selectedSession || !finalTarget || !message || !date || !time) return;
    
    const scheduleDate = new Date(`${date}T${time}`);
    if (scheduleDate.getTime() <= Date.now()) {
      alert(isEn ? 'Please select a future time' : 'يرجى اختيار وقت في المستقبل');
      return;
    }

    let targetName = finalTarget;
    if (targetType === 'group') {
      const g = groups.find(x => x.id === selectedGroup);
      if (g && g.name) { targetName = g.name || ''; }
    }

    const newMessage: ScheduledMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: selectedSession,
      targetNumber: finalTarget,
      targetName: targetType === 'group' ? targetName : undefined,
      message,
      scheduledTime: scheduleDate.getTime(),
      status: 'pending'
    };

    const updated = [...scheduledList, newMessage];
    setScheduledList(updated);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));
    
    setTargetNumber('');
    setSelectedGroup('');
    setMessage('');
  };

  const handleSendNow = async (id: string) => {
    const msg = scheduledList.find(m => m.id === id);
    if (!msg || msg.status !== 'pending') return;

    const updated = scheduledList.map(m => m.id === id ? { ...m, status: 'sent' as const } : m);
    setScheduledList(updated);
    localStorage.setItem('jor_tech_scheduled_msgs', JSON.stringify(updated));

    try {
      const chatId = msg.targetNumber.includes('@') ? msg.targetNumber : `${msg.targetNumber}@c.us`;
      await messageApi.sendText(msg.sessionId, chatId, msg.message);
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
    
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="page-container scheduler-page">
      <PageHeader title={isEn ? 'Message Scheduler' : 'جدولة الرسائل'} subtitle={isEn ? 'Prepare messages to be sent automatically at specific times' : 'قم بتجهيز رسائلك لترسل تلقائياً في الوقت المحدد'} />
      
      <div className="scheduler-warning">
        <AlertCircle size={20} />
        <span>{isEn 
          ? 'Note: This tool runs inside your browser. You must keep this dashboard open for scheduled messages to send.' 
          : 'ملاحظة هامة: هذه الأداة تعمل من خلال المتصفح. يجب أن تبقى لوحة التحكم مفتوحة لكي يتم إرسال الرسائل في وقتها.'}</span>
      </div>

      <div className="scheduler-grid">
        <div className="scheduler-card form-card">
          <h3 className="card-title">{isEn ? 'New Schedule' : 'جدولة جديدة'}</h3>
          
          <div className="form-group">
            <label>{isEn ? 'Session' : 'اختر الجلسة'}</label>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="input-field">
              <option value="" disabled>{isEn ? 'Select Session' : 'اختر الجلسة'}</option>
              {sessions.filter(s => s.status === 'ready').map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>

          <div className="target-type-selector">
            <button 
              className={`type-btn ${targetType === 'number' ? 'active' : ''}`}
              onClick={() => setTargetType('number')}
            >
              <Phone size={16} /> {isEn ? 'Phone Number' : 'رقم هاتف'}
            </button>
            <button 
              className={`type-btn ${targetType === 'group' ? 'active' : ''}`}
              onClick={() => setTargetType('group')}
            >
              <Users size={16} /> {isEn ? 'WhatsApp Group' : 'قروب واتساب'}
            </button>
          </div>

          {targetType === 'number' ? (
            <div className="form-group">
              <label>{isEn ? 'Target Number' : 'رقم المستلم'}</label>
              <input 
                type="text" 
                value={targetNumber} 
                onChange={e => setTargetNumber(e.target.value)} 
                className="input-field" 
                placeholder={isEn ? "e.g. 962791234567" : "مثال: 962791234567"} 
                dir="ltr"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>{isEn ? 'Select Group' : 'اختر القروب'}</label>
              <select 
                value={selectedGroup} 
                onChange={e => setSelectedGroup(e.target.value)} 
                className="input-field"
                disabled={!selectedSession || groups.length === 0}
              >
                <option value="" disabled>
                  {!selectedSession ? (isEn ? 'Select session first' : 'اختر الجلسة أولاً') : 
                   groups.length === 0 ? (isEn ? 'No groups found' : 'لا يوجد قروبات') : 
                   (isEn ? 'Choose a group' : 'اختر قروب')}
                </option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name || g.id}</option>
                ))}
              </select>
            </div>
          )}

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
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <div className="form-group flex-1">
              <label><Clock size={16}/> {isEn ? 'Time' : 'الوقت'}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" />
            </div>
          </div>

          <button 
            className="btn btn-primary schedule-btn" 
            onClick={handleSchedule}
            disabled={!selectedSession || !(targetNumber || selectedGroup) || !message || !date || !time}
          >
            <Calendar size={18} /> {isEn ? 'Schedule Message' : 'جدولة الرسالة'}
          </button>
        </div>

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
                <div key={msg.id} className={`scheduled-item ${msg.status}`}>
                  <div className="item-header">
                    <span className="target-num" dir="auto">{msg.targetName || msg.targetNumber}</span>
                    <span className={`status-badge ${msg.status}`}>
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
                      <button className="action-btn send-now" onClick={() => handleSendNow(msg.id)}>
                        <Zap size={16} /> {isEn ? 'Send Now' : 'إرسال فوري'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(msg.id)}>
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
