"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { SidePanel } from "@/components/shared/SidePanel";
import { Toast, type ToastMessage } from "@/components/shared/Toast";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";
import { ResourceCard } from "./ResourceCard";
import { ResourceForm } from "./ResourceForm";

export type Panel = { mode: "closed" } | { mode: "publish" } | { mode: "edit"; entry: CatalogEntry };

interface ResourceManagerProps {
  /** Recursos ya filtrados en el servidor; se actualizan solos tras cada Server Action. */
  entries: CatalogEntry[];
  /** Titular de la página y buscador, renderizados en el servidor. */
  hero: ReactNode;
  toolbar: ReactNode;
  hasFilters: boolean;
  /** Panel abierto al llegar desde otra página (?publicar=1 o ?editar=id). */
  initialPanel: Panel;
}

const PANEL_PARAMS = ["publicar", "editar"];

export function ResourceManager({ entries, hero, toolbar, hasFilters, initialPanel }: ResourceManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const [formVersion, setFormVersion] = useState(0);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((message: string, tone: ToastMessage["tone"] = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Al cerrar el panel se quitan ?publicar= y ?editar= de la URL, para que
  // recargar la página no lo vuelva a abrir.
  function closePanel() {
    setPanel({ mode: "closed" });
    if (!PANEL_PARAMS.some((param) => searchParams.has(param))) return;
    const params = new URLSearchParams(searchParams);
    PANEL_PARAMS.forEach((param) => params.delete(param));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSaved(entry: CatalogEntry, message: string) {
    closePanel();
    setFormVersion((version) => version + 1);
    setJustSavedId(entry.id);
    notify(message);
  }

  const editingId = panel.mode === "edit" ? panel.entry.id : null;
  const publishButtonClass =
    "bg-pen px-5 py-3 font-display text-lg font-extrabold text-sheet transition-colors [font-stretch:90%] hover:bg-pen-hover";

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-extrabold [font-stretch:150%]">
          Reutiliza
        </Link>
        <button
          type="button"
          onClick={() => setPanel({ mode: "publish" })}
          aria-label="Publicar un recurso"
          className={publishButtonClass}
        >
          <span className="sm:hidden">Publicar</span>
          <span className="hidden sm:inline">Publicar un recurso</span>
        </button>
      </div>

      {hero}

      <section aria-labelledby="published-heading" className="min-w-0">
        {toolbar}

        {entries.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 px-6 py-14 text-center">
            {hasFilters ? (
              <>
                <p className="font-display text-2xl font-extrabold [font-stretch:72%]">
                  No encontramos nada con esos filtros
                </p>
                <p className="mt-2 text-ink-soft">
                  Prueba con otra palabra o{" "}
                  <Link href="/" scroll={false} className="font-bold text-ink underline decoration-2 underline-offset-4">
                    mira todo el catálogo
                  </Link>
                  .
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-extrabold [font-stretch:72%]">
                  Aquí todavía no hay nada colgado
                </p>
                <p className="mt-2 text-ink-soft">Lo que publiques aparecerá en esta lista.</p>
                <button
                  type="button"
                  onClick={() => setPanel({ mode: "publish" })}
                  className={`mt-6 ${publishButtonClass}`}
                >
                  Publicar un recurso
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 2xl:columns-4">
            {entries.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isEditing={editingId === resource.id}
                justSaved={justSavedId === resource.id}
                onEdit={() => setPanel({ mode: "edit", entry: resource })}
                onNotify={notify}
                onAnimationEnd={() => setJustSavedId(null)}
              />
            ))}
          </div>
        )}
      </section>

      <SidePanel
        open={panel.mode !== "closed"}
        label={panel.mode === "edit" ? "Editar recurso" : "Publicar un recurso"}
        onClose={closePanel}
      >
        <ResourceForm
          key={panel.mode === "edit" ? `edit-${panel.entry.id}` : `new-${formVersion}`}
          resource={panel.mode === "edit" ? panel.entry : undefined}
          onSaved={handleSaved}
          onCancel={closePanel}
        />
      </SidePanel>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
