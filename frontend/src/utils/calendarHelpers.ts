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
  short_description?: string;
  location?: string;
  is_online?: boolean;
};

function getEventDescription(event: CalendarEvent): string | undefined {
  return event.short_description || undefined;
}

export function buildGoogleCalendarUrl(event: CalendarEvent, eventUrl: string): string {
  const desc = getEventDescription(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "",
    dates: `${toGoogleCalendarDate(event.start_date)}/${toGoogleCalendarDate(event.end_date)}`,
    details: desc ? `${desc}\n\n${eventUrl}` : eventUrl,
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
  const desc = getEventDescription(event);
  return {
    start: new Date(event.start_date!),
    end: new Date(event.end_date!),
    summary: event.name || "",
    url: eventUrl,
    description: desc ? desc + "\n\n" + eventUrl : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  };
}
