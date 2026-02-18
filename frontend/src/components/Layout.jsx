import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const path = useLocation().pathname;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-800 text-lg tracking-tight">TeraLeads</span>
            <nav className="ml-8 flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  path === '/dashboard'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  path === '/chat'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Chat
              </Link>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
