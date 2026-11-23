import type { ResourceModality } from "../../domain/ResourceAttributes";
import { DonationOutreach } from "./DonationOutreach";
import { ExchangeOutreach } from "./ExchangeOutreach";
import type { ModalityOutreach } from "./ModalityOutreach";
import { SaleOutreach } from "./SaleOutreach";

export type { ModalityOutreach, OutreachDetails } from "./ModalityOutreach";
export { DonationOutreach } from "./DonationOutreach";
export { ExchangeOutreach } from "./ExchangeOutreach";
export { SaleOutreach } from "./SaleOutreach";

const STRATEGIES: Record<ResourceModality, ModalityOutreach> = {
  donation: new DonationOutreach(),
  exchange: new ExchangeOutreach(),
  sale: new SaleOutreach(),
};

export function outreachFor(modality: ResourceModality): ModalityOutreach {
  return STRATEGIES[modality];
}
