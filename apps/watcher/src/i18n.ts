import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';
import config from './config';

export async function initializeI18n() {
  try {
    await i18n
      .use(Backend)
      .init({
        lng: config.appLanguage, // If you want to set a default language, uncomment this line
        fallbackLng: 'en', // Default language if the user language is not available
        preload: ['en', 'nl'], // Preload languages
        debug: false,
        //ns: ['translation'], // If you want to set a default namespace, uncomment this line
        //defaultNS: 'translation', // If you want to set a default namespace, uncomment this line
        backend: {
          // Adjusted path to point to src/locales, assuming __dirname is apps/watcher/src
          loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
        },
        interpolation: {
          escapeValue: false, // React already safes from xss
        },
      });
    console.log('[i18n] Initialized i18n (after await).');
    console.log('[i18n] Detected/Set language (after await):', i18n.language);
    console.log('[i18n] Language fallback order (after await):', i18n.languages);
    console.log('[i18n] Initial configuration used language (config object):', config.appLanguage);
    // return i18n; // Optional: can be useful
  } catch (error) {
    console.error('[i18n] Error during initialization:', error);
    // Propagate the error or handle as needed
    throw error; // Or process.exit(1) if init failure is critical
  }
}

export default i18n;
