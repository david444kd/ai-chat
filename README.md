# AI Chat — Платформа для общения с нейросетью

Полноценный чат с нейросетью: история диалогов, стриминг ответов токен за токеном, автогенерация заголовков и встроенное решение проблемы переполнения контекстного окна. Два отдельных приложения — Next.js фронтенд и Fastify/Bun бэкенд — связаны через SSE-стриминг.

---

## Что реализовано

- Список диалогов с группировкой по дате (Сегодня / Вчера / На этой неделе / Ранее)
- Автоопределение темы диалога: LLM генерирует заголовок ≤ 5 слов по первому сообщению
- Стриминг ответов нейросети в реальном времени через SSE — каждый токен появляется мгновенно
- Решение проблемы длинного чата: автоматическое суммирование истории при приближении к лимиту контекста
- Полный набор UI-состояний: skeleton-загрузка, thinking-индикатор, блокировка инпута, кнопка отмены стрима
- Адаптивный интерфейс — на мобильном сайдбар работает как overlay

---

## Стек технологий

### Frontend — Next.js

**Почему Next.js?**
App Router решил две практические задачи: встроенный API proxy через route handlers позволяет читать `anon_user_id` из HttpOnly cookie на сервере и инжектировать его в заголовок `x-user-id` — без отдельного auth-сервиса и без передачи идентификатора в клиентский код. Кроме того, route handler может форвардить SSE-поток от бэкенда в браузер через `ReadableStream`, сохраняя модель «данные приходят по мере генерации» (при условии корректных заголовков и отсутствия буферизации на уровне прокси/хостинга).

Для управления состоянием намеренно выбраны два инструмента с разными зонами ответственности: **React Query** — для серверного состояния (списки чатов, история сообщений, оптимистичные обновления), **Zustand** — для эфемерного состояния стрима (буфер токенов, статус соединения, AbortController). Это разделение держит компоненты простыми и предотвращает гонки состояний при быстром переключении между чатами.

Архитектура кода: **Feature-Sliced Design (FSD)** — `app / shared / entities / features / widgets`. Каждый слой импортирует только из нижележащих, что делает зависимости предсказуемыми и код — легко навигируемым.

| Зависимость | Назначение |
|---|---|
| Next.js 15 (App Router) | Routing, SSR, API proxy + SSE forwarding |
| TanStack React Query 5 | Серверное состояние, кеш, оптимистичные обновления |
| Zustand 5 | Эфемерное состояние стриминга (буфер, статус, AbortController) |
| Tailwind CSS 4 | Стилизация с oklch color tokens |
| Radix UI | Доступные UI-примитивы (dropdown, tooltip, scroll-area) |
| react-markdown | Рендеринг markdown в ответах ассистента |
| Biome | Линтинг и форматирование (вместо ESLint+Prettier) |

### Backend — Fastify + Bun + SQLite

Ключевая задача бэкенда — держать долгоживущие SSE-соединения и проксировать стриминг от OpenRouter к клиенту с минимальной латентностью. Именно этим продиктован выбор стека.

**Почему Bun?**
Bun — это рантайм и инструменты разработки в одном. Для этого проекта критично то, что в него встроен драйвер SQLite (`bun:sqlite`) — можно обойтись без отдельной СУБД и без нативных биндингов, оставаясь в модели «один сервис + один файл БД». Это снижает количество зависимостей и упрощает поставку (компактный Docker-образ, быстрый dev loop). Производительность и холодный старт зависят от окружения, но в рамках задачи «тонкий стриминговый сервис» Bun даёт очень комфортную скорость итераций.

**Почему Fastify?**
SSE требует аккуратного контроля над заголовками, временем жизни соединения и тем, как именно данные «проталкиваются» в сокет. Fastify удобен тем, что даёт прямой доступ к низкоуровневому ответу через `reply.raw`, а также имеет предсказуемый lifecycle и встроенную валидацию на JSON Schema. В итоге стриминг получается проще в сопровождении: меньше скрытых абстракций, меньше риск случайно «сломать» real-time UX при рефакторинге.

**Почему SQLite?**
Для чат-приложения с одним инстансом PostgreSQL — избыточен. SQLite с включённым WAL-режимом прекрасно справляется с конкурентными читателями и единственным писателем, которым является наш сервер. Нет отдельного процесса, нет сетевого оверхеда, нет миграционного сервиса — база живёт в одном файле, который монтируется через Docker volume. Это решение честно и прагматично для данного масштаба задачи.

