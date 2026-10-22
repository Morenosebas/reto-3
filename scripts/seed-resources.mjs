import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const demoResources = [
  {
    modality: "donation",
    title: "Cuna de madera",
    description: "Cuna en buen estado, incluye colchón. Mi hijo ya no la usa.",
    category: "furniture",
    location: "Bello, Antioquia",
  },
  {
    modality: "exchange",
    title: "Libros de cálculo universitario",
    description: "Stewart 7.ª edición y Larson, con pocas anotaciones a lápiz.",
    category: "books",
    location: "Laureles, Medellín",
    wantedInReturn: "Libros de programación o física",
  },
  {
    modality: "sale",
    title: "Retazos de madera de pino",
    description: "Sobrantes de un proyecto de carpintería, ideales para manualidades.",
    category: "materials",
    location: "San Fernando, Cali",
    price: 15000,
  },
];

const defaultBaseUrl = "http://localhost:3000/api/resources";

export async function seedResources({
  baseUrl = process.env.SEED_BASE_URL ?? defaultBaseUrl,
  fetchImpl = fetch,
} = {}) {
  const url = baseUrl.replace(/\/+$/, "");
  const existingResponse = await fetchImpl(url);
  if (!existingResponse.ok) {
    throw new Error(`No se pudieron consultar los recursos: HTTP ${existingResponse.status}`);
  }

  const existing = await existingResponse.json();
  if (!Array.isArray(existing)) {
    throw new Error("La API devolvió una lista de recursos inválida");
  }

  let created = 0;
  let skipped = 0;
  for (const sample of demoResources) {
    if (existing.some((resource) => matchesSample(resource, sample))) {
      skipped += 1;
      continue;
    }

    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sample),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? `No se pudo crear un recurso demo: HTTP ${response.status}`);
    }
    created += 1;
    existing.push(sample);
  }

  return { created, skipped };
}

function matchesSample(resource, sample) {
  return Object.entries(sample).every(([key, value]) => resource[key] === value);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { created, skipped } = await seedResources();
    console.log(`Seed completado: ${created} creados, ${skipped} ya existentes.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
