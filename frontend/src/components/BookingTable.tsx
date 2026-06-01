import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import type { Booking } from '../types';

interface BookingTableProps {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
  cancellingId: string | null;
}

function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy, HH:mm', { locale: ru });
}

export function BookingTable({ bookings, onCancel, cancellingId }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-ink-500">
        Бронирований не найдено.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop таблица */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Тип события</th>
              <th className="px-4 py-3 font-semibold">Имя гостя</th>
              <th className="px-4 py-3 font-semibold">Email гостя</th>
              <th className="px-4 py-3 font-semibold">Начало</th>
              <th className="px-4 py-3 font-semibold">Конец</th>
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-ink-900">
                  {b.eventTypeName}
                </td>
                <td className="px-4 py-3 text-ink-700">{b.guestName}</td>
                <td className="px-4 py-3 text-ink-500">{b.guestEmail}</td>
                <td className="px-4 py-3 text-ink-700">{formatDateTime(b.startTime)}</td>
                <td className="px-4 py-3 text-ink-700">{formatDateTime(b.endTime)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onCancel(b)}
                    disabled={cancellingId === b.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {cancellingId === b.id ? 'Отмена…' : 'Отменить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile карточки */}
      <div className="divide-y divide-slate-100 md:hidden">
        {bookings.map((b) => (
          <div key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink-900">{b.eventTypeName}</p>
                <p className="text-sm text-ink-700">{b.guestName}</p>
                <p className="text-xs text-ink-500">{b.guestEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => onCancel(b)}
                disabled={cancellingId === b.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Отменить
              </button>
            </div>
            <div className="mt-2 text-xs text-ink-500">
              {formatDateTime(b.startTime)} — {formatDateTime(b.endTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
