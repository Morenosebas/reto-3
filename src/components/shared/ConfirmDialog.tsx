"use client";

import { useEffect, useId, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo modal nativo (<dialog>): atrapa el foco, se cierra con Escape y se
 * muestra por encima de todo sin depender del contenedor donde se declara.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onCancel}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] border-2 border-ink bg-sheet p-6 text-ink backdrop:bg-ink/45"
    >
      <h2 id={titleId} className="font-display text-2xl font-extrabold leading-tight [font-stretch:72%]">
        {title}
      </h2>
      <p id={descriptionId} className="mt-3 leading-relaxed text-ink-soft">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="border-2 border-ink px-4 py-2 text-sm font-bold hover:bg-field"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="bg-alert px-4 py-2 text-sm font-bold text-sheet hover:opacity-90 disabled:opacity-60"
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
