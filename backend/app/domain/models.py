"""Доменные модели и их сериализация в JSON контракта (camelCase).

Хранилище держит данные как plain dict, но конструирование и
сериализация идут через dataclass-модели для единообразия.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from ..serialization import iso_z


@dataclass
class EventType:
    id: str
    name: str
    description: str
    duration: int  # минуты, >= 1
    work_start_time: str = "09:00"  # "HH:MM" UTC
    work_end_time: str = "18:00"  # "HH:MM" UTC
    available_24h: bool = False  # круглосуточно (00:00-24:00)


@dataclass
class Booking:
    id: str  # UUID
    event_type_id: str
    event_type_name: str
    event_type_duration: int
    guest_name: str
    guest_email: str
    start_time: datetime  # UTC-aware
    end_time: datetime  # UTC-aware
    created_at: datetime  # UTC-aware


def event_type_to_dict(et: dict) -> dict:
    """EventType (dict из store) -> JSON контракта."""
    return {
        "id": et["id"],
        "name": et["name"],
        "description": et["description"],
        "duration": et["duration"],
        "workStartTime": et.get("work_start_time", "09:00"),
        "workEndTime": et.get("work_end_time", "18:00"),
        "available24h": et.get("available_24h", False),
    }


def booking_to_dict(b: dict) -> dict:
    """Booking (dict из store) -> JSON контракта (camelCase, даты в Z)."""
    return {
        "id": b["id"],
        "eventTypeId": b["event_type_id"],
        "eventTypeName": b["event_type_name"],
        "eventTypeDuration": b["event_type_duration"],
        "guestName": b["guest_name"],
        "guestEmail": b["guest_email"],
        "startTime": iso_z(b["start_time"]),
        "endTime": iso_z(b["end_time"]),
        "createdAt": iso_z(b["created_at"]),
    }
