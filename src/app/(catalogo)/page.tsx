import { CatalogToolbar } from "@/components/resources/CatalogToolbar";
import { ResourceManager, type Panel } from "@/components/resources/ResourceManager";
import { findCatalogEntry, getCatalog } from "@/modules/resources/catalog/catalogAccess";
import {
  buildCatalogView,
  hasActiveFilters,
  parseCatalogFilters,
  toSearchCriteria,
} from "@/modules/resources/presentation/catalogFilters";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);

  // getCatalog lee la cookie del visitante, así que la página se genera en cada petición.
  const catalog = await getCatalog();
  const entries = await catalog.browse(toSearchCriteria(filters));
  const { visible, counts } = buildCatalogView(entries, filters);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-6 sm:px-8">
      <ResourceManager
        entries={visible}
        hasFilters={hasActiveFilters(filters)}
        initialPanel={await panelFromUrl(params)}
        hero={
          <header className="mt-8 mb-10 grid gap-5 sm:mt-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.92] tracking-[-0.01em] [font-stretch:62%]">
              Lo que ya no usas, a alguien le sirve.
            </h1>
            <p className="max-w-[34rem] text-lg leading-relaxed text-ink-soft">
              Publica aquí los objetos y materiales que tienes guardados, esos que ya no usas.
              Puedes regalarlos, intercambiarlos por algo que necesites o venderlos a un precio justo.
            </p>
          </header>
        }
        toolbar={<CatalogToolbar filters={filters} counts={counts} />}
      />
    </main>
  );
}

// ?publicar=1 abre el formulario; ?editar=id lo abre con ese recurso si el
// visitante es quien lo publicó (enlaces desde la página de detalle).
async function panelFromUrl(params: Record<string, string | string[] | undefined>): Promise<Panel> {
  if (typeof params.editar === "string") {
    const entry = await findCatalogEntry(params.editar);
    if (entry?.canManage) return { mode: "edit", entry };
  }
  if (params.publicar === "1") return { mode: "publish" };
  return { mode: "closed" };
}
