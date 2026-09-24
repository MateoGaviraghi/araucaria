// Los logos de contacto con sus colores originales (Mateo: "quiero que sean los logos originales; en
// WhatsApp que se muestre el logo… el correo con el logo de Gmail, lo mismo con Google Maps").
// Dibujados a mano en SVG, sin librería: WhatsApp, Gmail, Google Maps e Instagram. El teléfono va como el
// ícono de la app Teléfono, con el mismo tubo que WhatsApp.

export type Marca = "whatsapp" | "gmail" | "maps" | "instagram" | "telefono" | "reloj";

export function Logo({ marca, className = "" }: { marca: Marca; className?: string }) {
  switch (marca) {
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
          <path fill="#25D366" d="M16 2.3A13.7 13.7 0 0 0 4.2 22.9L2.3 29.7l7-1.8A13.7 13.7 0 1 0 16 2.3z" />
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
            d="M16 5.2a10.8 10.8 0 0 0-9.3 16.3l.3.5-1.1 4 4.1-1.1.5.3A10.8 10.8 0 1 0 16 5.2z"
          />
          <path
            fill="#fff"
            d="M12.3 10.2c-.3-.6-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.2 2.6 4.1 6.4 5.6 3.2 1.2 3.8 1 4.5.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5l-2.4-1.2c-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.9-1.8-1.1-1-1.8-2.1-2-2.5-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.3.1-.5 0-.7l-1.1-2.8z"
          />
        </svg>
      );
    case "gmail":
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M6 13v23a3 3 0 0 0 3 3h5V18.5z" />
          <path fill="#34A853" d="M42 13v23a3 3 0 0 1-3 3h-5V18.5z" />
          <path fill="#EA4335" d="M6 13l18 13.5L42 13v-2a4 4 0 0 0-6.4-3.2L24 16.5 12.4 7.8A4 4 0 0 0 6 11z" />
          <path fill="#FBBC04" d="M42 11a4 4 0 0 0-6.4-3.2L34 9v9.5l8-6z" />
          <path fill="#C5221F" d="M6 11a4 4 0 0 1 6.4-3.2L14 9v9.5l-8-6z" />
        </svg>
      );
    case "maps":
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
          <defs>
            <clipPath id="logo-maps-pin">
              <path d="M24 3C16 3 9.5 9.3 9.5 17.2 9.5 28 24 45 24 45s14.5-17 14.5-27.8C38.5 9.3 32 3 24 3z" />
            </clipPath>
          </defs>
          <g clipPath="url(#logo-maps-pin)">
            <rect width="48" height="48" fill="#34A853" />
            <path fill="#1A73E8" d="M0 0h24v17.2L12 25H0z" />
            <path fill="#EA4335" d="M24 0h24v12L24 17.2z" />
            <path fill="#FBBC04" d="M0 25h12l12-7.8 9 8.3L16 48H0z" />
          </g>
          <circle cx="24" cy="17.2" r="5.6" fill="#fff" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <radialGradient id="logo-ig" cx="30%" cy="107%" r="150%">
              <stop offset="0" stopColor="#fdf497" />
              <stop offset="0.05" stopColor="#fdf497" />
              <stop offset="0.45" stopColor="#fd5949" />
              <stop offset="0.6" stopColor="#d6249f" />
              <stop offset="0.9" stopColor="#285aeb" />
            </radialGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-ig)" />
          <rect x="7" y="7" width="18" height="18" rx="5.2" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="16" cy="16" r="4.3" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="21.4" cy="10.6" r="1.3" fill="#fff" />
        </svg>
      );
    case "telefono":
      // Mateo: "usá un logo mejor para el teléfono, que sea el mismo que usás en WhatsApp". El ícono de
      // la app Teléfono: cuadrado verde redondeado (como Instagram) con el mismo tubo blanco del logo de
      // WhatsApp.
      return (
        <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <linearGradient id="logo-tel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5AF575" />
              <stop offset="1" stopColor="#12BF3E" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-tel)" />
          <path
            fill="#fff"
            transform="translate(-0.4 -0.6) scale(1.02)"
            d="M12.3 10.2c-.3-.6-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.2 2.6 4.1 6.4 5.6 3.2 1.2 3.8 1 4.5.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5l-2.4-1.2c-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.9-1.8-1.1-1-1.8-2.1-2-2.5-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.3.1-.5 0-.7l-1.1-2.8z"
          />
        </svg>
      );
    case "reloj":
      // Mateo: "mejorá el logo del reloj, no pega con lo demás". Como la app Reloj: cuadrado redondeado
      // (igual que Instagram y Teléfono), esfera blanca y agujas; la del segundero en naranja.
      return (
        <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#1c1c1e" />
          <circle cx="16" cy="16" r="11.5" fill="#fff" />
          <g stroke="#1c1c1e" strokeLinecap="round">
            <path d="M16 6.8v1.6M16 23.6v1.6M6.8 16h1.6M23.6 16h1.6" strokeWidth="1.2" />
            <path d="M16 16V9.6" strokeWidth="1.9" />
            <path d="M16 16l4.6 2.7" strokeWidth="1.9" />
          </g>
          <path d="M16 16l-3.2 6.6" stroke="#ff9500" strokeWidth="1" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.4" fill="#ff9500" />
        </svg>
      );
  }
}
