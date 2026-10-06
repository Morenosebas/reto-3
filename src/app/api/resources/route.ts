import { toResourceInput } from "@/modules/resources/application/ResourceInput";
import { toResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { resourceUseCases } from "@/modules/resources/resourceModule";
import { errorResponse, readJsonBody } from "./http";

// GET /api/resources: lista todos los recursos
export async function GET() {
  try {
    const resources = await resourceUseCases.list.execute();
    return Response.json(resources.map(toResourceDTO));
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/resources: publica un recurso nuevo
export async function POST(request: Request) {
  try {
    const input = toResourceInput(await readJsonBody(request));
    const resource = await resourceUseCases.create.execute(input);
    return Response.json(toResourceDTO(resource), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
