'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Zap, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden rounded-2xl mb-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-8 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e31937]/10 border border-[#e31937]/20 text-[#e31937] text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          <span>{t('badge')}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t('title')}
          <span className="text-[#e31937]">{t('titleHighlight')}</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/news`}>
            <Button size="lg" className="bg-[#e31937] hover:bg-[#c41730] text-white px-8">
              {t('ctaNews')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href={`/${locale}/data`}>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800 px-8">
              {t('ctaData')}
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-14">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#e31937] mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-2xl font-bold text-white">78+</span>
            </div>
            <p className="text-slate-400 text-xs">{t('stat.marketsLabel')}</p>
          </div>
          <div className="text-center border-x border-slate-700/50">
            <div className="flex items-center justify-center gap-1.5 text-green-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-2xl font-bold text-white">5.2M</span>
            </div>
            <p className="text-slate-400 text-xs">{t('stat.salesLabel')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-2xl font-bold text-white">10K+</span>
            </div>
            <p className="text-slate-400 text-xs">{t('stat.chargingLabel')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
