import Link from "next/link";
import type { ReactNode } from "react";
import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import {
  CATEGORY_LABELS,
  formatPrice,
  formatRelativeDate,
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/modules/resources/presentation/labels";
import { MODALITY_FILL } from "./modalityStyles";

export function modalityValue(resource: ResourceDTO): string {
  switch (resource.modality) {
    case "donation":
      return "Gratis";
    case "exchange":
      return resource.wantedInReturn ? `Lo cambio por ${resource.wantedInReturn}` : "Lo cambio por…";
    case "sale":
      return resource.price !== undefined ? formatPrice(resource.price) : "Precio por definir";
  }
}

interface ResourceTagProps {
  resource: ResourceDTO;
  /** Si se indica, el título enlaza a la página del recurso. */
  href?: string;
  /** card: catálogo; page: detalle; preview: vista previa compacta del formulario. */
  size?: "card" | "page" | "preview";
  /** Acciones bajo la línea de corte (gestión o aviso de solo lectura). */
  children?: ReactNode;
}

/** Etiqueta colgante de un recurso: la usan el catálogo y la página de detalle. */
export function ResourceTag({ resource, href, size = "card", children }: ResourceTagProps) {
  const isDelivered = resource.status === "delivered";
  const isPage = size === "page";
  const isPreview = size === "preview";
  const TitleTag = isPage ? "h1" : isPreview ? "p" : "h3";

  return (
    <article
      className={`hang-tag relative flex flex-col pb-5 text-tag-ink ${
        isPage ? "px-7 pt-14 sm:px-10" : isPreview ? "px-5 pt-10" : "px-6 pt-12"
      } ${MODALITY_FILL[resource.modality]} ${isDelivered ? "opacity-60" : ""}`}
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

      <p className="flex flex-wrap gap-x-2.5 text-sm">
        <span className="font-bold">{MODALITY_LABELS[resource.modality]}</span>
        <span className="opacity-75">{CATEGORY_LABELS[resource.category]}</span>
      </p>
      <TitleTag
        className={`mt-1 font-display font-extrabold leading-[1.02] [font-stretch:72%] ${
          isPage ? "text-[clamp(2.25rem,6vw,3.5rem)]" : isPreview ? "text-2xl" : "text-[1.75rem]"
        } ${isPreview ? "break-words" : ""}`}
      >
        {href ? (
          <Link href={href} className="hover:underline hover:decoration-2 hover:underline-offset-4">
            {resource.title}
          </Link>
        ) : (
          resource.title
        )}
      </TitleTag>
      <p
        className={`mt-3 leading-relaxed ${
          isPage ? "text-lg" : isPreview ? "line-clamp-2 break-words text-sm" : "text-[0.95rem]"
        }`}
      >
        {resource.description}
      </p>

      <p className="mt-4 text-sm">
        En <span className="font-bold">{resource.location}</span>,{" "}
        {/* La fecha relativa depende de la hora del navegador: puede diferir de la del servidor. */}
        <time dateTime={resource.createdAt} suppressHydrationWarning>
          {formatRelativeDate(resource.createdAt)}
        </time>
      </p>

      <div className={`border-t-2 border-dashed border-tag-ink/35 ${isPreview ? "mt-4 pt-3" : "mt-5 pt-4"}`}>
        <p
          className={`font-display font-extrabold leading-tight [font-stretch:80%] ${
            isPage ? "text-3xl" : isPreview ? "break-words text-xl" : "text-2xl"
          }`}
        >
          {modalityValue(resource)}
        </p>
        {children}
      </div>
    </article>
  );
}
