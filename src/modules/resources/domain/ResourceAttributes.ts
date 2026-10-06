// Valores válidos de los atributos de un recurso.
// Se mantienen sin dependencias para poder compartirlos con la interfaz.

export const RESOURCE_MODALITIES = ["donation", "exchange", "sale"] as const;
export type ResourceModality = (typeof RESOURCE_MODALITIES)[number];

export const RESOURCE_CATEGORIES = [
  "clothing",
  "electronics",
  "furniture",
  "books",
  "home",
  "materials",
  "other",
] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_STATUSES = ["available", "reserved", "delivered"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

/** Precio máximo permitido para una venta solidaria (en pesos). */
export const MAX_SALE_PRICE = 500_000;
