import type { NextRequest } from "next/server";
import { getCatalog } from "@/modules/resources/catalog/catalogAccess";
import { errorResponse, readJsonBody } from "../http";

type Context = RouteContext<"/api/resources/[id]">;

export async function GET(_request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const catalog = await getCatalog();
    return Response.json(await catalog.find(id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const changes = await readJsonBody(request);
    const catalog = await getCatalog();
    return Response.json(await catalog.edit(id, changes));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Context) {
  try {
    const { id } = await ctx.params;
    const catalog = await getCatalog();
    await catalog.withdraw(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
