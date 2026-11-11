import type { ResourceSearchCriteria } from "../application/ListResources";
import type { CatalogEntry } from "../presentation/ResourceDTO";

/**
 * Operaciones del catálogo de recursos en el lenguaje del negocio. La
 * implementan la fachada CommunityCatalog y el proxy OwnerProtectedCatalog,
 * así que quien la usa no distingue entre uno y otro.
 */
export interface ResourceCatalog {
  browse(criteria?: ResourceSearchCriteria): Promise<CatalogEntry[]>;
  find(id: string): Promise<CatalogEntry>;
  publish(input: unknown): Promise<CatalogEntry>;
  edit(id: string, changes: unknown): Promise<CatalogEntry>;
  withdraw(id: string): Promise<void>;
}
