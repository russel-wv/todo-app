import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

const BUTTON_VARIANTS = {
  primary: "border-black bg-black text-white hover:bg-neutral-800",
  secondary: "border-transparent bg-tab hover:bg-tab-hover",
  danger: "border-black bg-high hover:bg-[#ff7d7d]",
};

export function Button({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof BUTTON_VARIANTS }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex h-11 items-center justify-center rounded-[5px] border-2 px-5 text-lg whitespace-nowrap transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Shared look for text inputs, textareas and selects. */
export const controlClass = cx(
  "block w-full rounded-[4px] border-2 border-line bg-white px-3 py-2 text-base leading-6 outline-none transition-colors",
  "placeholder:text-muted focus:border-black aria-invalid:border-red-600",
);

export const labelClass = "mb-1.5 block text-base font-medium";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  );
}
