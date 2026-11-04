export class ValidationError extends Error {
  /** Mensaje por campo (title, price…), para mostrarlo junto a cada campo del formulario. */
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class ResourceNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe un recurso con id "${id}"`);
    this.name = "ResourceNotFoundError";
  }
}

export class NotResourcePublisherError extends Error {
  constructor(message = "Solo quien publicó este recurso puede modificarlo o retirarlo") {
    super(message);
    this.name = "NotResourcePublisherError";
  }
}
