'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function FavoriteButton({ newsId }: { newsId: number }) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/favorites?newsId=${newsId}`)
      .then((res) => res.json())
      .then((data) => setIsFavorited(data.isFavorited))
      .catch(() => {});
  }, [session, newsId]);

  const toggle = async () => {
    if (!session) return;
    setLoading(true);
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId }),
    });
    const data = await res.json();
    setIsFavorited(data.isFavorited);
    setLoading(false);
  };

  if (!session) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={isFavorited ? 'text-red-500' : 'text-slate-400'}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
      <span className="ml-1">{isFavorited ? 'Saved' : 'Save'}</span>
    </Button>
  );
}
