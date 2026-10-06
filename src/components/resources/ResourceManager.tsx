"use client";

import { useState } from "react";
import {
  RESOURCE_MODALITIES,
  type ResourceModality,
} from "@/modules/resources/domain/ResourceAttributes";
import { resourceApi, type ResourcePayload } from "@/modules/resources/presentation/resourceApi";
import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { MODALITY_LABELS } from "@/modules/resources/presentation/labels";
import { MODALITY_FILL } from "./modalityStyles";
import { ResourceCard } from "./ResourceCard";
import { ResourceForm } from "./ResourceForm";

type Filter = ResourceModality | "all";

export function ResourceManager({ initialResources }: { initialResources: ResourceDTO[] }) {
  const [resources, setResources] = useState(initialResources);
  const [editing, setEditing] = useState<ResourceDTO | null>(null);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const visible =
    filter === "all" ? resources : resources.filter((r) => r.modality === filter);

  function countFor(option: Filter) {
    return option === "all"
      ? resources.length
      : resources.filter((r) => r.modality === option).length;
  }

  async function handleSubmit(payload: ResourcePayload) {
    if (editing) {
      const updated = await resourceApi.update(editing.id, payload);
      setResources((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
      setJustSavedId(updated.id);
    } else {
      const created = await resourceApi.create(payload);
      setResources((current) => [created, ...current]);
      setJustSavedId(created.id);
      // Si el filtro ocultaría lo recién publicado, se muestran todos.
      setFilter((current) => (current === "all" || current === created.modality ? current : "all"));
    }
  }

  async function handleDelete(resource: ResourceDTO) {
    if (!window.confirm(`¿Eliminar "${resource.title}"? No se puede deshacer.`)) return;
    setError(null);
    try {
      await resourceApi.remove(resource.id);
      setResources((current) => current.filter((r) => r.id !== resource.id));
      if (editing?.id === resource.id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el recurso");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,23rem)_1fr] lg:items-start lg:gap-14">
      <div className="lg:sticky lg:top-6">
        {/* La key reinicia el formulario al cambiar entre publicar y editar */}
        <ResourceForm
          key={editing?.id ?? "new"}
          resource={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </div>

      <section aria-labelledby="published-heading" className="min-w-0">
        <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-5">
          <h2
            id="published-heading"
            className="font-display text-3xl font-extrabold [font-stretch:72%]"
          >
            Recursos publicados
          </h2>

          <div role="group" aria-label="Filtrar por modalidad" className="flex flex-wrap gap-2">
            {(["all", ...RESOURCE_MODALITIES] as const).map((option) => {
              const active = filter === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                  className={`flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/25 text-ink hover:border-ink"
                  }`}
                >
                  {option !== "all" && (
                    <span
                      aria-hidden
                      className={`size-3 rounded-full ring-1 ring-tag-ink/30 ${MODALITY_FILL[option]}`}
                    />
                  )}
                  {option === "all" ? "Todos" : MODALITY_LABELS[option]}
                  <span className="font-normal opacity-70">{countFor(option)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-6 border-l-4 border-alert pl-3 text-sm font-bold text-alert">
            {error}
          </p>
        )}

        {visible.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 px-6 py-14 text-center">
            <p className="font-display text-2xl font-extrabold [font-stretch:72%]">
              Aquí todavía no hay nada colgado
            </p>
            <p className="mt-2 text-ink-soft">
              Publica un recurso desde el formulario y aparecerá en esta lista.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 2xl:columns-3">
            {visible.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isEditing={editing?.id === resource.id}
                justSaved={justSavedId === resource.id}
                onEdit={() => setEditing(resource)}
                onDelete={() => handleDelete(resource)}
                onAnimationEnd={() => setJustSavedId(null)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
