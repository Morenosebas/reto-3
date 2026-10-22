import type { Resource } from "./Resource";

export interface ResourceRepository {
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  save(resource: Resource): Promise<void>;
  delete(id: string): Promise<boolean>;
}
