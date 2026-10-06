import { ExchangeResource, type BaseResourceProps } from "../Resource";
import { requireText, ResourceCreator, type ResourceDraft } from "./ResourceCreator";

export class ExchangeResourceCreator extends ResourceCreator {
  protected createResource(
    base: BaseResourceProps,
    draft: ResourceDraft,
  ): ExchangeResource {
    const wantedInReturn = requireText(draft.wantedInReturn, "qué buscas a cambio", {
      min: 3,
      max: 120,
    });
    return new ExchangeResource(base, wantedInReturn);
  }
}
