import { CONTACT_PHONE_MESSAGE, toColombianMobile } from "../contactPhone";
import { ValidationError } from "../errors";
import type { BaseResourceProps, Resource } from "../Resource";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_STATUSES,
  type ResourceCategory,
  type ResourceStatus,
} from "../ResourceAttributes";

export interface ResourceDraft {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  location?: unknown;
  status?: unknown;
  wantedInReturn?: unknown;
  price?: unknown;
  contactPhone?: unknown;
}

export interface ResourceIdentity {
  id: string;
  createdAt: Date;
  /** Solo al restaurar un recurso guardado; si se omite, se usa la fecha actual. */
  updatedAt?: Date;
}

export abstract class ResourceCreator {
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
      contactPhone: optionalContactPhone(draft.contactPhone),
      createdAt: identity?.createdAt ?? now,
      updatedAt: identity?.updatedAt ?? now,
    };

    return this.createResource(base, draft);
  }
}

// El contacto es opcional en el dominio: las publicaciones anteriores no lo
// tienen. Si llega, debe ser un celular colombiano.
function optionalContactPhone(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const phone = typeof value === "string" ? toColombianMobile(value) : null;
  if (!phone) throw new ValidationError(CONTACT_PHONE_MESSAGE);
  return phone;
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
