import type { Resource } from "./Resource";

/** Contrato de persistencia. La implementación vive en infrastructure. */
export interface ResourceRepository {
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  /** Inserta el recurso o reemplaza el existente con el mismo id. */
  save(resource: Resource): Promise<void>;
  /** Devuelve false si el recurso no existía. */
  delete(id: string): Promise<boolean>;
}
