import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

// En `next dev` el hot reload vuelve a evaluar los módulos, lo que borraría
// una propiedad estática. Guardar la instancia en globalThis la conserva
// entre recargas y la comparte entre todos los Route Handlers y páginas.
const globalForRepository = globalThis as typeof globalThis & {
  inMemoryResourceRepository?: InMemoryResourceRepository;
};

/**
 * Singleton: existe una sola instancia del almacén en memoria para todo el
 * proceso. Si cada endpoint creara la suya, un recurso guardado con POST no
 * sería visible para el GET.
 *
 * Los datos se pierden al reiniciar el servidor; cuando se elija una base de
 * datos, basta con otra implementación de ResourceRepository.
 */
export class InMemoryResourceRepository implements ResourceRepository {
  private readonly resources = new Map<string, Resource>();

  // Constructor privado: la única forma de obtener el repositorio es getInstance().
  private constructor() {
    this.seed();
  }

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

  private seed() {
    const samples = [
      {
        modality: "donation",
        title: "Cuna de madera",
        description: "Cuna en buen estado, incluye colchón. Mi hijo ya no la usa.",
        category: "furniture",
        location: "Bello, Antioquia",
      },
      {
        modality: "exchange",
        title: "Libros de cálculo universitario",
        description: "Stewart 7.ª edición y Larson, con pocas anotaciones a lápiz.",
        category: "books",
        location: "Laureles, Medellín",
        wantedInReturn: "Libros de programación o física",
      },
      {
        modality: "sale",
        title: "Retazos de madera de pino",
        description: "Sobrantes de un proyecto de carpintería, ideales para manualidades.",
        category: "materials",
        location: "San Fernando, Cali",
        price: 15000,
      },
    ];

    for (const { modality, ...draft } of samples) {
      const resource = getResourceCreator(modality).create(draft);
      this.resources.set(resource.id, resource);
    }
  }
}
