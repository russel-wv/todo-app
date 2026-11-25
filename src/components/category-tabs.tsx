"use client";

import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";
import { resolveCategoryFilter, useTodoData } from "@/lib/store";
import type { Category } from "@/lib/types";
import { PencilIcon, PlusIcon } from "./icons";

// The bottom padding lifts the label 3px above center, as in the mockup.
const TAB_CLASS = cx(
  "inline-flex h-10 items-center gap-1.5 rounded-[5px] border-2 px-4 pb-1.5 text-xl whitespace-nowrap transition-colors sm:h-[42px] sm:px-5 sm:text-2xl",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
);

function Tab({
  selected,
  className,
  ...props
}: ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        TAB_CLASS,
        selected
          ? "border-black bg-tab-active"
          : "border-transparent bg-tab hover:bg-tab-hover",
        className,
      )}
      {...props}
    />
  );
}

function AddCategoryButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cx(TAB_CLASS, "border-transparent bg-tab hover:bg-tab-hover")}
      {...props}
    >
      <PlusIcon className="ml-0.5 size-[17px] shrink-0" />
      Add new category
    </button>
  );
}

/** "View all", one tab per saved category, then "+ Add new category". */
export function CategoryTabs({
  selectedId,
  onSelect,
  onAdd,
  onEdit,
}: {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
  onAdd: () => void;
  onEdit: (category: Category) => void;
}) {
  const { categories } = useTodoData();
  const activeId = resolveCategoryFilter(selectedId, categories);

  return (
    <>
      <Tab selected={activeId === null} onClick={() => onSelect(null)}>
        View all
      </Tab>
      {categories.map((category) => {
        const selected = category.id === activeId;
        return (
          <div key={category.id} className="group relative">
            <Tab
              selected={selected}
              onClick={() => onSelect(category.id)}
              onDoubleClick={() => onEdit(category)}
            >
              {category.name}
            </Tab>
            {/* Revealed on hover or keyboard focus, and kept visible for the
                selected tab on touch screens, which can't hover. */}
            <button
              type="button"
              aria-label={`Edit category ${category.name}`}
              title="Edit category"
              onClick={() => onEdit(category)}
              className={cx(
                "absolute -top-2.5 -right-2.5 z-10 grid size-7 place-items-center rounded-full border-2 border-black bg-white transition-opacity",
                "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
                "focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                selected && "pointer-coarse:pointer-events-auto pointer-coarse:opacity-100",
              )}
            >
              <PencilIcon className="size-3.5" />
            </button>
          </div>
        );
      })}
      <AddCategoryButton onClick={onAdd} />
    </>
  );
}

/** Server-rendered stand-in until the saved categories load in the browser. */
export function CategoryTabsPlaceholder() {
  return (
    <>
      <Tab selected>View all</Tab>
      <AddCategoryButton />
    </>
  );
}
