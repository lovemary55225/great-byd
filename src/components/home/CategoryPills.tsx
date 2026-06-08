'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Car, BarChart3, Cpu, Zap, Globe } from 'lucide-react';

const categories = [
  { slug: 'new-car', label: 'New Car', icon: Car, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400' },
  { slug: 'sales', label: 'Sales', icon: BarChart3, color: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400' },
  { slug: 'technology', label: 'Technology', icon: Cpu, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400' },
  { slug: 'charging', label: 'Charging', icon: Zap, color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400' },
  { slug: 'overseas', label: 'Overseas', icon: Globe, color: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400' },
];

export default function CategoryPills() {
  const locale = useLocale();
  const t = useTranslations('categories');

  return (
    <section className="mb-10">
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/news`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-gradient-to-br ${cat.color} hover:scale-105 transition-transform`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{t(cat.slug)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
