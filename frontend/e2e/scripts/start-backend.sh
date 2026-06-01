#!/usr/bin/env bash
# Поднимает Flask-бэкенд для e2e-тестов с авто-установкой зависимостей.
#
# Идемпотентно:
#   1. создаёт backend/.venv, если его нет;
#   2. ставит зависимости из requirements.txt (быстро, если уже стоят);
#   3. запускает run.py на FLASK_PORT (по умолчанию 3000).
#
# Вызывается из frontend/playwright.config.ts через webServer.

set -euo pipefail

# Каталог этого скрипта -> репозиторий: frontend/e2e/scripts -> корень.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"

PORT="${FLASK_PORT:-3000}"
VENV_DIR="${BACKEND_DIR}/.venv"
PY="${VENV_DIR}/bin/python"

cd "${BACKEND_DIR}"

# 1. venv
if [ ! -x "${PY}" ]; then
  echo "[e2e] Создаю virtualenv в ${VENV_DIR}"
  python3 -m venv "${VENV_DIR}"
fi

# 2. зависимости (pip быстро пропускает уже установленные)
echo "[e2e] Устанавливаю backend-зависимости"
"${PY}" -m pip install --quiet --disable-pip-version-check -r requirements.txt

# 3. запуск
echo "[e2e] Запускаю Flask на :${PORT}"
exec env FLASK_PORT="${PORT}" "${PY}" run.py
