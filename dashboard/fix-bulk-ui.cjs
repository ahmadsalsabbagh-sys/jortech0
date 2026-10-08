const fs = require('fs');

const tsx = `import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  
  // Batch processing state
  const [activeBatchId, setActiveBatchId] = useState('');
  const [batchResults, setBatchResults] = useState<{ chatId: string; status: string }[]>([]);

  useEffect(() => {
    sessionApi.list().then(data => setSessions(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  // Poll batch status
  useEffect(() => {
    if (!activeBatchId || !selectedSession) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await messageApi.getBatchStatus(selectedSession, activeBatchId);
        setBatchResults(res.results || []);
        
        if (res.status === 'completed' || res.status === 'failed' || res.status === 'cancelled') {
          clearInterval(interval);
          setIsLoading(false);
          setStatus({ type: res.status === 'completed' ? 'success' : 'error', text: isEn ? \`Batch \${res.status}\` : \`اكتمل الإرسال الجماعي (\${res.status})\` });
        }
      } catch (err) {
        console.error('Failed to poll batch', err);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [activeBatchId, selectedSession]);

  const handleSend = async () => {
    setStatus({ type: '', text: '' });
    setActiveBatchId('');
    setBatchResults([]);
    
    if (!selectedSession || !numbers.trim() || !message.trim()) {
      setStatus({ type: 'error', text: isEn ? 'Session, Numbers, and Message are required' : 'الجلسة، الأرقام، ونص الرسالة مطلوبين' });
      return;
    }

    const numberList = numbers.split('\\n')
      .map(n => n.trim().replace(/[^0-9]/g, ''))
      .filter(n => n.length > 5)
      .map(n => n + '@c.us');

    if (numberList.length === 0) {
      setStatus({ type: 'error', text: isEn ? 'No valid numbers found' : 'لم يتم العثور على أرقام صحيحة' });
      return;
    }

    setIsLoading(true);

    try {
      const messages = numberList.map(chatId => ({ chatId, type: 'text' as const, content: { text: message } }));
      
      // Initialize results visually as pending
      setBatchResults(numberList.map(chatId => ({ chatId, status: 'pending' })));

      const res = await messageApi.sendBulk(selectedSession, {
        messages,
        options: {
          delayBetweenMessages: delay * 1000,
          randomizeDelay: randomize,
          stopOnError: false
        }
      });
      
      setActiveBatchId(res.batchId);
      setStatus({ type: 'success', text: isEn ? \`Batch \${res.batchId} started...\` : 'بدأت عملية الإرسال الجماعي...' });
      
    } catch (err: any) {
      setStatus({ type: 'error', text: err?.message || 'Failed to start batch' });
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container bulk-sender-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEn ? 'Bulk Sender' : 'الإرسال الجماعي'}</h1>
          <p className="page-subtitle">{isEn ? 'Send messages to multiple contacts with delays to avoid bans' : 'إرسال رسائل لعدة جهات اتصال مع مسافات زمنية لتجنب الحظر'}</p>
        </div>
      </header>

      <div className="bulk-card">
        {status.text && (
          <div className={\`status-banner \${status.type}\`}>
            {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{status.text}</span>
          </div>
        )}

        <div className="form-group">
          <label><Send size={16}/> {isEn ? 'Select Session' : 'اختر الجلسة'}</label>
          <select 
            value={selectedSession} 
            onChange={e => setSelectedSession(e.target.value)}
            className="input-field"
            disabled={isLoading}
          >
            <option value="" disabled>{isEn ? 'Select Session' : 'اختر الجلسة'}</option>
            {sessions.filter(s => s.status === 'ready').map(s => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label><Users size={16}/> {isEn ? 'Target Numbers (one per line)' : 'أرقام المستلمين (رقم بكل سطر)'}</label>
            <textarea 
              value={numbers}
              onChange={e => setNumbers(e.target.value)}
              className="input-field numbers-area"
              placeholder="962791234567\n962799999999"
              dir="ltr"
              disabled={isLoading}
            />
          </div>

          <div className="form-group flex-1">
            <label><Send size={16}/> {isEn ? 'Message Content' : 'نص الرسالة'}</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input-field message-area"
              placeholder={isEn ? "Write your message..." : "اكتب رسالتك هنا..."}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-row settings-row">
          <div className="form-group">
            <label><Clock size={16}/> {isEn ? 'Delay (seconds)' : 'التأخير الزمني بين الرسائل (بالثواني)'}</label>
            <input 
              type="number" 
              min="1" 
              value={delay} 
              onChange={e => setDelay(Number(e.target.value))}
              className="input-field delay-input"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={randomize} 
                onChange={e => setRandomize(e.target.checked)}
                disabled={isLoading}
              />
              {isEn ? 'Randomize delay (adds +/- 50%)' : 'تأخير عشوائي (يضيف أو ينقص 50%)'}
            </label>
          </div>
        </div>

        <button 
          className="btn btn-primary send-btn" 
          onClick={handleSend}
          disabled={isLoading || !selectedSession || !numbers || !message}
        >
          {isLoading ? <Clock size={20} className="spin" /> : <Play size={20} />}
          {isLoading ? (isEn ? 'Sending...' : 'جاري الإرسال...') : (isEn ? 'Start Sending' : 'بدء الإرسال')}
        </button>

        {/* Results Log */}
        {batchResults.length > 0 && (
          <div className="batch-results-container">
            <h3 className="results-title">{isEn ? 'Live Sending Log' : 'سجل الإرسال المباشر'}</h3>
            <div className="results-list">
              {batchResults.map((r, i) => (
                <div key={i} className={\`result-item \${r.status}\`}>
                  <span className="result-number">{r.chatId.replace('@c.us', '')}</span>
                  <div className="result-status-icon">
                    {r.status === 'sent' && <><CheckCircle2 size={18} className="text-green-600" /> <span className="text-green-600">{isEn ? 'Sent' : 'تم الإرسال'}</span></>}
                    {r.status === 'failed' && <><XCircle size={18} className="text-red-600" /> <span className="text-red-600">{isEn ? 'Failed' : 'فشل'}</span></>}
                    {r.status === 'pending' && <><Clock size={18} className="text-orange-500" /> <span className="text-orange-500">{isEn ? 'Waiting' : 'في الانتظار'}</span></>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', tsx, 'utf8');

const cssAdd = `
.batch-results-container {
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.results-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1e293b;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 0.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.result-item.sent {
  border-left: 4px solid #16a34a;
}

.result-item.failed {
  border-left: 4px solid #dc2626;
}

.result-item.pending {
  border-left: 4px solid #f97316;
}

.result-number {
  font-weight: 600;
  font-family: monospace;
  font-size: 1.05rem;
  direction: ltr;
}

.result-status-icon {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.text-green-600 { color: #16a34a; }
.text-red-600 { color: #dc2626; }
.text-orange-500 { color: #f97316; }
`;
fs.appendFileSync('dashboard/src/pages/BulkSender.css', cssAdd, 'utf8');
