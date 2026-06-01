import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useAdminEventTypes,
  useCreateEventType,
  useDeleteEventType,
  useUpdateEventType,
} from '../../hooks/useEventTypes';
import { useAdminBookings } from '../../hooks/useBookings';
import { EventTypeForm } from '../../components/EventTypeForm';
import { Modal } from '../../components/Modal';
import { formatDuration, getErrorMessage } from '../../lib/format';
import { ApiError } from '../../api/client';
import type { EventType, EventTypeInput } from '../../types';

export function AdminEventTypesPage() {
  const { data: eventTypes, isLoading, isError, error } = useAdminEventTypes();
  // Все бронирования — чтобы понять, у каких типов есть предстоящие записи.
  const { data: bookings } = useAdminBookings({});

  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();
  const deleteEventType = useDeleteEventType();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const bookedEventTypeIds = useMemo(() => {
    const set = new Set<string>();
    bookings?.forEach((b) => set.add(b.eventTypeId));
    return set;
  }, [bookings]);

  const openCreate = () => {
    setEditing(null);
    setIdError(null);
    setModalOpen(true);
  };

  const openEdit = (eventType: EventType) => {
    setEditing(eventType);
    setIdError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setIdError(null);
  };

  const handleSubmit = (values: EventTypeInput) => {
    setIdError(null);

    if (editing) {
      updateEventType.mutate(
        { id: editing.id, input: values },
        {
          onSuccess: () => {
            toast.success('Тип события обновлён');
            closeModal();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, 'Не удалось обновить тип события'));
          },
        },
      );
    } else {
      createEventType.mutate(values, {
        onSuccess: () => {
          toast.success('Тип события создан');
          closeModal();
        },
        onError: (err) => {
          const status = err instanceof ApiError ? err.status : undefined;
          if (status === 409) {
            setIdError('ID уже существует');
          } else {
            toast.error(getErrorMessage(err, 'Не удалось создать тип события'));
          }
        },
      });
    }
  };

  const handleDelete = (eventType: EventType) => {
    if (bookedEventTypeIds.has(eventType.id)) return;
    setDeletingId(eventType.id);
    deleteEventType.mutate(eventType.id, {
      onSuccess: () => {
        toast.success('Тип события удалён');
      },
      onError: (err) => {
        const status = err instanceof ApiError ? err.status : undefined;
        if (status === 409) {
          toast.error('Нельзя удалить: есть предстоящие бронирования');
        } else {
          toast.error(getErrorMessage(err, 'Не удалось удалить тип события'));
        }
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          Типы событий
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Новый тип события
        </button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        )}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {getErrorMessage(error, 'Не удалось загрузить типы событий')}
          </div>
        )}
        {!isLoading && !isError && eventTypes && eventTypes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-ink-500">
            Типов событий пока нет.
          </div>
        )}
        {!isLoading && !isError && eventTypes && eventTypes.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Название</th>
                    <th className="px-4 py-3 font-semibold">Описание</th>
                    <th className="px-4 py-3 font-semibold">Длительность</th>
                    <th className="px-4 py-3 font-semibold">Часы (UTC)</th>
                    <th className="px-4 py-3 text-right font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventTypes.map((et) => {
                    const hasBookings = bookedEventTypeIds.has(et.id);
                    return (
                      <tr key={et.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-xs text-ink-500">
                          {et.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink-900">
                          {et.name}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-ink-500">
                          <span className="line-clamp-1">{et.description}</span>
                        </td>
                        <td className="px-4 py-3 text-ink-700">
                          {formatDuration(et.duration)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-500">
                          {et.available24h
                            ? '24 часа'
                            : `${et.workStartTime ?? '09:00'}–${et.workEndTime ?? '18:00'}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(et)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-slate-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Редактировать
                            </button>
                            <span
                              title={
                                hasBookings
                                  ? 'Нельзя удалить: есть предстоящие бронирования'
                                  : undefined
                              }
                            >
                              <button
                                type="button"
                                onClick={() => handleDelete(et)}
                                disabled={hasBookings || deletingId === et.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-ink-400 disabled:hover:bg-transparent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Удалить
                              </button>
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editing ? 'Редактировать тип события' : 'Новый тип события'}
      >
        <EventTypeForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={createEventType.isPending || updateEventType.isPending}
          idError={idError}
        />
      </Modal>
    </div>
  );
}
