export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe un recurso con id "${id}"`);
    this.name = "ResourceNotFoundError";
  }
}
