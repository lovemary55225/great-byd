'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const t = useTranslations('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('error.failed'));
      } else {
        router.push(`/${lang}/login`);
      }
    } catch {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card className="bg-[#13131f] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-white text-xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('name')}</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#0a0a0f] border-[#1e1e2e] text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('email')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0a0a0f] border-[#1e1e2e] text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('password')}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#0a0a0f] border-[#1e1e2e] text-white"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : t('submit')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            {t('hasAccount')}{' '}
            <Link href={`/${lang}/login`} className="text-blue-400 hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
