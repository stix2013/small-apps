import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';

i18n
  .use(Backend)
  .init({
    //lng: 'en', // If you want to set a default language, uncomment this line
    fallbackLng: 'en',
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

export default i18n;
