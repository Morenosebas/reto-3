import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactButton } from "@/components/resources/ContactButton";
import { ResourceDetailActions } from "@/components/resources/ResourceDetailActions";
import { ResourceTag } from "@/components/resources/ResourceTag";
import { ShareButton } from "@/components/resources/ShareButton";
import { findCatalogEntry, getCatalog } from "@/modules/resources/catalog/catalogAccess";
import { STATUS_VIEWS } from "@/modules/resources/presentation/catalogFilters";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";
import {
  CATEGORY_LABELS,
  formatPrice,
  MODALITY_LABELS,
} from "@/modules/resources/presentation/labels";

export async function generateMetadata({ params }: PageProps<"/recursos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const resource = await findCatalogEntry(id);
  if (!resource) return { title: "Publicación no encontrada · Reutiliza" };

  const description = `${MODALITY_LABELS[resource.modality]} en ${resource.location}. ${resource.description}`;
  return {
    title: `${resource.title} · Reutiliza`,
    description,
    openGraph: { title: resource.title, description, type: "article", locale: "es_CO" },
  };
}

export default async function ResourcePage({ params }: PageProps<"/recursos/[id]">) {
  const { id } = await params;
  const resource = await findCatalogEntry(id);
  if (!resource) notFound();

  // Más publicaciones de la misma categoría, con la misma Fachada del catálogo.
  const catalog = await getCatalog();
  const related = (await catalog.browse({ category: resource.category, statuses: STATUS_VIEWS.active }))
    .filter((entry) => entry.id !== resource.id)
    .slice(0, 3);
  const contactable = resource.status === "available" && Boolean(resource.contactPhone);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-20 pt-6 sm:px-8">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-extrabold [font-stretch:150%]">
          Reutiliza
        </Link>
        <Link href="/" className="text-sm font-bold underline decoration-2 underline-offset-4">
          Volver al catálogo
        </Link>
      </nav>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_17rem] md:items-start">
        <ResourceTag resource={resource} size="page">
          {resource.canManage ? (
            <ResourceDetailActions resource={resource} />
          ) : (
            <ContactButton resource={resource} />
          )}
        </ResourceTag>

        <aside className="flex flex-col gap-6 border-t-2 border-ink pt-5 md:border-t-0 md:border-l-2 md:pl-6 md:pt-0">
          <div>
            <h2 className="font-display text-xl font-extrabold [font-stretch:80%]">Cómo se entrega</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{deliveryText(resource)}</p>
            {!resource.canManage && (
              <p className="mt-2 leading-relaxed text-ink-soft">
                {contactable
                  ? "Escríbele por WhatsApp a quien lo publicó para coordinar la entrega."
                  : resource.status === "reserved"
                    ? "Quien lo publicó ya lo apartó para otra persona."
                    : resource.status === "delivered"
                      ? "Ya fue entregado. En el catálogo hay más cosas esperando."
                    : "Quien lo publicó no dejó un número de contacto."}
              </p>
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold [font-stretch:80%]">Compártelo</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              ¿Conoces a alguien a quien le sirva? Envíale el enlace de esta publicación.
            </p>
            <ShareButton title={resource.title} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
            <h2 id="related-heading" className="font-display text-3xl font-extrabold [font-stretch:72%]">
              Más en {CATEGORY_LABELS[resource.category]}
            </h2>
            <Link
              href={`/?categoria=${resource.category}`}
              className="text-sm font-bold underline decoration-2 underline-offset-4"
            >
              Ver todo en {CATEGORY_LABELS[resource.category]}
            </Link>
          </div>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {related.map((entry) => (
              <div key={entry.id} className="mb-6 break-inside-avoid">
                <ResourceTag resource={entry} href={`/recursos/${entry.id}`}>
                  {!entry.canManage && <ContactButton resource={entry} />}
                </ResourceTag>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function deliveryText(resource: CatalogEntry): string {
  switch (resource.modality) {
    case "donation":
      return `Quien lo publicó lo regala. Se recoge en ${resource.location}.`;
    case "exchange":
      return `Quien lo publicó lo cambia por: ${resource.wantedInReturn}. Se recoge en ${resource.location}.`;
    case "sale":
      return `Se vende a un precio solidario de ${formatPrice(resource.price ?? 0)}. Se recoge en ${resource.location}.`;
  }
}
