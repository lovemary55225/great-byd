import { getTranslations } from 'next-intl/server';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('about');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">{t('title')}</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>{t('intro')}</p>

          <p>{t('coverageTitle')}</p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('coverage.vehicleLaunches')}</li>
            <li>{t('coverage.salesData')}</li>
            <li>{t('coverage.technology')}</li>
            <li>{t('coverage.charging')}</li>
            <li>{t('coverage.overseas')}</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">{t('dataSourcesTitle')}</h2>
          <p>{t('dataSourcesText')}</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">{t('disclaimerTitle')}</h2>
          <p className="text-sm text-slate-400">{t('disclaimerText')}</p>
        </div>
      </div>
    </div>
  );
}
