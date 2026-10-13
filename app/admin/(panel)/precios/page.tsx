import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Precios } from "@/components/admin/precios";
import { getModuleSettings, requireAdmin } from "@/lib/dal";
import { Esqueleto } from "../esqueleto";

export const metadata = { title: "Precios y horarios" };

export default function PreciosPage() {
  return (
    <Suspense fallback={<Esqueleto />}>
      <PreciosDatos />
    </Suspense>
  );
}

async function PreciosDatos() {
  if (!(await requireAdmin())) redirect("/admin/login?sesion=terminada");
  return <Precios ajustes={await getModuleSettings()} />;
}
