import type {
  ResourceCategory,
  ResourceModality,
  ResourceStatus,
} from "../domain/ResourceAttributes";

export const MODALITY_LABELS: Record<ResourceModality, string> = {
  donation: "Donación",
  exchange: "Intercambio",
  sale: "Venta solidaria",
};

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  clothing: "Ropa",
  electronics: "Electrónica",
  furniture: "Muebles",
  books: "Libros",
  home: "Hogar",
  materials: "Materiales",
  other: "Otros",
};

export const STATUS_LABELS: Record<ResourceStatus, string> = {
  available: "Disponible",
  reserved: "Reservado",
  delivered: "Entregado",
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/** "hace 3 días", "ayer", "hace un momento". */
export function formatRelativeDate(isoDate: string, now: number = Date.now()): string {
  const elapsed = new Date(isoDate).getTime() - now;
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= size) return formatter.format(Math.round(elapsed / size), unit);
  }
  return "hace un momento";
}

export function formatPrice(price: number): string {
  return price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
