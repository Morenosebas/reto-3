"use client";

import { useState } from "react";

/** Comparte la página con el menú del sistema; si no existe, copia el enlace. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // La persona cerró el menú de compartir: no hay nada que hacer.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 border-2 border-ink px-4 py-2 text-sm font-bold hover:bg-field"
    >
      {copied ? "Enlace copiado" : "Compartir enlace"}
    </button>
  );
}
