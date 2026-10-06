import { ValidationError } from "../errors";
import type { BaseResourceProps, Resource } from "../Resource";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_STATUSES,
  type ResourceCategory,
  type ResourceStatus,
} from "../ResourceAttributes";

/**
 * Datos para construir un recurso. Llegan sin validar desde la capa de
 * entrada (formulario o API), por eso cada campo es `unknown`.
 */
export interface ResourceDraft {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  location?: unknown;
  status?: unknown;
  wantedInReturn?: unknown;
  price?: unknown;
}

/** Identidad que se conserva cuando se reconstruye un recurso existente. */
export interface ResourceIdentity {
  id: string;
  createdAt: Date;
}

/**
 * Creador del patrón Factory Method.
 *
 * `create` contiene el algoritmo común (validar los datos compartidos y
 * asignar identidad) y delega en `createResource`, el Factory Method, la
 * decisión de qué subclase de Resource instanciar. Agregar una modalidad
 * nueva consiste en escribir otro creador, sin modificar este código.
 */
export abstract class ResourceCreator {
  /** Factory Method: cada creador concreto decide qué producto construir. */
  protected abstract createResource(
    base: BaseResourceProps,
    draft: ResourceDraft,
  ): Resource;

  create(draft: ResourceDraft, identity?: ResourceIdentity): Resource {
    const now = new Date();
    const base: BaseResourceProps = {
      id: identity?.id ?? crypto.randomUUID(),
      title: requireText(draft.title, "título", { min: 3, max: 80 }),
      description: requireText(draft.description, "descripción", { min: 10, max: 500 }),
      category: requireOption<ResourceCategory>(draft.category, RESOURCE_CATEGORIES, "categoría"),
      location: requireText(draft.location, "ubicación", { min: 3, max: 120 }),
      status:
        draft.status === undefined
          ? "available"
          : requireOption<ResourceStatus>(draft.status, RESOURCE_STATUSES, "estado"),
      createdAt: identity?.createdAt ?? now,
      updatedAt: now,
    };

    return this.createResource(base, draft);
  }
}

export function requireText(
  value: unknown,
  field: string,
  { min, max }: { min: number; max: number },
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`El campo ${field} es obligatorio`);
  }
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new ValidationError(
      `El campo ${field} debe tener entre ${min} y ${max} caracteres`,
    );
  }
  return text;
}

function requireOption<T extends string>(
  value: unknown,
  options: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !options.includes(value as T)) {
    throw new ValidationError(`El valor del campo ${field} no es válido`);
  }
  return value as T;
}
