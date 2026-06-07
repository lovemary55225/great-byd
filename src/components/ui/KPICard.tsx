interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export default function KPICard({ title, value, change, isPositive }: KPICardProps) {
  return (
    <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
      <p className="text-slate-400 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-white font-mono">{value}</p>
      {change && (
        <p className={`text-sm mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  );
}
