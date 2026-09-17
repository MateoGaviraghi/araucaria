import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBlocksForMonth, getUpcomingBlocks, requireAdmin } from "@/lib/dal";
import { isValidIsoMonth, lastBookableDate, monthOf, todayInBuenosAires } from "@/lib/dates";
import { PrototypePanel } from "./panel";
import "./picker.css";
import "./prototipo.css";

export const metadata: Metadata = {
  title: "Prototipo · Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Prototype surface of the owner-panel design round (seccion-premium). Deleted when a variant is promoted.
export default async function PrototypePage({ searchParams }: PageProps<"/admin/prototipo">) {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login?sesion=terminada");

  const today = todayInBuenosAires();
  const lastBookable = lastBookableDate(today);
  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastBookable);

  const { mes, v } = await searchParams;
  const requested = typeof mes === "string" && isValidIsoMonth(mes) ? mes : firstMonth;
  const month = requested < firstMonth ? firstMonth : requested > lastMonth ? lastMonth : requested;
  const variant = Math.min(Math.max((Number(v) || 1) - 1, 0), 2);

  const [blocks, upcoming] = await Promise.all([getBlocksForMonth(month), getUpcomingBlocks(today)]);

  return (
    <PrototypePanel
      initialVariant={variant}
      month={month}
      blocks={blocks}
      upcoming={upcoming}
      today={today}
      lastBookable={lastBookable}
      firstMonth={firstMonth}
      lastMonth={lastMonth}
    />
  );
}
