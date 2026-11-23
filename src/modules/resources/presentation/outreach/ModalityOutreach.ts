import type { ResourceModality } from "../../domain/ResourceAttributes";

export interface OutreachDetails {
  title: string;
  wantedInReturn?: string;
  price?: number;
}

/** Estrategia de textos según la modalidad del recurso. */
export interface ModalityOutreach {
  readonly modality: ResourceModality;
  composeRequest(details: OutreachDetails): string;
  describeHandoff(location: string, details: OutreachDetails): string;
  tagValue(details: OutreachDetails): string;
}
