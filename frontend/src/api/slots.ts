import { apiClient } from './client';
import type { Slot } from '../types';

/**
 * GET /event-types/:eventTypeId/slots?date=YYYY-MM-DD
 * Возвращает только available:true слоты в окне [today, today + 14 days).
 */
export async function listSlots(
  eventTypeId: string,
  date?: string,
): Promise<Slot[]> {
  const { data } = await apiClient.get<Slot[]>(
    `/event-types/${encodeURIComponent(eventTypeId)}/slots`,
    {
      params: date ? { date } : undefined,
    },
  );
  return data;
}
