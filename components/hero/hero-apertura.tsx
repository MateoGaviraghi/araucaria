// Deja el hero CERRADO antes del primer pintado: los telones tapando y el texto oculto. Si esto
// lo hiciera React, el primer cuadro mostraría todo abierto y después saltaría hacia atrás
// (criterio: cero parpadeos al recargar).
//
// Va como hoja de estilo inyectada y no como atributo del <html>, que daría aviso de hidratación.
// Se quita sola a los 3 s: si la animación nunca corriera, el hero aparece igual en vez de
// quedarse tapado. Con movimiento reducido no hace nada y el hero nace abierto.
const GUION = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.hero-telon span{transform:none}.hero-cuerpo>*{opacity:0}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

export function HeroApertura() {
  return <script dangerouslySetInnerHTML={{ __html: GUION }} />;
}
