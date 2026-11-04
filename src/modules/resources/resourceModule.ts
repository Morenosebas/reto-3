import { CreateResource } from "./application/CreateResource";
import { DeleteResource } from "./application/DeleteResource";
import { GetResource } from "./application/GetResource";
import { ListResources } from "./application/ListResources";
import { UpdateResource } from "./application/UpdateResource";
import { CachingRepositoryDecorator } from "./infrastructure/CachingRepositoryDecorator";
import { InMemoryResourceRepository } from "./infrastructure/InMemoryResourceRepository";
import { LoggingRepositoryDecorator } from "./infrastructure/LoggingRepositoryDecorator";

/**
 * Raíz de composición del módulo.
 *
 * Es el único lugar que conoce las implementaciones concretas del repositorio
 * y los decoradores. Los casos de uso solo conocen la interfaz ResourceRepository.
 *
 * Decorator: se apilan dos decoradores sobre el repositorio base:
 *   InMemoryResourceRepository (base)
 *     → CachingRepositoryDecorator  (evita lecturas repetidas)
 *       → LoggingRepositoryDecorator (registra cada operación)
 *
 * Para cambiar el comportamiento basta con añadir, quitar o reordenar
 * decoradores aquí; ningún caso de uso se ve afectado.
 */
const baseRepository = InMemoryResourceRepository.getInstance();
const cachedRepository = new CachingRepositoryDecorator(baseRepository);
const repository = new LoggingRepositoryDecorator(cachedRepository);

export const resourceUseCases = {
  list: new ListResources(repository),
  get: new GetResource(repository),
  create: new CreateResource(repository),
  update: new UpdateResource(repository),
  delete: new DeleteResource(repository),
};
