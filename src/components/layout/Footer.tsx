import Link from 'next/link';
import SubscribeForm from './SubscribeForm';

export default function Footer() {
  return (
    <footer className="bg-[#0d0d14] border-t border-[#1e1e2e] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-bold text-white mb-3">Great BYD</h4>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-4">
              Independent global news aggregation and data intelligence platform for BYD automotive developments. Tracking sales, technology, and market expansion across 78+ countries.
            </p>
            <div className="flex items-center gap-4 text-slate-500 text-xs">
              <span>10 Languages</span>
              <span>·</span>
              <span>Real-time Data</span>
              <span>·</span>
              <span>AI Translation</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Platform</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/en/news" className="hover:text-white transition-colors">Latest News</Link></li>
              <li><Link href="/en/data" className="hover:text-white transition-colors">Data Dashboard</Link></li>
              <li><Link href="/en/search" className="hover:text-white transition-colors">Search</Link></li>
              <li><Link href="/en/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Subscribe */}
          <SubscribeForm />
        </div>

        <div className="border-t border-[#1e1e2e] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Great BYD. All rights reserved.</p>
          <p>Data sourced from public news and official BYD reports.</p>
        </div>
      </div>
    </footer>
  );
}
