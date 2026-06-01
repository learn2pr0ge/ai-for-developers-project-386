"""In-memory хранилище.

Глобальные словари живут в рамках процесса; после перезапуска данные
сбрасываются (это допустимо по требованиям). База данных не используется.
"""

from __future__ import annotations

from typing import Dict

# key = event_type["id"]
event_types: Dict[str, dict] = {}
# key = booking["id"] (UUID)
bookings: Dict[str, dict] = {}


SEED_EVENT_TYPES = [
    {
        "id": "intro-call",
        "name": "Вводный звонок",
        "description": "30-минутное знакомство",
        "duration": 30,
        "work_start_time": "09:00",
        "work_end_time": "18:00",
    },
    {
        "id": "consultation",
        "name": "Консультация",
        "description": "Подробное обсуждение задачи",
        "duration": 60,
        "work_start_time": "10:00",
        "work_end_time": "16:00",
    },
    {
        "id": "demo",
        "name": "Демонстрация",
        "description": "Показ продукта",
        "duration": 45,
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "available_24h": False,
    },
]


def seed() -> None:
    """Наполняет хранилище стартовыми данными (идемпотентно).

    Сидируются только типы событий; бронирования стартуют пустыми.
    """
    event_types.clear()
    bookings.clear()
    for et in SEED_EVENT_TYPES:
        event_types[et["id"]] = dict(et)
