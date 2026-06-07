import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en', 'es', 'ar', 'fr', 'ru', 'pt', 'de', 'ja', 'ko'],
  defaultLocale: 'zh',
  localePrefix: 'always',
});
