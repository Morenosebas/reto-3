"use client";

import { useCallback, useState } from "react";
import { Toast, type ToastMessage } from "@/components/shared/Toast";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";
import { OwnerActions } from "./OwnerActions";

/** Acciones de quien publicó en la página de detalle, con su propio aviso. */
export function ResourceDetailActions({ resource }: { resource: CatalogEntry }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((message: string, tone: ToastMessage["tone"]) => {
    setToast({ id: Date.now(), message, tone });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <>
      <OwnerActions
        resource={resource}
        editHref={`/?editar=${resource.id}`}
        onNotify={notify}
        returnToCatalogOnDelete
      />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
