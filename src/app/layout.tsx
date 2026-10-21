import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reutiliza",
  description: "Plataforma para donar, intercambiar y reutilizar recursos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
