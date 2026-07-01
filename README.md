# 📋 Task Dashboard

A full-stack task management dashboard built with **Bun**, **Hono**, and **SQLite**. Features a dark-themed UI with real-time stats, CRUD operations, and priority-based task organization.

## Stack

| Layer       | Tech                                        |
|-------------|---------------------------------------------|
| Runtime     | [Bun](https://bun.sh)                       |
| Framework   | [Hono](https://hono.dev)                    |
| Database    | SQLite (via `bun:sqlite`)                  |
| Frontend    | Vanilla JS + CSS (dark theme, no framework) |

## Project Structure

```
├── src/
│   ├── server.ts          # Hono server + API routes
│   └── db.ts              # SQLite database layer
├── public/
│   └── index.html         # Single-page frontend dashboard
├── data/
│   └── tasks.sqlite       # SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2 or later

### Install

```bash
bun install
```

### Run (development with hot-reload)

```bash
bun run dev
```

The server starts on **http://localhost:3000**.

### Production

```bash
bun run start
```

## API Endpoints

| Method   | Path               | Description                     |
|----------|--------------------|---------------------------------|
| `GET`    | `/api/tasks`       | List all tasks (newest first)   |
| `POST`   | `/api/tasks`       | Create a new task               |
| `PATCH`  | `/api/tasks/:id`   | Update a task (partial)         |
| `DELETE` | `/api/tasks/:id`   | Delete a task                   |
| `GET`    | `/api/stats`       | Get aggregate task statistics   |

### Task Schema

```jsonc
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "medium",       // "low" | "medium" | "high"
  "completed": false,
  "due_date": "2026-07-15",   // ISO date string or null
  "created_at": "2026-07-01T10:00:00Z",
  "updated_at": "2026-07-01T10:00:00Z"
}
```

## Features

- **CRUD operations** — create, read, update, and delete tasks
- **Priority levels** — low (green), medium (amber), high (red)
- **Due dates** — tasks show overdue warnings when past their due date
- **Completion toggle** — check off tasks with a single click
- **Dashboard stats** — total tasks, completed count, and breakdown by priority
- **Dark theme** — modern gradient design with smooth animations
- **Responsive** — works on desktop and mobile

## Scripts

| Command               | Description                         |
|-----------------------|-------------------------------------|
| `bun run dev`         | Start dev server with hot-reload    |
| `bun run start`       | Start production server             |
| `bun run typecheck`   | Run TypeScript type checking        |
