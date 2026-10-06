import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";
import type { ResourceInput } from "./ResourceInput";

export class CreateResource {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(input: ResourceInput): Promise<Resource> {
    // El caso de uso no conoce las subclases de Resource: solo pide el
    // creador de la modalidad y llama al método de fábrica.
    const resource = getResourceCreator(input.modality).create(input);
    await this.repository.save(resource);
    return resource;
  }
}
