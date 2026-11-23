import type { ModalityOutreach, OutreachDetails } from "./ModalityOutreach";

export class ExchangeOutreach implements ModalityOutreach {
  readonly modality = "exchange" as const;

  composeRequest(details: OutreachDetails): string {
    const wanted = details.wantedInReturn
      ? ` Puedo ofrecer a cambio: ${details.wantedInReturn}.`
      : "";
    return `Hola, vi tu intercambio «${details.title}» en Reutiliza.${wanted} ¿Te interesa?`;
  }

  describeHandoff(location: string, details: OutreachDetails): string {
    const wanted = details.wantedInReturn ?? "algo a convenir";
    return `Quien lo publicó lo cambia por: ${wanted}. Se recoge en ${location}.`;
  }

  tagValue(details: OutreachDetails): string {
    return details.wantedInReturn
      ? `Lo cambio por ${details.wantedInReturn}`
      : "Lo cambio por…";
  }
}
