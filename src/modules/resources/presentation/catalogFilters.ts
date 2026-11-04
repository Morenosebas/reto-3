import type { ResourceSearchCriteria } from "../application/ListResources";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_MODALITIES,
  type ResourceCategory,
  type ResourceModality,
  type ResourceStatus,
} from "../domain/ResourceAttributes";
import type { CatalogEntry } from "./ResourceDTO";

/**
 * Qué estados muestra el catálogo:
 * - active (por defecto): disponible y reservado; lo entregado ya no le sirve a nadie.
 * - available: solo lo que todavía se puede pedir (?disponibles=1).
 * - delivered: el historial de lo entregado (?entregados=1).
 */
export type StatusView = "active" | "available" | "delivered";

export const STATUS_VIEWS: Record<StatusView, readonly ResourceStatus[]> = {
  active: ["available", "reserved"],
  available: ["available"],
  delivered: ["delivered"],
};

/** Filtros del catálogo tal como viajan en la URL: /?q=libros&categoria=books&modalidad=exchange&disponibles=1 */
export interface CatalogFilters {
  query: string;
  category: ResourceCategory | null;
  modality: ResourceModality | null;
  statusView: StatusView;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export const NO_FILTERS: CatalogFilters = {
  query: "",
  category: null,
  modality: null,
  statusView: "active",
};

export function parseCatalogFilters(params: SearchParams): CatalogFilters {
  const category = first(params.categoria);
  const modality = first(params.modalidad);
  return {
    query: (first(params.q) ?? "").trim().slice(0, 80),
    category: isOneOf(category, RESOURCE_CATEGORIES) ? category : null,
    modality: isOneOf(modality, RESOURCE_MODALITIES) ? modality : null,
    statusView: statusViewOf(params),
  };
}

/** Si la URL pide explícitamente un estado (?disponibles=1 o ?entregados=1). */
export function hasStatusParam(params: SearchParams): boolean {
  return first(params.disponibles) === "1" || first(params.entregados) === "1";
}

/** Criterios que resuelve el catálogo en el servidor (texto, categoría y estados). */
export function toSearchCriteria(filters: CatalogFilters): ResourceSearchCriteria {
  return {
    text: filters.query || undefined,
    category: filters.category ?? undefined,
    statuses: STATUS_VIEWS[filters.statusView],
  };
}

/** Enlace al catálogo con los filtros actuales más los cambios indicados. */
export function catalogHref(filters: CatalogFilters, changes: Partial<CatalogFilters> = {}): string {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.query) params.set("q", next.query);
  if (next.category) params.set("categoria", next.category);
  if (next.modality) params.set("modalidad", next.modality);
  if (next.statusView === "available") params.set("disponibles", "1");
  if (next.statusView === "delivered") params.set("entregados", "1");
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export interface CatalogView {
  visible: CatalogEntry[];
  counts: Record<ResourceModality | "all", number>;
}

/**
 * Aplica el filtro de modalidad sobre el resultado de la búsqueda y cuenta
 * cuántos recursos hay en cada modalidad para mostrarlo en los botones de filtro.
 */
export function buildCatalogView(entries: CatalogEntry[], filters: CatalogFilters): CatalogView {
  const counts = { all: entries.length, donation: 0, exchange: 0, sale: 0 };
  for (const entry of entries) counts[entry.modality] += 1;
  const visible = filters.modality
    ? entries.filter((entry) => entry.modality === filters.modality)
    : entries;
  return { visible, counts };
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.query || filters.category || filters.modality || filters.statusView !== "active",
  );
}

function statusViewOf(params: SearchParams): StatusView {
  if (first(params.entregados) === "1") return "delivered";
  if (first(params.disponibles) === "1") return "available";
  return "active";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(value: string | undefined, options: readonly T[]): value is T {
  return value !== undefined && (options as readonly string[]).includes(value);
}
