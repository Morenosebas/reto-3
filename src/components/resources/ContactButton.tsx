import { PublicationStatus } from "@/modules/resources/domain/lifecycle";
import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { outreachFor } from "@/modules/resources/presentation/outreach";
import { WhatsAppLink } from "./WhatsAppLink";

/** Para quien visita: abre WhatsApp o explica por qué no se puede pedir. */
export function ContactButton({ resource }: { resource: ResourceDTO }) {
  const status = new PublicationStatus(resource.status);
  const notice = status.noticeForVisitor();
  if (notice) {
    return <p className="mt-4 text-sm font-bold">{notice}</p>;
  }
  if (!status.allowsVisitorContact() || !resource.contactPhone) return null;

  const message = outreachFor(resource.modality).composeRequest({
    title: resource.title,
    wantedInReturn: resource.wantedInReturn,
    price: resource.price,
  });

  return (
    <WhatsAppLink
      phone={resource.contactPhone}
      text={message}
      className="mt-4 inline-flex items-center bg-tag-ink px-4 py-2.5 text-sm font-bold text-sheet transition-opacity hover:opacity-90"
    >
      Escribir por WhatsApp
    </WhatsAppLink>
  );
}
