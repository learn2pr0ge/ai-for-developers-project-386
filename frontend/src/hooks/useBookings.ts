import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelBooking,
  createBooking,
  listAdminBookings,
  type AdminBookingFilters,
} from '../api/bookings';
import { slotKeys } from './useSlots';
import type { Booking, BookingInput } from '../types';

export const bookingKeys = {
  all: ['bookings'] as const,
  adminList: (filters: AdminBookingFilters) =>
    [...bookingKeys.all, 'admin-list', filters] as const,
};

/** Админский список бронирований с фильтрами */
export function useAdminBookings(filters: AdminBookingFilters) {
  return useQuery({
    queryKey: bookingKeys.adminList(filters),
    queryFn: () => listAdminBookings(filters),
  });
}

/** Создание бронирования гостем */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, BookingInput>({
    mutationFn: (input: BookingInput) => createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/** Отмена бронирования (админ) */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
    },
  });
}
