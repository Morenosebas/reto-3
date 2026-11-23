import { formatPrice } from "../labels";
import type { ModalityOutreach, OutreachDetails } from "./ModalityOutreach";

export class SaleOutreach implements ModalityOutreach {
  readonly modality = "sale" as const;

  composeRequest(details: OutreachDetails): string {
    const price =
      details.price !== undefined ? ` Vi el precio solidario de ${formatPrice(details.price)}.` : "";
    return `Hola, vi tu venta «${details.title}» en Reutiliza.${price} ¿Sigue disponible?`;
  }

  describeHandoff(location: string, details: OutreachDetails): string {
    const price =
      details.price !== undefined ? formatPrice(details.price) : "un precio solidario";
    return `Se vende a un precio solidario de ${price}. Se recoge en ${location}.`;
  }

  tagValue(details: OutreachDetails): string {
    return details.price !== undefined ? formatPrice(details.price) : "Precio por definir";
  }
}
