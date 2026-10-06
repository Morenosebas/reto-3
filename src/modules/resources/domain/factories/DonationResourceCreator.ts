import { DonationResource, type BaseResourceProps } from "../Resource";
import { ResourceCreator } from "./ResourceCreator";

export class DonationResourceCreator extends ResourceCreator {
  // Una donación no tiene datos adicionales: se ignoran precio e intercambio.
  protected createResource(base: BaseResourceProps): DonationResource {
    return new DonationResource(base);
  }
}
