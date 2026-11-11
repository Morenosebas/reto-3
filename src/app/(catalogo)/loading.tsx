const PLACEHOLDER_HEIGHTS = ["h-80", "h-96", "h-72", "h-88"];

/** Se muestra mientras el servidor prepara el catálogo. */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-6 sm:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-lg font-extrabold [font-stretch:150%]">Reutiliza</p>
        <div className="h-12 w-48 bg-pen/25" />
      </div>
      <p role="status" className="sr-only">
        Cargando publicaciones…
      </p>
      <div className="mt-8 mb-10 h-28 max-w-3xl bg-ink/10 sm:mt-12" />
      <div className="mb-8 h-24 border-b-2 border-ink/20" />
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 2xl:columns-4">
        {PLACEHOLDER_HEIGHTS.map((height, index) => (
          <div
            key={index}
            className={`hang-tag mb-6 break-inside-avoid bg-ink/10 motion-safe:animate-pulse ${height}`}
          />
        ))}
      </div>
    </main>
  );
}
