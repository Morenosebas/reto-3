import { connection } from "next/server";
import { ResourceManager } from "@/components/resources/ResourceManager";
import { toResourceDTO } from "@/modules/resources/presentation/ResourceDTO";
import { resourceUseCases } from "@/modules/resources/resourceModule";

export default async function Home() {
  // Los datos viven en memoria y cambian en cada petición: no prerenderizar.
  await connection();
  const resources = (await resourceUseCases.list.execute()).map(toResourceDTO);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-6 sm:px-8">
      <p className="font-display text-lg font-extrabold [font-stretch:150%]">Reutiliza</p>

      <header className="mt-10 mb-12 max-w-4xl sm:mt-16 sm:mb-16">
        <h1 className="font-display text-[clamp(2.75rem,8vw,6.25rem)] font-extrabold leading-[0.92] tracking-[-0.01em] [font-stretch:62%]">
          Lo que ya no usas, a alguien le sirve.
        </h1>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
          Pública aquí los objetos y/o materiales que tienes guardados, esos que ya no usas. Puedes
          regalarlos, intercambiarlos por algo que necesites o venderlos a un precio
          justo.
        </p>
      </header>

      <ResourceManager initialResources={resources} />
    </main>
  );
}
