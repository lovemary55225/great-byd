'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SubscribeForm() {
  const t = useTranslations('subscribe');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(t('success'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t('error'));
      }
    } catch {
      setStatus('error');
      setMessage(t('genericError'));
    }
  };

  return (
    <div>
      <h4 className="text-white font-bold mb-2">{t('title')}</h4>
      <p className="text-slate-400 text-sm mb-3">{t('description')}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder={t('placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#0a0a0f] border-[#1e1e2e] text-white flex-1"
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '...' : t('submit')}
        </Button>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
