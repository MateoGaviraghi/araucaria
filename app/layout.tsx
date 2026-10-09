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

// Facts from docs/01-CONTEXT.md. The tab icon, the home-screen icon and the link preview image are the
// file conventions app/icon.png, app/apple-icon.png and app/opengraph-image.png, cut from the temporary
// logo until the original arrives (CR-03).
const DESCRIPCION =
  "Salón de eventos en Güemes 3660, Santa Fe: cumpleaños, eventos infantiles, reuniones, talleres y celebraciones. Consultá la disponibilidad.";

export const metadata: Metadata = {
  metadataBase: new URL("https://araucariamultiespacio.com.ar"),
  title: "Araucaria",
  description: DESCRIPCION,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Araucaria multiespacio",
    title: "Araucaria",
    description: DESCRIPCION,
    url: "/",
  },
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
