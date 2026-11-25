"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { addCategory, renameCategory, useTodoData } from "@/lib/store";
import type { Category } from "@/lib/types";
import { Modal } from "./modal";
import { Button, controlClass, FieldError, labelClass } from "./ui";

/** Creates a category when `category` is null, otherwise renames or deletes it. */
export function CategoryDialog({
  category,
  onClose,
  onCreated,
  onRequestDelete,
}: {
  category: Category | null;
  onClose: () => void;
  onCreated: (category: Category) => void;
  onRequestDelete: (category: Category, taskCount: number) => void;
}) {
  const { categories, tasks } = useTodoData();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, " ");
    const taken = categories.some(
      (other) =>
        other.id !== category?.id &&
        other.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const message = !trimmed
      ? "Enter a category name."
      : taken
        ? `There's already a category called "${trimmed}".`
        : undefined;
    if (message) {
      setError(message);
      inputRef.current?.focus();
      return;
    }
    if (category) renameCategory(category.id, trimmed);
    else onCreated(addCategory(trimmed));
    close();
  }

  return (
    <Modal title={category ? "Edit category" : "New category"} onClose={onClose}>
      {(close) => (
        <form noValidate onSubmit={(event) => handleSubmit(event, close)} className="mt-6">
          <label htmlFor={`${id}-name`} className={labelClass}>
            Name
          </label>
          <input
            ref={inputRef}
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            autoComplete="off"
            placeholder="e.g. Personal"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={controlClass}
          />
          <FieldError id={`${id}-error`} message={error} />

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {category && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() =>
                  onRequestDelete(
                    category,
                    tasks.filter((task) => task.categoryId === category.id).length,
                  )
                }
              >
                Delete
              </Button>
            )}
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" variant="primary">
              {category ? "Save" : "Add category"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
