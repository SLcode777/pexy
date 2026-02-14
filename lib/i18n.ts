import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import fr from '@/locales/fr/translation.json';
import en from '@/locales/en/translation.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
