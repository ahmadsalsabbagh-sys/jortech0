const fs = require('fs');

const tsx = `import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2, XCircle, FileText, Upload, Activity, Rocket, MessageSquare, Settings, Monitor, Phone } from 'lucide-react';
import { sessionApi, messageApi, type Session } from '../services/api';
import * as XLSX from 'xlsx';
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
  const [batchResults, setBatchResults] = useState<{ chatId: string; status: string; error?: any }[]>([]);
  
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
        
        const allDone = res.results?.length > 0 && res.results.every((r: any) => r.status !== 'pending');
        
        if (res.status === 'completed' || res.status === 'failed' || res.status === 'cancelled' || allDone) {
          clearInterval(interval);
          setBatchState('completed');
          setStatusMsg({ 
            type: 'success', 
            text: isEn ? 'Campaign finished successfully' : 'اكتملت حملة الإرسال الجماعي بنجاح' 
          });
        }
      } catch (err) {
        console.error('Failed to poll batch', err);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [activeBatchId, selectedSession, batchState]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let extractedNumbers: string[] = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        json.forEach((row: any[]) => {
          row.forEach(cell => {
            if (cell !== undefined && cell !== null) {
              const str = String(cell).trim();
              if (/[0-9]{8,}/.test(str)) extractedNumbers.push(str);
            }
          });
        });
      } else if (ext === 'vcf') {
        const text = await file.text();
        const matches = text.match(/TEL[^:]*:([^\\n\\r]+)/gi);
        if (matches) {
          matches.forEach(m => {
            const num = m.split(':')[1];
            if (num) extractedNumbers.push(num.trim());
          });
        }
      } else {
        const text = await file.text();
        extractedNumbers = text.split(/[\\n,]+/).map(n => n.trim()).filter(Boolean);
      }

      if (extractedNumbers.length > 0) {
        setNumbers(prev => prev ? prev + '\\n' + extractedNumbers.join('\\n') : extractedNumbers.join('\\n'));
        setStatusMsg({ type: 'success', text: isEn ? \`Imported \${extractedNumbers.length} numbers\` : \`تم استيراد \${extractedNumbers.length} رقم بنجاح\` });
      } else {
        setStatusMsg({ type: 'error', text: isEn ? 'No valid numbers found in the file' : 'لم يتم العثور على أرقام صحيحة في الملف' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: isEn ? 'Failed to read file' : 'فشل في قراءة الملف' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    setStatusMsg({ type: '', text: '' });
    
    if (!selectedSession || !numbers.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: isEn ? 'Session, Numbers, and Message are required' : 'الجلسة، الأرقام، ونص الرسالة مطلوبين' });
      return;
    }

    const rawNumbers = numbers.split(/[\\n,]+/).map(n => n.trim()).filter(Boolean);
    const formattedNumbers = rawNumbers.map(n => {
      let num = n.replace(/[^0-9+]/g, '');
      if (num.startsWith('+')) num = num.substring(1);
      if (num.startsWith('00')) num = num.substring(2);
      if (num.startsWith('07') && num.length === 10) num = '962' + num.substring(1);
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
        <div className="bulk-panel form-panel">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Rocket size={20} className="text-blue-600" /> 
              {isEn ? 'Campaign Setup' : 'تجهيز الحملة'}
            </h2>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2"><Phone size={16}/> {isEn ? 'Select WhatsApp Number' : 'رقم الواتساب المرسل (الجلسة)'}</label>
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
              <label className="flex items-center gap-2"><Users size={16}/> {isEn ? 'Target Numbers' : 'أرقام المستلمين'}</label>
              <button className="btn-upload" onClick={() => fileInputRef.current?.click()} disabled={isWorking}>
                <Upload size={14} /> {isEn ? 'Upload Excel/VCF/TXT' : 'إدراج ملف (Excel, VCF, TXT)'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.csv,.xlsx,.xls,.vcf" 
                style={{display: 'none'}} 
              />
            </div>
            <p className="input-hint">{isEn ? 'Accepts 07... or +962..., duplicates are removed automatically.' : 'يقبل صيغة 07... أو 962... الأرقام المكررة تُحذف تلقائياً.'}</p>
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
            <label className="flex items-center gap-2"><MessageSquare size={16}/> {isEn ? 'Message Content' : 'محتوى الرسالة'}</label>
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
              <label className="flex items-center gap-2"><Settings size={16}/> {isEn ? 'Delay (sec)' : 'تأخير الإرسال (بالثواني)'}</label>
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
                {isEn ? 'Randomize (+/- 50%)' : 'تأخير عشوائي (آمن)'}
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

        <div className="bulk-panel log-panel">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Monitor size={20} className="text-blue-600" /> 
              {isEn ? 'Live Monitor & Logs' : 'شاشة المراقبة المباشرة'}
            </h2>
          </div>

          <div className="stats-row">
            <div className="stat-box total">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">{isEn ? 'Total' : 'المجموع'}</span>
            </div>
            <div className="stat-box sent">
              <span className="stat-value">{stats.sent}</span>
              <span className="stat-label">{isEn ? 'Sent' : 'تم بنجاح'}</span>
            </div>
            <div className="stat-box failed">
              <span className="stat-value">{stats.failed}</span>
              <span className="stat-label">{isEn ? 'Failed' : 'خطأ/فشل'}</span>
            </div>
            <div className="stat-box pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">{isEn ? 'Waiting' : 'انتظار'}</span>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-text">
                {isWorking 
                  ? (isEn ? \`Processing... (\${stats.sent + stats.failed}/\${stats.total})\` : \`جاري العمل... (\${stats.sent + stats.failed} من \${stats.total})\`)
                  : (batchState === 'completed' 
                      ? (isEn ? 'Completed!' : 'اكتملت الحملة!') 
                      : (isEn ? 'Waiting to start' : 'في انتظار إطلاق الحملة')
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
                <p>{isEn ? 'Logs will appear here...' : 'التقارير الحية ستظهر هنا أثناء الإرسال...'}</p>
              </div>
            ) : (
              batchResults.map((r, i) => (
                <div key={i} className={\`log-item \${r.status}\`}>
                  <div className="log-left">
                    <div className="log-index">{i + 1}</div>
                    <div className="log-number">{r.chatId.replace('@c.us', '')}</div>
                  </div>
                  <div className="log-right">
                    {r.status === 'sent' && <span className="badge sent"><CheckCircle2 size={14}/> {isEn ? 'Sent' : 'تم الإرسال'}</span>}
                    {r.status === 'failed' && (
                      <div className="failed-container" title={r.error?.message || r.error?.code}>
                        <span className="badge failed"><XCircle size={14}/> {isEn ? 'Failed' : 'فشل'}</span>
                        <span className="error-reason">{r.error?.message || (isEn ? 'Invalid Number/Not on WA' : 'رقم خاطئ أو غير مسجل بالواتساب')}</span>
                      </div>
                    )}
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

const cssAdd = `
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.text-blue-600 { color: #2563eb; }

.failed-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.error-reason {
  font-size: 0.7rem;
  color: #ef4444;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ltr;
  text-align: right;
}
`;

fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', tsx, 'utf8');
fs.appendFileSync('dashboard/src/pages/BulkSender.css', cssAdd, 'utf8');
