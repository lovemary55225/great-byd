import Link from 'next/link';
import { useLocale } from 'next-intl';

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

  return (
    <Link href={`/${locale}/news/${slug}`}>
      <article className="bg-[#13131f] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#e31937]/50 transition-colors">
        {imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-5">
          <span className="text-xs text-[#e31937] font-medium">{category}</span>
          <h3 className="text-lg font-semibold text-white mt-2 mb-2 line-clamp-2">{title}</h3>
          {summary && <p className="text-slate-400 text-sm line-clamp-2 mb-3">{summary}</p>}
          <p className="text-slate-500 text-xs">{new Date(publishedAt).toLocaleDateString(locale)}</p>
        </div>
      </article>
    </Link>
  );
}
