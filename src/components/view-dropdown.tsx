"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import { useDismiss } from "@/lib/use-dismiss";
import { ChevronDownIcon } from "./icons";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

/**
 * The "Sort by" / "Group by" control: a select-only combobox. Focus stays
 * on the button while the arrow keys move through the options.
 */
export function ViewDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  // Space picks an option on keydown; its keyup must not "click" the button again.
  const swallowSpaceKeyUp = useRef(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  useDismiss(rootRef, open, () => setOpen(false));

  function openAt(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    if (!open) {
      // Enter and Space open the list through the button's native click.
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openAt(selectedIndex);
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case " ":
        swallowSpaceKeyUp.current = true;
      // falls through
      case "Enter":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-label={`${label}: ${options[selectedIndex].label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          if (event.key === " " && swallowSpaceKeyUp.current) {
            event.preventDefault();
            swallowSpaceKeyUp.current = false;
          }
        }}
        className={cx(
          // Like the tabs, the label sits slightly above center.
          "flex items-center gap-3 border-2 px-2.5 pt-[5px] pb-[11px] text-xl leading-8 whitespace-nowrap sm:text-2xl",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
          open ? "border-[#d9d9d9] bg-white" : "border-transparent",
        )}
      >
        <span>
          {label}: <span className="text-muted">{options[selectedIndex].label}</span>
        </span>
        <ChevronDownIcon className="h-[7px] w-3 shrink-0" />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 -mt-0.5 border-2 border-[#d9d9d9] bg-white"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              // Keep focus on the combobox button.
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => choose(index)}
              className={cx(
                "cursor-pointer px-2.5 py-0.5 text-center text-lg leading-7 sm:text-xl",
                index > 0 && "border-t-2 border-[#d9d9d9]",
                index === activeIndex && "bg-neutral-100",
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
