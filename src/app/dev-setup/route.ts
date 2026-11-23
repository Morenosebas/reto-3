import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Ruta de desarrollo: establece la cookie del publicante seed
 * para que los recursos de prueba aparezcan con botones de gestión.
 *
 * Solo disponible en desarrollo. Visitar: http://localhost:3077/dev-setup
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("reutiliza_publisher", "seed-demo-publisher-key", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}
