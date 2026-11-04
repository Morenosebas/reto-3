import type { Resource } from "../domain/Resource";
import type {
  ResourceCategory,
  ResourceModality,
  ResourceStatus,
} from "../domain/ResourceAttributes";

export interface ResourceDTO {
  id: string;
  modality: ResourceModality;
  title: string;
  description: string;
  category: ResourceCategory;
  location: string;
  status: ResourceStatus;
  wantedInReturn?: string;
  price?: number;
  /** Celular colombiano (10 dígitos) para contactar a quien publica. */
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

/** Recurso tal como lo muestra el catálogo a quien lo visita. */
export interface CatalogEntry extends ResourceDTO {
  /** Si quien visita puede editarlo o retirarlo. */
  canManage: boolean;
}

export function toResourceDTO(resource: Resource): ResourceDTO {
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
