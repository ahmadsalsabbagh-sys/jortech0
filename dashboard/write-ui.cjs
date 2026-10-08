const fs = require('fs');

const loginTsx = `import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Languages } from 'lucide-react';
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
      const response = await fetch(API_BASE_URL + '/auth/validate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': key } });
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

  const isEn = currentLang === 'en';
  const marketingTitle = isEn ? 'Professional Digital Solutions' : 'حلول رقمية احترافية متكاملة';
  const marketingSub = isEn ? 'Join us now and benefit from our smart tools.' : 'انضم إلينا الآن واستفد من أدواتنا الذكية.';
  const loginTitle = isEn ? 'Login' : 'تسجيل الدخول';
  const loginSub = isEn ? 'Welcome back to JOR Tech' : 'مرحباً بك مجدداً في JOR Tech';
  const loginBtn = isEn ? 'Login \u279C' : 'دخول \u279C';

  return (
    <div className="login-container">
      <div className={\`login-card \${isEn ? 'is-en' : 'is-ar'}\`}>
        
        {/* Left Side (Blue Panel) */}
        <div className="login-blue-panel">
          <div className="login-logo-wrapper">
            <img 
              src="https://www.jortechjo.com/uploads/settings/69ff8042503c0.png" 
              alt="JOR Tech" 
              className="logo-icon-large" 
            />
          </div>
          <h2 className="login-brand-title">JOR Tech</h2>
          <div className="login-marketing-box">
            <p>{marketingTitle}<br/>{marketingSub}</p>
          </div>
        </div>

        {/* Right Side (Form Panel) */}
        <div className="login-white-panel">
          <h2 className="login-title">{loginTitle}</h2>
          <p className="login-subtitle">{loginSub}</p>

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
              {isLoading ? t('login.connecting') : loginBtn}
            </button>
          </form>

          <p className="login-help">
            {isEn ? 'Need help? Visit our ' : 'للحصول على مساعدة يرجى مراجعة ' }
            <a href="https://www.jortechjo.com" target="_blank" rel="noopener noreferrer">
              {isEn ? 'website' : 'موقعنا'}
            </a>
          </p>

          <footer className="login-footer">
            <span>{isEn ? 'JOR Tech Dashboard | Version ' : 'لوحة تحكم JOR Tech | الإصدار '} {__APP_VERSION__}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('dashboard/src/pages/Login.tsx', loginTsx, 'utf8');

const loginCss = `
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
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 550px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 114, 255, 0.15);
  overflow: hidden;
}

/* PANELS */
.login-blue-panel,
.login-white-panel {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-blue-panel {
  width: 45%;
  background: linear-gradient(135deg, #0052D4, #0072ff);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  z-index: 10;
}

.login-white-panel {
  width: 55%;
  background: #ffffff;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 5;
}

/* ANIMATION LOGIC */
/* Arabic (RTL): Blue on left, White on right */
.login-card.is-ar .login-blue-panel {
  transform: translateX(0);
  left: 0;
}
.login-card.is-ar .login-white-panel {
  transform: translateX(0);
  right: 0;
}

/* English (LTR): Blue on right, White on left */
.login-card.is-en .login-blue-panel {
  transform: translateX(122.22%); /* 55 / 45 = 1.2222 */
  left: 0;
}
.login-card.is-en .login-white-panel {
  transform: translateX(-81.81%); /* 45 / 55 = 0.8181 */
  right: 0;
}

.login-logo-wrapper {
  background: white;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  overflow: hidden;
}

.logo-icon-large {
  width: 130%;
  height: 130%;
  object-fit: cover;
  transform: scale(1.1);
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
.is-ar .input-wrapper input {
  padding: 1rem 3rem 1rem 1rem;
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
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
}
.is-ar .toggle-visibility {
  left: 1rem;
}
.is-en .toggle-visibility {
  right: 1rem;
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

@media (max-width: 768px) {
  .login-card {
    height: auto;
    min-height: 700px;
  }
  .login-blue-panel,
  .login-white-panel {
    position: static;
    width: 100% !important;
    transform: none !important;
  }
  .login-blue-panel {
    padding: 2rem;
  }
  .login-white-panel {
    padding: 2rem;
  }
}
`;
fs.writeFileSync('dashboard/src/pages/Login.css', loginCss, 'utf8');
console.log('Fixed correctly');