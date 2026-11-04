import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

/**
 * Decorator — añade una capa de caché en memoria a cualquier ResourceRepository.
 *
 * Evita consultas repetidas al repositorio subyacente para operaciones de
 * lectura. Invalida la caché automáticamente al guardar o eliminar, garantizando
 * que los datos leídos siempre estén actualizados tras una mutación.
 *
 * Al igual que LoggingRepositoryDecorator, es transparente para los casos de
 * uso: implementa ResourceRepository y puede envolver cualquier implementación,
 * incluyendo otros decoradores.
 */
export class CachingRepositoryDecorator implements ResourceRepository {
  private cache: Resource[] | null = null;

  constructor(private readonly inner: ResourceRepository) {}

  async findAll(): Promise<Resource[]> {
    if (this.cache !== null) {
      console.log("[cache] findAll → devuelto desde caché");
      return this.cache;
    }
    const results = await this.inner.findAll();
    this.cache = results;
    console.log("[cache] findAll → cargado desde repositorio y cacheado");
    return results;
  }

  async findById(id: string): Promise<Resource | null> {
    // Aprovecha la caché si ya fue cargada; si no, delega al repositorio.
    if (this.cache !== null) {
      return this.cache.find((r) => r.id === id) ?? null;
    }
    return this.inner.findById(id);
  }

  async save(resource: Resource): Promise<void> {
    await this.inner.save(resource);
    this.cache = null; // invalida la caché tras cualquier escritura
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.inner.delete(id);
    this.cache = null; // invalida la caché tras cualquier eliminación
    return result;
  }
}
