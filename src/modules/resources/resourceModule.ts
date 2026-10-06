import { CreateResource } from "./application/CreateResource";
import { DeleteResource } from "./application/DeleteResource";
import { GetResource } from "./application/GetResource";
import { ListResources } from "./application/ListResources";
import { UpdateResource } from "./application/UpdateResource";
import { InMemoryResourceRepository } from "./infrastructure/InMemoryResourceRepository";

// Raíz de composición del módulo: el único lugar que conoce la
// implementación concreta del repositorio. Todos los casos de uso reciben
// la misma instancia porque el repositorio es un Singleton.
const repository = InMemoryResourceRepository.getInstance();

export const resourceUseCases = {
  list: new ListResources(repository),
  get: new GetResource(repository),
  create: new CreateResource(repository),
  update: new UpdateResource(repository),
  delete: new DeleteResource(repository),
};
