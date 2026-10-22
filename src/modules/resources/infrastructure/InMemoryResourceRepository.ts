import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

// En `next dev` el hot reload vuelve a evaluar los módulos, lo que borraría
// una propiedad estática. Guardar la instancia en globalThis la conserva
// entre reevaluaciones dentro del mismo contexto de ejecución. No comparte
// memoria entre workers, procesos ni instancias serverless.
const globalForRepository = globalThis as typeof globalThis & {
  inMemoryResourceRepository?: InMemoryResourceRepository;
};

/**
 * Singleton: existe una sola instancia del almacén en memoria para todo el
 * contexto de ejecución. Si cada endpoint creara la suya, un recurso guardado con POST no
 * sería visible para el GET.
 *
 * Los datos se pierden al reiniciar el servidor; cuando se elija una base de
 * datos, basta con otra implementación de ResourceRepository.
 */
export class InMemoryResourceRepository implements ResourceRepository {
  private readonly resources = new Map<string, Resource>();

  private constructor() {}

  static getInstance(): InMemoryResourceRepository {
    globalForRepository.inMemoryResourceRepository ??= new InMemoryResourceRepository();
    return globalForRepository.inMemoryResourceRepository;
  }

  async findAll(): Promise<Resource[]> {
    return [...this.resources.values()];
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resources.get(id) ?? null;
  }

  async save(resource: Resource): Promise<void> {
    this.resources.set(resource.id, resource);
  }

  async delete(id: string): Promise<boolean> {
    return this.resources.delete(id);
  }
}
