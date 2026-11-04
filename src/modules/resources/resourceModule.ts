import { CreateResource } from "./application/CreateResource";
import { DeleteResource } from "./application/DeleteResource";
import { GetResource } from "./application/GetResource";
import { ListResources } from "./application/ListResources";
import { UpdateResource } from "./application/UpdateResource";
import { CommunityCatalog, type ResourceUseCases } from "./catalog/CommunityCatalog";
import type { ResourceRepository } from "./domain/ResourceRepository";
import { InMemoryResourceRepository } from "./infrastructure/InMemoryResourceRepository";
import { getResourceStorage, usesMemoryStorage } from "./infrastructure/resourceStorage";
import { UnstorageResourceRepository } from "./infrastructure/UnstorageResourceRepository";
import { UnstoragePublisherRegistry } from "./infrastructure/UnstoragePublisherRegistry";

const storage = getResourceStorage();

// Por defecto los recursos persisten en archivos mediante el adaptador de
// unstorage. Con RESOURCE_STORAGE=memory se usa el Singleton en memoria.
const repository: ResourceRepository = usesMemoryStorage()
  ? InMemoryResourceRepository.getInstance()
  : new UnstorageResourceRepository(storage);

export const resourceUseCases: ResourceUseCases = {
  list: new ListResources(repository),
  get: new GetResource(repository),
  create: new CreateResource(repository),
  update: new UpdateResource(repository),
  delete: new DeleteResource(repository),
};

export const communityCatalog = new CommunityCatalog(resourceUseCases);
export const publisherRegistry = new UnstoragePublisherRegistry(storage);
