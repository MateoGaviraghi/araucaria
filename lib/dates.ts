// Dates are 'YYYY-MM-DD' strings (Postgres `date`, no timezone). "Today" is always Buenos Aires
// (G-010); calendar arithmetic runs on UTC midnights so no local timezone can shift a day.

export const TIME_ZONE = "America/Argentina/Buenos_Aires";

/** 'YYYY-MM-DD' */
export type IsoDate = string;
/** 'YYYY-MM' */
export type IsoMonth = string;

// CI-04 default: bookable from today to today + 12 months.
export const BOOKING_HORIZON_MONTHS = 12;

/** Request time in ms. A helper because the React Compiler lint forbids Date.now() inside a component (G-019). */
export function nowMs(): number {
  return Date.now();
}

export function todayInBuenosAires(now: Date = new Date()): IsoDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function toUtc(date: IsoDate): Date {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function fromUtc(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

/** Rejects impossible dates such as 2026-02-30. */
export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

export function isValidIsoMonth(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value) && isValidIsoDate(`${value}-01`);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const utc = toUtc(date);
  utc.setUTCDate(utc.getUTCDate() + days);
  return fromUtc(utc);
}

/** Clamps to the end of the target month: 2027-01-31 + 1 month = 2027-02-28. */
export function addMonths(date: IsoDate, months: number): IsoDate {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month - 1 + months + 1, 0)).getUTCDate();
  return fromUtc(new Date(Date.UTC(year, month - 1 + months, Math.min(day, lastDay))));
}

export function lastBookableDate(today: IsoDate): IsoDate {
  return addMonths(today, BOOKING_HORIZON_MONTHS);
}

export function monthOf(date: IsoDate): IsoMonth {
  return date.slice(0, 7);
}

export function firstDayOfMonth(month: IsoMonth): IsoDate {
  return `${month}-01`;
}

export function addMonthsToMonth(month: IsoMonth, months: number): IsoMonth {
  return monthOf(addMonths(firstDayOfMonth(month), months));
}

/** ISO weekday of a date: 1 = lunes … 7 = domingo. */
export function isoWeekday(date: IsoDate): number {
  return toUtc(date).getUTCDay() || 7;
}

function formatParts(date: IsoDate, options: Intl.DateTimeFormatOptions) {
  const parts = new Intl.DateTimeFormat("es-AR", { ...options, timeZone: "UTC" }).formatToParts(toUtc(date));
  return (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
}

/** "domingo 18 de octubre de 2026" (the WhatsApp message format, 05-API-CONTRACTS.md §3). */
export function formatLongDate(date: IsoDate): string {
  const part = formatParts(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${part("weekday")} ${part("day")} de ${part("month")} de ${part("year")}`;
}

/** "18/10", "05/09". Built from the ISO string: es-AR Intl ignores 2-digit months in day/month. */
export function formatDayMonth(date: IsoDate): string {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}`;
}

/** "domingo 18/10" */
export function formatWeekdayDayMonth(date: IsoDate): string {
  return `${formatParts(date, { weekday: "long" })("weekday")} ${formatDayMonth(date)}`;
}

/** "Octubre de 2026" */
export function formatMonthTitle(month: IsoMonth): string {
  const part = formatParts(firstDayOfMonth(month), { month: "long", year: "numeric" });
  const name = part("month");
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${part("year")}`;
}
