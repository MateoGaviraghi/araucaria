import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelMarco } from "@/components/admin/panel-marco";
import "../admin.css";

export const metadata: Metadata = {
  title: { default: "Panel de Araucaria", template: "%s · Panel de Araucaria" },
  robots: { index: false, follow: false },
};

// The owner panel's frame (D-046): side menu, "Nueva reserva" and the shared dialogs. It reads no data:
// every page checks the session itself with requireAdmin() (C-05), inside its own <Suspense> (D-021).
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <PanelMarco>{children}</PanelMarco>;
}
