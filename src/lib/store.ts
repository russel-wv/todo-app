import { use, useSyncExternalStore } from "react";
import { browser } from "react-dom";
import { createSampleData } from "./sample-data";
import {
  PRIORITIES,
  STATUSES,
  type Category,
  type Priority,
  type Status,
  type Task,
  type TaskInput,
  type TodoData,
} from "./types";

/*
 * All app data lives in one localStorage entry. This module keeps an
 * in-memory copy and notifies subscribed components when it changes,
 * whether the change happened in this tab or in another one.
 */

const STORAGE_KEY = "todo-app:v1";
const EMPTY: TodoData = { categories: [], tasks: [] };

let snapshot: TodoData | null = null;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(new Date(value).getTime());
}

function parseCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null;
  const { id, name } = value;
  return typeof id === "string" && typeof name === "string"
    ? { id, name }
    : null;
}

function parseTask(value: unknown): Task | null {
  if (!isRecord(value)) return null;
  const { id, title, description, status, priority, dueAt, categoryId, createdAt } =
    value;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    !STATUSES.includes(status as Status) ||
    !PRIORITIES.includes(priority as Priority) ||
    !isTimestamp(dueAt)
  ) {
    return null;
  }
  return {
    id,
    title,
    description: typeof description === "string" ? description : "",
    status: status as Status,
    priority: priority as Priority,
    dueAt,
    categoryId: typeof categoryId === "string" ? categoryId : null,
    createdAt: isTimestamp(createdAt) ? createdAt : dueAt,
  };
}

/** Parses stored JSON, skipping malformed entries rather than failing outright. */
function parseData(json: string): TodoData | null {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.tasks)
  ) {
    return null;
  }
  const categories = value.categories
    .map(parseCategory)
    .filter((category): category is Category => category !== null);
  const categoryIds = new Set(categories.map((category) => category.id));
  const tasks = value.tasks
    .map(parseTask)
    .filter((task): task is Task => task !== null)
    .map((task) =>
      task.categoryId === null || categoryIds.has(task.categoryId)
        ? task
        : { ...task, categoryId: null },
    );
  return { categories, tasks };
}

function save(data: TodoData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Couldn't save to localStorage; changes will be lost on reload.", error);
  }
}

function load(): TodoData {
  let json: string | null = null;
  try {
    json = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked by browser settings; keep the data in memory.
  }
  if (json === null) {
    // First visit: start with the sample board and save it right away, so
    // its deadlines keep counting down across reloads.
    const sample = createSampleData(Date.now());
    save(sample);
    return sample;
  }
  const data = parseData(json);
  if (data === null) {
    console.warn(`Ignoring unreadable data in localStorage["${STORAGE_KEY}"].`);
    return EMPTY;
  }
  return data;
}

function getSnapshot() {
  snapshot ??= load();
  return snapshot;
}

function emit() {
  for (const listener of listeners) listener();
}

// Another tab changed the data: mirror it here without writing it back.
function handleStorage(event: StorageEvent) {
  if (event.storageArea !== window.localStorage) return;
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  snapshot =
    event.newValue === null ? EMPTY : (parseData(event.newValue) ?? EMPTY);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function commit(update: (data: TodoData) => TodoData) {
  const current = getSnapshot();
  const next = update(current);
  if (next === current) return;
  snapshot = next;
  save(next);
  emit();
}

/**
 * The saved categories and tasks. The server can't read the browser's
 * localStorage, so components that call this render only in the browser
 * and need a `<Suspense>` boundary above them.
 */
export function useTodoData() {
  use(browser("Tasks and categories are saved in this browser's localStorage."));
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** The selected category id, or `null` (all tasks) if it no longer exists. */
export function resolveCategoryFilter(
  selectedId: string | null,
  categories: Category[],
) {
  return selectedId !== null && categories.some((c) => c.id === selectedId)
    ? selectedId
    : null;
}

function createId() {
  // randomUUID is only available in secure contexts (HTTPS or localhost).
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function addCategory(name: string) {
  const category: Category = { id: createId(), name };
  commit((data) => ({ ...data, categories: [...data.categories, category] }));
  return category;
}

export function renameCategory(id: string, name: string) {
  commit((data) => ({
    ...data,
    categories: data.categories.map((category) =>
      category.id === id ? { ...category, name } : category,
    ),
  }));
}

/** Deletes a category together with the tasks filed under it. */
export function deleteCategory(id: string) {
  commit((data) => ({
    categories: data.categories.filter((category) => category.id !== id),
    tasks: data.tasks.filter((task) => task.categoryId !== id),
  }));
}

export function addTask(input: TaskInput) {
  const task: Task = { ...input, id: createId(), createdAt: Date.now() };
  commit((data) => ({ ...data, tasks: [...data.tasks, task] }));
}

/** Updates a task. A task that changes status moves to the end of its new column. */
export function updateTask(id: string, changes: Partial<TaskInput>) {
  commit((data) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return data;
    const updated = { ...task, ...changes };
    const tasks =
      updated.status === task.status
        ? data.tasks.map((t) => (t.id === id ? updated : t))
        : [...data.tasks.filter((t) => t.id !== id), updated];
    return { ...data, tasks };
  });
}

export function deleteTask(id: string) {
  commit((data) => ({
    ...data,
    tasks: data.tasks.filter((task) => task.id !== id),
  }));
}
