import { ResourceNotFoundError } from "../domain/errors";
import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";
import type { ResourceInput } from "./ResourceInput";

export class UpdateResource {
  constructor(private readonly repository: ResourceRepository) {}

  /**
   * Actualización parcial: los campos omitidos conservan su valor actual.
   * El recurso se reconstruye con la fábrica de su modalidad (que puede ser
   * otra), así las reglas de validación son las mismas que al crearlo.
   */
  async execute(id: string, changes: ResourceInput): Promise<Resource> {
    const current = await this.repository.findById(id);
    if (!current) throw new ResourceNotFoundError(id);

    const draft = {
      title: current.title,
      description: current.description,
      category: current.category,
      location: current.location,
      status: current.status,
      ...current.modalityDetails(),
      ...withoutUndefined(changes),
    };

    const modality = changes.modality ?? current.modality;
    const updated = getResourceCreator(modality).create(draft, {
      id: current.id,
      createdAt: current.createdAt,
    });

    await this.repository.save(updated);
    return updated;
  }
}

function withoutUndefined(input: ResourceInput): ResourceInput {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
}
