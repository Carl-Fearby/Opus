import type { ChangeEvent, ChangeEventHandler } from "react";

export type DateRangeValue = { from: string; to: string };

export function formatDateDisplay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseDateTimeLocal(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    return { date: "", hours: "09", minutes: "00" };
  }
  return { date: match[1], hours: match[2], minutes: match[3] };
}

export function formatDateTimeLocal(date: string, hours: string, minutes: string) {
  if (!date) return "";
  return `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function formatDateTimeDisplay(value: string) {
  const { date, hours, minutes } = parseDateTimeLocal(value);
  const dateLabel = formatDateDisplay(date);
  if (!dateLabel) return "";
  return `${dateLabel}, ${hours}:${minutes}`;
}

export function parseTimeValue(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})/);
  if (!match) {
    return { hours: "09", minutes: "00" };
  }
  return { hours: match[1], minutes: match[2] };
}

export function formatTimeValue(hours: string, minutes: string) {
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function formatTimeDisplay(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

export function parseMonthValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function formatMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatMonthDisplay(value: string) {
  const parsed = parseMonthValue(value);
  if (!parsed) return "";
  const date = new Date(parsed.year, parsed.month - 1, 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function padWeek(value: number) {
  return String(value).padStart(2, "0");
}

/** ISO week-numbering year and week for a calendar date. */
export function getISOWeekParts(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: target.getUTCFullYear(), week };
}

export function getISOWeeksInYear(year: number) {
  return getISOWeekParts(new Date(Date.UTC(year, 11, 28))).week;
}

/** Monday (UTC) of the given ISO week. */
export function getDateOfISOWeek(year: number, week: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - day + 1 + (week - 1) * 7);
  return monday;
}

export function parseWeekValue(value: string) {
  const match = value.match(/^(\d{4})-W(\d{2})$/i);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  const maxWeek = getISOWeeksInYear(year);
  if (week < 1 || week > maxWeek) return null;
  return { year, week };
}

export function formatWeekValue(year: number, week: number) {
  return `${year}-W${padWeek(week)}`;
}

export function formatWeekDisplay(value: string) {
  const parsed = parseWeekValue(value);
  if (!parsed) return "";
  const monday = getDateOfISOWeek(parsed.year, parsed.week);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const range = `${monday.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })} – ${sunday.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })}`;
  return `Week ${parsed.week}, ${parsed.year} (${range})`;
}

export function formatWeekRangeLabel(year: number, week: number) {
  const monday = getDateOfISOWeek(year, week);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return `${monday.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })} – ${sunday.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })}`;
}

export function formatDateRangeDisplay(value: DateRangeValue) {
  const from = formatDateDisplay(value.from);
  const to = formatDateDisplay(value.to);
  if (from && to) return `${from} – ${to}`;
  if (from) return `${from} – …`;
  return "";
}

/** Fire a ChangeEvent-compatible update so useFormState.register keeps working. */
export function emitDateInputChange(
  onChange: ChangeEventHandler<HTMLInputElement> | undefined,
  nextValue: string,
  name?: string,
) {
  if (!onChange) return;

  const target = {
    name: name ?? "",
    type: "date",
    value: nextValue,
  } as HTMLInputElement;

  onChange({
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLInputElement>);
}
