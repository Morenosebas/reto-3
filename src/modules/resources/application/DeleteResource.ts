import { ResourceNotFoundError } from "../domain/errors";
import type { ResourceRepository } from "../domain/ResourceRepository";

export class DeleteResource {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new ResourceNotFoundError(id);
  }
}
