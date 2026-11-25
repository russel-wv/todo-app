"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A modal built on the native `<dialog>`, which traps focus, closes on
 * Escape and returns focus to the opener. Mount it to open it; `onClose`
 * runs once it has closed, so the parent can unmount it.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  /** Receives `close`, for buttons that should dismiss the dialog. */
  children: (close: () => void) => ReactNode;
}) {
  // Kept in state (not a ref) because `close` is handed to children during render.
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (dialog && !dialog.open) dialog.showModal();
  }, [dialog]);

  function close() {
    dialog?.close();
  }

  return (
    <dialog
      ref={setDialog}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clicks on the backdrop target the <dialog> itself. Requiring the
      // press to start there too keeps a text selection that ends outside
      // the panel from closing it.
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget) {
          close();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg border-2 border-black bg-white p-0 text-black shadow-block backdrop:bg-black/40"
    >
      <div className="p-6 sm:p-8">
        <h2 id={titleId} className="text-2xl leading-8 font-bold">
          {title}
        </h2>
        {children(close)}
      </div>
    </dialog>
  );
}
