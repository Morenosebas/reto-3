import { ValidationError } from "../errors";
import { SaleResource, type BaseResourceProps } from "../Resource";
import { MAX_SALE_PRICE } from "../ResourceAttributes";
import { ResourceCreator, type ResourceDraft } from "./ResourceCreator";

export class SaleResourceCreator extends ResourceCreator {
  protected createResource(
    base: BaseResourceProps,
    draft: ResourceDraft,
  ): SaleResource {
    const rawPrice = draft.price;
    // La API admite números y texto decimal del formulario, nunca coerciones
    // de booleanos, arrays u objetos. Los precios se expresan en pesos enteros.
    if (
      (typeof rawPrice !== "number" && typeof rawPrice !== "string") ||
      (typeof rawPrice === "string" && !/^\d+$/.test(rawPrice.trim()))
    ) {
      throw new ValidationError("El precio debe ser un número entero de pesos");
    }
    const price = Number(rawPrice);
    if (!Number.isSafeInteger(price) || price < 1 || price > MAX_SALE_PRICE) {
      throw new ValidationError(
        `El precio debe ser un entero entre 1 y ${MAX_SALE_PRICE.toLocaleString("es-CO")} COP`,
      );
    }
    return new SaleResource(base, price);
  }
}
