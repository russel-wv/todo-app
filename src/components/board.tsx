"use client";

import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { resolveCategoryFilter, useTodoData } from "@/lib/store";
import { useNow } from "@/lib/time";
import {
  PRIORITIES,
  STATUS_LABELS,
  type SortBy,
  type Status,
  type Task,
} from "@/lib/types";
import { PlusIcon } from "./icons";
import { TaskCard } from "./task-card";
import { STATUS_DOT_CLASS } from "./tokens";

/** A status heading with its dot, above the black-outlined box of cards. */
export function StatusColumn({
  status,
  onAddTask,
  children,
}: {
  status: Status;
  onAddTask: () => void;
  children: ReactNode;
}) {
  const headingId = useId();
  const label = STATUS_LABELS[status];

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="flex items-center gap-2.5 text-2xl leading-8">
          <span
            aria-hidden="true"
            className={cx("size-3.25 shrink-0 rounded-full", STATUS_DOT_CLASS[status])}
          />
          {label}
        </h2>
        <button
          type="button"
          onClick={onAddTask}
          aria-label={`Add a task to ${label}`}
          title={`Add a task to ${label}`}
          className="grid size-8 place-items-center rounded-[5px] text-muted transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-2 focus-visible:outline-black"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
      <div className="mt-5 ml-6 border-2 border-black bg-white px-4 py-5 shadow-block sm:px-5.5 sm:py-7">
        {children}
      </div>
    </section>
  );
}

/** The cards in one status column, filtered and sorted. Browser-only. */
export function TaskList({
  status,
  categoryFilter,
  sortBy,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: {
  status: Status;
  categoryFilter: string | null;
  sortBy: SortBy;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const { categories, tasks } = useTodoData();
  const now = useNow();
  const categoryId = resolveCategoryFilter(categoryFilter, categories);

  const columnTasks = tasks.filter(
    (task) =>
      task.status === status &&
      (categoryId === null || task.categoryId === categoryId),
  );
  // toSorted is stable: tasks that tie keep the order they arrived in.
  const sortedTasks = columnTasks.toSorted((a, b) =>
    sortBy === "time-remaining"
      ? a.dueAt - b.dueAt
      : PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority),
  );

  if (sortedTasks.length === 0) {
    return (
      <div className="grid min-h-[153px] place-items-center border-2 border-dashed border-line p-4 text-center">
        <p className="text-base text-muted">
          No tasks here yet.{" "}
          <button
            type="button"
            onClick={onAddTask}
            className="font-medium text-black underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-black"
          >
            Add a task
          </button>
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-2">
      {sortedTasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            now={now}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </li>
      ))}
    </ul>
  );
}

/** Server-rendered stand-in until the saved tasks load in the browser. */
export function TaskListPlaceholder() {
  return (
    <div className="h-[153px] animate-pulse border-2 border-line bg-neutral-50">
      <span className="sr-only">Loading tasks…</span>
    </div>
  );
}
