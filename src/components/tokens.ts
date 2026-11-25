import type { Priority, Status } from "@/lib/types";

// Full class names (not built from strings) so Tailwind can detect them.

export const STATUS_DOT_CLASS: Record<Status, string> = {
  todo: "bg-todo",
  "in-progress": "bg-progress",
  completed: "bg-done",
};

export const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
};
