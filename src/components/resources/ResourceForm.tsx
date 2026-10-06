"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  MAX_SALE_PRICE,
  RESOURCE_CATEGORIES,
  RESOURCE_MODALITIES,
  RESOURCE_STATUSES,
  type ResourceCategory,
  type ResourceModality,
  type ResourceStatus,
} from "@/modules/resources/domain/ResourceAttributes";
import type { ResourcePayload } from "@/modules/resources/presentation/resourceApi";
import type { ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import {
  CATEGORY_LABELS,
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/modules/resources/presentation/labels";
import { MODALITY_BORDER, MODALITY_FILL } from "./modalityStyles";

interface FormValues {
  modality: ResourceModality;
  title: string;
  description: string;
  category: ResourceCategory;
  location: string;
  status: ResourceStatus;
  wantedInReturn: string;
  price: string;
}

const EMPTY_VALUES: FormValues = {
  modality: "donation",
  title: "",
  description: "",
  category: "other",
  location: "",
  status: "available",
  wantedInReturn: "",
  price: "",
};

function toFormValues(resource: ResourceDTO): FormValues {
  return {
    modality: resource.modality,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    location: resource.location,
    status: resource.status,
    wantedInReturn: resource.wantedInReturn ?? "",
    price: resource.price?.toString() ?? "",
  };
}

function toPayload(values: FormValues, isEditing: boolean): ResourcePayload {
  const { wantedInReturn, price, status, ...common } = values;
  return {
    ...common,
    ...(isEditing && { status }),
    ...(values.modality === "exchange" && { wantedInReturn }),
    ...(values.modality === "sale" && { price }),
  };
}

const inputClass =
  "w-full rounded-none border-0 border-b-2 border-ink/40 bg-field px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 hover:border-ink/70 focus:border-pen focus-visible:outline-none";

interface ResourceFormProps {
  /** Recurso en edición; si no se pasa, el formulario publica uno nuevo. */
  resource?: ResourceDTO;
  onSubmit: (payload: ResourcePayload) => Promise<void>;
  onCancel: () => void;
}

export function ResourceForm({ resource, onSubmit, onCancel }: ResourceFormProps) {
  const isEditing = resource !== undefined;
  const [values, setValues] = useState<FormValues>(
    resource ? toFormValues(resource) : EMPTY_VALUES,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(toPayload(values, isEditing));
      if (!isEditing) setValues(EMPTY_VALUES);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el recurso");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-5 border-2 bg-sheet p-6 transition-colors ${
        isEditing ? "border-pen" : "border-ink"
      }`}
    >
      <div>
        <h2 className="font-display text-3xl font-extrabold leading-none [font-stretch:72%]">
          {isEditing ? "Editar recurso" : "Publicar un recurso"}
        </h2>
        {isEditing && (
          <p className="mt-2 text-sm text-ink-soft">
            Estás cambiando «{resource.title}».
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-bold">¿Cómo quieres entregarlo?</legend>
        <div className="grid grid-cols-3 gap-2">
          {RESOURCE_MODALITIES.map((modality) => {
            const active = values.modality === modality;
            return (
              <label
                key={modality}
                className={`flex cursor-pointer items-center justify-center border-2 px-1 py-2.5 text-center text-sm font-bold leading-tight transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pen ${
                  active
                    ? `${MODALITY_FILL[modality]} border-tag-ink text-tag-ink`
                    : `${MODALITY_BORDER[modality]} text-ink hover:border-ink`
                }`}
              >
                <input
                  type="radio"
                  name="modality"
                  value={modality}
                  checked={active}
                  onChange={() => update("modality", modality)}
                  className="sr-only"
                />
                {MODALITY_LABELS[modality]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label="Título">
        <input
          className={inputClass}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder='"Monitor de 22 pulgadas Samsung"'
          required
          minLength={3}
          maxLength={80}
        />
      </Field>

      <Field label="Descripción" hint="Cuenta en qué estado está y cuánto tiempo lo usaste.">
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
          minLength={10}
          maxLength={500}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Categoría">
          <select
            className={inputClass}
            value={values.category}
            onChange={(e) => update("category", e.target.value as ResourceCategory)}
          >
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Dónde se recoge">
          <input
            className={inputClass}
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Barrio, ciudad"
            required
            minLength={3}
            maxLength={120}
          />
        </Field>
      </div>

      {values.modality === "exchange" && (
        <Field label="¿Qué te gustaría recibir a cambio?">
          <input
            className={inputClass}
            value={values.wantedInReturn}
            onChange={(e) => update("wantedInReturn", e.target.value)}
            placeholder="Libros, herramientas, plantas…"
            required
            minLength={3}
            maxLength={120}
          />
        </Field>
      )}

      {values.modality === "sale" && (
        <Field
          label="Precio en pesos"
          hint={`Hasta ${MAX_SALE_PRICE.toLocaleString("es-CO")}. La idea es un precio justo, no hacer negocio.`}
        >
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="20000"
            required
            min={1}
            max={MAX_SALE_PRICE}
          />
        </Field>
      )}

      {isEditing && (
        <Field label="Estado">
          <select
            className={inputClass}
            value={values.status}
            onChange={(e) => update("status", e.target.value as ResourceStatus)}
          >
            {RESOURCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      )}

      {error && (
        <p role="alert" className="border-l-4 border-alert pl-3 text-sm font-bold text-alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-5 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-pen px-5 py-3 font-display text-lg font-extrabold text-sheet transition-colors [font-stretch:90%] hover:bg-pen-hover disabled:opacity-60"
        >
          {submitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Publicar"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold underline decoration-2 underline-offset-4"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-sm text-ink-soft">{hint}</span>}
    </label>
  );
}
