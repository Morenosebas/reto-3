import { isHttpMappable, ValidationError } from "@/modules/resources/domain/errors";

// Utilidades HTTP compartidas por los endpoints de recursos.
// No es un route.ts, así que Next.js no lo expone como ruta.

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("El cuerpo de la petición debe ser JSON válido");
  }
}

/**
 * Adapter: convierte cualquier error del dominio en una respuesta HTTP.
 *
 * No conoce clases de error concretas (ValidationError, ResourceNotFoundError…).
 * Solo comprueba si el error implementa HttpMappable; si es así, usa el
 * httpStatus que el propio error declara. Añadir un nuevo tipo de error al
 * dominio no requiere modificar esta función.
 */
export function errorResponse(error: unknown): Response {
  if (isHttpMappable(error)) {
    return Response.json({ error: error.message }, { status: error.httpStatus });
  }
  console.error(error);
  return Response.json({ error: "Error interno del servidor" }, { status: 500 });
}
