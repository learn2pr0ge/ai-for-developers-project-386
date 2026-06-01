"""Точка входа: поднимает Flask-приложение.

Порт берётся из переменной окружения FLASK_PORT (по умолчанию 3000).
Хранилище — в памяти, после перезапуска данные сбрасываются.
"""

import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "3000"))
    app.run(host="0.0.0.0", port=port, debug=True)
