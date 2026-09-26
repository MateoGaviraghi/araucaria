// The same places as the real section, still: nothing blinks while the data arrives (D-046).
export function Esqueleto({ tarjetas = 0 }: { tarjetas?: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <div className="pn-esq pn-esq-cabeza" />
      {tarjetas > 0 && (
        <div className="pn-tarjetas">
          {Array.from({ length: tarjetas }, (_, i) => (
            <div key={i} className="pn-esq pn-esq-tarjeta" />
          ))}
        </div>
      )}
      <div className="pn-esq pn-esq-bloque" />
    </div>
  );
}
