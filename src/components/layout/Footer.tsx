export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Great BYD. All rights reserved.</p>
        <p className="mt-2">Data sourced from public news and official BYD reports.</p>
      </div>
    </footer>
  );
}
