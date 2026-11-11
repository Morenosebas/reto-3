"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCatalog, getPublishingCatalog } from "@/modules/resources/catalog/catalogAccess";
import {
  NotResourcePublisherError,
  ResourceNotFoundError,
  ValidationError,
} from "@/modules/resources/domain/errors";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";

// Server Actions de la interfaz. Igual que los Route Handlers, solo hablan con
// el catálogo protegido de la Data Access Layer: el proxy autoriza cada acción.

export type FormActionState =
  | { status: "idle" }
  | { status: "success"; entry: CatalogEntry; message: string }
  | { status: "error"; message: string; fieldErrors: Record<string, string> };

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export async function publishResource(
  _previous: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  return runFormAction(async () => {
    const catalog = await getPublishingCatalog();
    const entry = await catalog.publish(formToInput(formData));
    revalidateCatalog(entry.id);
    return { status: "success", entry, message: `Publicaste «${entry.title}»` };
  });
}

export async function editResource(
  id: string,
  _previous: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  return runFormAction(async () => {
    const catalog = await getCatalog();
    const entry = await catalog.edit(id, formToInput(formData));
    revalidateCatalog(entry.id);
    return { status: "success", entry, message: "Cambios guardados" };
  });
}

export async function changeResourceStatus(id: string, status: string): Promise<ActionResult> {
  return runAction(async () => {
    const catalog = await getCatalog();
    const entry = await catalog.edit(id, { status });
    revalidateCatalog(id);
    return `«${entry.title}» quedó como ${STATUS_MESSAGES[entry.status]}`;
  });
}

export async function withdrawResource(
  id: string,
  { returnToCatalog = false }: { returnToCatalog?: boolean } = {},
): Promise<ActionResult> {
  const result = await runAction(async () => {
    const catalog = await getCatalog();
    await catalog.withdraw(id);
    revalidatePath("/");
    return "Publicación eliminada";
  });
  // redirect funciona lanzando una excepción de Next.js: va fuera de runAction
  // para que su try/catch no la atrape.
  if (result.ok && returnToCatalog) redirect("/");
  return result;
}

const STATUS_MESSAGES: Record<CatalogEntry["status"], string> = {
  available: "disponible",
  reserved: "reservado",
  delivered: "entregado",
};

function formToInput(formData: FormData): Record<string, string> {
  const input: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) input[key] = value;
  }
  return input;
}

function revalidateCatalog(id: string) {
  revalidatePath("/");
  revalidatePath(`/recursos/${id}`);
}

async function runFormAction(
  action: () => Promise<FormActionState>,
): Promise<FormActionState> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message, fieldErrors: { ...error.fieldErrors } };
    }
    return { status: "error", message: messageFor(error), fieldErrors: {} };
  }
}

async function runAction(action: () => Promise<string>): Promise<ActionResult> {
  try {
    return { ok: true, message: await action() };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

function messageFor(error: unknown): string {
  if (
    error instanceof ValidationError ||
    error instanceof NotResourcePublisherError ||
    error instanceof ResourceNotFoundError
  ) {
    return error.message;
  }
  console.error(error);
  return "No se pudo completar la acción. Intenta de nuevo.";
}
