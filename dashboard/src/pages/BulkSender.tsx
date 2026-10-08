import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2, XCircle, FileText, Upload, Activity, Rocket, MessageSquare, Settings, Monitor, Phone, HelpCircle, X, Plus } from 'lucide-react';
import { sessionApi, messageApi, type Session } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import * as XLSX from 'xlsx';
import './BulkSender.css';

interface ParsedContact {
  id: string; // unique ID for frontend tracking (so duplicates don't conflict in React keys)
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
  
  // Track frontend loop if allowDuplicates is true
  const [batchResults, setBatchResults] = useState<{ id: string; chatId: string; status: string; error?: any; targetName?: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionApi.list().then(data => setSessions(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

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
        const lines = text.split(/[\r\n]+/);
        let currentName = '';
        lines.forEach(line => {
          if (line.startsWith('FN:')) currentName = line.substring(3).trim();
          if (line.startsWith('TEL')) {
            const num = line.split(':')[1]?.trim();
            if (num) extractedLines.push(`${num} , ${currentName}`);
          }
        });
      } else {
        const text = await file.text();
        extractedLines = text.split(/[\n]+/).map(n => n.trim()).filter(Boolean);
      }

      if (extractedLines.length > 0) {
        setNumbersText(prev => prev ? prev + '\n' + extractedLines.join('\n') : extractedLines.join('\n'));
        setStatusMsg({ type: 'success', text: isEn ? `Imported ${extractedLines.length} contacts` : `تم استيراد ${extractedLines.length} جهة اتصال بنجاح` });
      } else {
        setStatusMsg({ type: 'error', text: isEn ? 'No valid contacts found' : 'لم يتم العثور على أرقام صحيحة' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: isEn ? 'Failed to read file' : 'فشل في قراءة الملف' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseContacts = (): ParsedContact[] => {
    const lines = numbersText.split(/[\n]+/).map(n => n.trim()).filter(Boolean);
    const parsed = lines.map((line, i) => {
      const numMatch = line.match(/(?:^|\s|,|\+)([0-9]{6,15})(?:\s|,|$)/);
      const pureNumbersMatch = line.match(/[0-9+]+/g);
      
      let rawNum = numMatch ? numMatch[1] : (pureNumbersMatch ? pureNumbersMatch.join('') : '');
      let name = line.replace(rawNum, '').replace(/[,+\-]/g, ' ').trim();
      
      let num = rawNum.replace(/[^0-9+]/g, '');
      if (num.startsWith('+')) num = num.substring(1);
      if (num.startsWith('00')) num = num.substring(2);
      if (num.startsWith('07') && num.length === 10) num = '962' + num.substring(1);

      return { id: `c_${i}_${Date.now()}`, rawLine: line, number: num, name, formattedNumber: num };
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
    
    const initialResults = contacts.map(c => ({ 
      id: c.id,
      chatId: `${c.formattedNumber}@c.us`, 
      status: 'pending',
      targetName: c.name || c.formattedNumber 
    }));
    setBatchResults(initialResults);

    // If allow duplicates is true, we CANNOT use the backend sendBulk because it deduplicates.
    // Instead, we will simulate the batch entirely from the frontend.
    // Wait, the user said: "ضفت رقم 28 مره ما بعثله غير مره وحده".
    // If we loop through the contacts here in React, we bypass backend deduplication.
    
    const processBatchLocally = async () => {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const chatId = `${contact.formattedNumber}@c.us`;
        
        try {
          await messageApi.sendText(selectedSession, chatId, message);
          setBatchResults(prev => prev.map(r => r.id === contact.id ? { ...r, status: 'sent' } : r));
          successCount++;
        } catch (err: any) {
          setBatchResults(prev => prev.map(r => r.id === contact.id ? { ...r, status: 'failed', error: { message: err?.message || 'Error' } } : r));
          failCount++;
        }
        
        // Delay (unless it's the last message)
        if (i < contacts.length - 1) {
          let waitTime = delay * 1000;
          if (randomize) {
            const offset = waitTime * 0.5;
            waitTime = waitTime + (Math.random() * offset * (Math.random() > 0.5 ? 1 : -1));
          }
          await new Promise(res => setTimeout(res, waitTime));
        }
      }
      
      setBatchState('completed');
      setStatusMsg({ 
        type: 'success', 
        text: isEn ? 'Campaign finished successfully' : 'اكتملت الحملة التكرارية بنجاح' 
      });
    };

    processBatchLocally();
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
    <div className="page-container bulk-sender-page theme-v2">
      <PageHeader title={isEn ? 'Bulk Sender' : 'الإرسال الجماعي والتكرار'} subtitle={isEn ? 'Advanced sender with anti-ban and duplication bypass' : 'أداة الإرسال القوية للرسائل والمكررة بتصميم عصري'} />

      {statusMsg.text && (
        <div className={`global-alert ${statusMsg.type}`}>
          {statusMsg.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="bulk-dashboard-grid">
        <div className="bulk-panel setup-panel modern-glass">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Rocket size={20} className="primary-icon" /> 
              {isEn ? 'Campaign Setup' : 'تجهيز الحملة'}
            </h2>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <Phone size={18} className="primary-icon"/> 
              {isEn ? '1. Select Session' : '1. رقم الواتساب المرسل'}
            </div>
            <select 
              value={selectedSession} 
              onChange={e => setSelectedSession(e.target.value)}
              className="input-field modern-input"
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
              <Users size={18} className="primary-icon"/> 
              {isEn ? '2. Target Numbers' : '2. المستلمين (أرقام وأسماء)'}
              <div className="tooltip-icon" title={isEn ? "Click the plus button to add numbers manually or upload Excel/VCF files" : "اضغط على الزر الدائري لفتح نافذة إضافة الأرقام أو رفع ملفات جاهزة (إكسل، VCF)"}>
                <HelpCircle size={14} />
              </div>
            </div>
            
            <div className="action-row modern-action-row">
              <button className="circle-btn" onClick={() => setIsNumbersModalOpen(true)} disabled={isWorking}>
                <Plus size={24} />
              </button>
              <div className="action-info">
                <strong className="text-xl">{parsedCount}</strong> {isEn ? 'Contacts' : 'جهة اتصال'}
                {parsedCount > 0 && <span className="view-edit-link" onClick={() => setIsNumbersModalOpen(true)}>{isEn ? '(Edit)' : '(عرض وتعديل)'}</span>}
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <MessageSquare size={18} className="primary-icon"/> 
              {isEn ? '3. Message Content' : '3. نص الرسالة'}
              <div className="tooltip-icon" title={isEn ? "Click the button to compose your message" : "اضغط لكتابة محتوى الرسالة التي تريد إرسالها للجميع"}>
                <HelpCircle size={14} />
              </div>
            </div>
            
            <div className="action-row modern-action-row">
              <button className="circle-btn" onClick={() => setIsMessageModalOpen(true)} disabled={isWorking}>
                <FileText size={20} />
              </button>
              <div className="action-info message-preview">
                {message ? (message.length > 40 ? message.substring(0, 40) + '...' : message) : (isEn ? 'No message written' : 'لم يتم كتابة مسج بعد')}
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-label">
              <Settings size={18} className="primary-icon"/> 
              {isEn ? '4. Campaign Settings' : '4. إعدادات الحملة'}
            </div>
            <div className="settings-box modern-settings">
              <div className="setting-item">
                <label className="flex items-center gap-1">
                  <Clock size={14}/> {isEn ? 'Delay (s)' : 'تأخير بالثواني'}
                  <div className="tooltip-icon" title={isEn ? "Seconds to wait between messages" : "الوقت بالثواني الذي سينتظره النظام بين كل رسالة وأخرى لتجنب حظر الواتساب"}><HelpCircle size={12}/></div>
                </label>
                <input 
                  type="number" min="0" step="0.5" value={delay} onChange={e => setDelay(Number(e.target.value))}
                  className="input-field small-input" disabled={isWorking}
                />
              </div>
              <div className="setting-item">
                <label className="checkbox-label" title={isEn ? "Adds a random offset to delay" : "يجعل التأخير الزمني غير ثابت ليبدو كأنه إرسال بشري طبيعي"}>
                  <input type="checkbox" checked={randomize} onChange={e => setRandomize(e.target.checked)} disabled={isWorking} />
                  <span className="checkbox-text">{isEn ? 'Randomize (+/- 50%)' : 'تأخير عشوائي'}</span>
                </label>
                <label className="checkbox-label" title={isEn ? "Allow sending to the same number multiple times" : "مهم جداً: إذا أردت إرسال نفس الرسالة لنفس الرقم أكثر من مرة (مثال: أضفت الرقم 28 مرة)، ضع صح هنا لكي لا يحذفهم النظام!"}>
                  <input type="checkbox" checked={allowDuplicates} onChange={e => setAllowDuplicates(e.target.checked)} disabled={isWorking} />
                  <span className="checkbox-text">{isEn ? 'Allow duplicates' : 'إرسال مكرر بقوة'}</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            className={`btn btn-primary send-btn modern-btn-gradient ${isWorking ? 'working' : ''}`}
            onClick={handleSend}
            disabled={isWorking || !selectedSession || parsedCount === 0 || !message}
          >
            {isWorking ? <Activity size={24} className="pulse" /> : <Rocket size={24} />}
            {isWorking ? (isEn ? 'Sending Campaign...' : 'جاري إطلاق الرسائل...') : (isEn ? 'Launch Campaign' : 'إطلاق الحملة')}
          </button>
        </div>

        <div className="bulk-panel log-panel modern-glass">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Monitor size={20} className="primary-icon" /> 
              {isEn ? 'Live Monitor' : 'شاشة المراقبة المباشرة'}
            </h2>
          </div>

          <div className="stats-row modern-stats">
            <div className="stat-box total">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">{isEn ? 'Total' : 'المجموع'}</span>
            </div>
            <div className="stat-box sent">
              <span className="stat-value">{stats.sent}</span>
              <span className="stat-label">{isEn ? 'Sent' : 'نجاح'}</span>
            </div>
            <div className="stat-box failed">
              <span className="stat-value">{stats.failed}</span>
              <span className="stat-label">{isEn ? 'Failed' : 'فشل'}</span>
            </div>
            <div className="stat-box pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">{isEn ? 'Wait' : 'انتظار'}</span>
            </div>
          </div>

          <div className="progress-container modern-progress">
            <div className="progress-header">
              <span className="progress-text">
                {isWorking 
                  ? (isEn ? `Processing... (${stats.sent + stats.failed}/${stats.total})` : `جاري العمل... (${stats.sent + stats.failed} من ${stats.total})`)
                  : (batchState === 'completed' 
                      ? (isEn ? 'Completed!' : 'اكتملت الحملة!') 
                      : (isEn ? 'Ready' : 'جاهز للإرسال')
                    )
                }
              </span>
              <span className="progress-percent">{progressPercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="log-container modern-log">
            {batchResults.length === 0 ? (
              <div className="log-empty">
                <Monitor size={32} opacity={0.3} />
                <p>{isEn ? 'Logs will appear here...' : 'التقارير الحية ستظهر هنا أثناء الإرسال...'}</p>
              </div>
            ) : (
              batchResults.map((r, i) => (
                <div key={i} className={`log-item modern-log-item ${r.status}`}>
                  <div className="log-left">
                    <div className="log-index">{i + 1}</div>
                    <div className="log-details">
                      <div className="log-name">{r.targetName}</div>
                    </div>
                  </div>
                  <div className="log-right">
                    {r.status === 'sent' && <span className="badge sent"><CheckCircle2 size={14}/> {isEn ? 'Sent' : 'تم'}</span>}
                    {r.status === 'failed' && (
                      <div className="failed-container" title={r.error?.message || r.error?.code}>
                        <span className="badge failed"><XCircle size={14}/> {isEn ? 'Failed' : 'فشل'}</span>
                        <span className="error-reason">{r.error?.message || (isEn ? 'Invalid Number' : 'رقم خاطئ/لا يوجد واتس')}</span>
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

      {isNumbersModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNumbersModalOpen(false)}>
          <div className="modal-content modern-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2"><Users size={20} className="primary-icon"/> {isEn ? 'Target Numbers' : 'إضافة جهات الاتصال'}</h3>
              <button className="modal-close" onClick={() => setIsNumbersModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="flex-between" style={{marginBottom: '0.8rem'}}>
                <span className="input-hint">{isEn ? 'Format: Number , Name (e.g. 0791234567, Ahmad)' : 'الصيغة: الرقم , الاسم (مثال: 0791234567, أحمد)'}</span>
                <button className="btn-upload modern-upload-btn" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> {isEn ? 'Upload Excel/VCF' : 'رفع إكسل / VCF'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv,.xlsx,.xls,.vcf" style={{display: 'none'}} />
              </div>
              <textarea 
                value={numbersText}
                onChange={e => setNumbersText(e.target.value)}
                className="input-field numbers-area modern-textarea"
                placeholder="0791036401 , Ahmad\n+962781595697 , Omar"
                dir="auto"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary modern-btn-gradient" onClick={() => setIsNumbersModalOpen(false)}>{isEn ? 'Done' : 'حفظ وإغلاق'}</button>
            </div>
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMessageModalOpen(false)}>
          <div className="modal-content modern-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2"><MessageSquare size={20} className="primary-icon"/> {isEn ? 'Message Content' : 'كتابة الرسالة'}</h3>
              <button className="modal-close" onClick={() => setIsMessageModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="input-field message-area modern-textarea"
                placeholder={isEn ? "Write your message..." : "اكتب رسالتك هنا بكل حرية..."}
                style={{height: '250px'}}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary modern-btn-gradient" onClick={() => setIsMessageModalOpen(false)}>{isEn ? 'Done' : 'حفظ وإغلاق'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
