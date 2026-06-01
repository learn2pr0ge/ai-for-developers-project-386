import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';

const navItems = [
  { to: '/admin/bookings', label: 'Бронирования' },
  { to: '/admin/event-types', label: 'Типы событий' },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-brand-500" strokeWidth={2.2} />
            <span className="text-lg font-bold tracking-tight text-ink-900">
              Calendar
            </span>
            <span className="ml-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-ink-500">
              Админка
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-slate-100 hover:text-ink-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/"
              className="ml-2 rounded-lg px-3 py-2 text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900"
            >
              На сайт
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
