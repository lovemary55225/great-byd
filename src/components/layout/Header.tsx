import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const { data: session, status } = useSession();

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
          <div className="flex items-center gap-4">
            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/favorites`} className="text-slate-300 hover:text-white text-sm hidden md:block">
                  {t('favorites')}
                </Link>
                <span className="text-sm text-slate-300">{session.user.name || session.user.email}</span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm">{t('login')}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm">{t('register')}</Button>
                </Link>
              </div>
            )}
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