| Зависимость | Назначение |
|---|---|
| Fastify 5 | HTTP-фреймворк с доступом к raw response для SSE |
| Bun runtime | JavaScript рантайм со встроенным SQLite-драйвером |
| bun:sqlite | Синхронный SQLite без нативных зависимостей |
| @fastify/cors | CORS |
| nanoid | Генерация коротких строковых ID |

---

## Архитектура

```
Browser
  │  (cookie: anon_user_id)
  ▼
Next.js App Router
  │  /api/[...path] → proxy → inject x-user-id header
  ▼
Fastify Backend                    OpenRouter API
  ├── GET  /api/chats              ← list user's chats
  ├── POST /api/chats              ← create chat
  ├── GET  /api/chats/:id          ← chat + messages
  ├── DELETE /api/chats/:id        ← delete chat
  ├── POST /api/chats/:id/generate-title
  └── POST /api/chats/:id/messages → SSE stream ──► LLM
         │
         ▼
      SQLite (WAL mode)
      ├── chats (id, user_id, title, created_at, updated_at)
      └── messages (id, chat_id, role, content, created_at)
```

### Анонимная идентификация пользователя

Авторизация не требуется по ТЗ, но изоляция данных между пользователями нужна. Решение: Next.js middleware при первом визите генерирует UUID и сохраняет его в HttpOnly cookie `anon_user_id`. При каждом запросе к бэкенду API proxy читает этот cookie на сервере и инжектирует его как заголовок `x-user-id`. Бэкенд проверяет заголовок и изолирует все данные по `user_id`. Cookie недоступна JS — CSRF не страшен, идентификатор не утекает в клиентский код.
Авторизация не требуется по ТЗ, но изоляция данных между пользователями нужна. Решение: Next.js middleware при первом визите генерирует UUID и сохраняет его в HttpOnly cookie `anon_user_id`. При каждом запросе к бэкенду API proxy читает этот cookie на сервере и инжектирует его как заголовок `x-user-id`. Бэкенд проверяет заголовок и изолирует все данные по `user_id`. HttpOnly означает, что идентификатор недоступен JavaScript (снижение риска утечки при XSS). Риски CSRF снижаются настройками cookie (`SameSite`) и тем, что state-changing запросы идут через same-origin proxy (и при необходимости легко дополняются проверкой `Origin/Referer`).

### Решение проблемы переполнения контекста

> Реализовано в `backend/src/services/context.ts`

Длинный чат — классическая проблема: контекстное окно модели конечно, а обрывать историю на полуслове нельзя. Применён подход **summarize-and-keep-tail**:

Перед каждым запросом к LLM функция `buildContext()` оценивает размер всей истории чата (эвристика: ~3 символа/токен). Если суммарный объём превышает **3 000 токенов**:

1. **Хвост** — последние 6 сообщений сохраняются полностью и передаются модели как есть.
2. **Голова** — все более ранние сообщения сжимаются в резюме из 3–5 предложений через отдельный (non-streaming) вызов LLM.
3. Резюме добавляется как `system`-сообщение в начало контекста перед хвостом.

Если суммирование по какой-то причине не удалось — продолжаем только с хвостом. Диалог никогда не обрывается, модель всегда получает актуальный контекст, а размер запроса остаётся предсказуемым.

### Стриминг SSE

```
Browser                Frontend Proxy           Backend              OpenRouter
  │── POST /messages ──► route.ts ─────────────► send.ts ────────────►│
  │                                              saves user msg        │
  │◄── text/event-stream ◄──── forwarded ◄────── SSE stream ◄─────────│
  │  data: {"type":"delta","content":"..."}
  │  data: {"type":"done","messageId":"..."}
  │  data: {"type":"error","message":"..."}
```

---

## База данных

```sql
CREATE TABLE chats (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL DEFAULT 'Новый чат',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE messages (
  id         TEXT PRIMARY KEY,
  chat_id    TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

Временные метки хранятся как Unix milliseconds (INTEGER). Включены WAL-режим и foreign keys.

---

## API Endpoints

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/api/chats` | Список чатов пользователя (сортировка: updated_at DESC) |
| `POST` | `/api/chats` | Создать пустой чат |
| `GET` | `/api/chats/:id` | Чат + все сообщения |
| `DELETE` | `/api/chats/:id` | Удалить чат (cascade) |
| `POST` | `/api/chats/:id/generate-title` | Сгенерировать заголовок чата |
| `POST` | `/api/chats/:id/messages` | Отправить сообщение (SSE stream) |
| `GET` | `/health` | Health check |

Все `/api/*` роуты требуют заголовок `x-user-id` (инжектируется прокси).

---

## Запуск локально

### Требования

