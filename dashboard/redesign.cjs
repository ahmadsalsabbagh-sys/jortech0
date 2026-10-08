const fs = require('fs');

let loginTsx = import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Languages } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import { CustomSelect } from '../components/CustomSelect';
import { languageOptions, resolveSupportedLanguage, type SupportedLanguage } from '../i18n';
import { API_BASE_URL } from '../services/api';
import './Login.css';

interface LoginProps {
  onLogin: (apiKey: string, role?: string, engineType?: string, scoped?: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const currentLang = resolveSupportedLanguage(i18n.resolvedLanguage || i18n.language);

  const changeLanguage = (language: SupportedLanguage) => {
    void i18n.changeLanguage(language);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = apiKey.trim();
    if (!key) {
      setError(t('login.apiKeyRequired'));
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(\\/auth/validate\, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key,
        },
      });

      if (response.ok) {
        const data: { role?: string; engineType?: string; scoped?: unknown } = await response.json().catch(() => ({}));
        onLogin(
          key,
          data.role,
          typeof data.engineType === 'string' ? data.engineType : undefined,
          data.scoped === true,
        );
      } else {
        const errorData: { message?: unknown } = await response.json().catch(() => ({}));
        const reason = response.status < 500 && typeof errorData.message === 'string' ? errorData.message : '';
        setError(reason || t(response.status === 401 ? 'login.invalidKey' : 'login.connectionError'));
      }
    } catch {
      setError(t('login.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side (Blue Panel) */}
        <div className="login-left">
          <div className="login-logo-wrapper">
            <img 
              src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" 
              alt="JOR Tech" 
              className="logo-icon-large" 
            />
          </div>
          <h2 className="login-brand-title">JOR Tech</h2>
          <div className="login-marketing-box">
            <p>حلول رقمية احترافية متكاملة<br/>انضم إلينا الآن واستفد من أدواتنا الذكية.</p>
          </div>
        </div>

        {/* Right Side (Form Panel) */}
        <div className="login-right">
          <h2 className="login-title">تسجيل الدخول</h2>
          <p className="login-subtitle">مرحباً بك مجدداً في JOR Tech</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-language">
              <Languages size={18} />
              <CustomSelect
                value={currentLang}
                onChange={value => changeLanguage(value as SupportedLanguage)}
                options={languageOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                ariaLabel={t('common.language')}
              />
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={t('login.apiKeyPlaceholder') || 'أدخل مفتاح API الخاص بك'}
                  className={error ? 'error' : ''}
                  dir="ltr"
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowKey(!showKey)}
                  aria-label="Toggle visibility"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="connect-btn" disabled={isLoading}>
              {isLoading ? t('login.connecting') : 'دخول ➔'}
            </button>
          </form>

          <p className="login-help">
            للحصول على مساعدة يرجى مراجعة <a href="https://www.jortechjo.com" target="_blank" rel="noopener noreferrer">موقعنا</a>
          </p>

          <footer className="login-footer">
            <span>لوحة تحكم JOR Tech | الإصدار {__APP_VERSION__}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
\;

fs.writeFileSync('dashboard/src/pages/Login.tsx', loginTsx, 'utf8');

let loginCss = \
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  padding: 2rem;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  font-family: 'Cairo', sans-serif;
}

.login-card {
  display: flex;
  flex-direction: row-reverse; /* RTL makes row-reverse put the blue panel on the left */
  background: var(--bg-white, #fff);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 114, 255, 0.15);
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  overflow: hidden;
}

/* LEFT PANEL (Blue) */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #0052D4, #0072ff);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.login-logo-wrapper {
  background: white;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.logo-icon-large {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.login-brand-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}

.login-marketing-box {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.1);
}

.login-marketing-box p {
  font-size: 1rem;
  line-height: 1.8;
  font-weight: 600;
  margin: 0;
}

/* RIGHT PANEL (Form) */
.login-right {
  flex: 1.2;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0052D4;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #00b4db;
  font-weight: 600;
  margin-bottom: 2.5rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.login-language {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.login-language svg {
  color: #64748b;
}

.login-language .custom-select {
  flex: 1;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.3s;
  color: #0f172a;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #0072ff;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1);
  background: #ffffff;
}

.input-wrapper input.error {
  border-color: #ef4444;
}

.toggle-visibility {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
}

.toggle-visibility:hover {
  color: #0072ff;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.connect-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  background: #0072ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
}

.connect-btn:hover:not(:disabled) {
  background: #0052D4;
}

.connect-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.login-help {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
}

.login-help a {
  color: #0072ff;
  font-weight: 700;
  text-decoration: none;
}

.login-footer {
  margin-top: auto;
  padding-top: 2rem;
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 450px;
  }
  .login-left {
    padding: 2rem;
  }
  .login-right {
    padding: 2rem;
  }
}
\;

fs.writeFileSync('dashboard/src/pages/Login.css', loginCss, 'utf8');

console.log('Done redesigning Login page.');