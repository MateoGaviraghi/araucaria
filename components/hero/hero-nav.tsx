import Image from "next/image";

// Barra provisoria: existe solo para que el hero no quede flotando en el prototipo.
// El NAV de verdad se diseña en su propia ronda de seccion-premium, cuando Mateo lo nombre.
export function HeroNav() {
  return (
    <div className="hero-barra-sup">
      <a className="hero-marca" href="#inicio">
        <Image src="/media/logo-araucaria.png" alt="" width={52} height={52} priority />
        <span>
          Araucaria
          <small>multiespacio</small>
        </span>
      </a>
      <a className="boton boton-chico boton-en-oscuro" href="#disponibilidad">
        <span className="solo-ancho">Consultar disponibilidad</span>
        <span className="solo-angosto">Disponibilidad</span>
      </a>
    </div>
  );
}
