import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden">
      {/* Градиентная подложка */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-slate-50 to-brand-100" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 shadow-sm ring-1 ring-white/60">
            Быстрая запись на звонок
          </span>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-ink-900 sm:text-6xl">
            Calendar
          </h1>

          <p className="mt-4 max-w-md text-lg text-ink-500">
            Забронируйте встречу за минуту: выберите тип события и удобное время.
          </p>

          <Link
            to="/event-types"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600"
          >
            Записаться
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
