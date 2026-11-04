import type { CreateResource } from "../application/CreateResource";
import type { DeleteResource } from "../application/DeleteResource";
import type { GetResource } from "../application/GetResource";
import type { ListResources, ResourceSearchCriteria } from "../application/ListResources";
import type { UpdateResource } from "../application/UpdateResource";
import type { Resource } from "../domain/Resource";
import { toResourceDTO, type CatalogEntry } from "../presentation/ResourceDTO";
import type { ResourceCatalog } from "./ResourceCatalog";

/** Subsistema que la fachada coordina: un caso de uso por operación. */
export interface ResourceUseCases {
  list: ListResources;
  get: GetResource;
  create: CreateResource;
  update: UpdateResource;
  delete: DeleteResource;
}

/**
 * Facade: único punto de entrada al subsistema de recursos. Quien la usa
 * (página, Route Handlers) no conoce los casos de uso, la validación, la
 * fábrica, el repositorio ni la conversión a DTO.
 *
 * No restringe el acceso: cualquier visitante podría gestionar cualquier
 * recurso. Esa regla la agrega el proxy OwnerProtectedCatalog.
 */
export class CommunityCatalog implements ResourceCatalog {
  constructor(private readonly useCases: ResourceUseCases) {}

  async browse(criteria?: ResourceSearchCriteria): Promise<CatalogEntry[]> {
    const resources = await this.useCases.list.execute(criteria);
    return resources.map(toCatalogEntry);
  }

  async find(id: string): Promise<CatalogEntry> {
    return toCatalogEntry(await this.useCases.get.execute(id));
  }

  async publish(input: unknown): Promise<CatalogEntry> {
    return toCatalogEntry(await this.useCases.create.execute(input));
  }

  async edit(id: string, changes: unknown): Promise<CatalogEntry> {
    return toCatalogEntry(await this.useCases.update.execute(id, changes));
  }

  async withdraw(id: string): Promise<void> {
    await this.useCases.delete.execute(id);
  }
}

function toCatalogEntry(resource: Resource): CatalogEntry {
  return { ...toResourceDTO(resource), canManage: true };
}
