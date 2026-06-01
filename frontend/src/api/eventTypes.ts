import { apiClient } from './client';
import type { EventType, EventTypeInput } from '../types';

/** GET /event-types — публичный список типов событий */
export async function listEventTypes(): Promise<EventType[]> {
  const { data } = await apiClient.get<EventType[]>('/event-types');
  return data;
}

/** GET /event-types/:id — один тип события (публичный) */
export async function getEventType(eventTypeId: string): Promise<EventType> {
  const { data } = await apiClient.get<EventType>(
    `/event-types/${encodeURIComponent(eventTypeId)}`,
  );
  return data;
}

/** GET /admin/event-types — список для админа */
export async function listAdminEventTypes(): Promise<EventType[]> {
  const { data } = await apiClient.get<EventType[]>('/admin/event-types');
  return data;
}

/** POST /admin/event-types — создать тип события */
export async function createEventType(input: EventTypeInput): Promise<EventType> {
  const { data } = await apiClient.post<EventType>('/admin/event-types', input);
  return data;
}

/** PUT /admin/event-types/:id — обновить тип события */
export async function updateEventType(
  eventTypeId: string,
  input: EventTypeInput,
): Promise<EventType> {
  const { data } = await apiClient.put<EventType>(
    `/admin/event-types/${encodeURIComponent(eventTypeId)}`,
    input,
  );
  return data;
}

/** DELETE /admin/event-types/:id — удалить тип события */
export async function deleteEventType(eventTypeId: string): Promise<void> {
  await apiClient.delete(`/admin/event-types/${encodeURIComponent(eventTypeId)}`);
}
