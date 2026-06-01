"""Фабрика приложения: CORS, blueprints, обработчики ошибок, seed."""

from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from . import store
from .errors import register_error_handlers
from .routes import all_blueprints


def create_app() -> Flask:
    app = Flask(__name__)

    # CORS для отдельного фронтенд-клиента (dev — все origins).
    CORS(app)

    register_error_handlers(app)

    for bp in all_blueprints:
        app.register_blueprint(bp)

    # Стартовые данные в памяти.
    store.seed()

    return app
