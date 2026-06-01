import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { isWithinBookingWindow } from '../lib/slots';

interface DateStripProps {
  selectedDate: Date | null;
  onSelect: (day: Date) => void;
  /** Кол-во свободных слотов по ключу YYYY-MM-DD */
  freeCounts: Record<string, number>;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Месячный календарь (Пн–Вс) с подсказками «N св.» и навигацией по месяцам.
 * Выбираемы только дни внутри 14-дневного окна бронирования.
 */
export function DateStrip({ selectedDate, onSelect, freeCounts }: DateStripProps) {
  const [viewMonth, setViewMonth] = useState<Date>(
    startOfMonth(selectedDate ?? new Date()),
  );

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">Календарь</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Предыдущий месяц"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-500 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Следующий месяц"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-500 transition-colors hover:bg-slate-50"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-500">
        {format(viewMonth, 'LLLL yyyy', { locale: ru })} г.
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase text-ink-400">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const selectable = isWithinBookingWindow(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const key = format(day, 'yyyy-MM-dd');
          const free = freeCounts[key];

          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelect(day)}
              className={[
                'flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors',
                !inMonth ? 'opacity-40' : '',
                isSelected
                  ? 'bg-brand-50 font-bold text-ink-900 ring-1 ring-brand-300'
                  : selectable
                    ? 'bg-slate-50 text-ink-900 hover:bg-slate-100'
                    : 'cursor-not-allowed bg-transparent text-ink-400',
              ].join(' ')}
            >
              <span>{format(day, 'd')}</span>
              {selectable && typeof free === 'number' && (
                <span className="mt-0.5 text-[10px] font-medium text-ink-400">
                  {free} св.
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
