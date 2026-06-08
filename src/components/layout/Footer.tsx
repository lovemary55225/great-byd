import SubscribeForm from './SubscribeForm';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-2">Great BYD</h4>
            <p className="text-slate-400 text-sm">Independent global news aggregation for BYD automotive developments.</p>
          </div>
          <SubscribeForm />
        </div>
        <div className="border-t border-slate-800 pt-6 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Great BYD. All rights reserved.</p>
          <p className="mt-2">Data sourced from public news and official BYD reports.</p>
        </div>
      </div>
    </footer>
  );
}
