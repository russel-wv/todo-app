"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react";
import { cx } from "@/lib/cx";
import { updateTask } from "@/lib/store";
import { STATUSES, STATUS_LABELS, type Task } from "@/lib/types";
import { useDismiss } from "@/lib/use-dismiss";
import { DotsIcon } from "./icons";

function MenuItem({
  danger = false,
  className,
  ...props
}: ComponentProps<"button"> & { danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx(
        "block w-full border-t-2 border-[#d9d9d9] px-3 py-1 text-center text-lg leading-7 whitespace-nowrap first:border-t-0",
        "hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100",
        danger && "text-red-700",
        className,
      )}
      {...props}
    />
  );
}

/** The "•••" button on a card: edit, move to another status, or delete. */
export function TaskMenu({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<"first" | "last">("first");
  const [open, setOpen] = useState(false);

  useDismiss(rootRef, open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const items = getItems();
    (focusOnOpen.current === "first" ? items[0] : items.at(-1))?.focus();
  }, [open]);

  function getItems() {
    return Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
  }

  function openMenu(focus: "first" | "last") {
    focusOnOpen.current = focus;
    setOpen(true);
  }

  function closeMenu(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = getItems();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (index: number) =>
      items[(index + items.length) % items.length]?.focus();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        closeMenu(false);
        break;
    }
  }

  function run(action: () => void) {
    // Focus the trigger first, so a dialog opened by the action returns
    // focus here when it closes.
    closeMenu(true);
    action();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${task.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu("first"))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.key === "ArrowDown" ? "first" : "last");
          }
        }}
        className="grid h-7 w-9 place-items-center rounded-[4px] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-black"
      >
        <DotsIcon className="h-1.5 w-[21px]" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`Actions for ${task.title}`}
          onKeyDown={handleMenuKeyDown}
          className="absolute top-full right-0 z-30 mt-1 min-w-52 border-2 border-[#d9d9d9] bg-white"
        >
          <MenuItem onClick={() => run(() => onEdit(task))}>Edit</MenuItem>
          {STATUSES.filter((status) => status !== task.status).map((status) => (
            <MenuItem
              key={status}
              onClick={() => run(() => updateTask(task.id, { status }))}
            >
              Move to {STATUS_LABELS[status]}
            </MenuItem>
          ))}
          <MenuItem danger onClick={() => run(() => onDelete(task))}>
            Delete
          </MenuItem>
        </div>
      )}
    </div>
  );
}
