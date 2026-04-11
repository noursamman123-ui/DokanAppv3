import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar from './ar.json';
import en from './en.json';
import { AppSettings } from '../utils/storage';

const currentLanguage = AppSettings.getLanguage();

// Enable RTL for Arabic
I18nManager.forceRTL(currentLanguage === 'ar');
I18nManager.allowRTL(true);

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: currentLanguage,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
