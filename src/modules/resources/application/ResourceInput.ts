import type { ResourceDraft } from "../domain/factories";

/** Datos de entrada de los casos de uso de creación y actualización. */
export interface ResourceInput extends ResourceDraft {
  modality?: unknown;
}

/** Interpreta un cuerpo JSON arbitrario como ResourceInput. */
export function toResourceInput(body: unknown): ResourceInput {
  return typeof body === "object" && body !== null ? (body as ResourceInput) : {};
}
