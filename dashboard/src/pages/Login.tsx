import { useState } from 'react';
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
  const loginBtn = isEn ? 'Login ➜' : 'دخول ➜';

  return (
    <div className="login-container">
      <div className={`login-card ${isEn ? 'is-en' : 'is-ar'}`}>
        
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
