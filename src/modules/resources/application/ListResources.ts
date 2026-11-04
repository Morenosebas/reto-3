import type { Resource } from "../domain/Resource";
import type { ResourceCategory, ResourceStatus } from "../domain/ResourceAttributes";
import type { ResourceRepository } from "../domain/ResourceRepository";

export interface ResourceSearchCriteria {
  /** Texto a buscar en título, descripción, ubicación y contraprestación. */
  text?: string;
  category?: ResourceCategory;
  /** Estados a mostrar; si se omite, se listan todos. */
  statuses?: readonly ResourceStatus[];
}

export class ListResources {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(criteria: ResourceSearchCriteria = {}): Promise<Resource[]> {
    const resources = await this.repository.findAll();
    return resources
      .filter((resource) => matches(resource, criteria))
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
  }
}

// Lo que todavía se puede pedir va primero; lo entregado, al final.
const STATUS_ORDER: Record<ResourceStatus, number> = {
  available: 0,
  reserved: 1,
  delivered: 2,
};

function matches(
  resource: Resource,
  { text, category, statuses }: ResourceSearchCriteria,
): boolean {
  if (statuses && !statuses.includes(resource.status)) return false;
  if (category && resource.category !== category) return false;
  const words = normalize(text ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const searchable = normalize(
    [
      resource.title,
      resource.description,
      resource.location,
      resource.modalityDetails().wantedInReturn ?? "",
    ].join(" "),
  );
  return words.every((word) => searchable.includes(word));
}

// "Bogotá" y "bogota" deben coincidir: se ignoran mayúsculas y tildes.
function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
