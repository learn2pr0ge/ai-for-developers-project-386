// TypeScript-интерфейсы по моделям из TypeSpec (api.tsp)

/** Тип события — шаблон встречи, создаётся владельцем */
export interface EventType {
  /** Уникальный slug, задаётся владельцем вручную */
  id: string;
  /** Отображаемое название */
  name: string;
  /** Описание для гостя */
  description: string;
  /** Длительность в минутах */
  duration: number;
  /** Начало рабочего окна, "HH:MM" UTC (дефолт "09:00") */
  workStartTime?: string;
  /** Конец рабочего окна, "HH:MM" UTC (дефолт "18:00") */
  workEndTime?: string;
  /** Доступность круглосуточно. При true рабочие часы игнорируются. */
  available24h?: boolean;
}

/** Тело запроса для создания / обновления типа события */
export interface EventTypeInput {
  id: string;
  name: string;
  description: string;
  duration: number;
  /** Начало рабочего окна, "HH:MM" UTC (дефолт "09:00") */
  workStartTime?: string;
  /** Конец рабочего окна, "HH:MM" UTC (дефолт "18:00") */
  workEndTime?: string;
  /** Доступность круглосуточно. При true рабочие часы игнорируются. */
  available24h?: boolean;
}

/** Свободный временной слот (вычисляется динамически) */
export interface Slot {
  startTime: string; // utcDateTime (ISO 8601)
  endTime: string; // utcDateTime (ISO 8601)
  available: boolean;
}

/** Бронирование, созданное гостем */
export interface Booking {
  /** UUID, генерируется сервером */
  id: string;
  /** Ссылка на EventType.id */
  eventTypeId: string;
  /** Краткая информация о типе события (денормализация) */
  eventTypeName: string;
  eventTypeDuration: number;
  guestName: string;
  guestEmail: string;
  startTime: string; // utcDateTime
  endTime: string; // utcDateTime
  createdAt: string; // utcDateTime
}

/** Тело запроса для создания бронирования (гость) */
export interface BookingInput {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  /** Должен быть в пределах [now, now + 14 days) */
  startTime: string; // utcDateTime
}

/** Стандартная ошибка */
export interface ErrorResponse {
  code: string;
  message: string;
}
