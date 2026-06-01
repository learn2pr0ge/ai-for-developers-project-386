import { Link, Navigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import type { Booking } from '../../types';

interface LocationState {
  booking?: Booking;
}

export function BookingSuccessPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const booking = state?.booking;

  // Без данных бронирования (прямой заход) — на главную.
  if (!booking) {
    return <Navigate to="/" replace />;
  }

  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">
          Бронирование подтверждено
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Мы записали вашу встречу. Детали ниже.
        </p>

        <dl className="mt-6 space-y-3 text-left">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium text-ink-400">Событие</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">
              {booking.eventTypeName}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium text-ink-400">Дата и время</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">
              {format(start, 'EEEE, d MMMM yyyy', { locale: ru })}
              <br />
              {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium text-ink-400">Гость</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">
              {booking.guestName}
              <span className="ml-1 font-normal text-ink-500">
                ({booking.guestEmail})
              </span>
            </dd>
          </div>
        </dl>

        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
