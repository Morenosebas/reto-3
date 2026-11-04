"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Límite de error de la aplicación (por ejemplo, si el almacén no responde). */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-8">
      <p className="font-display text-lg font-extrabold [font-stretch:150%]">Reutiliza</p>
      <h1 className="mt-8 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[0.95] [font-stretch:62%]">
        No pudimos cargar las publicaciones
      </h1>
      <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
        El servidor tuvo un problema al leer el catálogo. Tus publicaciones siguen guardadas;
        vuelve a intentarlo en unos segundos.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => retry()}
          className="bg-pen px-5 py-3 font-display text-lg font-extrabold text-sheet [font-stretch:90%] hover:bg-pen-hover"
        >
          Intentar de nuevo
        </button>
        <Link href="/" className="text-sm font-bold underline decoration-2 underline-offset-4">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
