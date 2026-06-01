import type { GridSlot } from '../lib/slots';

interface SlotGridProps {
  slots: GridSlot[];
  selectedIso: string | null;
  onSelect: (slot: GridSlot) => void;
  isLoading?: boolean;
}

/**
 * Список «Статус слотов»: кликабельные карточки свободных слотов,
 * недоступные (занятые) — серые и не кликабельны.
 */
export function SlotGrid({ slots, selectedIso, onSelect, isLoading }: SlotGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-ink-500">
        Нет слотов на этот день.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const isSelected = selectedIso === slot.startTimeIso;

        if (!slot.available) {
          return (
            <div
              key={slot.startTimeIso}
              aria-disabled
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-ink-400"
            >
              <span>{slot.label}</span>
              <span className="font-semibold">Занято</span>
            </div>
          );
        }

        return (
          <button
            key={slot.startTimeIso}
            type="button"
            onClick={() => onSelect(slot)}
            className={[
              'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors',
              isSelected
                ? 'border-brand-400 bg-brand-50 text-ink-900 ring-1 ring-brand-300'
                : 'border-slate-200 bg-white text-ink-900 hover:border-brand-300 hover:bg-brand-50/40',
            ].join(' ')}
          >
            <span>{slot.label}</span>
            <span className="font-semibold text-brand-600">Свободно</span>
          </button>
        );
      })}
    </div>
  );
}
