import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { HeroApertura } from "@/components/hero/hero-apertura";
import "./globals.css";
import "@/components/ui/boton.css";
import "@/components/hero/hero.css";

// Titular con carácter editorial (postura declarada en la ronda del HERO, docs/06-UI-UX.md §6).
const titulo = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--fuente-titulo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Araucaria",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-AR" className={titulo.variable}>
      <body>
        <HeroApertura />
        {children}
      </body>
    </html>
  );
}
