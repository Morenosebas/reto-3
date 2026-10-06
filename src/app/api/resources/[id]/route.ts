import type { NextRequest } from "next/server";
import { toResourceInput } from "@/modules/resources/application/ResourceInput";
import { toResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { resourceUseCases } from "@/modules/resources/resourceModule";
import { errorResponse, readJsonBody } from "../http";

type Context = RouteContext<"/api/resources/[id]">;

// GET /api/resources/:id: consulta un recurso
export async function GET(_request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const resource = await resourceUseCases.get.execute(id);
    return Response.json(toResourceDTO(resource));
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/resources/:id: actualiza los campos enviados
export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const changes = toResourceInput(await readJsonBody(request));
    const resource = await resourceUseCases.update.execute(id, changes);
    return Response.json(toResourceDTO(resource));
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/resources/:id: elimina un recurso
export async function DELETE(_request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    await resourceUseCases.delete.execute(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
