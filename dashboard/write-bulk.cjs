const fs = require('fs');

const tsx = `import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Clock, Users, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sessionsApi, messagingApi, type Session } from '../services/api';
import './BulkSender.css';

export function BulkSender() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(5);
  const [randomize, setRandomize] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(console.error);
  }, []);

  const handleSend = async () => {
    setStatus({ type: '', text: '' });
    
    if (!selectedSession || !numbers.trim() || !message.trim()) {
      setStatus({ type: 'error', text: t('bulkSender.requiredFields') });
      return;
    }

    const numberList = numbers.split('\\n')
      .map(n => n.trim().replace(/[^0-9]/g, ''))
      .filter(n => n.length > 5)
      .map(n => n + '@c.us'); // Format to WhatsApp JID

    if (numberList.length === 0) {
      setStatus({ type: 'error', text: t('bulkSender.error') + ': No valid numbers found' });
      return;
    }

    setIsLoading(true);

    try {
      const messages = numberList.map(chatId => ({ chatId, text: message }));
      
      await messagingApi.sendBulk(selectedSession, {
        messages,
        options: {
          delayBetweenMessages: delay * 1000,
          randomizeDelay: randomize,
          stopOnError: false
        }
      });
      
      setStatus({ type: 'success', text: t('bulkSender.success') + \` (\${messages.length} messages queued)\` });
      setNumbers('');
      setMessage('');
    } catch (err: any) {
      setStatus({ type: 'error', text: err?.message || t('bulkSender.error') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container bulk-sender-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{t('bulkSender.title')}</h1>
          <p className="page-subtitle">{t('bulkSender.subtitle')}</p>
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
          <label><Send size={16}/> {t('bulkSender.sessionSelect')}</label>
          <select 
            value={selectedSession} 
            onChange={e => setSelectedSession(e.target.value)}
            className="input-field"
          >
            <option value="" disabled>{t('bulkSender.sessionSelect')}</option>
            {sessions.filter(s => s.status === 'WORKING').map(s => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label><Users size={16}/> {t('bulkSender.targetNumbers')}</label>
            <textarea 
              value={numbers}
              onChange={e => setNumbers(e.target.value)}
              className="input-field numbers-area"
              placeholder="962791234567\n962799999999"
              dir="ltr"
            />
          </div>

          <div className="form-group flex-1">
            <label><Send size={16}/> {t('bulkSender.messageText')}</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input-field message-area"
              placeholder="السلام عليكم..."
            />
          </div>
        </div>

        <div className="form-row settings-row">
          <div className="form-group">
            <label><Clock size={16}/> {t('bulkSender.delayLabel')}</label>
            <input 
              type="number" 
              min="1" 
              value={delay} 
              onChange={e => setDelay(Number(e.target.value))}
              className="input-field delay-input"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={randomize} 
                onChange={e => setRandomize(e.target.checked)}
              />
              {t('bulkSender.randomizeDelay')}
            </label>
          </div>
        </div>

        <button 
          className="btn btn-primary send-btn" 
          onClick={handleSend}
          disabled={isLoading || !selectedSession || !numbers || !message}
        >
          {isLoading ? <Clock size={20} className="spin" /> : <Play size={20} />}
          {isLoading ? t('bulkSender.sending') : t('bulkSender.sendBtn')}
        </button>
      </div>
    </div>
  );
}
`;

const css = `
.bulk-sender-page {
  max-width: 1000px;
  margin: 0 auto;
}

.bulk-card {
  background: var(--bg-white, #fff);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--border, #eee);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 300px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary, #333);
}

.input-field {
  padding: 0.8rem;
  border: 1px solid var(--border, #ccc);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-card, #fafafa);
  color: var(--text-primary, #000);
}

.input-field:focus {
  border-color: #0072ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1);
}

.numbers-area {
  min-height: 200px;
  resize: vertical;
}

.message-area {
  min-height: 200px;
  resize: vertical;
}

.settings-row {
  background: rgba(0, 114, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  align-items: center;
}

.delay-input {
  width: 100px;
  text-align: center;
}

.checkbox-group {
  justify-content: center;
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
  font-weight: 500 !important;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #0072ff;
}

.send-btn {
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background: #0072ff;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 114, 255, 0.3);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-banner {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.status-banner.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-banner.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
`;

fs.writeFileSync('dashboard/src/pages/BulkSender.tsx', tsx, 'utf8');
fs.writeFileSync('dashboard/src/pages/BulkSender.css', css, 'utf8');