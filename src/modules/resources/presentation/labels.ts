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

export function formatPrice(price: number): string {
  return price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
