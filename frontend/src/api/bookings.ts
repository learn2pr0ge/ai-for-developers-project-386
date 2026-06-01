import { apiClient } from './client';
import type { Booking, BookingInput } from '../types';

export interface AdminBookingFilters {
  eventTypeId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/** POST /bookings — создать бронирование (гость) */
export async function createBooking(input: BookingInput): Promise<Booking> {
  const { data } = await apiClient.post<Booking>('/bookings', input);
  return data;
}

/** GET /admin/bookings — все бронирования с опциональными фильтрами */
export async function listAdminBookings(
  filters: AdminBookingFilters = {},
): Promise<Booking[]> {
  const params: Record<string, string> = {};
  if (filters.eventTypeId) params.eventTypeId = filters.eventTypeId;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  const { data } = await apiClient.get<Booking[]>('/admin/bookings', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data;
}

/** DELETE /admin/bookings/:id — отменить бронирование */
export async function cancelBooking(bookingId: string): Promise<void> {
  await apiClient.delete(`/admin/bookings/${encodeURIComponent(bookingId)}`);
}
