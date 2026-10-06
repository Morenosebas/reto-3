import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import {
  CATEGORY_LABELS,
  formatPrice,
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/modules/resources/presentation/labels";
import { MODALITY_FILL } from "./modalityStyles";

function modalityValue(resource: ResourceDTO): string {
  switch (resource.modality) {
    case "donation":
      return "Gratis";
    case "exchange":
      return `Lo cambio por ${resource.wantedInReturn}`;
    case "sale":
      return formatPrice(resource.price ?? 0);
  }
}

interface ResourceCardProps {
  resource: ResourceDTO;
  isEditing: boolean;
  /** Recién publicado o editado: entra con la animación de colgarse. */
  justSaved: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAnimationEnd: () => void;
}

export function ResourceCard({
  resource,
  isEditing,
  justSaved,
  onEdit,
  onDelete,
  onAnimationEnd,
}: ResourceCardProps) {
  const isDelivered = resource.status === "delivered";

  return (
    // El filtro va en el contenedor porque el recorte de la etiqueta cortaría la sombra.
    <div
      onAnimationEnd={onAnimationEnd}
      className={`mb-6 break-inside-avoid transition-[filter,translate] duration-200 ${
        justSaved ? "hang-in" : ""
      } ${isEditing ? "-translate-y-1 drop-shadow-[5px_5px_0_var(--ink)]" : ""}`}
    >
      <article
        className={`hang-tag relative flex flex-col px-6 pb-5 pt-12 text-tag-ink ${
          MODALITY_FILL[resource.modality]
        } ${isDelivered ? "opacity-60" : ""}`}
      >
        {resource.status !== "available" && (
          <span
            className={`absolute right-7 top-4 rotate-[-8deg] border-[3px] px-2 py-0.5 font-display text-sm font-extrabold [font-stretch:75%] ${
              isDelivered ? "border-tag-ink text-tag-ink" : "border-tag-pen text-tag-pen"
            }`}
          >
            {STATUS_LABELS[resource.status]}
          </span>
        )}

        <p className="text-sm font-bold">{MODALITY_LABELS[resource.modality]}</p>
        <h3 className="mt-1 font-display text-[1.75rem] font-extrabold leading-[1.02] [font-stretch:72%]">
          {resource.title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed">{resource.description}</p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
          <dt className="opacity-70">Categoría</dt>
          <dd className="font-bold">{CATEGORY_LABELS[resource.category]}</dd>
          <dt className="opacity-70">Dónde</dt>
          <dd className="font-bold">{resource.location}</dd>
        </dl>

        {/* Línea de corte, como en una etiqueta de precio */}
        <div className="mt-5 border-t-2 border-dashed border-tag-ink/35 pt-4">
          <p className="font-display text-2xl font-extrabold leading-tight [font-stretch:80%]">
            {modalityValue(resource)}
          </p>
          <div className="mt-4 flex gap-5 text-sm font-bold">
            <button
              type="button"
              onClick={onEdit}
              className="underline decoration-2 underline-offset-4 hover:decoration-[3px]"
            >
              {isEditing ? "Editando" : "Editar"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-tag-alert underline decoration-2 underline-offset-4 hover:decoration-[3px]"
            >
              Eliminar
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
