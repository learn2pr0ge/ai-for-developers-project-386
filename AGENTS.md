# AGENTS.md

Инструкции для AI-агентов, работающих в этом репозитории.

## О проекте

Calendar Booking — учебный fullstack-проект (бронирование встреч по слотам,
в стиле Calendly). Подход **contract-first**: единый источник истины — `api.tsp`.
Состоит из частей:

- `api.tsp` — контракт REST API на TypeSpec (модели + эндпоинты). Источник истины.
- `mock/` — генерация OpenAPI из контракта + mock-сервер на Prism (`:4010`).
- `backend/` — реальный бэкенд на Flask (Python 3.11+), хранилище в памяти (`:3000`).
- `frontend/` — React 18 + TypeScript + Vite + TailwindCSS SPA (dev на `:5173`).
- `node_modules` (в корне) — симлинк на `mock/node_modules`, нужен компилятору
  TypeSpec для резолва импортов `@typespec/*`. Не трогать.

Фронтенд может работать как против `mock/` (`:4010`), так и против `backend/`
(`:3000`) — адрес задаётся в `frontend/.env` (`VITE_API_URL`).

## Команды

Mock-сервер:

```bash
cd mock && npm install
npm run dev      # gen + поднять Prism на :4010
npm run gen      # api.tsp -> mock/generated/@typespec/openapi3/openapi.yaml
npm run mock     # Prism на :4010 (--dynamic --cors)
```

Backend (Flask, данные в памяти, сбрасываются при перезапуске):

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
FLASK_PORT=3000 .venv/bin/python run.py   # API на :3000, CORS включён
```

Frontend:

```bash
cd frontend && npm install
npm run dev      # Vite dev-сервер на :5173
npm run build    # tsc -b && vite build
npm run preview
```

Порядок запуска: поднять API (mock `:4010` **или** backend `:3000`), затем
frontend. Адрес API берётся из `frontend/.env` → `VITE_API_URL`.

## Архитектура и поток данных

`api.tsp` → эмиттер `@typespec/openapi3` → `mock/generated/.../openapi.yaml` → Prism.

Frontend: `src/api/` (axios-запросы) → `src/hooks/` (react-query) →
`src/pages/` / `src/components/`. Два флоу:

- Гостевой: `/`, `/event-types`, `/book/:eventTypeId`, `/booking-success`.
- Админский: `/admin/*` (bookings, event-types).

Backend (Flask): `app/__init__.py` (`create_app`, CORS, blueprints, error
handlers) → `app/routes/` (по группам контракта) → `app/domain/` (модели,
`slots.py` — генерация слотов/конфликты) → `app/store.py` (in-memory dict +
seed). Ошибки — через `ApiError` (`app/errors.py`) в формате `ErrorResponse`
(`{code, message}`). Даты — UTC-aware, в JSON отдаются ISO 8601 с суффиксом `Z`.
Рабочие часы слотов и окно бронирования — в UTC (см. `app/domain/slots.py`).

## Конвенции стека

- Данные с сервера — только через `@tanstack/react-query` hooks в `src/hooks/`;
  сами запросы — в `src/api/`.
- HTTP — через `apiClient` (axios) из `src/api/client.ts`; ошибки нормализуются
  в `ApiError` (поля `status`, `code`).
- Формы — `react-hook-form` + `zod`. Даты — `date-fns`. UI — Tailwind.
  Тосты — `sonner`. Иконки — `lucide-react`.
- Не добавлять новые зависимости без необходимости.

## Правила для агентов

- **Синхронизация типов:** при изменении `api.tsp` обновлять
  `frontend/src/types/index.ts` и backend (`app/domain/`, сериализацию,
  валидацию). `types/` вручную зеркалит модели контракта — всё должно совпадать.
- **Не коммитить генерируемое:** `mock/generated/`, любые `node_modules`,
  корневой симлинк, `*.tsbuildinfo`, `.env`. Всё это в `.gitignore` — оставить так.
- **Соблюдать стек и стиль** (см. раздел выше).
- После правок фронтенда проверять сборкой: `cd frontend && npm run build`
  (включает `tsc -b`). Это единственная проверка — тестов и линтера в проекте нет.
- Mock работает в режиме `--dynamic`: данные случайны, состояние не сохраняется.
  Негативные статусы (`404/409/422`) тестируются заголовком `Prefer: code=<N>`.

## Заметки

- Аутентификации нет; админка отделена только префиксом `/admin`.
- Окно бронирования — 14 дней. Рабочие часы сетки слотов настраиваются на
  каждый тип события (`workStartTime`/`workEndTime`, формат `HH:MM`, дефолт
  09:00–18:00). Флаг `available24h` включает круглосуточный режим (00:00–24:00) —
  тогда часы игнорируются, а в форме скрывается их выбор. Backend считает время в
  **UTC** (`app/domain/slots.py`), фронтенд строит сетку по локальному времени
  браузера (`frontend/src/lib/slots.ts`) — при таймзоне браузера ≠ UTC отметки
  доступности могут визуально расходиться.
