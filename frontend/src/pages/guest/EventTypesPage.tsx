import { useEventTypes } from '../../hooks/useEventTypes';
import { EventTypeCard } from '../../components/EventTypeCard';
import { getErrorMessage } from '../../lib/format';

export function EventTypesPage() {
  const { data: eventTypes, isLoading, isError, error } = useEventTypes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Шапка */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
          Выберите тип события
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
        </p>
      </div>

      {/* Содержимое */}
      <div className="mt-6">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {getErrorMessage(error, 'Не удалось загрузить типы событий')}
          </div>
        )}

        {!isLoading && !isError && eventTypes && eventTypes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-ink-500">
            Пока нет доступных типов событий.
          </div>
        )}

        {!isLoading && !isError && eventTypes && eventTypes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {eventTypes.map((eventType) => (
              <EventTypeCard key={eventType.id} eventType={eventType} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
