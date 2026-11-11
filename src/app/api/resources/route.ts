import type { NextRequest } from "next/server";
import { getCatalog, getPublishingCatalog } from "@/modules/resources/catalog/catalogAccess";
import {
  hasStatusParam,
  parseCatalogFilters,
  toSearchCriteria,
} from "@/modules/resources/presentation/catalogFilters";
import { errorResponse, readJsonBody } from "./http";

// GET /api/resources?q=libros&categoria=books&disponibles=1 (o &entregados=1)
export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const criteria = toSearchCriteria(parseCatalogFilters(params));
    // A diferencia del catálogo, la API lista todos los estados si no se pide
    // uno: así conserva su contrato y el script de carga ve lo que ya existe.
    if (!hasStatusParam(params)) criteria.statuses = undefined;
    const catalog = await getCatalog();
    return Response.json(await catalog.browse(criteria));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await readJsonBody(request);
    const catalog = await getPublishingCatalog();
    return Response.json(await catalog.publish(input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
