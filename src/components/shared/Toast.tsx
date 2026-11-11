"use client";

import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  message: string;
  tone: "success" | "error";
}

const VISIBLE_MS = 4500;

/**
 * Aviso breve tras una acción. La región aria-live existe siempre para que
 * los lectores de pantalla anuncien cada mensaje nuevo.
 */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center"
    >
      {toast && (
        <p
          key={toast.id}
          className={`toast-in pointer-events-auto flex max-w-md items-center gap-4 border-2 px-4 py-3 text-sm font-bold shadow-[4px_4px_0_var(--ink)] ${
            toast.tone === "success"
              ? "border-ink bg-tag-sale text-tag-ink"
              : "border-alert bg-sheet text-alert"
          }`}
        >
          {toast.message}
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto underline decoration-2 underline-offset-4"
          >
            Cerrar
          </button>
        </p>
      )}
    </div>
  );
}
