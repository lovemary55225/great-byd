import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import zhMessages from '../../../messages/zh.json';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';
import arMessages from '../../../messages/ar.json';
import frMessages from '../../../messages/fr.json';
import ruMessages from '../../../messages/ru.json';
import ptMessages from '../../../messages/pt.json';
import deMessages from '../../../messages/de.json';
import jaMessages from '../../../messages/ja.json';
import koMessages from '../../../messages/ko.json';

const messagesMap: Record<string, any> = {
  zh: zhMessages,
  en: enMessages,
  es: esMessages,
  ar: arMessages,
  fr: frMessages,
  ru: ruMessages,
  pt: ptMessages,
  de: deMessages,
  ja: jaMessages,
  ko: koMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: messagesMap[locale] || messagesMap[routing.defaultLocale],
  };
});
