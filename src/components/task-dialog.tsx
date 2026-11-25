"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { cx } from "@/lib/cx";
import { addTask, updateTask, useTodoData } from "@/lib/store";
import { parseDateTimeInputValue, toDateTimeInputValue } from "@/lib/time";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type TaskInput,
} from "@/lib/types";
import { Modal } from "./modal";
import { PRIORITY_CLASS, STATUS_DOT_CLASS } from "./tokens";
import { Button, controlClass, FieldError, labelClass } from "./ui";

const OPTION_CLASS = cx(
  "flex cursor-pointer items-center gap-2 rounded-[4px] border-2 px-3 text-base leading-8 select-none",
  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-black",
);

/** Creates a task when `taskId` is null, otherwise edits that task. */
export function TaskDialog({
  taskId,
  initialValues,
  onClose,
}: {
  taskId: string | null;
  initialValues: TaskInput;
  onClose: () => void;
}) {
  const { categories } = useTodoData();
  const id = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [status, setStatus] = useState(initialValues.status);
  const [priority, setPriority] = useState(initialValues.priority);
  const [due, setDue] = useState(() => toDateTimeInputValue(initialValues.dueAt));
  const [categoryId, setCategoryId] = useState(initialValues.categoryId ?? "");
  const [errors, setErrors] = useState<{ title?: string; due?: string }>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const dueAt = parseDateTimeInputValue(due);
    const nextErrors = {
      title: trimmedTitle ? undefined : "Give the task a title.",
      due: dueAt === null ? "Choose a due date and time." : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.title) return titleRef.current?.focus();
    if (dueAt === null) return dueRef.current?.focus();

    const values: TaskInput = {
      title: trimmedTitle,
      description: description.trim(),
      status,
      priority,
      dueAt,
      // The category may have been deleted (e.g. in another tab) meanwhile.
      categoryId: categories.some((c) => c.id === categoryId) ? categoryId : null,
    };
    if (taskId) updateTask(taskId, values);
    else addTask(values);
    close();
  }

  return (
    <Modal title={taskId ? "Edit task" : "New task"} onClose={onClose}>
      {(close) => (
        <form
          noValidate
          onSubmit={(event) => handleSubmit(event, close)}
          className="mt-6 flex flex-col gap-5"
        >
          <div>
            <label htmlFor={`${id}-title`} className={labelClass}>
              Title
            </label>
            <input
              ref={titleRef}
              id={`${id}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              autoComplete="off"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? `${id}-title-error` : undefined}
              className={controlClass}
            />
            <FieldError id={`${id}-title-error`} message={errors.title} />
          </div>

          <div>
            <label htmlFor={`${id}-description`} className={labelClass}>
              Description <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id={`${id}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={300}
              className={cx(controlClass, "resize-none")}
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Priority</legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((value) => (
                <label
                  key={value}
                  className={cx(
                    OPTION_CLASS,
                    PRIORITY_CLASS[value],
                    priority === value ? "border-black" : "border-transparent",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-priority`}
                    value={value}
                    checked={priority === value}
                    onChange={() => setPriority(value)}
                    className="sr-only"
                  />
                  {PRIORITY_LABELS[value]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Status</legend>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((value) => (
                <label
                  key={value}
                  className={cx(
                    OPTION_CLASS,
                    "bg-white",
                    status === value ? "border-black" : "border-line",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-status`}
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cx("size-2.5 rounded-full", STATUS_DOT_CLASS[value])}
                  />
                  {STATUS_LABELS[value]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-due`} className={labelClass}>
                Due
              </label>
              <input
                ref={dueRef}
                id={`${id}-due`}
                type="datetime-local"
                value={due}
                onChange={(event) => setDue(event.target.value)}
                aria-invalid={errors.due ? true : undefined}
                aria-describedby={errors.due ? `${id}-due-error` : undefined}
                className={controlClass}
              />
              <FieldError id={`${id}-due-error`} message={errors.due} />
            </div>
            <div>
              <label htmlFor={`${id}-category`} className={labelClass}>
                Category
              </label>
              <select
                id={`${id}-category`}
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={cx(controlClass, "h-11")}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" variant="primary">
              {taskId ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
