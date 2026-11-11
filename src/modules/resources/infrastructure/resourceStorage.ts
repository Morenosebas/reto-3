import { createStorage, type Storage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";
import memoryDriver from "unstorage/drivers/memory";

// Igual que el repositorio en memoria, la conexión al almacén se guarda en
// globalThis: una sola por proceso, aunque el hot reload reevalúe el módulo.
const globalForStorage = globalThis as typeof globalThis & {
  reutilizaStorage?: Storage;
};

/** Devuelve la conexión única al almacén clave-valor de la aplicación. */
export function getResourceStorage(): Storage {
  globalForStorage.reutilizaStorage ??= createStorage({ driver: createDriver() });
  return globalForStorage.reutilizaStorage;
}

export function usesMemoryStorage(): boolean {
  return process.env.RESOURCE_STORAGE === "memory";
}

function createDriver() {
  if (usesMemoryStorage()) return memoryDriver();
  return fsLiteDriver({ base: process.env.RESOURCE_DATA_DIR ?? ".data" });
}
