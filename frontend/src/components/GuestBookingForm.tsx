import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  guestName: z.string().trim().min(1, 'Укажите имя'),
  guestEmail: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
});

export type GuestBookingFormValues = z.infer<typeof schema>;

interface GuestBookingFormProps {
  onSubmit: (values: GuestBookingFormValues) => void;
  isSubmitting: boolean;
  /** Inline-ошибка с сервера (напр. 422) */
  serverError?: string | null;
}

export function GuestBookingForm({
  onSubmit,
  isSubmitting,
  serverError,
}: GuestBookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestBookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guestName: '', guestEmail: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 space-y-4 border-t border-slate-200 pt-4"
    >
      <div>
        <label
          htmlFor="guestName"
          className="block text-sm font-medium text-ink-700"
        >
          Имя гостя
        </label>
        <input
          id="guestName"
          type="text"
          autoComplete="name"
          {...register('guestName')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          placeholder="Иван Иванов"
        />
        {errors.guestName && (
          <p className="mt-1 text-xs text-red-600">{errors.guestName.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="guestEmail"
          className="block text-sm font-medium text-ink-700"
        >
          Email
        </label>
        <input
          id="guestEmail"
          type="email"
          autoComplete="email"
          {...register('guestEmail')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          placeholder="ivan@example.com"
        />
        {errors.guestEmail && (
          <p className="mt-1 text-xs text-red-600">{errors.guestEmail.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Бронируем…' : 'Подтвердить бронирование'}
      </button>
    </form>
  );
}
