import type { Resource } from "../domain/Resource";
import type {
  ResourceCategory,
  ResourceModality,
  ResourceStatus,
} from "../domain/ResourceAttributes";

/** Forma serializable de un recurso, compartida por la API y la interfaz. */
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
  createdAt: string;
  updatedAt: string;
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
    ...resource.modalityDetails(),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}
