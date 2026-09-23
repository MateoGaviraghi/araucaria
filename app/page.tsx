import { Galeria } from "@/components/galeria/galeria";
import { Hero } from "@/components/hero/hero";
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

export default function HomePage() {
  return (
    <>
      <ScrollSuave />
      <Hero />
      <script dangerouslySetInnerHTML={{ __html: GUION_GALERIA }} />
      <Galeria />
    </>
  );
}
