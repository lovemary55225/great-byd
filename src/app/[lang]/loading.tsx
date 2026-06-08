import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e31937] mx-auto"></div>
      <p className="mt-4 text-slate-400">{t('loading')}</p>
    </div>
  );
}
