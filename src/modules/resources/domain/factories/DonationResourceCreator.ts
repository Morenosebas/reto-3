import { DonationResource, type BaseResourceProps } from "../Resource";
import { ResourceCreator } from "./ResourceCreator";

export class DonationResourceCreator extends ResourceCreator {
  protected createResource(base: BaseResourceProps): DonationResource {
    return new DonationResource(base);
  }
}
