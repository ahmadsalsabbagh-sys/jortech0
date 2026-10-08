const fs = require('fs');

const tsx = `import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2, XCircle, FileText, Upload, Activity } from 'lucide-react';
import { sessionApi, messageApi, type Session } from '../services/api';
import './BulkSender.css';

export function BulkSender() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en' || i18n.resolvedLanguage === 'en';
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(5);
  const [randomize, setRandomize] = useState(true);
  
  const [batchState, setBatchState] = useState<'idle' | 'sending' | 'completed' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  
  const [activeBatchId, setActiveBatchId] = useState('');
  const [batchResults, setBatchResults] = useState<{ chatId: string; status: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionApi.list().then(data => setSessions(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  // Poll batch status
  useEffect(() => {
    if (!activeBatchId || !selectedSession || batchState !== 'sending') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await messageApi.getBatchStatus(selectedSession, activeBatchId);
        setBatchResults(res.results || []);
        
        if (res.status === 'completed' || res.status === 'failed' || res.status === 'cancelled') {
          clearInterval(interval);
          setBatchState(res.status === 'completed' ? 'completed' : 'error');
          setStatusMsg({ 
            type: res.status === 'completed' ? 'success' : 'error', 
            text: isEn ? \`Batch \${res.status} successfully\` : \`تم الانتهاء من الإرسال (\${res.status})\` 
          });
        }
      } catch (err) {
        console.error('Failed to poll batch', err);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [activeBatchId, selectedSession, batchState]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setNumbers(prev => prev ? prev + '\\n' + text : text);
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    setStatusMsg({ type: '', text: '' });
    
    if (!selectedSession || !numbers.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: isEn ? 'Session, Numbers, and Message are required' : 'الجلسة، الأرقام، ونص الرسالة مطلوبين' });
      return;
    }

    // Process numbers: Split, clean, format (handle 07 -> 9627), and deduplicate
    const rawNumbers = numbers.split(/[\\n,]+/).map(n => n.trim()).filter(Boolean);
    const formattedNumbers = rawNumbers.map(n => {
      let num = n.replace(/[^0-9+]/g, '');
      if (num.startsWith('+')) num = num.substring(1);
      if (num.startsWith('00')) num = num.substring(2);
      if (num.startsWith('07') && num.length === 10) num = '962' + num.substring(1); // Auto Jordanian prefix
      return num;
    }).filter(n => n.length > 5);

    const uniqueNumbers = [...new Set(formattedNumbers)];

    if (uniqueNumbers.length === 0) {
      setStatusMsg({ type: 'error', text: isEn ? 'No valid numbers found' : 'لم يتم العثور على أرقام صحيحة' });
      return;
    }

    setBatchState('sending');
    setBatchResults(uniqueNumbers.map(n => ({ chatId: \`\${n}@c.us\`, status: 'pending' })));

    try {
      const payloadMessages = uniqueNumbers.map(n => ({ 
        chatId: \`\${n}@c.us\`, 
        type: 'text' as const, 
        content: { text: message } 
      }));

      const res = await messageApi.sendBulk(selectedSession, {
        messages: payloadMessages,
        options: {
          delayBetweenMessages: delay * 1000,
          randomizeDelay: randomize,
          stopOnError: false
        }
      });
      
      setActiveBatchId(res.batchId);
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to start batch' });
      setBatchState('error');
    }
  };

  const stats = {
    total: batchResults.length,
    sent: batchResults.filter(r => r.status === 'sent').length,
    failed: batchResults.filter(r => r.status === 'failed').length,
    pending: batchResults.filter(r => r.status === 'pending').length,
  };
  
  const progressPercent = stats.total > 0 ? Math.round(((stats.sent + stats.failed) / stats.total) * 100) : 0;
  const isWorking = batchState === 'sending';

  return (
    <div className="page-container bulk-sender-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEn ? 'Bulk Sender' : 'الإرسال الجماعي'}</h1>
          <p className="page-subtitle">{isEn ? 'Send messages to multiple contacts with delays to avoid bans' : 'أداة الإرسال المتقدمة مع فلاتر تلقائية وتأخير زمني لتجنب الحظر'}</p>
        </div>
      </header>

      {statusMsg.text && (
        <div className={\`global-alert \${statusMsg.type}\`}>
          {statusMsg.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="bulk-dashboard-grid">
        {/* LEFT COLUMN: Setup Form */}
        <div className="bulk-panel form-panel">
          <div className="panel-header">
            <h2 className="panel-title">{isEn ? 'Campaign Setup' : 'إعداد الحملة'}</h2>
          </div>

          <div className="form-group">
            <label><Send size={16}/> {isEn ? 'Select Session' : 'اختر الجلسة (الرقم المرسل)'}</label>
            <select 
              value={selectedSession} 
              onChange={e => setSelectedSession(e.target.value)}
              className="input-field"
              disabled={isWorking}
            >
              <option value="" disabled>{isEn ? 'Select Session' : 'اختر الجلسة'}</option>
              {sessions.filter(s => s.status === 'ready').map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label><Users size={16}/> {isEn ? 'Target Numbers' : 'أرقام المستلمين'}</label>
              <button className="btn-upload" onClick={() => fileInputRef.current?.click()} disabled={isWorking}>
                <Upload size={14} /> {isEn ? 'Upload Txt/Csv' : 'رفع ملف أرقام'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.csv" 
                style={{display: 'none'}} 
              />
            </div>
            <p className="input-hint">{isEn ? 'Accepts 07... or +962..., duplicates are removed automatically.' : 'يقبل صيغة 07... أو 962... سيتم إزالة الأرقام المكررة تلقائياً.'}</p>
            <textarea 
              value={numbers}
              onChange={e => setNumbers(e.target.value)}
              className="input-field numbers-area"
              placeholder="0791036401\\n+962781595697"
              dir="ltr"
              disabled={isWorking}
            />
          </div>

          <div className="form-group">
            <label><FileText size={16}/> {isEn ? 'Message Content' : 'نص الرسالة'}</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input-field message-area"
              placeholder={isEn ? "Write your message..." : "اكتب رسالتك هنا..."}
              disabled={isWorking}
            />
          </div>

          <div className="settings-box">
            <div className="setting-item">
              <label><Clock size={16}/> {isEn ? 'Delay (sec)' : 'تأخير زمني (بالثواني)'}</label>
              <input 
                type="number" 
                min="1" 
                value={delay} 
                onChange={e => setDelay(Number(e.target.value))}
                className="input-field small-input"
                disabled={isWorking}
              />
            </div>
            <div className="setting-item checkbox-center">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={randomize} 
                  onChange={e => setRandomize(e.target.checked)}
                  disabled={isWorking}
                />
                {isEn ? 'Randomize (+/- 50%)' : 'تأخير عشوائي'}
              </label>
            </div>
          </div>

          <button 
            className={\`btn btn-primary send-btn \${isWorking ? 'working' : ''}\`}
            onClick={handleSend}
            disabled={isWorking || !selectedSession || !numbers || !message}
          >
            {isWorking ? <Activity size={20} className="pulse" /> : <Play size={20} />}
            {isWorking ? (isEn ? 'Sending Campaign...' : 'جاري إرسال الحملة...') : (isEn ? 'Start Sending' : 'إطلاق الحملة الجماعية')}
          </button>
        </div>

        {/* RIGHT COLUMN: Live Log & Stats */}
        <div className="bulk-panel log-panel">
          <div className="panel-header">
            <h2 className="panel-title">{isEn ? 'Live Monitor' : 'المراقبة المباشرة والسجل'}</h2>
          </div>

          <div className="stats-row">
            <div className="stat-box total">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">{isEn ? 'Total' : 'الإجمالي'}</span>
            </div>
            <div className="stat-box sent">
              <span className="stat-value">{stats.sent}</span>
              <span className="stat-label">{isEn ? 'Sent' : 'تم الإرسال'}</span>
            </div>
            <div className="stat-box failed">
              <span className="stat-value">{stats.failed}</span>
              <span className="stat-label">{isEn ? 'Failed' : 'فشل'}</span>
            </div>
            <div className="stat-box pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">{isEn ? 'Waiting' : 'في الانتظار'}</span>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-text">
                {isWorking 
                  ? (isEn ? \`Processing... (\${stats.sent + stats.failed}/\${stats.total})\` : \`جاري العمل... (\${stats.sent + stats.failed} من \${stats.total})\`)
                  : (batchState === 'completed' 
                      ? (isEn ? 'Completed!' : 'اكتملت الحملة!') 
                      : (isEn ? 'Waiting to start' : 'في انتظار البدء')
                    )
                }
              </span>
              <span className="progress-percent">{progressPercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: \`\${progressPercent}%\` }}></div>
            </div>
          </div>

          <div className="log-container">
            {batchResults.length === 0 ? (
              <div className="log-empty">
                <Activity size={32} opacity={0.3} />
                <p>{isEn ? 'Logs will appear here...' : 'سيظهر سجل الإرسال وتفاصيل الأرقام هنا...'}</p>
              </div>
            ) : (
              batchResults.map((r, i) => (
                <div key={i} className={\`log-item \${r.status}\`}>
                  <div className="log-left">
                    <div className="log-index">{i + 1}</div>
                    <div className="log-number">{r.chatId.replace('@c.us', '')}</div>
                  </div>
                  <div className="log-right">
                    {r.status === 'sent' && <span className="badge sent"><CheckCircle2 size={14}/> {isEn ? 'Sent' : 'تم'}</span>}
                    {r.status === 'failed' && <span className="badge failed"><XCircle size={14}/> {isEn ? 'Failed' : 'خطأ'}</span>}
                    {r.status === 'pending' && <span className="badge pending"><Clock size={14}/> {isEn ? 'Wait' : 'انتظار'}</span>}
                  </div>
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
.bulk-sender-page {
  max-width: 1200px;
  margin: 0 auto;
}

.global-alert {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.global-alert.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.global-alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.bulk-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 900px) {
  .bulk-dashboard-grid { grid-template-columns: 1fr; }
}

.bulk-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.panel-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.8rem;
  margin-bottom: 0.5rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-upload {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
}
.btn-upload:hover { background: #e2e8f0; color: #0f172a; }

.input-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin: -0.3rem 0 0.3rem 0;
}

.settings-box {
  display: flex;
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.setting-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-center {
  justify-content: center;
  align-items: center;
}

.small-input {
  max-width: 100px;
  text-align: center;
}

.send-btn {
  margin-top: 0.5rem;
  padding: 1.2rem;
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn.working {
  background: #1e293b;
  box-shadow: 0 0 0 4px rgba(30, 41, 59, 0.2);
  animation: pulse-border 2s infinite;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.stat-box.total .stat-value { color: #3b82f6; }
.stat-box.sent { background: #f0fdf4; border-color: #bbf7d0; }
.stat-box.sent .stat-value { color: #16a34a; }
.stat-box.failed { background: #fef2f2; border-color: #fecaca; }
.stat-box.failed .stat-value { color: #dc2626; }
.stat-box.pending .stat-value { color: #f97316; }

/* Progress */
.progress-container {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.progress-bar-bg {
  height: 10px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 10px;
  transition: width 0.5s ease;
}

/* Log */
.log-container {
  flex: 1;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.log-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.log-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.log-index {
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  min-width: 28px;
  text-align: center;
}

.log-number {
  font-weight: 700;
  font-family: monospace;
  color: #0f172a;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
}

.badge.sent { background: #dcfce7; color: #166534; }
.badge.failed { background: #fee2e2; color: #991b1b; }
.badge.pending { background: #ffedd5; color: #c2410c; }

.pulse {
  animation: pulse-icon 1.5s infinite;
}
@keyframes pulse-icon {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(30, 41, 59, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(30, 41, 59, 0); }
  100% { box-shadow: 0 0 0 0 rgba(30, 41, 59, 0); }
}
`;

fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/pages/BulkSender.css', css, 'utf8');