- [Bun](https://bun.sh/) ≥ 1.3
- API-ключ от [OpenRouter](https://openrouter.ai/)

### Backend

```bash
cd backend
cp .env.example .env
# Вставьте OPENROUTER_API_KEY в .env
bun install
bun run dev
# Сервер запустится на http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# BACKEND_URL=http://localhost:3000 (по умолчанию)
bun install
bun run dev
# Приложение запустится на http://localhost:3001
```

---

## Запуск через Docker

### Backend

```bash
cd backend
docker build -t ai-chat-backend .
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=your_key \
  -e FRONTEND_URL=http://localhost:3001 \
  -v $(pwd)/data:/app/data \
  -e DB_PATH=/app/data/chat.db \
  ai-chat-backend
```

### Frontend (Vercel)

Фронтенд рассчитан на деплой на [Vercel](https://vercel.com/) — платформу, нативно поддерживающую Next.js. Достаточно импортировать репозиторий, задать переменную `BACKEND_URL` в настройках проекта и задеплоить одной кнопкой.

---

## Переменные окружения

### Backend (`backend/.env`)

| Переменная | Обязательная | Описание |
|---|---|---|
| `OPENROUTER_API_KEY` | Да | API-ключ OpenRouter |
| `LLM_MODEL` | Нет | Модель с суффиксом `:free` |
| `FRONTEND_URL` | Нет | CORS + HTTP-Referer |
| `PORT` | Нет | Порт сервера |
| `SYSTEM_PROMPT` | Нет | Системный промпт для LLM |
| `DB_PATH` | Нет | Путь к SQLite файлу |

### Frontend (`frontend/.env.local`)

| Переменная | Обязательная | Описание |
|---|---|---|
| `BACKEND_URL` | Нет | URL бэкенда (server-side only) |
| `NEXT_PUBLIC_API_URL` | Нет | URL API для браузера |
| `NEXT_PUBLIC_MODEL_NAME` | Нет | Название модели в хедере |

---

## UX-детали

### Состояния загрузки

- **Список чатов** — skeleton-заглушки при первой загрузке
- **Сообщения** — скелетон пары user+assistant при переходе в чат
- **Thinking** — анимированные три точки пока LLM не прислал первый токен
- **Стриминг** — блинкающий курсор в конце сообщения ассистента
- **Composer** — `textarea` и кнопка отправки заблокированы во время стрима; кнопка переключается в «стоп» (можно прервать генерацию)

### Другие детали

- Автоскролл вниз при получении новых токенов; останавливается, если пользователь прокрутил вверх >80px
- Удаление чата с оптимистичным обновлением (rollback при ошибке)
- Поиск по заголовкам чатов (client-side фильтрация)
- Группировка чатов в сайдбаре: Сегодня / Вчера / На этой неделе / Ранее
- Markdown-рендеринг в ответах ассистента
- Тёмная тема с oklch цветовыми токенами

---

## AI-инструменты в разработке

Весь проект написан с активным использованием **[Claude Code](https://claude.ai/code)** — терминального AI-ассистента от Anthropic, который работает непосредственно в рабочей директории проекта и может читать, писать и редактировать файлы.

Конкретные задачи, где Claude Code был задействован:

- Проектирование архитектуры: FSD-слои фронтенда, разбивка роутов и сервисов на бэкенде
- Реализация SSE-стриминга end-to-end: от `streamCompletion()` на бэкенде до парсера в `sse.ts` и Zustand-стора на фронтенде
- Логика `buildContext()` — суммирование истории чата для управления контекстным окном
- UI-состояния: skeleton loaders, thinking indicator, autoScroll с детекцией ручной прокрутки
- Итеративный рефакторинг и code review по ходу разработки

Claude Code позволил двигаться значительно быстрее без потери качества кода — особенно в тех местах, где требовалась точная стыковка между фронтендом и бэкендом (SSE-протокол, заголовки, формат событий).

---

## Структура репозитория

```
ai-chat/
├── backend/
│   ├── src/
│   │   ├── db/           # SQLite schema + singleton
│   │   ├── routes/       # chats/, messages/
│   │   ├── services/     # openrouter, context, messages, title, user
│   │   ├── types.ts
│   │   └── index.ts      # Fastify entry point
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/          # Next.js routes + API proxy
    │   ├── shared/       # API client, queries, store, hooks, ui
    │   ├── entities/     # chat, message
    │   ├── features/     # create-chat, search-chats, send-message, toggle-sidebar
    │   └── widgets/      # chat-layout, sidebar, chat-view
    ├── .env.example
    └── package.json
```
