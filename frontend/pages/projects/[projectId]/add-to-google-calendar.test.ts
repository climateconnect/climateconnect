import { getServerSideProps } from "./add-to-google-calendar";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

const mockApiRequest = jest.fn();
jest.mock("../../../public/lib/apiOperations", () => ({
  ...jest.requireActual("../../../public/lib/apiOperations"),
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
    writeHead: jest.fn(function (this: any, status: number, headers: Record<string, string>) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    }),
    end: jest.fn(function (this: any, body?: string) {
      if (body) res.body = body;
    }),
  };
  return {
    res,
    query: { projectId: "test-event" },
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

describe("add-to-google-calendar getServerSideProps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue({ data: makeEvent() });
  });

  it("redirects to Google Calendar URL with status 302", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    expect(ctx.res.writeHead).toHaveBeenCalledWith(302, expect.any(Object));
    expect(ctx.res.headers.Location).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/render/);
  });

  it("includes the event name as the text parameter", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    expect(url.searchParams.get("text")).toBe("Climate Summit");
  });

  it("includes start and end dates in Google Calendar format (YYYYMMDDTHHmmssZ)", async () => {
    mockApiRequest.mockResolvedValue({
      data: makeEvent({
        start_date: "2026-07-15T10:00:00Z",
        end_date: "2026-07-15T12:30:00Z",
      }),
    });
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    const dates = url.searchParams.get("dates");
    expect(dates).toBe("20260715T100000Z/20260715T123000Z");
  });

  it("includes the event URL in the details parameter", async () => {
    const ctx = makeCtx({ query: { projectId: "summit-2026" } });
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    const details = url.searchParams.get("details");
    expect(details).toContain("/projects/summit-2026");
    expect(details).toContain("A great event about climate.");
  });

  it("sets location to 'Online' for online events", async () => {
    mockApiRequest.mockResolvedValue({
      data: makeEvent({ is_online: true, location: "Berlin, Germany" }),
    });
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    expect(url.searchParams.get("location")).toBe("Online");
  });

  it("uses the event location for in-person events", async () => {
    const ctx = makeCtx();
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    expect(url.searchParams.get("location")).toBe("Berlin, Germany");
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

  it("uses German locale prefix when locale is de", async () => {
    const ctx = makeCtx({ locale: "de" });
    await getServerSideProps(ctx);
    const url = new URL(ctx.res.headers.Location);
    const details = url.searchParams.get("details");
    expect(details).toContain("/de/projects/test-event");
  });
});
