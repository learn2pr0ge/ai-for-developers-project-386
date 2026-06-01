import { useQuery } from '@tanstack/react-query';
import { listSlots } from '../api/slots';

export const slotKeys = {
  all: ['slots'] as const,
  list: (eventTypeId: string, date: string) =>
    [...slotKeys.all, eventTypeId, date] as const,
};

/**
 * Доступные слоты для типа события на конкретную дату.
 * Бэкенд возвращает только available:true слоты.
 */
export function useSlots(eventTypeId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: slotKeys.list(eventTypeId ?? '', date ?? ''),
    queryFn: () => listSlots(eventTypeId as string, date),
    enabled: Boolean(eventTypeId) && Boolean(date),
  });
}
