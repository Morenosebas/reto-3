import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

export class ListResources {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(): Promise<Resource[]> {
    const resources = await this.repository.findAll();
    return resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
