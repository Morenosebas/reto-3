"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SidePanelProps {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel lateral modal sobre <dialog>: atrapa el foco, se cierra con Escape o
 * con el botón y deja el catálogo visible detrás. En el celular ocupa toda la pantalla.
 */
export function SidePanel({ open, label, onClose, children }: SidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={onClose}
      className="side-panel m-0 ml-auto h-dvh max-h-dvh w-full max-w-full overflow-y-auto border-l-2 border-ink bg-sheet p-0 text-ink backdrop:bg-ink/45 sm:w-[30rem]"
    >
      <div className="flex justify-end px-6 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold underline decoration-2 underline-offset-4"
        >
          Cerrar
        </button>
      </div>
      <div className="px-6 pb-10">{open && children}</div>
    </dialog>
  );
}
