import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';

export function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-brand-500" strokeWidth={2.2} />
            <span className="text-lg font-bold tracking-tight text-ink-900">
              Calendar
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            <NavLink
              to="/event-types"
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-100 text-ink-900'
                    : 'text-ink-700 hover:bg-slate-100 hover:text-ink-900',
                ].join(' ')
              }
            >
              Записаться
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-100 text-ink-900'
                    : 'text-ink-500 hover:bg-slate-100 hover:text-ink-900',
                ].join(' ')
              }
            >
              Админка
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
