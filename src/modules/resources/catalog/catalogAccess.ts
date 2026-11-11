import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { ResourceNotFoundError } from "../domain/errors";
import type { CatalogEntry } from "../presentation/ResourceDTO";
import { communityCatalog, publisherRegistry } from "../resourceModule";
import { OwnerProtectedCatalog } from "./OwnerProtectedCatalog";
import type { ResourceCatalog } from "./ResourceCatalog";

// Data Access Layer (guía de seguridad de datos de Next.js): el único lugar
// que lee la identidad del visitante y entrega el catálogo ya protegido.
// "server-only" impide que este módulo termine en el bundle del navegador.

const PUBLISHER_COOKIE = "reutiliza_publisher";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/** Catálogo para consultar. Solo lee la cookie; sirve en páginas y Route Handlers. */
export const getCatalog = cache(async (): Promise<ResourceCatalog> => {
  const publisherKey = (await cookies()).get(PUBLISHER_COOKIE)?.value;
  return protectCatalog(publisherKey);
});

/**
 * Un recurso del catálogo, o null si no existe. Se memoriza por petición
 * porque generateMetadata y la página de detalle lo piden por separado.
 */
export const findCatalogEntry = cache(async (id: string): Promise<CatalogEntry | null> => {
  try {
    return await (await getCatalog()).find(id);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) return null;
    throw error;
  }
});

/**
 * Catálogo para publicar. Si el visitante todavía no tiene clave de
 * publicante, la crea en una cookie httpOnly. Next.js solo permite escribir
 * cookies en Route Handlers y Server Actions.
 *
 * Las Server Actions también pasan por aquí: Next.js advierte que se pueden
 * invocar con un POST directo, así que deben autorizar igual que la API, y el
 * proxy lo hace en ambos casos.
 */
export async function getPublishingCatalog(): Promise<ResourceCatalog> {
  const cookieStore = await cookies();
  let publisherKey = cookieStore.get(PUBLISHER_COOKIE)?.value;
  if (!publisherKey) {
    publisherKey = randomUUID();
    cookieStore.set(PUBLISHER_COOKIE, publisherKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
    });
  }
  return protectCatalog(publisherKey);
}

function protectCatalog(publisherKey: string | undefined): ResourceCatalog {
  const visitorId = publisherKey ? fingerprint(publisherKey) : null;
  return new OwnerProtectedCatalog(communityCatalog, publisherRegistry, visitorId);
}

// En el almacén se guarda la huella de la clave, nunca la clave misma.
function fingerprint(publisherKey: string): string {
  return createHash("sha256").update(publisherKey).digest("hex");
}
