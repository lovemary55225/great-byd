import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  category: string;
}

export default function NewsCard({ slug, title, summary, imageUrl, publishedAt, category }: NewsCardProps) {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <Link href={`/${locale}/news/${slug}`} className="group block">
      <article className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#e31937]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#e31937]/5 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-video overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0f] flex items-center justify-center">
              <span className="text-slate-600 text-sm">{t('noImage')}</span>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium text-white border border-white/10">
              {category}
            </span>
          </div>
          {/* Hover arrow */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#e31937] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#e31937] transition-colors">
            {title}
          </h3>
          {summary && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
              {summary}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(publishedAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
