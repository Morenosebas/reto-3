/**
 * Interfaz del Adapter: cualquier error que implemente HttpMappable
 * puede ser convertido a una respuesta HTTP sin que la capa de API
 * necesite conocer las clases de error concretas del dominio.
 */
export interface HttpMappable {
  readonly httpStatus: number;
  readonly message: string;
}

export function isHttpMappable(error: unknown): error is HttpMappable {
  return (
    typeof error === "object" &&
    error !== null &&
    "httpStatus" in error &&
    typeof (error as HttpMappable).httpStatus === "number"
  );
}

/**
 * Error de validación: datos enviados por el cliente que no cumplen
 * las reglas de negocio. Se adapta a HTTP 400.
 */
export class ValidationError extends Error implements HttpMappable {
  readonly httpStatus = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error de recurso no encontrado. Se adapta a HTTP 404.
 */
export class ResourceNotFoundError extends Error implements HttpMappable {
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`No existe un recurso con id "${id}"`);
    this.name = "ResourceNotFoundError";
  }
}
