"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import {
  editResource,
  publishResource,
  type FormActionState,
} from "@/app/recursos/actions";
import {
  MAX_SALE_PRICE,
  RESOURCE_CATEGORIES,
  RESOURCE_MODALITIES,
  RESOURCE_STATUSES,
  type ResourceCategory,
  type ResourceModality,
  type ResourceStatus,
} from "@/modules/resources/domain/ResourceAttributes";
import type { CatalogEntry, ResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import {
  CATEGORY_LABELS,
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/modules/resources/presentation/labels";
import { MODALITY_BORDER, MODALITY_FILL } from "./modalityStyles";
import { ResourceTag } from "./ResourceTag";

interface FormValues {
  modality: ResourceModality;
  title: string;
  description: string;
  category: ResourceCategory;
  location: string;
  status: ResourceStatus;
  wantedInReturn: string;
  price: string;
  contactPhone: string;
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
  contactPhone: "",
};

const IDLE: FormActionState = { status: "idle" };

function toFormValues(resource: CatalogEntry): FormValues {
  return {
    modality: resource.modality,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    location: resource.location,
    status: resource.status,
    wantedInReturn: resource.wantedInReturn ?? "",
    price: resource.price?.toString() ?? "",
    contactPhone: resource.contactPhone ?? "",
  };
}

// La vista previa muestra la etiqueta tal como quedará; mientras un campo
// esté vacío, aparece un texto guía en su lugar.
function toPreview(values: FormValues, resource: CatalogEntry | undefined, createdAt: string): ResourceDTO {
  const price = /^\d+$/.test(values.price.trim()) ? Number(values.price) : undefined;
  return {
    id: resource?.id ?? "vista-previa",
    modality: values.modality,
    title: values.title.trim() || "Título de tu publicación",
    description: values.description.trim() || "Aquí va lo que cuentes del objeto.",
    category: values.category,
    location: values.location.trim() || "tu barrio",
    status: values.status,
    wantedInReturn: values.wantedInReturn.trim() || undefined,
    price: price && price > 0 ? price : undefined,
    createdAt,
    updatedAt: createdAt,
  };
}

const inputClass =
  "w-full rounded-none border-0 border-b-2 border-ink/40 bg-field px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 hover:border-ink/70 focus:border-pen focus-visible:outline-none aria-[invalid=true]:border-alert";

interface ResourceFormProps {
  /** Recurso en edición; si no se pasa, el formulario publica uno nuevo. */
  resource?: CatalogEntry;
  onSaved: (entry: CatalogEntry, message: string) => void;
  onCancel: () => void;
}

export function ResourceForm({ resource, onSaved, onCancel }: ResourceFormProps) {
  const isEditing = resource !== undefined;
  const [values, setValues] = useState<FormValues>(
    resource ? toFormValues(resource) : EMPTY_VALUES,
  );
  const [createdAt] = useState(() => resource?.createdAt ?? new Date().toISOString());

  // La Server Action publica o edita a través del catálogo protegido; el
  // resultado trae el recurso guardado o los errores de cada campo.
  const [state, formAction, pending] = useActionState(
    async (previous: FormActionState, formData: FormData) => {
      const result = resource
        ? await editResource(resource.id, previous, formData)
        : await publishResource(previous, formData);
      if (result.status === "success") onSaved(result.entry, result.message);
      return result;
    },
    IDLE,
  );

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};
  const generalError =
    state.status === "error" && Object.keys(fieldErrors).length === 0 ? state.message : null;

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  // Se envía desde onSubmit y no con <form action>: React reinicia los
  // formularios con acción al terminar, y eso borraría los campos controlados
  // justo cuando hay errores que corregir.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function fieldProps(name: keyof FormValues) {
    const error = fieldErrors[name];
    return {
      id: `resource-${name}`,
      name,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `resource-${name}-error` : undefined,
    };
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <div>
        <h2 className="font-display text-3xl font-extrabold leading-none [font-stretch:72%]">
          {isEditing ? "Editar recurso" : "Publicar un recurso"}
        </h2>
        {isEditing && (
          <p className="mt-2 text-sm text-ink-soft">Estás cambiando «{resource.title}».</p>
        )}
      </div>

      <div aria-hidden className="pointer-events-none select-none">
        <p className="mb-2 text-sm font-bold text-ink-soft">Así se verá tu etiqueta</p>
        <ResourceTag resource={toPreview(values, resource, createdAt)} size="preview" />
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

      <Field
        label="Título"
        htmlFor="resource-title"
        error={fieldErrors.title}
        counter={{ length: values.title.length, max: 80 }}
      >
        <input
          {...fieldProps("title")}
          className={inputClass}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Monitor Samsung de 22 pulgadas"
          required
          minLength={3}
          maxLength={80}
        />
      </Field>

      <Field
        label="Descripción"
        htmlFor="resource-description"
        hint="Cuenta en qué estado está y cuánto tiempo lo usaste."
        error={fieldErrors.description}
        counter={{ length: values.description.length, max: 500 }}
      >
        <textarea
          {...fieldProps("description")}
          className={`${inputClass} min-h-24 resize-y`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
          minLength={10}
          maxLength={500}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Categoría" htmlFor="resource-category" error={fieldErrors.category}>
          <select
            {...fieldProps("category")}
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

        <Field label="Dónde se recoge" htmlFor="resource-location" error={fieldErrors.location}>
          <input
            {...fieldProps("location")}
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

      <Field
        label="Tu WhatsApp"
        htmlFor="resource-contactPhone"
        hint="Celular de Colombia. Lo verá quien quiera pedirte el objeto."
        error={fieldErrors.contactPhone}
      >
        <div className="flex">
          <span
            aria-hidden
            className="flex items-center border-b-2 border-ink/40 bg-ink px-3 text-base font-bold text-paper"
          >
            +57
          </span>
          <input
            {...fieldProps("contactPhone")}
            className={inputClass}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={values.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            placeholder="300 123 4567"
            required
          />
        </div>
      </Field>

      {values.modality === "exchange" && (
        <Field
          label="¿Qué te gustaría recibir a cambio?"
          htmlFor="resource-wantedInReturn"
          error={fieldErrors.wantedInReturn}
        >
          <input
            {...fieldProps("wantedInReturn")}
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
          htmlFor="resource-price"
          hint={`Hasta ${MAX_SALE_PRICE.toLocaleString("es-CO")}. La idea es un precio justo, no hacer negocio.`}
          error={fieldErrors.price}
        >
          <input
            {...fieldProps("price")}
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
        <Field label="Estado" htmlFor="resource-status" error={fieldErrors.status}>
          <select
            {...fieldProps("status")}
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

      {generalError && (
        <p role="alert" className="border-l-4 border-alert pl-3 text-sm font-bold text-alert">
          {generalError}
        </p>
      )}

      <div className="flex items-center gap-5 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-pen px-5 py-3 font-display text-lg font-extrabold text-sheet transition-colors [font-stretch:90%] hover:bg-pen-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Publicar"}
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
  htmlFor,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  /** Caracteres usados frente al máximo permitido. */
  counter?: { length: number; max: number };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-bold">
          {label}
        </label>
        {counter && (
          <span
            className={`text-xs tabular-nums ${
              counter.length >= counter.max ? "font-bold text-alert" : "text-ink-soft"
            }`}
          >
            {counter.length}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <span id={`${htmlFor}-error`} className="text-sm font-bold text-alert">
          {error}
        </span>
      ) : (
        hint && <span className="text-sm text-ink-soft">{hint}</span>
      )}
    </div>
  );
}
