const fs = require('fs');

const tsx = `import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2, XCircle, FileText, Upload, Activity, Rocket, MessageSquare, Settings, Monitor, Phone, HelpCircle, X, Plus } from 'lucide-react';
import { sessionApi, messageApi, type Session } from '../services/api';
import * as XLSX from 'xlsx';
import './BulkSender.css';

interface ParsedContact {
  rawLine: string;
  number: string;
  name?: string;
  formattedNumber: string;
}

export function BulkSender() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en' || i18n.resolvedLanguage === 'en';
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  
  // Modals state
  const [isNumbersModalOpen, setIsNumbersModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Form State
  const [numbersText, setNumbersText] = useState('');
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(5);
  const [randomize, setRandomize] = useState(true);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  
  const [batchState, setBatchState] = useState<'idle' | 'sending' | 'completed' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  
  const [activeBatchId, setActiveBatchId] = useState('');
  const [batchResults, setBatchResults] = useState<{ chatId: string; status: string; error?: any; targetName?: string }[]>([]);
  
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
        
        // Merge results with our internal names if needed, but since we rely on the backend, 
        // we map the results back to the original array to keep the names in the UI.
        setBatchResults(prev => {
          if (!res.results) return prev;
          return prev.map(p => {
            const apiRes = res.results.find((ar: any) => ar.chatId === p.chatId);
            if (apiRes) return { ...p, status: apiRes.status, error: apiRes.error };
            return p;
          });
        });
        
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
      let extractedLines: string[] = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        json.forEach((row: any[]) => {
          const rowStr = row.map(c => String(c || '').trim()).filter(Boolean).join(' , ');
          if (rowStr.match(/[0-9]{8,}/)) {
            extractedLines.push(rowStr);
          }
        });
      } else if (ext === 'vcf') {
        const text = await file.text();
        const lines = text.split(/[\\r\\n]+/);
        let currentName = '';
        lines.forEach(line => {
          if (line.startsWith('FN:')) currentName = line.substring(3).trim();
          if (line.startsWith('TEL')) {
            const num = line.split(':')[1]?.trim();
            if (num) extractedLines.push(\`\${num} , \${currentName}\`);
          }
        });
      } else {
        const text = await file.text();
        extractedLines = text.split(/[\\n]+/).map(n => n.trim()).filter(Boolean);
      }

      if (extractedLines.length > 0) {
        setNumbersText(prev => prev ? prev + '\\n' + extractedLines.join('\\n') : extractedLines.join('\\n'));
        setStatusMsg({ type: 'success', text: isEn ? \`Imported \${extractedLines.length} contacts\` : \`تم استيراد \${extractedLines.length} جهة اتصال بنجاح\` });
      } else {
        setStatusMsg({ type: 'error', text: isEn ? 'No valid contacts found' : 'لم يتم العثور على أرقام صحيحة' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: isEn ? 'Failed to read file' : 'فشل في قراءة الملف' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to parse the numbers input text
  const parseContacts = (): ParsedContact[] => {
    const lines = numbersText.split(/[\\n]+/).map(n => n.trim()).filter(Boolean);
    const parsed = lines.map(line => {
      // Find the first sequence of numbers > 6 digits
      const numMatch = line.match(/(?:^|\\s|,|\\+)([0-9]{6,15})(?:\\s|,|$)/);
      const pureNumbersMatch = line.match(/[0-9+]+/g);
      
      let rawNum = numMatch ? numMatch[1] : (pureNumbersMatch ? pureNumbersMatch.join('') : '');
      let name = line.replace(rawNum, '').replace(/[,+\\-]/g, ' ').trim();
      
      let num = rawNum.replace(/[^0-9]/g, '');
      if (rawNum.startsWith('+')) num = num; // wait, stripped above
      num = rawNum.replace(/[^0-9+]/g, '');
      if (num.startsWith('+')) num = num.substring(1);
      if (num.startsWith('00')) num = num.substring(2);
      if (num.startsWith('07') && num.length === 10) num = '962' + num.substring(1);

      return { rawLine: line, number: num, name, formattedNumber: num };
    });

    return parsed.filter(p => p.formattedNumber.length > 5);
  };

  const handleSend = async () => {
    setStatusMsg({ type: '', text: '' });
    
    if (!selectedSession || !numbersText.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: isEn ? 'Session, Numbers, and Message are required' : 'الجلسة، الأرقام، ونص الرسالة مطلوبين' });
      return;
    }

    let contacts = parseContacts();

    if (!allowDuplicates) {
      const seen = new Set();
      contacts = contacts.filter(c => {
        if (seen.has(c.formattedNumber)) return false;
        seen.add(c.formattedNumber);
        return true;
      });
    }

    if (contacts.length === 0) {
      setStatusMsg({ type: 'error', text: isEn ? 'No valid numbers found' : 'لم يتم العثور على أرقام صحيحة' });
      return;
    }

    setBatchState('sending');
    
    // Set UI initial state
    setBatchResults(contacts.map(c => ({ 
      chatId: \`\${c.formattedNumber}@c.us\`, 
      status: 'pending',
      targetName: c.name || c.formattedNumber 
    })));

    try {
      const payloadMessages = contacts.map(c => ({ 
        chatId: \`\${c.formattedNumber}@c.us\`, 
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

  const parsedCount = parseContacts().length;
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
          <p className="page-subtitle">{isEn ? 'Send messages with custom delays to avoid bans' : 'أداة الإرسال المتقدمة مع واجهة مريحة ومميزات احترافية'}</p>
        </div>
      </header>

      {statusMsg.text && (
        <div className={\`global-alert \${statusMsg.type}\`}>
          {statusMsg.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="bulk-dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="bulk-panel setup-panel">
          
          <div className="setup-step">
            <div className="step-label">
              <Phone size={18} className="text-blue-600"/> 
              {isEn ? '1. Select Session' : '1. رقم الواتساب المرسل'}
            </div>
            <select 
              value={selectedSession} 
              onChange={e => setSelectedSession(e.target.value)}
              className="input-field"
              disabled={isWorking}
            >
              <option value="" disabled>{isEn ? 'Select Session' : 'اختر الجلسة (الرقم)'}</option>
              {sessions.filter(s => s.status === 'ready').map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <Users size={18} className="text-blue-600"/> 
              {isEn ? '2. Target Numbers & Names' : '2. المستلمين (أرقام وأسماء)'}
              <div className="tooltip-icon" title={isEn ? "Click the plus button to add numbers manually or upload Excel/VCF files" : "اضغط على الزر الدائري لفتح نافذة إضافة الأرقام أو رفع ملفات جاهزة (إكسل، VCF)"}>
                <HelpCircle size={14} />
              </div>
            </div>
            
            <div className="action-row">
              <button className="circle-btn" onClick={() => setIsNumbersModalOpen(true)} disabled={isWorking}>
                <Plus size={24} />
              </button>
              <div className="action-info">
                <strong>{parsedCount}</strong> {isEn ? 'Contacts added' : 'جهات اتصال جاهزة'}
                {parsedCount > 0 && <span className="view-edit-link" onClick={() => setIsNumbersModalOpen(true)}>{isEn ? '(Edit)' : '(تعديل)'}</span>}
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <MessageSquare size={18} className="text-blue-600"/> 
              {isEn ? '3. Message Content' : '3. نص الرسالة'}
              <div className="tooltip-icon" title={isEn ? "Click the button to compose your message" : "اضغط لكتابة محتوى الرسالة التي تريد إرسالها للجميع"}>
                <HelpCircle size={14} />
              </div>
            </div>
            
            <div className="action-row">
              <button className="circle-btn" onClick={() => setIsMessageModalOpen(true)} disabled={isWorking}>
                <FileText size={20} />
              </button>
              <div className="action-info message-preview">
                {message ? (message.length > 30 ? message.substring(0, 30) + '...' : message) : (isEn ? 'No message written' : 'لم يتم كتابة رسالة بعد')}
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <Settings size={18} className="text-blue-600"/> 
              {isEn ? '4. Campaign Settings' : '4. إعدادات الحملة'}
            </div>
            <div className="settings-box">
              <div className="setting-item">
                <label className="flex items-center gap-1">
                  <Clock size={14}/> {isEn ? 'Delay (s)' : 'التأخير (ثواني)'}
                  <div className="tooltip-icon" title={isEn ? "Seconds to wait between messages" : "الوقت بالثواني الذي سينتظره النظام بين كل رسالة وأخرى لتجنب حظر الواتساب"}><HelpCircle size={12}/></div>
                </label>
                <input 
                  type="number" min="1" value={delay} onChange={e => setDelay(Number(e.target.value))}
                  className="input-field small-input" disabled={isWorking}
                />
              </div>
              <div className="setting-item">
                <label className="checkbox-label" title={isEn ? "Adds a random offset to delay" : "يجعل التأخير الزمني غير ثابت ليبدو كأنه إرسال بشري طبيعي"}>
                  <input type="checkbox" checked={randomize} onChange={e => setRandomize(e.target.checked)} disabled={isWorking} />
                  {isEn ? 'Randomize (+/- 50%)' : 'تأخير عشوائي'}
                </label>
                <label className="checkbox-label" title={isEn ? "Allow sending to the same number multiple times" : "تفعيل هذا الخيار يسمح بإرسال الرسالة لنفس الرقم أكثر من مرة إذا كان مكرراً في القائمة"}>
                  <input type="checkbox" checked={allowDuplicates} onChange={e => setAllowDuplicates(e.target.checked)} disabled={isWorking} />
                  {isEn ? 'Allow duplicates' : 'إرسال للمكرر'}
                </label>
              </div>
            </div>
          </div>

          <button 
            className={\`btn btn-primary send-btn \${isWorking ? 'working' : ''}\`}
            onClick={handleSend}
            disabled={isWorking || !selectedSession || parsedCount === 0 || !message}
          >
            {isWorking ? <Activity size={24} className="pulse" /> : <Rocket size={24} />}
            {isWorking ? (isEn ? 'Sending Campaign...' : 'جاري العمل...') : (isEn ? 'Launch Campaign' : 'إطلاق الحملة')}
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bulk-panel log-panel">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Monitor size={20} className="text-blue-600" /> 
              {isEn ? 'Live Monitor' : 'شاشة المراقبة'}
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
              <span className="stat-label">{isEn ? 'Failed' : 'فشل'}</span>
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
                      : (isEn ? 'Ready' : 'جاهز للإرسال')
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
                <Monitor size={32} opacity={0.3} />
                <p>{isEn ? 'Logs will appear here...' : 'التقارير الحية ستظهر هنا أثناء الإرسال...'}</p>
              </div>
            ) : (
              batchResults.map((r, i) => (
                <div key={i} className={\`log-item \${r.status}\`}>
                  <div className="log-left">
                    <div className="log-index">{i + 1}</div>
                    <div className="log-details">
                      <div className="log-name">{r.targetName}</div>
                    </div>
                  </div>
                  <div className="log-right">
                    {r.status === 'sent' && <span className="badge sent"><CheckCircle2 size={14}/> {isEn ? 'Sent' : 'تم الإرسال'}</span>}
                    {r.status === 'failed' && (
                      <div className="failed-container" title={r.error?.message || r.error?.code}>
                        <span className="badge failed"><XCircle size={14}/> {isEn ? 'Failed' : 'فشل'}</span>
                        <span className="error-reason">{r.error?.message || (isEn ? 'Invalid Number' : 'رقم خاطئ أو غير مسجل بالواتس')}</span>
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

      {/* MODALS */}
      {isNumbersModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNumbersModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2"><Users size={20}/> {isEn ? 'Target Numbers' : 'إضافة جهات الاتصال'}</h3>
              <button className="modal-close" onClick={() => setIsNumbersModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="flex-between" style={{marginBottom: '0.8rem'}}>
                <span className="input-hint">{isEn ? 'Format: Number , Name (e.g. 0791234567, Ahmad)' : 'الصيغة: الرقم , الاسم (مثال: 0791234567, أحمد)'}</span>
                <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> {isEn ? 'Upload Excel/VCF' : 'رفع إكسل / VCF'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv,.xlsx,.xls,.vcf" style={{display: 'none'}} />
              </div>
              <textarea 
                value={numbersText}
                onChange={e => setNumbersText(e.target.value)}
                className="input-field numbers-area"
                placeholder="0791036401 , Ahmad\\n+962781595697 , Omar"
                dir="auto"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsNumbersModalOpen(false)}>{isEn ? 'Done' : 'حفظ وإغلاق'}</button>
            </div>
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMessageModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2"><MessageSquare size={20}/> {isEn ? 'Message Content' : 'كتابة الرسالة'}</h3>
              <button className="modal-close" onClick={() => setIsMessageModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="input-field message-area"
                placeholder={isEn ? "Write your message..." : "اكتب رسالتك هنا..."}
                style={{height: '250px'}}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsMessageModalOpen(false)}>{isEn ? 'Done' : 'حفظ وإغلاق'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
`;

