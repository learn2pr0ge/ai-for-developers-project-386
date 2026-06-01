import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

// ─────────────────────────────────────────────────────────────────────────────
// COMMON MODELS
// ─────────────────────────────────────────────────────────────────────────────

/** Стандартная ошибка */
model ErrorResponse {
  code: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN MODELS
// ─────────────────────────────────────────────────────────────────────────────

/** Тип события — шаблон встречи, создаётся владельцем */
model EventType {
  /** Уникальный slug, задаётся владельцем вручную */
  id: string;

  /** Отображаемое название */
  @minLength(1)
  name: string;

  /** Описание для гостя */
  description: string;

  /** Длительность в минутах */
  @minValue(1)
  duration: int32;

  /** Начало рабочего окна, "HH:MM" в UTC. Если не задано — "09:00". */
  workStartTime?: string;

  /** Конец рабочего окна, "HH:MM" в UTC. Если не задано — "18:00". */
  workEndTime?: string;

  /** Доступность круглосуточно (00:00–24:00). При true workStartTime/workEndTime игнорируются. Дефолт false. */
  available24h?: boolean;
}

/** Тело запроса для создания / обновления типа события */
model EventTypeInput {
  id: string;

  @minLength(1)
  name: string;

  description: string;

  @minValue(1)
  duration: int32;

  /** Начало рабочего окна, "HH:MM" в UTC. Если не задано — "09:00". */
  workStartTime?: string;

  /** Конец рабочего окна, "HH:MM" в UTC. Если не задано — "18:00". */
  workEndTime?: string;

  /** Доступность круглосуточно (00:00–24:00). При true workStartTime/workEndTime игнорируются. Дефолт false. */
  available24h?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

@service({
  title: "Calendar Booking API",
  version: "1.0.0",
})
@server("https://api.example.com", "Production")
namespace CalendarBooking {

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES — доступны гостям
  // ───────────────────────────────────────────────────────────────────────────

  @tag("Guest — Event Types")
  @route("/event-types")
  namespace GuestEventTypes {

    /** Получить список всех типов событий */
    @get
    @doc("Возвращает все доступные типы событий для бронирования")
    op listEventTypes(): {
      @statusCode statusCode: 200;
      @body body: EventType[];
    };

    /** Получить тип события по id */
    @get
    @route("/{eventTypeId}")
    @doc("Возвращает один тип события по его slug-идентификатору")
    op getEventType(@path eventTypeId: string): {
      @statusCode statusCode: 200;
      @body body: EventType;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };

    /** Получить доступные слоты для типа события */
    @get
    @route("/{eventTypeId}/slots")
    @doc("""
      Возвращает свободные слоты для выбранного типа события.
      Слоты генерируются в окне [today, today + 14 days).
      Шаг между слотами равен duration типа события.
      Возвращаются только слоты с available = true.
    """)
    op listSlots(
      @path eventTypeId: string,

      /** Фильтрация по дате (YYYY-MM-DD). Если не указана, возвращает всё окно. */
      @query date?: plainDate,
    ): {
      @statusCode statusCode: 200;
      @body body: Slot[];
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };
  }

  @tag("Guest — Bookings")
  @route("/bookings")
  namespace GuestBookings {

    /** Создать бронирование */
    @post
    @doc("""
      Создаёт новое бронирование на выбранный слот.
      Возвращает 409 при конфликте времени.
      Возвращает 422, если startTime вне допустимого окна 14 дней.
    """)
    op createBooking(@body body: BookingInput): {
      @statusCode statusCode: 201;
      @body booking: Booking;
    } | {
      /** Временной слот уже занят */
      @statusCode statusCode: 409;
      @body body: ErrorResponse;
    } | {
      /** Ошибка валидации (напр. startTime вне окна) */
      @statusCode statusCode: 422;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES — используются владельцем (без аутентификации, отдельный префикс)
  // ───────────────────────────────────────────────────────────────────────────

  @tag("Admin — Event Types")
  @route("/admin/event-types")
  namespace AdminEventTypes {

    /** Получить все типы событий (админ) */
    @get
    @doc("Возвращает список всех типов событий")
    op listEventTypes(): {
      @statusCode statusCode: 200;
      @body body: EventType[];
    };

    /** Создать тип события */
    @post
    @doc("Создаёт новый тип события. id задаётся владельцем вручную.")
    op createEventType(@body body: EventTypeInput): {
      @statusCode statusCode: 201;
      @body body: EventType;
    } | {
      /** id уже занят */
      @statusCode statusCode: 409;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 422;
      @body body: ErrorResponse;
    };

    /** Получить тип события по id (админ) */
    @get
    @route("/{eventTypeId}")
    op getEventType(@path eventTypeId: string): {
      @statusCode statusCode: 200;
      @body body: EventType;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };

    /** Обновить тип события */
    @put
    @route("/{eventTypeId}")
    @doc("Полное обновление типа события (replace). id в пути приоритетен.")
    op updateEventType(
      @path eventTypeId: string,
      @body body: EventTypeInput,
    ): {
      @statusCode statusCode: 200;
      @body body: EventType;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 422;
      @body body: ErrorResponse;
    };

    /** Удалить тип события */
    @delete
    @route("/{eventTypeId}")
    @doc("Удаляет тип события. Нельзя удалить тип, у которого есть предстоящие бронирования.")
    op deleteEventType(@path eventTypeId: string): {
      @statusCode statusCode: 204;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    } | {
      /** Есть активные бронирования */
      @statusCode statusCode: 409;
      @body body: ErrorResponse;
    };
  }

  @tag("Admin — Bookings")
  @route("/admin/bookings")
  namespace AdminBookings {

    /** Получить все предстоящие бронирования */
    @get
    @doc("""
      Возвращает все бронирования всех типов событий в хронологическом порядке.
      Опционально фильтруются по типу события или диапазону дат.
    """)
    op listBookings(
      /** Фильтр по типу события */
      @query eventTypeId?: string,

      /** Начало диапазона дат (включительно) */
      @query from?: plainDate,

      /** Конец диапазона дат (включительно) */
      @query to?: plainDate,
    ): {
      @statusCode statusCode: 200;
      @body body: Booking[];
    };

    /** Получить бронирование по id (админ) */
    @get
    @route("/{bookingId}")
    op getBooking(@path bookingId: string): {
      @statusCode statusCode: 200;
      @body body: Booking;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };

    /** Отменить бронирование */
    @delete
    @route("/{bookingId}")
    @doc("Удаляет (отменяет) бронирование, освобождая слот.")
    op cancelBooking(@path bookingId: string): {
      @statusCode statusCode: 204;
    } | {
      @statusCode statusCode: 404;
      @body body: ErrorResponse;
    };
  }
}