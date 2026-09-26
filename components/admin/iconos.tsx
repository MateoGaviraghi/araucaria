// Line icons for the owner panel (D-046): 20 × 20, 1.6 stroke, currentColor. Decorative: aria-hidden.

type Props = { className?: string };

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconoInicio = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M3.5 9 10 3.5 16.5 9v7.5h-4.25V12h-4.5v4.5H3.5z" />
  </svg>
);

export const IconoReservas = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M7 5h9.5M7 10h9.5M7 15h9.5" />
    <circle cx="3.75" cy="5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="3.75" cy="10" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="3.75" cy="15" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconoCalendario = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3" y="4.25" width="14" height="12.5" rx="2" />
    <path d="M3 8.25h14M7 2.75v3M13 2.75v3" />
  </svg>
);

export const IconoMas = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={1.8}>
    <path d="M10 4.5v11M4.5 10h11" />
  </svg>
);

export const IconoAfuera = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M8 4H4.5v11.5H16V12M11 4h5v5M16 4l-7 7" />
  </svg>
);

export const IconoSalir = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M8 3.5H4.5v13H8M12.5 6.5 16 10l-3.5 3.5M16 10H8" />
  </svg>
);

export const IconoCerrar = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M5 5l10 10M15 5 5 15" />
  </svg>
);

export const IconoFlecha = ({ className, izquierda }: Props & { izquierda?: boolean }) => (
  <svg {...base} className={className} strokeWidth={1.7}>
    <path d={izquierda ? "M16 10H4.5M9 5.5 4.5 10 9 14.5" : "M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5"} />
  </svg>
);

export const IconoBuscar = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="8.75" cy="8.75" r="5.25" />
    <path d="m12.75 12.75 3.75 3.75" />
  </svg>
);

export const IconoTelefono = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M5.5 3.5h2.25l1.25 3.25-1.75 1.25a8.5 8.5 0 0 0 4.75 4.75l1.25-1.75 3.25 1.25v2.25a1.5 1.5 0 0 1-1.5 1.5A12.5 12.5 0 0 1 4 5a1.5 1.5 0 0 1 1.5-1.5z" />
  </svg>
);
