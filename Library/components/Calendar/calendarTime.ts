import type { CalendarEvent } from "./Calendar";

export function formatEventTimeRange(startTime?: string, endTime?: string) {
  if (!startTime) {
    return null;
  }

  const format = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  if (endTime) {
    return `${format(startTime)} – ${format(endTime)}`;
  }

  return format(startTime);
}

export function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    if (!a.startTime && !b.startTime) {
      return a.title.localeCompare(b.title);
    }

    if (!a.startTime) {
      return 1;
    }

    if (!b.startTime) {
      return -1;
    }

    const startCompare = a.startTime.localeCompare(b.startTime);
    if (startCompare !== 0) {
      return startCompare;
    }

    return (a.endTime ?? "").localeCompare(b.endTime ?? "");
  });
}
