import type { ResourceDraft } from "../domain/factories";
import { ValidationError } from "../domain/errors";

/** Datos de entrada de los casos de uso de creación y actualización. */
export interface ResourceInput extends ResourceDraft {
  modality?: unknown;
}

/** Interpreta un cuerpo JSON arbitrario como ResourceInput. */
export function toResourceInput(body: unknown): ResourceInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError("El cuerpo debe ser un objeto JSON");
  }
  return body as ResourceInput;
}
