"use client";

import { useRef } from "react";
import type { IsoMonth } from "@/lib/dates";
import { gsap, useGSAP } from "@/lib/gsap";
import { ABRE, CURVA, ENTRE_LINEAS, ESCONDIDO, Mascara, partesDelMes, quieto } from "./comun";

// La foto del mes, con su nombre en grande (la mitad izquierda que la cortina tapa al elegir un
// día). Cada mes trae otra foto del lugar: entra con un fundido mientras se aleja de 1,08 a 1 en
// 1,2 s, y el nombre sube desde su máscara. Antes de que la sección llegue, todo espera escondido.

const FOTOS = [
  { src: "/media/fotos/salon-ventanal.jpg", alt: "El salón y su ventanal" },
  { src: "/media/fotos/pileta.jpg", alt: "La pileta" },
  { src: "/media/fotos/jardin.jpg", alt: "El jardín" },
  { src: "/media/fotos/quincho.jpg", alt: "La parrilla" },
  { src: "/media/fotos/salon-interior.jpg", alt: "El interior del salón" },
  { src: "/media/fotos/pileta-cascada.jpg", alt: "La cascada de la pileta" },
  { src: "/media/fotos/salon-vacio.jpg", alt: "El salón vacío, listo para armar" },
];

const ENTRA = 1.2;
const ACERCA = 1.08;

export function Foto({ mes, llego, className = "" }: { mes: IsoMonth; llego: boolean; className?: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const actual = Number(mes.slice(5, 7)) % FOTOS.length;
  const { nombre, anio } = partesDelMes(mes);

  useGSAP(
    () => {
      const capas = gsap.utils.toArray<HTMLElement>(".cal-foto-capa", raiz.current);
      const lineas = ".cal-foto-texto .cal-linea";
      capas.forEach((c, i) => gsap.set(c, { zIndex: i === actual ? 2 : 1 }));

      if (!quieto()) {
        capas.forEach((c, i) => gsap.set(c, { opacity: i === actual ? 1 : 0, scale: 1 }));
        gsap.set(lineas, { y: 0, yPercent: 0 });
        return;
      }
      if (!llego) {
        gsap.set(lineas, { y: 0, yPercent: ESCONDIDO });
        return;
      }
      gsap.fromTo(
        capas[actual],
        { opacity: 0, scale: ACERCA },
        {
          opacity: 1,
          scale: 1,
          duration: ENTRA,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => capas.forEach((c, i) => i !== actual && gsap.set(c, { opacity: 0 })),
        },
      );
      gsap.fromTo(lineas, { y: 0, yPercent: ESCONDIDO }, { y: 0, yPercent: 0, duration: ABRE, ease: CURVA, stagger: ENTRE_LINEAS, overwrite: true });
    },
    { scope: raiz, dependencies: [actual, nombre, llego] },
  );

  return (
    <div ref={raiz} className={`cal-foto ${className}`}>
      {FOTOS.map((f, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- capas que GSAP cruza; next/image no suma acá
        <img key={f.src} className="cal-foto-capa" src={f.src} alt={i === actual ? f.alt : ""} loading="lazy" decoding="async" />
      ))}
      <div className="cal-foto-velo" aria-hidden="true" />
      <p className="cal-foto-texto" aria-hidden="true">
        <Mascara className="cal-foto-mes">{nombre}</Mascara>
        <Mascara className="cal-foto-anio">{anio}</Mascara>
      </p>
    </div>
  );
}
