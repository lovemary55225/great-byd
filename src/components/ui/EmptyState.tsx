import { useTranslations } from 'next-intl';
import { Newspaper } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1e1e2e] flex items-center justify-center mb-4">
        <Newspaper className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title || t('emptyStateTitle')}</h3>
      <p className="text-slate-400 text-sm max-w-sm">{description || t('emptyStateDescription')}</p>
    </div>
  );
}
