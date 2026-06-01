"""Работа с датами на границе API.

Все datetime внутри бэкенда — UTC-aware. В JSON отдаём ISO 8601 с
суффиксом `Z` (например, `2026-06-02T09:00:00Z`), как ожидает фронтенд.
"""

from __future__ import annotations

import re
from datetime import date, datetime, time, timezone

from .errors import unprocessable

_HHMM_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def iso_z(dt: datetime) -> str:
    """UTC-aware datetime -> ISO 8601 со суффиксом Z (секундная точность)."""
    dt_utc = dt.astimezone(timezone.utc).replace(microsecond=0)
    return dt_utc.isoformat().replace("+00:00", "Z")


def parse_iso_utc(value: object) -> datetime:
    """Парсит ISO 8601-строку в UTC-aware datetime.

    Принимает как суффикс `Z`, так и явное смещение (`+00:00`).
    Бросает 422 при некорректном формате.
    """
    if not isinstance(value, str) or not value:
        raise unprocessable("startTime обязателен и должен быть строкой ISO 8601")

    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        raise unprocessable(f"Некорректный формат даты-времени: {value!r}")

    if parsed.tzinfo is None:
        # Трактуем «наивное» время как UTC.
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def parse_hhmm(value: object, *, field: str) -> time:
    """Парсит строку "HH:MM" (00:00-23:59) в time. Ошибка -> 422."""
    if not isinstance(value, str) or not _HHMM_RE.match(value):
        raise unprocessable(f"{field} должен быть в формате HH:MM (00:00-23:59)")
    hours, minutes = value.split(":")
    return time(int(hours), int(minutes))


def parse_query_date(value: object) -> date | None:
    """Парсит query-параметр даты в формате YYYY-MM-DD. None если не задан."""
    if value is None or value == "":
        return None
    if not isinstance(value, str):
        raise unprocessable("Некорректный формат даты (ожидается YYYY-MM-DD)")
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise unprocessable(f"Некорректный формат даты: {value!r} (нужно YYYY-MM-DD)")
