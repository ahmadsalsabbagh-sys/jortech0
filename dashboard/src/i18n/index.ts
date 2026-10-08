import i18n from 'i18next';
import type { BackendModule, ReadCallback, ResourceKey } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = ['ar', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const rtlLanguages: SupportedLanguage[] = ['ar'];

export const languageOptions: Array<{ value: SupportedLanguage; label: string; compactLabel: string }> = [
  { value: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', compactLabel: 'AR' },
  { value: 'en', label: 'English', compactLabel: 'EN' },
];

export function resolveSupportedLanguage(lang?: string): SupportedLanguage {
  const value = lang || 'ar';
  const exact = supportedLanguages.find(supported => supported.toLowerCase() === value.toLowerCase());
  if (exact) return exact;

  const parts = value.toLowerCase().split('-');
  const base = parts[0];

  return supportedLanguages.find(supported => supported === base) ?? 'ar';
}

/**
 * i18next's own loading extension point. Using it rather than fetching by hand is what keeps a
 * runtime language switch correct: i18next resolves `read` for the requested language before it
 * emits `languageChanged`, so no component ever renders against a half-loaded catalogue and neither
 * language picker has to sequence anything itself.
 */
const lazyLocaleBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language: string, _namespace: string, callback: ReadCallback) => {
    // A dynamic import with a variable rather than `import.meta.glob`: Vite splits one chunk per
    // matched file either way, but this stays a real runtime import under the bare node test runner
    // that renders the components, where the Vite transform does not run and `import.meta.glob` is
    // undefined. Keep the directory and the extension literal or the split stops happening.
    void import(`./locales/${language}.json`).then(
      (module: { default: ResourceKey }) => callback(null, module.default),
      (error: Error) => callback(error, false),
    );
  },
};

/**
 * Keyed to `resolvedLanguage` â€” the language whose catalogue actually answered â€” rather than to the
 * one that was requested, which is the expression `Layout` and `Login` already use to label the
 * picker. The two could not disagree while every catalogue was bundled; now that they are fetched
 * they can. A chunk that 404s (a tab left open across a redeploy is the realistic way) still sets
 * `language`, still emits this event and still gets cached by the detector, while `t()` serves the
 * English fallback â€” so following the request would dress English copy right-to-left and leave the
 * picker reading EN against an `ar` document.
 */
function applyDirection() {
  const resolved = resolveSupportedLanguage(i18n.resolvedLanguage || i18n.language);
  const dir = rtlLanguages.includes(resolved) ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = resolved;
    document.documentElement.dir = dir;
  }
}

// Subscribed before init, which is also what sets the initial direction: init resolves the detected
// language through `changeLanguage`, so the first event is the initial one. Registering afterwards
// happens to work too, but only because init defers â€” this way the order cannot matter.
i18n.on('languageChanged', applyDirection);

export const i18nReady = i18n
  .use(lazyLocaleBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    supportedLngs: supportedLanguages as unknown as string[],
    nonExplicitSupportedLngs: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'openwa_language',
      caches: ['localStorage'],
      // Map a code only when it matches a shipped language. An unmatched one passes through unchanged,
      // so i18next skips it and tries the visitor's next preference; mapping it to 'en' would end the
      // search on an English they never asked for. fallbackLng still covers a list with no match.
      convertDetectedLanguage: (lang: string) => {
        const resolved = resolveSupportedLanguage(lang);
        return resolved === 'en' && lang.toLowerCase().split('-')[0] !== 'en' ? lang : resolved;
      },
    },
    react: { useSuspense: false },
  });

export default i18n;