const css = `
.bulk-sender-page { max-width: 1200px; margin: 0 auto; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.text-blue-600 { color: #2563eb; }

.global-alert { padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 1.5rem; }
.global-alert.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.global-alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.bulk-dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .bulk-dashboard-grid { grid-template-columns: 1fr; } }

.bulk-panel { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panel-header { border-bottom: 1px solid #f1f5f9; padding-bottom: 0.8rem; margin-bottom: 0.5rem; }
.panel-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; }

.setup-step { display: flex; flex-direction: column; gap: 0.8rem; }
.step-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #334155; font-size: 1.05rem; }

.tooltip-icon { color: #94a3b8; cursor: help; display: inline-flex; align-items: center; transition: color 0.2s; }
.tooltip-icon:hover { color: #3b82f6; }

.action-row { display: flex; align-items: center; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px dashed #cbd5e1; }
.circle-btn { width: 50px; height: 50px; border-radius: 50%; background: #3b82f6; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); transition: all 0.2s; flex-shrink: 0; }
.circle-btn:hover { transform: scale(1.05); background: #2563eb; }
.circle-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-info { display: flex; flex-direction: column; color: #475569; font-size: 0.95rem; }
.view-edit-link { color: #3b82f6; cursor: pointer; font-size: 0.8rem; text-decoration: underline; margin-top: 0.2rem; }
.message-preview { color: #64748b; font-style: italic; }

.flex-between { display: flex; justify-content: space-between; align-items: center; }
.btn-upload { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; transition: all 0.2s; }
.btn-upload:hover { background: #e2e8f0; color: #0f172a; }

.input-hint { font-size: 0.85rem; color: #64748b; }
.numbers-area { min-height: 200px; resize: vertical; }
.message-area { min-height: 150px; resize: vertical; }

.settings-box { display: flex; gap: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; align-items: center;}
.setting-item { display: flex; flex-direction: column; gap: 0.5rem; }
.small-input { max-width: 100px; text-align: center; }

.send-btn { margin-top: 0.5rem; padding: 1.2rem; font-size: 1.2rem; font-weight: 700; border-radius: 12px; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.send-btn.working { background: #1e293b; box-shadow: 0 0 0 4px rgba(30, 41, 59, 0.2); animation: pulse-border 2s infinite; }

/* Modals */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { background: white; width: 100%; max-width: 600px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; animation: modal-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.modal-close { background: none; border: none; color: #64748b; cursor: pointer; padding: 0.3rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.modal-close:hover { background: #f1f5f9; color: #0f172a; }
.modal-body { padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; }
.modal-footer { padding: 1.2rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; }
@keyframes modal-slide-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* Stats Row */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
.stat-box { display: flex; flex-direction: column; align-items: center; padding: 1rem 0.5rem; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; }
.stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; margin-bottom: 0.3rem; }
.stat-label { font-size: 0.8rem; font-weight: 600; color: #64748b; }
.stat-box.total .stat-value { color: #3b82f6; }
.stat-box.sent { background: #f0fdf4; border-color: #bbf7d0; }
.stat-box.sent .stat-value { color: #16a34a; }
.stat-box.failed { background: #fef2f2; border-color: #fecaca; }
.stat-box.failed .stat-value { color: #dc2626; }
.stat-box.pending .stat-value { color: #f97316; }

/* Progress */
.progress-container { background: #f8fafc; padding: 1rem; border-radius: 10px; border: 1px solid #e2e8f0; }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #334155; }
.progress-bar-bg { height: 10px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 10px; transition: width 0.5s ease; }

/* Log */
.log-container { flex: 1; min-height: 300px; max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
.log-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 0.5rem; }
.log-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: white; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
.log-left { display: flex; align-items: center; gap: 0.8rem; }
.log-index { background: #f1f5f9; color: #64748b; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; min-width: 28px; text-align: center; }
.log-name { font-weight: 700; color: #0f172a; direction: ltr;}
.badge { display: flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem; }
.badge.sent { background: #dcfce7; color: #166534; }
.badge.failed { background: #fee2e2; color: #991b1b; }
.badge.pending { background: #ffedd5; color: #c2410c; }
.failed-container { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }
.error-reason { font-size: 0.7rem; color: #ef4444; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: ltr; text-align: right; }
.pulse { animation: pulse-icon 1.5s infinite; }
@keyframes pulse-icon { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }
@keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(30, 41, 59, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(30, 41, 59, 0); } 100% { box-shadow: 0 0 0 0 rgba(30, 41, 59, 0); } }
`;

fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/pages/BulkSender.css', css, 'utf8');
