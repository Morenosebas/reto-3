import type { Storage } from "unstorage";
import { getResourceCreator } from "../domain/factories";
import type { Resource } from "../domain/Resource";
import type { ResourceRepository } from "../domain/ResourceRepository";

/** Forma en que un recurso queda en el almacén: JSON plano, sin clases ni fechas. */
export interface StoredResourceRecord {
  id: string;
  modality: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  wantedInReturn?: string;
  price?: number;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

const RESOURCES_PREFIX = "resources";
// Los ids son UUID; cualquier otra forma no puede existir en el almacén y
// además evitaría que una clave arbitraria llegue a la ruta de un archivo.
const STORABLE_ID = /^[A-Za-z0-9-]+$/;

/**
 * Adapter: hace que el almacén clave-valor de unstorage (Adaptee), que solo
 * entiende claves de texto y JSON plano, cumpla el contrato del dominio
 * ResourceRepository (Target), que trabaja con entidades Resource.
 */
export class UnstorageResourceRepository implements ResourceRepository {
  constructor(private readonly storage: Storage) {}

  async findAll(): Promise<Resource[]> {
    const keys = await this.storage.getKeys(RESOURCES_PREFIX);
    const records = await Promise.all(
      keys.map((key) => this.storage.getItem<StoredResourceRecord>(key)),
    );
    return records
      .filter((record): record is StoredResourceRecord => record !== null)
      .map(toResource);
  }

  async findById(id: string): Promise<Resource | null> {
    if (!STORABLE_ID.test(id)) return null;
    const record = await this.storage.getItem<StoredResourceRecord>(keyOf(id));
    return record ? toResource(record) : null;
  }

  async save(resource: Resource): Promise<void> {
    await this.storage.setItem(keyOf(resource.id), toRecord(resource));
  }

  async delete(id: string): Promise<boolean> {
    if (!STORABLE_ID.test(id)) return false;
    const key = keyOf(id);
    if (!(await this.storage.hasItem(key))) return false;
    await this.storage.removeItem(key);
    return true;
  }
}

function keyOf(id: string): string {
  return `${RESOURCES_PREFIX}:${id}`;
}

function toRecord(resource: Resource): StoredResourceRecord {
  return {
    id: resource.id,
    modality: resource.modality,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    location: resource.location,
    status: resource.status,
    ...(resource.contactPhone && { contactPhone: resource.contactPhone }),
    ...resource.modalityDetails(),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

// El registro guardado se convierte de nuevo en entidad con la fábrica de su
// modalidad (Factory Method), que vuelve a aplicar las reglas del dominio.
function toResource(record: StoredResourceRecord): Resource {
  try {
    return getResourceCreator(record.modality).create(record, {
      id: record.id,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  } catch (error) {
    throw new Error(`El recurso almacenado "${record.id}" no es válido`, { cause: error });
  }
}
