import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} from "./db.js";
import type { TaskInput, TaskUpdate } from "./db.js";

const app = new Hono();

app.use("*", cors());

app.get("/", serveStatic({ path: "./public/index.html" }));

app.use("/public/*", serveStatic({ root: "./" }));

app.get("/api/tasks", (c) => {
  const tasks = getAllTasks();
  return c.json({ tasks });
});

app.post("/api/tasks", async (c) => {
  const body = (await c.req.json()) as TaskInput;
  const task = createTask(body);
  return c.json({ task }, 201);
});

app.patch("/api/tasks/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "Invalid task ID" }, 400);
  }
  const body = (await c.req.json()) as TaskUpdate;
  const task = updateTask(id, body);
  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }
  return c.json({ task });
});

app.delete("/api/tasks/:id", (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "Invalid task ID" }, 400);
  }
  const deleted = deleteTask(id);
  if (!deleted) {
    return c.json({ error: "Task not found" }, 404);
  }
  return new Response(null, { status: 204 });
});

app.get("/api/stats", (c) => {
  const stats = getStats();
  return c.json(stats);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
