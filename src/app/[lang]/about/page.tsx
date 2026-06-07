import { getTranslations } from 'next-intl/server';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">About Great BYD</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            Great BYD is an independent news aggregation platform dedicated to tracking BYD's global automotive developments.
          </p>

          <p>
            We collect and curate news from official BYD channels, automotive media, and public data sources worldwide, covering:
          </p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>New vehicle launches and product updates</li>
            <li>Global sales data and market analysis</li>
            <li>Technology breakthroughs and innovations</li>
            <li>Charging infrastructure expansion</li>
            <li>Overseas market entry strategies</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Data Sources</h2>
          <p>
            News articles are aggregated from RSS feeds and public APIs. Sales data is compiled from official industry reports
            and automotive associations in respective countries.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Disclaimer</h2>
          <p className="text-sm text-slate-400">
            This is an unofficial fan project. All data and news are sourced from publicly available information.
            BYD and related trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </div>
  );
}
