import { CreateResource } from "./application/CreateResource";
import { DeleteResource } from "./application/DeleteResource";
import { GetResource } from "./application/GetResource";
import { ListResources } from "./application/ListResources";
import { UpdateResource } from "./application/UpdateResource";
import { InMemoryResourceRepository } from "./infrastructure/InMemoryResourceRepository";


const repository = InMemoryResourceRepository.getInstance();

export const resourceUseCases = {
  list: new ListResources(repository),
  get: new GetResource(repository),
  create: new CreateResource(repository),
  update: new UpdateResource(repository),
  delete: new DeleteResource(repository),
};
