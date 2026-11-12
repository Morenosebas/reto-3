import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { ResourceNotFoundError } from "../domain/errors";
import type { CatalogEntry } from "../presentation/ResourceDTO";
import { communityCatalog, publisherRegistry } from "../resourceModule";
import { OwnerProtectedCatalog } from "./OwnerProtectedCatalog";
import type { ResourceCatalog } from "./ResourceCatalog";



const PUBLISHER_COOKIE = "reutiliza_publisher";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const getCatalog = cache(async (): Promise<ResourceCatalog> => {
  const publisherKey = (await cookies()).get(PUBLISHER_COOKIE)?.value;
  return protectCatalog(publisherKey);
});


export const findCatalogEntry = cache(async (id: string): Promise<CatalogEntry | null> => {
  try {
    return await (await getCatalog()).find(id);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) return null;
    throw error;
  }
});


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
