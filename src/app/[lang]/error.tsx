'use client';

import { useTranslations } from 'next-intl';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">{t('title')}</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#e31937] text-white rounded-lg hover:bg-[#c41730] transition-colors"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
