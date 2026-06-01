import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEventType,
  deleteEventType,
  getEventType,
  listAdminEventTypes,
  listEventTypes,
  updateEventType,
} from '../api/eventTypes';
import type { EventType, EventTypeInput } from '../types';

export const eventTypeKeys = {
  all: ['event-types'] as const,
  list: () => [...eventTypeKeys.all, 'list'] as const,
  adminList: () => [...eventTypeKeys.all, 'admin-list'] as const,
  detail: (id: string) => [...eventTypeKeys.all, 'detail', id] as const,
};

/** Публичный список типов событий */
export function useEventTypes() {
  return useQuery({
    queryKey: eventTypeKeys.list(),
    queryFn: listEventTypes,
  });
}

/** Один тип события (публичный) */
export function useEventType(eventTypeId: string | undefined) {
  return useQuery({
    queryKey: eventTypeKeys.detail(eventTypeId ?? ''),
    queryFn: () => getEventType(eventTypeId as string),
    enabled: Boolean(eventTypeId),
  });
}

/** Админский список типов событий */
export function useAdminEventTypes() {
  return useQuery({
    queryKey: eventTypeKeys.adminList(),
    queryFn: listAdminEventTypes,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EventTypeInput) => createEventType(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventTypeInput }) =>
      updateEventType(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}

export type { EventType };
