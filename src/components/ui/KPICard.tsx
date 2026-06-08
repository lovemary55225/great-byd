import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
}

export default function KPICard({ title, value, change, isPositive, icon: Icon }: KPICardProps) {
  return (
    <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#e31937]/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-400 text-sm">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-[#e31937]/10 text-[#e31937] group-hover:bg-[#e31937]/20 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white font-mono tracking-tight">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-sm mt-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
