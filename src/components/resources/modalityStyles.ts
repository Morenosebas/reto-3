import type { ResourceModality } from "@/modules/resources/domain/ResourceAttributes";

// Cada modalidad tiene su color de sticker; se usa en etiquetas, filtros y formulario.

export const MODALITY_FILL: Record<ResourceModality, string> = {
  donation: "bg-tag-donation",
  exchange: "bg-tag-exchange",
  sale: "bg-tag-sale",
};

export const MODALITY_BORDER: Record<ResourceModality, string> = {
  donation: "border-tag-donation",
  exchange: "border-tag-exchange",
  sale: "border-tag-sale",
};
