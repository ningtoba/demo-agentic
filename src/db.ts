import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  due_date?: string | null;
}

export interface Stats {
  total: number;
  completed: number;
  by_priority: { low: number; medium: number; high: number };
}

mkdirSync("./data", { recursive: true });
const dbPath = "./data/tasks.sqlite";
const db = new Database(dbPath, { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    title: row.title as string,
    description: row.description as string,
    priority: row.priority as "low" | "medium" | "high",
    completed: (row.completed as number) === 1,
    due_date: (row.due_date as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

const getAllTasks = (): Task[] =>
  db
    .query("SELECT * FROM tasks ORDER BY created_at DESC")
    .all()
    .map(rowToTask);

const getTaskById = (id: number): Task | undefined => {
  const row = db
    .query("SELECT * FROM tasks WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToTask(row) : undefined;
};

const createTask = (input: TaskInput): Task => {
  const now = new Date().toISOString();
  const stmt = db.query(
    `INSERT INTO tasks (title, description, priority, due_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  stmt.run(
    input.title,
    input.description ?? "",
    input.priority ?? "medium",
    input.due_date ?? null,
    now,
    now
  );
  const row = db
    .query("SELECT * FROM tasks WHERE id = last_insert_rowid()")
    .get() as Record<string, unknown>;
  return rowToTask(row);
};

const updateTask = (id: number, data: TaskUpdate): Task | undefined => {
  const existing = getTaskById(id);
  if (!existing) return undefined;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.priority !== undefined) {
    fields.push("priority = ?");
    values.push(data.priority);
  }
  if (data.completed !== undefined) {
    fields.push("completed = ?");
    values.push(data.completed ? 1 : 0);
  }
  if (data.due_date !== undefined) {
    fields.push("due_date = ?");
    values.push(data.due_date);
  }

  if (fields.length === 0) return existing;

  const now = new Date().toISOString();
  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  db.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getTaskById(id);
};

const deleteTask = (id: number): boolean => {
  const stmt = db.query("DELETE FROM tasks WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
};

const getStats = (): Stats => {
  const totalRow = db.query("SELECT COUNT(*) as count FROM tasks").get() as {
    count: number;
  };
  const completedRow = db
    .query("SELECT COUNT(*) as count FROM tasks WHERE completed = 1")
    .get() as { count: number };

  const priorityRows = db
    .query(
      "SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority"
    )
    .all() as { priority: string; count: number }[];

  const by_priority = { low: 0, medium: 0, high: 0 };
  for (const row of priorityRows) {
    by_priority[row.priority as "low" | "medium" | "high"] = row.count;
  }

  return {
    total: totalRow.count,
    completed: completedRow.count,
    by_priority,
  };
};

export {
  db,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
};
