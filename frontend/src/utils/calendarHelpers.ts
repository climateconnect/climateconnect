export function escapeIcalText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function toGoogleCalendarDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return (
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z"
  );
}

type CalendarEvent = {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  location?: string;
  is_online?: boolean;
};

export function buildGoogleCalendarUrl(event: CalendarEvent, eventUrl: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "",
    dates: `${toGoogleCalendarDate(event.start_date)}/${toGoogleCalendarDate(event.end_date)}`,
    details: event.description ? `${event.description}\n\n${eventUrl}` : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcalEventData(
  event: CalendarEvent,
  eventUrl: string
): {
  start: Date;
  end: Date;
  summary: string;
  url: string;
  description: string;
  location: string;
} {
  return {
    start: new Date(event.start_date!),
    end: new Date(event.end_date!),
    summary: event.name || "",
    url: eventUrl,
    description: event.description
      ? escapeIcalText(event.description) + "\\n\\n" + eventUrl
      : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  };
}
