import { ResourceNotFoundError, ValidationError } from "@/modules/resources/domain/errors";

// Utilidades HTTP compartidas por los endpoints de recursos.
// No es un route.ts, así que Next.js no lo expone como ruta.

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("El cuerpo de la petición debe ser JSON válido");
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof ResourceNotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }
  console.error(error);
  return Response.json({ error: "Error interno del servidor" }, { status: 500 });
}
