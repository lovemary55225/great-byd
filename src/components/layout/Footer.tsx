import Link from 'next/link';
import { useTranslations } from 'next-intl';
import SubscribeForm from './SubscribeForm';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-[#0d0d14] border-t border-[#1e1e2e] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-bold text-white mb-3">Great BYD</h4>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-4">
              {t('brandDescription')}
            </p>
            <div className="flex items-center gap-4 text-slate-500 text-xs">
              <span>{t('feature.languages')}</span>
              <span>·</span>
              <span>{t('feature.realtime')}</span>
              <span>·</span>
              <span>{t('feature.aiTranslation')}</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-3">{t('links.platform')}</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/en/news" className="hover:text-white transition-colors">{t('links.latestNews')}</Link></li>
              <li><Link href="/en/data" className="hover:text-white transition-colors">{t('links.dataDashboard')}</Link></li>
              <li><Link href="/en/search" className="hover:text-white transition-colors">{t('links.search')}</Link></li>
              <li><Link href="/en/about" className="hover:text-white transition-colors">{t('links.about')}</Link></li>
            </ul>
          </div>

          {/* Subscribe */}
          <SubscribeForm />
        </div>

        <div className="border-t border-[#1e1e2e] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Great BYD. {t('allRightsReserved')}</p>
          <p>{t('dataSource')}</p>
        </div>
      </div>
    </footer>
  );
}
