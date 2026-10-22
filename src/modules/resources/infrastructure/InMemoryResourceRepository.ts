import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

const globalForRepository = globalThis as typeof globalThis & {
  inMemoryResourceRepository?: InMemoryResourceRepository;
};

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
