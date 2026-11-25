export const STATUSES = ["todo", "in-progress", "completed"] as const;
export type Status = (typeof STATUSES)[number];

/** Highest first: also the order used by "Sort by: Status". */
export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface Category {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  /** Deadline in milliseconds since the Unix epoch. */
  dueAt: number;
  /** `null` when the task isn't filed under any category. */
  categoryId: string | null;
  createdAt: number;
}

/** The editable fields of a task. */
export type TaskInput = Omit<Task, "id" | "createdAt">;

export interface TodoData {
  categories: Category[];
  tasks: Task[];
}

/**
 * "status" orders each column by priority, High first and Low last;
 * "time-remaining" puts the nearest deadline first.
 */
export type SortBy = "status" | "time-remaining";

/** Show every status column, or a single one. */
export type GroupBy = "all" | Status;
