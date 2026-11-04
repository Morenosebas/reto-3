import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const anybody = localFont({
  src: "./fonts/anybody-latin-wdth-normal.woff2",
  variable: "--font-anybody-file",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "50% 150%" }],
});

const atkinson = localFont({
  src: "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  variable: "--font-atkinson-file",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reutiliza",
  description: "Plataforma para donar, intercambiar y reutilizar recursos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${anybody.variable} ${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
