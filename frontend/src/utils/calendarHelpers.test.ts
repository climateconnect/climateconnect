import {
  toGoogleCalendarDate,
  buildGoogleCalendarUrl,
  buildIcalEventData,
} from "./calendarHelpers";

describe("toGoogleCalendarDate", () => {
  it("returns empty string for null/undefined", () => {
    expect(toGoogleCalendarDate(null)).toBe("");
    expect(toGoogleCalendarDate(undefined)).toBe("");
    expect(toGoogleCalendarDate("")).toBe("");
  });

  it("formats a UTC date string correctly", () => {
    expect(toGoogleCalendarDate("2026-07-15T10:00:00Z")).toBe("20260715T100000Z");
  });

  it("pads single-digit months and days", () => {
    expect(toGoogleCalendarDate("2026-01-05T08:05:03Z")).toBe("20260105T080503Z");
  });

  it("handles midnight correctly", () => {
    expect(toGoogleCalendarDate("2026-12-31T00:00:00Z")).toBe("20261231T000000Z");
  });
});

describe("buildGoogleCalendarUrl", () => {
  it("builds a valid Google Calendar URL", () => {
    const event = {
      name: "Climate Summit",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "A great event.",
      location: "Berlin, Germany",
      is_online: false,
    };
    const url = buildGoogleCalendarUrl(event, "https://example.com/event");
    expect(url).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/render\?/);
    const params = new URL(url).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("text")).toBe("Climate Summit");
    expect(params.get("dates")).toBe("20260715T100000Z/20260715T120000Z");
    expect(params.get("details")).toContain("A great event.");
    expect(params.get("details")).toContain("https://example.com/event");
    expect(params.get("location")).toBe("Berlin, Germany");
  });

  it("sets location to 'Online' for online events", () => {
    const event = {
      name: "Online Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      is_online: true,
      location: "Berlin",
    };
    const url = buildGoogleCalendarUrl(event, "https://example.com/event");
    const params = new URL(url).searchParams;
    expect(params.get("location")).toBe("Online");
  });

  it("uses event URL as details when description is empty", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
    };
    const url = buildGoogleCalendarUrl(event, "https://example.com/event");
    const params = new URL(url).searchParams;
    expect(params.get("details")).toBe("https://example.com/event");
  });

  it("falls back to short_description when description is not set", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "A short summary.",
    };
    const url = buildGoogleCalendarUrl(event, "https://example.com/event");
    const params = new URL(url).searchParams;
    expect(params.get("details")).toContain("A short summary.");
    expect(params.get("details")).toContain("https://example.com/event");
  });

  it("uses short_description for Google Calendar details", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "Short summary.",
    };
    const url = buildGoogleCalendarUrl(event, "https://example.com/event");
    const params = new URL(url).searchParams;
    expect(params.get("details")).toContain("Short summary.");
  });
});

describe("buildIcalEventData", () => {
  it("returns correct event data structure", () => {
    const event = {
      name: "Climate Summit",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "A great event.",
      location: "Berlin, Germany",
      is_online: false,
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.summary).toBe("Climate Summit");
    expect(data.start).toEqual(new Date("2026-07-15T10:00:00Z"));
    expect(data.end).toEqual(new Date("2026-07-15T12:00:00Z"));
    expect(data.url).toBe("https://example.com/event");
    expect(data.description).toContain("A great event.");
    expect(data.description).toContain("https://example.com/event");
    expect(data.location).toBe("Berlin, Germany");
  });

  it("sets location to 'Online' for online events", () => {
    const event = {
      name: "Online Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      is_online: true,
      location: "Berlin",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.location).toBe("Online");
  });

  it("uses event URL as description when description is empty", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.description).toBe("https://example.com/event");
  });

  it("preserves actual newlines in description (no pre-escaping)", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "Line one.\nLine two.",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.description).toBe("Line one.\nLine two.\n\nhttps://example.com/event");
  });

  it("preserves commas in description (no pre-escaping)", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "First, second, third.",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.description).toContain("First, second, third.");
  });

  it("uses short_description for the ical description", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
      short_description: "A short summary.",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.description).toContain("A short summary.");
    expect(data.description).toContain("https://example.com/event");
  });

  it("uses URL only when short_description is not set", () => {
    const event = {
      name: "Event",
      start_date: "2026-07-15T10:00:00Z",
      end_date: "2026-07-15T12:00:00Z",
    };
    const data = buildIcalEventData(event, "https://example.com/event");
    expect(data.description).toBe("https://example.com/event");
  });
});
