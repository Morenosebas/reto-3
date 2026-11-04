import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

/**
 * Decorator — añade logging de auditoría a cualquier ResourceRepository.
 *
 * Implementa la misma interfaz que el repositorio que envuelve, por lo que
 * es transparente para los casos de uso. El comportamiento de logging se
 * puede activar o desactivar simplemente añadiendo o quitando este decorador
 * en la raíz de composición, sin tocar ninguna clase concreta de repositorio.
 */
export class LoggingRepositoryDecorator implements ResourceRepository {
  constructor(private readonly inner: ResourceRepository) {}

  async findAll(): Promise<Resource[]> {
    const results = await this.inner.findAll();
    console.log(`[repo] findAll → ${results.length} recurso(s)`);
    return results;
  }

  async findById(id: string): Promise<Resource | null> {
    const result = await this.inner.findById(id);
    console.log(`[repo] findById(${id}) → ${result ? "encontrado" : "no encontrado"}`);
    return result;
  }

  async save(resource: Resource): Promise<void> {
    await this.inner.save(resource);
    console.log(`[repo] save → id=${resource.id} modalidad=${resource.modality} título="${resource.title}"`);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.inner.delete(id);
    console.log(`[repo] delete(${id}) → ${deleted ? "eliminado" : "no existía"}`);
    return deleted;
  }
}
