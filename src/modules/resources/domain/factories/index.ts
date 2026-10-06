import { ValidationError } from "../errors";
import { RESOURCE_MODALITIES, type ResourceModality } from "../ResourceAttributes";
import { DonationResourceCreator } from "./DonationResourceCreator";
import { ExchangeResourceCreator } from "./ExchangeResourceCreator";
import type { ResourceCreator } from "./ResourceCreator";
import { SaleResourceCreator } from "./SaleResourceCreator";

export type { ResourceCreator, ResourceDraft, ResourceIdentity } from "./ResourceCreator";

const creators: Record<ResourceModality, ResourceCreator> = {
  donation: new DonationResourceCreator(),
  exchange: new ExchangeResourceCreator(),
  sale: new SaleResourceCreator(),
};

/** Devuelve el creador concreto que corresponde a la modalidad pedida. */
export function getResourceCreator(modality: unknown): ResourceCreator {
  if (!RESOURCE_MODALITIES.includes(modality as ResourceModality)) {
    throw new ValidationError("La modalidad debe ser donación, intercambio o venta");
  }
  return creators[modality as ResourceModality];
}
