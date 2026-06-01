import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { AdminBookingFilters } from '../../api/bookings';
import { useAdminBookings, useCancelBooking } from '../../hooks/useBookings';
import { useAdminEventTypes } from '../../hooks/useEventTypes';
import { BookingTable } from '../../components/BookingTable';
import { getErrorMessage } from '../../lib/format';
import type { Booking } from '../../types';

export function AdminBookingsPage() {
  const [eventTypeId, setEventTypeId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filters: AdminBookingFilters = useMemo(
    () => ({
      eventTypeId: eventTypeId || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [eventTypeId, from, to],
  );

  const { data: bookings, isLoading, isError, error } = useAdminBookings(filters);
  const { data: eventTypes } = useAdminEventTypes();
  const cancelBooking = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (booking: Booking) => {
    setCancellingId(booking.id);
    cancelBooking.mutate(booking.id, {
      onSuccess: () => {
        toast.success('Бронирование отменено');
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, 'Не удалось отменить бронирование'));
      },
      onSettled: () => {
        setCancellingId(null);
      },
    });
  };

  const resetFilters = () => {
    setEventTypeId('');
    setFrom('');
    setTo('');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          Бронирования
        </h1>
      </div>

      {/* Фильтры */}
      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-ink-500">
            Тип события
          </label>
          <select
            value={eventTypeId}
            onChange={(e) => setEventTypeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          >
            <option value="">Все</option>
            {eventTypes?.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500">С даты</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500">По дату</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-50"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="mt-6">
        {isLoading && (
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        )}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {getErrorMessage(error, 'Не удалось загрузить бронирования')}
          </div>
        )}
        {!isLoading && !isError && bookings && (
          <BookingTable
            bookings={bookings}
            onCancel={handleCancel}
            cancellingId={cancellingId}
          />
        )}
      </div>
    </div>
  );
}
