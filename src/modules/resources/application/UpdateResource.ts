import { ResourceNotFoundError } from "../domain/errors";
import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";
import { parseResourceCreation, parseResourcePatch } from "./ResourceSchemas";

export class UpdateResource {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(id: string, input: unknown): Promise<Resource> {
    const changes = parseResourcePatch(input);
    const current = await this.repository.findById(id);
    if (!current) throw new ResourceNotFoundError(id);

    const merged = {
      title: current.title,
      description: current.description,
      category: current.category,
      location: current.location,
      status: current.status,
      ...current.modalityDetails(),
      ...withoutUndefined(changes),
      modality: changes.modality ?? current.modality,
    };

    const draft = parseResourceCreation(merged);
    const updated = getResourceCreator(draft.modality).create(draft, {
      id: current.id,
      createdAt: current.createdAt,
    });

    await this.repository.save(updated);
    return updated;
  }
}

function withoutUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
