import { addDays, parseISO, startOfDay } from 'date-fns';
import type { Slot } from '../types';

/** Рабочие часы по умолчанию (если у типа события не заданы), UTC */
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;

/** "HH:MM" -> {hours, minutes}; при ошибке — fallback */
function parseHHMM(
  value: string | undefined,
  fallbackHour: number,
): { hours: number; minutes: number } {
  if (value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return { hours: h, minutes: m };
  }
  return { hours: fallbackHour, minutes: 0 };
}

/** Размер окна бронирования (включая сегодня) */
export const BOOKING_WINDOW_DAYS = 14;

export interface GridSlot {
  /** Время начала (UTC) */
  start: Date;
  /** Время конца (UTC) */
  end: Date;
  /** Доступен ли слот для бронирования (вернул ли его API) */
  available: boolean;
  /** ISO-строка startTime для отправки на сервер */
  startTimeIso: string;
  /** Подпись «09:00 - 09:15» (UTC) */
  label: string;
}

/**
 * Ключ слота по UTC-времени начала (минутная точность).
 *
 * Backend генерирует рабочие часы в UTC, поэтому и сетка, и подписи слотов
 * строятся в UTC — иначе при таймзоне браузера ≠ UTC доступность «съезжает».
 */
function slotKeyUtc(date: Date): string {
  return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" в UTC
}

/** "HH:mm" по UTC-компонентам даты */
function formatUtcHm(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** UTC-полночь календарного дня, выбранного в (локальном) календаре */
function utcMidnightOf(day: Date): Date {
  return new Date(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0),
  );
}

/** "YYYY-MM-DD" по UTC-компонентам даты */
function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Генерирует полную сетку слотов для дня (в UTC) с шагом duration и помечает
 * available по списку слотов из API.
 *
 * API возвращает только available:true слоты — их startTime используем как
 * множество «свободных». Все прочие слоты сетки считаются занятыми.
 */
export function buildDayGrid(
  day: Date,
  durationMinutes: number,
  availableSlots: Slot[],
  workStartTime?: string,
  workEndTime?: string,
  available24h = false,
): GridSlot[] {
  const availableKeys = new Set(
    availableSlots
      .filter((slot) => slot.available)
      .map((slot) => slotKeyUtc(parseISO(slot.startTime))),
  );

  // Границы дня в UTC.
  const utcMidnight = utcMidnightOf(day);
  let dayStartMs: number;
  let dayEndMs: number;
  if (available24h) {
    dayStartMs = utcMidnight.getTime();
    dayEndMs = utcMidnight.getTime() + 24 * 60 * 60 * 1000;
  } else {
    const start = parseHHMM(workStartTime, WORK_START_HOUR);
    const end = parseHHMM(workEndTime, WORK_END_HOUR);
    dayStartMs =
      utcMidnight.getTime() + (start.hours * 60 + start.minutes) * 60 * 1000;
    dayEndMs =
      utcMidnight.getTime() + (end.hours * 60 + end.minutes) * 60 * 1000;
  }

  const stepMs = durationMinutes * 60 * 1000;
  const grid: GridSlot[] = [];
  let cursorMs = dayStartMs;

  while (cursorMs + stepMs <= dayEndMs) {
    const start = new Date(cursorMs);
    const end = new Date(cursorMs + stepMs);
    const available = availableKeys.has(slotKeyUtc(start));
    grid.push({
      start,
      end,
      available,
      startTimeIso: start.toISOString(),
      label: `${formatUtcHm(start)} - ${formatUtcHm(end)}`,
    });
    cursorMs += stepMs;
  }

  return grid;
}

/** Список дней окна бронирования начиная с сегодня */
export function buildBookingWindow(): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(today, i));
}

/** Входит ли день в окно [today, today + 14 days) */
export function isWithinBookingWindow(day: Date): boolean {
  const today = startOfDay(new Date());
  const last = addDays(today, BOOKING_WINDOW_DAYS - 1);
  const d = startOfDay(day);
  return d >= today && d <= last;
}

/**
 * Кол-во свободных слотов в дне (по списку из API), считается по UTC-дате
 * слота, согласованно с сеткой buildDayGrid.
 */
export function countAvailableForDay(slots: Slot[], day: Date): number {
  const key = utcDateKey(utcMidnightOf(day));
  return slots.filter(
    (slot) => slot.available && utcDateKey(parseISO(slot.startTime)) === key,
  ).length;
}

/** Формат даты для query-параметра API: YYYY-MM-DD (UTC-день календаря) */
export function toApiDate(day: Date): string {
  return utcDateKey(utcMidnightOf(day));
}
