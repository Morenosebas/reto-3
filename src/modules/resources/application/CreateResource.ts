import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";
import { parseResourceCreation } from "./ResourceSchemas";

export class CreateResource {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(input: unknown): Promise<Resource> {
    const validInput = parseResourceCreation(input);
    // El caso de uso no conoce las subclases de Resource: solo pide el
    // creador de la modalidad y llama al método de fábrica.
    const resource = getResourceCreator(validInput.modality).create(validInput);
    await this.repository.save(resource);
    return resource;
  }
}
