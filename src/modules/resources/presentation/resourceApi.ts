import type { ResourceDTO } from "./ResourceDTO";

// Cliente HTTP del módulo para los componentes de la interfaz.

export type ResourcePayload = Partial<
  Omit<ResourceDTO, "id" | "createdAt" | "updatedAt" | "price">
> & { price?: number | string };

const BASE_URL = "/api/resources";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? `Error ${response.status} al llamar a la API`);
  }
  return body as T;
}

export const resourceApi = {
  list: () => request<ResourceDTO[]>(BASE_URL),

  create: (payload: ResourcePayload) =>
    request<ResourceDTO>(BASE_URL, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: ResourcePayload) =>
    request<ResourceDTO>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) => request<void>(`${BASE_URL}/${id}`, { method: "DELETE" }),
};
