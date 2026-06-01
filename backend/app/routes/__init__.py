"""Blueprints приложения."""

from .admin_bookings import admin_bookings_bp
from .admin_event_types import admin_event_types_bp
from .guest_bookings import guest_bookings_bp
from .guest_event_types import guest_event_types_bp
from .guest_slots import guest_slots_bp

all_blueprints = (
    guest_event_types_bp,
    guest_slots_bp,
    guest_bookings_bp,
    admin_event_types_bp,
    admin_bookings_bp,
)

__all__ = ["all_blueprints"]
