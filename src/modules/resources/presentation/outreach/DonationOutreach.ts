import type { ModalityOutreach, OutreachDetails } from "./ModalityOutreach";

export class DonationOutreach implements ModalityOutreach {
  readonly modality = "donation" as const;

  composeRequest(details: OutreachDetails): string {
    return `Hola, vi tu donación «${details.title}» en Reutiliza. ¿Sigue disponible?`;
  }

  describeHandoff(location: string, _details: OutreachDetails): string {
    return `Quien lo publicó lo regala. Se recoge en ${location}.`;
  }

  tagValue(_details: OutreachDetails): string {
    return "Gratis";
  }
}
