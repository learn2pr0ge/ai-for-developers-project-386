import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { EventType, EventTypeInput } from '../types';

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "HH:MM" -> минуты от полуночи */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const schema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, 'ID обязателен')
      .regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры и дефис'),
    name: z.string().trim().min(1, 'Название обязательно'),
    description: z.string(),
    duration: z
      .coerce.number({ invalid_type_error: 'Укажите число' })
      .int('Должно быть целым числом')
      .min(1, 'Минимум 1 минута'),
    available24h: z.boolean(),
    workStartTime: z.string(),
    workEndTime: z.string(),
  })
  // Часы валидируем только когда НЕ круглосуточно.
  .superRefine((v, ctx) => {
    if (v.available24h) return;

    if (!HHMM_RE.test(v.workStartTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['workStartTime'],
        message: 'Формат HH:MM',
      });
    }
    if (!HHMM_RE.test(v.workEndTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['workEndTime'],
        message: 'Формат HH:MM',
      });
    }
    if (!HHMM_RE.test(v.workStartTime) || !HHMM_RE.test(v.workEndTime)) return;

    if (toMinutes(v.workStartTime) >= toMinutes(v.workEndTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['workEndTime'],
        message: 'Время окончания должно быть позже начала',
      });
      return;
    }
    if (toMinutes(v.workEndTime) - toMinutes(v.workStartTime) < v.duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['workEndTime'],
        message: 'Интервал должен вмещать хотя бы один слот',
      });
    }
  });

export type EventTypeFormValues = z.infer<typeof schema>;

interface EventTypeFormProps {
  /** Если передан — режим редактирования (id заблокирован) */
  initial?: EventType;
  onSubmit: (values: EventTypeInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Серверная ошибка для поля id (напр. 409 «ID уже существует») */
  idError?: string | null;
}

export function EventTypeForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  idError,
}: EventTypeFormProps) {
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EventTypeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initial?.id ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      duration: initial?.duration ?? 30,
      available24h: initial?.available24h ?? false,
      workStartTime: initial?.workStartTime ?? '09:00',
      workEndTime: initial?.workEndTime ?? '18:00',
    },
  });

  const available24h = watch('available24h');

  // Прокидываем серверную ошибку 409 на поле id.
  useEffect(() => {
    if (idError) {
      setError('id', { type: 'server', message: idError });
    }
  }, [idError, setError]);

  const submit = (values: EventTypeFormValues) => {
    onSubmit({
      id: values.id,
      name: values.name,
      description: values.description,
      duration: values.duration,
      available24h: values.available24h,
      // В режиме 24ч часы не отправляем — backend подставит дефолты.
      ...(values.available24h
        ? {}
        : {
            workStartTime: values.workStartTime,
            workEndTime: values.workEndTime,
          }),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-ink-700">
          ID (slug)
        </label>
        <input
          id="id"
          type="text"
          disabled={isEdit}
          {...register('id')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="meeting-30"
        />
        {errors.id && (
          <p className="mt-1 text-xs text-red-600">{errors.id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink-700">
          Название
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          placeholder="Встреча 30 минут"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-ink-700"
        >
          Описание
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          placeholder="Базовый тип события для бронирования."
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-ink-700"
        >
          Длительность (мин)
        </label>
        <input
          id="duration"
          type="number"
          min={1}
          step={1}
          {...register('duration')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        {errors.duration && (
          <p className="mt-1 text-xs text-red-600">{errors.duration.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-3">
        <input
          id="available24h"
          type="checkbox"
          {...register('available24h')}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
        />
        <label htmlFor="available24h" className="text-sm text-ink-700">
          <span className="font-medium">Доступно круглосуточно</span>
          <span className="mt-0.5 block text-xs text-ink-400">
            Слоты строятся 24 часа в сутки; выбор рабочих часов недоступен.
          </span>
        </label>
      </div>

      {!available24h && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="workStartTime"
              className="block text-sm font-medium text-ink-700"
            >
              Доступно с (UTC)
            </label>
            <input
              id="workStartTime"
              type="text"
              inputMode="numeric"
              placeholder="09:00"
              maxLength={5}
              {...register('workStartTime')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
            {errors.workStartTime && (
              <p className="mt-1 text-xs text-red-600">
                {errors.workStartTime.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="workEndTime"
              className="block text-sm font-medium text-ink-700"
            >
              Доступно до (UTC)
            </label>
            <input
              id="workEndTime"
              type="text"
              inputMode="numeric"
              placeholder="18:00"
              maxLength={5}
              {...register('workEndTime')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
            {errors.workEndTime && (
              <p className="mt-1 text-xs text-red-600">
                {errors.workEndTime.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-slate-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
