import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
] as const;

export type SupportedLanguageCode = 'fr' | 'ar' | 'en' | 'es';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cardforge_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Apply document language and direction (RTL for Arabic)
export const applyLanguageDirection = (lng: string) => {
  const isRtl = lng === 'ar' || lng.startsWith('ar');
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }
};

i18n.on('languageChanged', (lng) => {
  applyLanguageDirection(lng);
});

// Initial application
if (typeof document !== 'undefined') {
  applyLanguageDirection(i18n.resolvedLanguage || i18n.language || 'fr');
}

export default i18n;
