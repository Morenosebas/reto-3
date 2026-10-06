import { ResourceNotFoundError } from "../domain/errors";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

export class GetResource {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(id: string): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource) throw new ResourceNotFoundError(id);
    return resource;
  }
}
