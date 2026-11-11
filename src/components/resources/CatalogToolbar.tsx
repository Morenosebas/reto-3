import Form from "next/form";
import Link from "next/link";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_MODALITIES,
} from "@/modules/resources/domain/ResourceAttributes";
import {
  catalogHref,
  hasActiveFilters,
  type CatalogFilters,
  type CatalogView,
} from "@/modules/resources/presentation/catalogFilters";
import { CATEGORY_LABELS, MODALITY_LABELS } from "@/modules/resources/presentation/labels";
import { AutoSubmitSelect } from "./AutoSubmitSelect";
import { MODALITY_FILL } from "./modalityStyles";

const chipClass = (active: boolean) =>
  `flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors ${
    active ? "border-ink bg-ink text-paper" : "border-ink/25 text-ink hover:border-ink"
  }`;

/**
 * Búsqueda y filtros del catálogo. Todo viaja en la URL, así que un enlace
 * filtrado se puede compartir y funciona aunque no cargue JavaScript.
 */
export function CatalogToolbar({
  filters,
  counts,
}: {
  filters: CatalogFilters;
  counts: CatalogView["counts"];
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-5">
      <h2 id="published-heading" className="font-display text-3xl font-extrabold [font-stretch:72%]">
        Lo que hay para llevar
      </h2>

      <Form key={catalogHref(filters)} action="/" role="search" className="flex flex-wrap gap-2">
        <label htmlFor="catalog-search" className="sr-only">
          Buscar recursos
        </label>
        <input
          id="catalog-search"
          name="q"
          type="search"
          defaultValue={filters.query}
          placeholder="Buscar por objeto, barrio o ciudad"
          maxLength={80}
          className="min-w-0 flex-[1_1_14rem] border-2 border-ink/30 bg-field px-3 py-2 text-base outline-none focus:border-pen"
        />
        <label htmlFor="catalog-category" className="sr-only">
          Categoría
        </label>
        <AutoSubmitSelect
          id="catalog-category"
          name="categoria"
          defaultValue={filters.category ?? ""}
          className="flex-[0_1_12rem] border-2 border-ink/30 bg-field px-3 py-2 text-base outline-none focus:border-pen"
        >
          <option value="">Todas las categorías</option>
          {RESOURCE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </AutoSubmitSelect>
        {filters.modality && <input type="hidden" name="modalidad" value={filters.modality} />}
        {filters.statusView === "available" && <input type="hidden" name="disponibles" value="1" />}
        {filters.statusView === "delivered" && <input type="hidden" name="entregados" value="1" />}
        <button
          type="submit"
          className="border-2 border-ink bg-ink px-4 py-2 text-sm font-bold text-paper hover:bg-ink/85"
        >
          Buscar
        </button>
      </Form>

      <nav aria-label="Filtrar por modalidad y disponibilidad" className="flex flex-wrap items-center gap-2">
        <Link
          href={catalogHref(filters, { modality: null })}
          scroll={false}
          aria-current={filters.modality === null ? "page" : undefined}
          className={chipClass(filters.modality === null)}
        >
          Todos
          <span className="font-normal opacity-70">{counts.all}</span>
        </Link>
        {RESOURCE_MODALITIES.map((modality) => (
          <Link
            key={modality}
            href={catalogHref(filters, { modality })}
            scroll={false}
            aria-current={filters.modality === modality ? "page" : undefined}
            className={chipClass(filters.modality === modality)}
          >
            <span aria-hidden className={`size-3 rounded-full ring-1 ring-tag-ink/30 ${MODALITY_FILL[modality]}`} />
            {MODALITY_LABELS[modality]}
            <span className="font-normal opacity-70">{counts[modality]}</span>
          </Link>
        ))}
        {(
          [
            ["available", "Solo disponibles"],
            ["delivered", "Entregados"],
          ] as const
        ).map(([view, label]) => {
          const active = filters.statusView === view;
          return (
            <Link
              key={view}
              href={catalogHref(filters, { statusView: active ? "active" : view })}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={`${chipClass(active)} border-dashed`}
            >
              {label}
            </Link>
          );
        })}
        {hasActiveFilters(filters) && (
          <Link
            href="/"
            scroll={false}
            className="ml-1 text-sm font-bold underline decoration-2 underline-offset-4"
          >
            Quitar filtros
          </Link>
        )}
      </nav>
    </div>
  );
}
