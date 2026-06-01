import { useNavigate } from 'react-router-dom';
import type { EventType } from '../types';
import { formatDuration } from '../lib/format';

interface EventTypeCardProps {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  const navigate = useNavigate();

  const open = () => navigate(`/book/${eventType.id}`);

  return (
    <button
      type="button"
      onClick={open}
      className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-ink-900 group-hover:text-brand-700">
          {eventType.name}
        </h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-ink-500">
          {formatDuration(eventType.duration)}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-500">{eventType.description}</p>
    </button>
  );
}
