import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { requestMessage } from "@/modules/resources/presentation/contact";
import { WhatsAppLink } from "./WhatsAppLink";

/**
 * Para quien visita: abre la conversación de WhatsApp con el número que
 * guardó quien publicó. Si ya no se puede pedir, explica por qué no hay botón.
 */
export function ContactButton({ resource }: { resource: ResourceDTO }) {
  if (resource.status === "reserved") {
    return <p className="mt-4 text-sm font-bold">Apartado para otra persona.</p>;
  }
  if (resource.status === "delivered") {
    return <p className="mt-4 text-sm font-bold">Ya fue entregado.</p>;
  }
  if (!resource.contactPhone) return null;

  return (
    <WhatsAppLink
      phone={resource.contactPhone}
      text={requestMessage(resource.title)}
      className="mt-4 inline-flex items-center bg-tag-ink px-4 py-2.5 text-sm font-bold text-sheet transition-opacity hover:opacity-90"
    >
      Escribir por WhatsApp
    </WhatsAppLink>
  );
}
