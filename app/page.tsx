import { Suspense } from "react";
import { Disponibilidad, DisponibilidadEsperando } from "@/components/calendario/disponibilidad";
import { Cierre } from "@/components/cierre/cierre";
import { Galeria } from "@/components/galeria/galeria";
import { Hero } from "@/components/hero/hero";
import { Incluye } from "@/components/incluye/incluye";
import { ScrollSuave } from "@/components/scroll-suave";

// Los textos de la galería se abren desde su máscara cuando llega cada tarjeta. Este guion los deja
// abajo ANTES del primer pintado: si lo hiciera React, al recargar parado en la galería se verían
// escritos, desaparecerían y recién ahí se abrirían (criterio: cero parpadeos al recargar). Mismo
// método que components/hero/hero-apertura.tsx: hoja inyectada que se quita sola a los 3 s, así un
// JavaScript que nunca corre no deja los textos escondidos. Con movimiento reducido no hace nada.
const GUION_GALERIA = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.gal-linea{transform:translateY(125%)}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

// Lo que incluye el alquiler (D-037): los textos esperan abajo en su máscara, los filetes sin dibujar y
// las viñetas en cero hasta que la franja llega a la pantalla.
const GUION_INCLUYE = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.inc-linea{transform:translateY(120%)}.inc-hilo{transform:scaleX(0)}.inc-vineta{transform:scale(0)}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

// Lo mismo para el calendario (D-033): el título, los números y el mes de la foto esperan abajo en
// su máscara, las luces apagadas y los sellos sin caer, hasta que la sección llega a la pantalla.
const GUION_CALENDARIO = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.cal-encabezado .cal-linea,.cal-grilla-cabeza .cal-linea,.cal-num,.cal-foto-texto .cal-linea{transform:translateY(110%)}.cal .cal-dia .cal-luz,.cal .cal-dia .cal-sello{opacity:0}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

// El cierre (D-036): textos, nombres del mapa, marcador, contorno de ARAUCARIA y la tarjeta esperan
// escondidos hasta su entrada. Literal y no importado: una constante de un módulo "use client" llega al
// servidor como referencia de cliente, no como texto.
const GUION_CIERRE = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.cie-linea{transform:translateY(130%)}.mp-etq,.mp-lugar,.mp-pin,.mp-rotulo{opacity:0}.pie-contorno text{stroke-dasharray:1600;stroke-dashoffset:1600;fill-opacity:0}.pie-marco .pie{transform:translateY(140px)}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

export default function HomePage() {
  return (
    <>
      <ScrollSuave />
      <Hero />
      <script dangerouslySetInnerHTML={{ __html: GUION_GALERIA }} />
      <Galeria />
      <script dangerouslySetInnerHTML={{ __html: GUION_INCLUYE }} />
      <Incluye />
      <script dangerouslySetInnerHTML={{ __html: GUION_CALENDARIO }} />
      <Suspense fallback={<DisponibilidadEsperando />}>
        <Disponibilidad />
      </Suspense>
      <script dangerouslySetInnerHTML={{ __html: GUION_CIERRE }} />
      <Cierre />
    </>
  );
}
