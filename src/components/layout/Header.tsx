import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/news', label: t('news') },
    { href: '/data', label: t('data') },
    { href: '/search', label: t('search') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="text-xl font-bold text-white">
            Great BYD
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
