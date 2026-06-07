'use client';

import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-sm"
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
