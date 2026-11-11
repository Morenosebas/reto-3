/** Recuerda qué publicante (identificado por la huella de su clave) publicó cada recurso. */
export interface PublisherRegistry {
  register(resourceId: string, publisherId: string): Promise<void>;
  publisherOf(resourceId: string): Promise<string | null>;
  forget(resourceId: string): Promise<void>;
}
