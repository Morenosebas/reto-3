"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { changeResourceStatus, withdrawResource } from "@/app/recursos/actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ToastMessage } from "@/components/shared/Toast";
import {
  RESOURCE_STATUSES,
  type ResourceStatus,
} from "@/modules/resources/domain/ResourceAttributes";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";
import { formatContactPhone } from "@/modules/resources/presentation/contact";
import { STATUS_LABELS } from "@/modules/resources/presentation/labels";
import { WhatsAppLink } from "./WhatsAppLink";

interface OwnerActionsProps {
  resource: CatalogEntry;
  /** En el catálogo, editar abre el formulario; en el detalle, enlaza al catálogo. */
  onEdit?: () => void;
  editHref?: string;
  isEditing?: boolean;
  onNotify: (message: string, tone: ToastMessage["tone"]) => void;
  /** En la página de detalle, tras eliminar se vuelve al catálogo. */
  returnToCatalogOnDelete?: boolean;
}

/** Acciones de quien publicó: cambiar el estado, editar y eliminar. */
export function OwnerActions({
  resource,
  onEdit,
  editHref,
  isEditing = false,
  onNotify,
  returnToCatalogOnDelete = false,
}: OwnerActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function changeStatus(status: ResourceStatus) {
    if (status === resource.status) return;
    startTransition(async () => {
      const result = await changeResourceStatus(resource.id, status);
      onNotify(result.message, result.ok ? "success" : "error");
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await withdrawResource(resource.id, {
        returnToCatalog: returnToCatalogOnDelete,
      });
      setConfirmingDelete(false);
      onNotify(result.message, result.ok ? "success" : "error");
    });
  }

  const linkClass = "underline decoration-2 underline-offset-4 hover:decoration-[3px]";

  return (
    <div className="mt-4 flex flex-col gap-4">
      <p className="text-sm">
        {resource.contactPhone ? (
          <>
            Te escribirán al{" "}
            <span className="font-bold">{formatContactPhone(resource.contactPhone)}</span>.{" "}
            <WhatsAppLink
              phone={resource.contactPhone}
              text={`Probando mi publicación «${resource.title}» en Reutiliza.`}
              className="font-bold underline decoration-2 underline-offset-4"
            >
              Abrir mi chat en WhatsApp
            </WhatsAppLink>
          </>
        ) : (
          "Sin WhatsApp: edítalo y agrega tu número para que puedan pedírtelo."
        )}
      </p>
      <fieldset disabled={pending}>
        <legend className="mb-1.5 text-sm font-bold">Estado</legend>
        <div className="flex flex-wrap gap-1.5">
          {RESOURCE_STATUSES.map((status) => {
            const active = resource.status === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => changeStatus(status)}
                className={`border-2 border-tag-ink px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-60 ${
                  active ? "bg-tag-ink text-sheet" : "hover:bg-tag-ink/10"
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-5 text-sm font-bold">
        {onEdit ? (
          <button type="button" onClick={onEdit} className={linkClass}>
            {isEditing ? "Editando" : "Editar"}
          </button>
        ) : (
          editHref && (
            <Link href={editHref} className={linkClass}>
              Editar
            </Link>
          )
        )}
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className={`text-tag-alert ${linkClass}`}
        >
          Eliminar
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="¿Eliminar esta publicación?"
        description={`«${resource.title}» dejará de aparecer en el catálogo. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
