import type { Storage } from "unstorage";
import type { PublisherRegistry } from "../catalog/PublisherRegistry";

const PUBLISHERS_PREFIX = "publishers";
const STORABLE_ID = /^[A-Za-z0-9-]+$/;

/** Guarda la relación recurso → publicante en el mismo almacén de unstorage. */
export class UnstoragePublisherRegistry implements PublisherRegistry {
  constructor(private readonly storage: Storage) {}

  async register(resourceId: string, publisherId: string): Promise<void> {
    await this.storage.setItem(keyOf(resourceId), publisherId);
  }

  async publisherOf(resourceId: string): Promise<string | null> {
    if (!STORABLE_ID.test(resourceId)) return null;
    const publisherId = await this.storage.getItem<string>(keyOf(resourceId));
    return typeof publisherId === "string" ? publisherId : null;
  }

  async forget(resourceId: string): Promise<void> {
    if (STORABLE_ID.test(resourceId)) await this.storage.removeItem(keyOf(resourceId));
  }
}

function keyOf(resourceId: string): string {
  return `${PUBLISHERS_PREFIX}:${resourceId}`;
}
