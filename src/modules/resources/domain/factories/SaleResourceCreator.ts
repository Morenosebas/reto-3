import { ValidationError } from "../errors";
import { SaleResource, type BaseResourceProps } from "../Resource";
import { MAX_SALE_PRICE } from "../ResourceAttributes";
import { ResourceCreator, type ResourceDraft } from "./ResourceCreator";

export class SaleResourceCreator extends ResourceCreator {
  protected createResource(
    base: BaseResourceProps,
    draft: ResourceDraft,
  ): SaleResource {
    const price = Number(draft.price);
    if (draft.price === "" || draft.price == null || !Number.isFinite(price)) {
      throw new ValidationError("El precio es obligatorio para una venta");
    }
    if (price <= 0 || price > MAX_SALE_PRICE) {
      throw new ValidationError(
        `El precio debe ser mayor a 0 y no superar ${MAX_SALE_PRICE.toLocaleString("es-CO")}`,
      );
    }
    return new SaleResource(base, Math.round(price));
  }
}
