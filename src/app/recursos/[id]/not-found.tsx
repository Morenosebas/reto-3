import Link from "next/link";

export default function ResourceNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-8">
      <Link href="/" className="self-start font-display text-lg font-extrabold [font-stretch:150%]">
        Reutiliza
      </Link>
      <h1 className="mt-8 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[0.95] [font-stretch:62%]">
        Esta publicación ya no está
      </h1>
      <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
        Quien la publicó la eliminó, o el enlace está incompleto. En el catálogo hay otras
        cosas esperando una segunda vida.
      </p>
      <Link
        href="/"
        className="mt-8 self-start bg-pen px-5 py-3 font-display text-lg font-extrabold text-sheet [font-stretch:90%] hover:bg-pen-hover"
      >
        Ver el catálogo
      </Link>
    </main>
  );
}
