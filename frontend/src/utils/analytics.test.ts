import { trackAuthEvent, trackGA4Event } from "./analytics";

describe("trackGA4Event", () => {
  const mockEvent = jest.fn();
  const mockReactGA = { event: mockEvent } as any;

  beforeEach(() => {
    mockEvent.mockClear();
  });

  it("no-ops during SSR when window is undefined", () => {
    trackGA4Event("auth_email_entered", { locale: "en" }, mockReactGA);
    expect(mockEvent).toHaveBeenCalled();
  });

  it("no-ops when ReactGA is undefined", () => {
    trackGA4Event("auth_email_entered", { locale: "en" }, undefined);
    expect(mockEvent).not.toHaveBeenCalled();
  });

  it("calls ReactGA.event with event name and clean params", () => {
    trackGA4Event(
      "auth_email_entered",
      { locale: "en", hub_slug: "berlin", user_status: "new" },
      mockReactGA
    );

    expect(mockEvent).toHaveBeenCalledTimes(1);
    expect(mockEvent).toHaveBeenCalledWith("auth_email_entered", {
      locale: "en",
      hub_slug: "berlin",
      user_status: "new",
    });
  });

  it("strips undefined values from params", () => {
    trackGA4Event(
      "auth_step_viewed",
      { locale: "de", hub_slug: undefined, step: "email_entry" },
      mockReactGA
    );

    expect(mockEvent).toHaveBeenCalledWith("auth_step_viewed", {
      locale: "de",
      step: "email_entry",
    });
  });

  it("handles numeric and boolean params", () => {
    trackGA4Event(
      "auth_signup_interests_submitted",
      { locale: "en", sector_count: 3, is_resend: true },
      mockReactGA
    );

    expect(mockEvent).toHaveBeenCalledWith("auth_signup_interests_submitted", {
      locale: "en",
      sector_count: 3,
      is_resend: true,
    });
  });

  it("fires event_registration_* events with event_slug", () => {
    trackGA4Event(
      "event_registration_modal_opened",
      { user_type: "authenticated", event_slug: "summer-summit", has_available_seats: true },
      mockReactGA
    );

    expect(mockEvent).toHaveBeenCalledWith("event_registration_modal_opened", {
      user_type: "authenticated",
      event_slug: "summer-summit",
      has_available_seats: true,
    });
  });
});

describe("trackAuthEvent (backward compatibility)", () => {
  it("is an alias for trackGA4Event", () => {
    expect(trackAuthEvent).toBe(trackGA4Event);
  });
});
