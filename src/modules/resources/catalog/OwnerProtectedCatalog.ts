import type { ResourceSearchCriteria } from "../application/ListResources";
import { NotResourcePublisherError } from "../domain/errors";
import type { CatalogEntry } from "../presentation/ResourceDTO";
import type { PublisherRegistry } from "./PublisherRegistry";
import type { ResourceCatalog } from "./ResourceCatalog";

/**
 * Proxy de protección: tiene la misma interfaz que el catálogo real y decide,
 * antes de delegar, si el visitante puede hacer la operación. Solo quien
 * publicó un recurso puede editarlo o retirarlo.
 *
 * `visitorId` es la huella de la clave de publicante del visitante, o null si
 * todavía no ha publicado nada desde este navegador.
 */
export class OwnerProtectedCatalog implements ResourceCatalog {
  constructor(
    private readonly catalog: ResourceCatalog,
    private readonly publishers: PublisherRegistry,
    private readonly visitorId: string | null,
  ) {}

  async browse(criteria?: ResourceSearchCriteria): Promise<CatalogEntry[]> {
    const entries = await this.catalog.browse(criteria);
    return Promise.all(entries.map((entry) => this.withPermissions(entry)));
  }

  async find(id: string): Promise<CatalogEntry> {
    return this.withPermissions(await this.catalog.find(id));
  }

  async publish(input: unknown): Promise<CatalogEntry> {
    if (this.visitorId === null) {
      throw new NotResourcePublisherError("Se necesita una clave de publicante para publicar");
    }
    const entry = await this.catalog.publish(input);
    await this.publishers.register(entry.id, this.visitorId);
    return { ...entry, canManage: true };
  }

  async edit(id: string, changes: unknown): Promise<CatalogEntry> {
    await this.assertIsPublisher(id);
    return { ...(await this.catalog.edit(id, changes)), canManage: true };
  }

  async withdraw(id: string): Promise<void> {
    await this.assertIsPublisher(id);
    await this.catalog.withdraw(id);
    await this.publishers.forget(id);
  }

  private async withPermissions(entry: CatalogEntry): Promise<CatalogEntry> {
    return { ...entry, canManage: await this.isPublisherOf(entry.id) };
  }

  private async isPublisherOf(id: string): Promise<boolean> {
    if (this.visitorId === null) return false;
    return (await this.publishers.publisherOf(id)) === this.visitorId;
  }

  private async assertIsPublisher(id: string): Promise<void> {
    if (await this.isPublisherOf(id)) return;
    // Si el recurso no existe, el catálogo real responde que no se encontró;
    // solo si existe se informa que el visitante no puede gestionarlo.
    await this.catalog.find(id);
    throw new NotResourcePublisherError();
  }
}
