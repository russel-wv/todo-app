"use client";

import { cx } from "@/lib/cx";
import { describeDeadline } from "@/lib/time";
import { PRIORITY_LABELS, type Task } from "@/lib/types";
import { HourglassIcon } from "./icons";
import { TaskMenu } from "./task-menu";
import { PRIORITY_CLASS } from "./tokens";

export function TaskCard({
  task,
  now,
  onEdit,
  onDelete,
}: {
  task: Task;
  now: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const deadline = describeDeadline(task.dueAt, now, task.status === "completed");
  const due = new Date(task.dueAt);

  return (
    <article className="relative border-2 border-line bg-white px-5 pt-[11px] pb-[19px] sm:px-6.5">
      <h3 className="pr-10 text-xl leading-8 font-bold tracking-normal break-words sm:text-[25px]">
        {task.title}
      </h3>
      <div className="absolute top-1.5 right-3.5 sm:right-5">
        <TaskMenu task={task} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {/* Always two lines tall, like the mockup, so the footers line up. */}
      <p className="mt-2 line-clamp-2 min-h-11 text-base leading-[22px] break-words">
        {task.description}
      </p>
      <div className="mt-[9px] flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <span
          className={cx(
            "rounded-[4px] px-2.5 pb-1 text-base leading-[22px]",
            PRIORITY_CLASS[task.priority],
          )}
        >
          <span className="sr-only">Priority: </span>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span
          className={cx(
            "text-base leading-[22px] whitespace-nowrap",
            deadline.overdue && "font-medium text-red-700",
          )}
        >
          <HourglassIcon className="mr-1.5 inline-block h-3 w-2" />
          <time
            dateTime={due.toISOString()}
            title={`Due ${due.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`}
          >
            {deadline.text}
          </time>
        </span>
      </div>
    </article>
  );
}
