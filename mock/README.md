# Mock API (Prism)

Эмулятор API по контракту `../api.tsp` для разработки и проверки фронтенда.

Пайплайн: `api.tsp` (TypeSpec) → `openapi.yaml` (эмиттер `@typespec/openapi3`) →
mock-сервер на [Prism](https://github.com/stoplightio/prism).

## Установка

```bash
cd mock
npm install
```

## Запуск

```bash
npm run dev      # сгенерировать OpenAPI и поднять mock на :4010
```

Отдельные шаги:

```bash
npm run gen      # api.tsp -> generated/@typespec/openapi3/openapi.yaml
npm run mock     # поднять Prism на :4010 (--dynamic --cors)
```

Сервер слушает `http://localhost:4010`. Фронтенд берёт адрес из
`frontend/.env` (`VITE_API_URL=http://localhost:4010`).

## Примеры

```bash
curl http://localhost:4010/event-types
curl "http://localhost:4010/event-types/intro/slots"

# Конкретный статус ответа — через заголовок Prefer:
curl -X POST http://localhost:4010/bookings \
  -H 'Content-Type: application/json' \
  -H 'Prefer: code=409' \
  -d '{"eventTypeId":"intro","guestName":"A","guestEmail":"a@b.c","startTime":"2026-06-02T09:00:00Z"}'
```

## Замечания

- Режим `--dynamic`: на каждый запрос Prism генерирует случайные данные по схеме
  (в т.ч. может добавлять лишние свойства). Состояние не сохраняется — созданные
  брони не запоминаются, слоты не вычисляются. Для проверки HTTP-слоя и верстки
  этого достаточно; для «живых» данных нужен полноценный бэкенд.
- Негативные статусы (`404/409/422`) проверяются заголовком `Prefer: code=<N>`.
- `gen` перед компиляцией создаёт симлинк `../node_modules -> mock/node_modules`
  (см. `scripts/link-modules.mjs`): компилятору TypeSpec он нужен, чтобы
  резолвить импорты `@typespec/*` из `api.tsp`, лежащего в корне репозитория.
  Симлинк заигнорен в корневом `.gitignore`.
