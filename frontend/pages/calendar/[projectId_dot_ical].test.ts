import { TextEncoder, TextDecoder } from "util";
import { getServerSideProps } from "./[projectId_dot_ical]";

// ical-generator uses TextEncoder which is not available in jsdom
/* eslint-disable no-undef */
if (typeof global.TextEncoder === "undefined") {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  (global as any).TextDecoder = TextDecoder;
}
/* eslint-enable no-undef */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const mockApiRequest = jest.fn();
jest.mock("../../public/lib/apiOperations", () => ({
  ...jest.requireActual("../../public/lib/apiOperations"),
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Record<string, any> = {}) {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader: jest.fn(function (name: string, value: string) {
      res.headers[name] = value;
    }),
    write: jest.fn(function (data: string) {
      res.body += data;
    }),
    end: jest.fn(),
  };
  return {
    res,
    query: { projectId_dot_ical: "test-event.ical" },
    locale: "en",
    ...overrides,
  };
}

function makeEvent(overrides: Record<string, any> = {}) {
  return {
    name: "Climate Summit",
    start_date: "2026-07-15T10:00:00Z",
    end_date: "2026-07-15T12:00:00Z",
    description: "A great event about climate.",
    location: "Berlin, Germany",
    is_online: false,
    is_draft: false,
    project_type: { type_id: "event" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ical endpoint getServerSideProps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue({ data: makeEvent() });
  });

  it("returns iCal content with correct Content-Type header", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.setHeader).toHaveBeenCalledWith("Content-Type", "text/calendar; charset=utf-8");
  });

  it("sets Content-Disposition with the slug as filename", async () => {
    const ctx = makeCtx({ query: { projectId_dot_ical: "summit-2026.ical" } });
    await getServerSideProps(ctx);
    expect(ctx.res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="summit-2026.ics"'
    );
  });

  it("writes valid iCal content with VCALENDAR and VEVENT", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    const body = ctx.res.body;
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("END:VCALENDAR");
    expect(body).toContain("BEGIN:VEVENT");
    expect(body).toContain("END:VEVENT");
  });

  it("includes the event summary (name) in the iCal output", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.body).toContain("SUMMARY:Climate Summit");
  });

  it("includes the event URL in the iCal output", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.body).toContain("/projects/test-event");
  });

  it("includes the event location in the iCal output", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.body).toContain("LOCATION:Berlin\\, Germany");
  });

  it("sets location to 'Online' for online events", async () => {
    mockApiRequest.mockResolvedValue({
      data: makeEvent({ is_online: true, location: "Berlin, Germany" }),
    });
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.body).toContain("LOCATION:Online");
  });

  it("returns 404 when the API request fails", async () => {
    mockApiRequest.mockRejectedValue(new Error("Not found"));
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.statusCode).toBe(404);
  });

  it("returns 404 when the project is not an event", async () => {
    mockApiRequest.mockResolvedValue({
      data: makeEvent({ project_type: { type_id: "project" } }),
    });
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.statusCode).toBe(404);
  });

  it("returns 404 when the event is a draft", async () => {
    mockApiRequest.mockResolvedValue({
      data: makeEvent({ is_draft: true }),
    });
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.statusCode).toBe(404);
  });

  it("extracts the slug correctly by stripping .ical suffix", async () => {
    const ctx = makeCtx({ query: { projectId_dot_ical: "my-cool-event.ical" } });
    await getServerSideProps(ctx);
    // Verify the API was called with the correct slug
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/projects/my-cool-event/" })
    );
  });

  it("includes DTSTART and DTEND in the iCal output", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.body).toContain("DTSTART:");
    expect(ctx.res.body).toContain("DTEND:");
  });

  it("uses German locale for API request when locale is de", async () => {
    const ctx = makeCtx({ locale: "de" });
    await getServerSideProps(ctx);
    expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ locale: "de" }));
  });
});
