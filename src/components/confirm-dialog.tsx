"use client";

import type { ReactNode } from "react";
import { Modal } from "./modal";
import { Button } from "./ui";

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      {(close) => (
        <>
          <p className="mt-3 text-base leading-[22px]">{message}</p>
          <div className="mt-8 flex justify-end gap-3">
            {/* First in the dialog, so it gets the initial focus. */}
            <Button onClick={close}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
