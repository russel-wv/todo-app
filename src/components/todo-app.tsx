"use client";

import { Suspense, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { deleteCategory, deleteTask } from "@/lib/store";
import { defaultDueAt } from "@/lib/time";
import {
  STATUSES,
  STATUS_LABELS,
  type Category,
  type GroupBy,
  type SortBy,
  type Status,
  type Task,
  type TaskInput,
} from "@/lib/types";
import { StatusColumn, TaskList, TaskListPlaceholder } from "./board";
import { CategoryDialog } from "./category-dialog";
import { CategoryTabs, CategoryTabsPlaceholder } from "./category-tabs";
import { ConfirmDialog } from "./confirm-dialog";
import { TaskDialog } from "./task-dialog";
import { ViewDropdown, type DropdownOption } from "./view-dropdown";

const SORT_OPTIONS: DropdownOption<SortBy>[] = [
  { value: "status", label: "Status" },
  { value: "time-remaining", label: "Time Remaining" },
];

const GROUP_OPTIONS: DropdownOption<GroupBy>[] = [
  { value: "all", label: "Show all" },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

const CONTAINER = "mx-auto w-full max-w-[1584px] px-4 sm:px-6";

type DialogState =
  | { type: "task"; taskId: string | null; values: TaskInput }
  | { type: "category"; category: Category | null }
  | {
      type: "confirm";
      title: string;
      message: ReactNode;
      confirmLabel: string;
      onConfirm: () => void;
    };

function toTaskInput(task: Task): TaskInput {
  const { title, description, status, priority, dueAt, categoryId } = task;
  return { title, description, status, priority, dueAt, categoryId };
}

export function TodoApp() {
  // null shows every category.
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("status");
  const [groupBy, setGroupBy] = useState<GroupBy>("all");
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const columns = groupBy === "all" ? STATUSES : [groupBy];
  const closeDialog = () => setDialog(null);

  function openNewTask(status: Status) {
    setDialog({
      type: "task",
      taskId: null,
      values: {
        title: "",
        description: "",
        status,
        priority: "medium",
        dueAt: defaultDueAt(),
        categoryId: categoryFilter,
      },
    });
  }

  function confirmDeleteTask(task: Task) {
    setDialog({
      type: "confirm",
      title: "Delete task?",
      message: <>&ldquo;{task.title}&rdquo; will be permanently deleted.</>,
      confirmLabel: "Delete task",
      onConfirm: () => deleteTask(task.id),
    });
  }

  function confirmDeleteCategory(category: Category, taskCount: number) {
    const tasksNote =
      taskCount === 0
        ? ""
        : taskCount === 1
          ? " and its 1 task"
          : ` and its ${taskCount} tasks`;
    setDialog({
      type: "confirm",
      title: "Delete category?",
      message: (
        <>
          &ldquo;{category.name}&rdquo;{tasksNote} will be permanently deleted.
        </>
      ),
      confirmLabel: "Delete category",
      onConfirm: () => {
        deleteCategory(category.id);
        setCategoryFilter((current) => (current === category.id ? null : current));
      },
    });
  }

  return (
    <>
      <header className="border-b-2 border-divider">
        <div className={cx(CONTAINER, "py-6")}>
          <h1 className="font-display text-2xl leading-9 font-bold tracking-normal sm:text-[28px]">
            TODO App
          </h1>
          <div className="mt-[15px] flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <div
              role="group"
              aria-label="Filter by category"
              className="flex flex-wrap items-center gap-2.5"
            >
              <Suspense fallback={<CategoryTabsPlaceholder />}>
                <CategoryTabs
                  selectedId={categoryFilter}
                  onSelect={setCategoryFilter}
                  onAdd={() => setDialog({ type: "category", category: null })}
                  onEdit={(category) => setDialog({ type: "category", category })}
                />
              </Suspense>
            </div>
            {/* The negative margin lines the text up with the page edge;
                the padding and border only show while a menu is open. */}
            <div className="-mx-3 flex flex-wrap items-center gap-1">
              <ViewDropdown
                label="Sort by"
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
              />
              <ViewDropdown
                label="Group by"
                value={groupBy}
                options={GROUP_OPTIONS}
                onChange={setGroupBy}
              />
            </div>
          </div>
        </div>
      </header>

      <main className={cx(CONTAINER, "pt-12 pb-20 sm:pt-[70px]")}>
        <div className="grid gap-y-12 sm:pr-6 sm:pl-4 lg:grid-cols-3 lg:gap-x-3.5">
          {columns.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              onAddTask={() => openNewTask(status)}
            >
              <Suspense fallback={<TaskListPlaceholder />}>
                <TaskList
                  status={status}
                  categoryFilter={categoryFilter}
                  sortBy={sortBy}
                  onAddTask={() => openNewTask(status)}
                  onEditTask={(task) =>
                    setDialog({ type: "task", taskId: task.id, values: toTaskInput(task) })
                  }
                  onDeleteTask={confirmDeleteTask}
                />
              </Suspense>
            </StatusColumn>
          ))}
        </div>
      </main>

      {dialog?.type === "task" && (
        <TaskDialog
          taskId={dialog.taskId}
          initialValues={dialog.values}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "category" && (
        <CategoryDialog
          category={dialog.category}
          onClose={closeDialog}
          onCreated={(category) => setCategoryFilter(category.id)}
          onRequestDelete={confirmDeleteCategory}
        />
      )}
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          onConfirm={dialog.onConfirm}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
