import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import EditEventRegistrationModal from "./EditEventRegistrationModal";
import { EventRegistrationData, Project } from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("universal-cookie", () => {
  return jest.fn(() => ({ get: jest.fn(() => "test-token") }));
});

const mockApiRequest = jest.fn();
jest.mock("../../../public/lib/apiOperations", () => ({
  ...jest.requireActual("../../../public/lib/apiOperations"),
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

// Stub DatePicker to a plain text input so tests don't depend on the
// MUI date-picker internals.
jest.mock("../general/DatePicker", () => {
  const React = require("react");
  return function MockDatePicker({ label, date, handleChange, error }: any) {
    return (
      <div>
        <label htmlFor={`datepicker-${label}`}>{label}</label>
        <input
          id={`datepicker-${label}`}
          data-testid={`datepicker-${label}`}
          type="text"
          value={date ? date.toISOString() : ""}
          onChange={(e) => {
            const dayjs = require("dayjs");
            handleChange(dayjs(e.target.value || null));
          }}
          aria-label={label}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
const FUTURE_DATE = "2099-03-31T23:59:00.000Z"; // before EVENT_END_DATE
const PAST_DATE = "2000-01-01T00:00:00.000Z";
const EVENT_END_DATE = "2099-06-30T23:59:00.000Z";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    url_slug: "test-event",
    name: "Test Event",
    project_type: { type_id: "event" } as any,
    end_date: EVENT_END_DATE,
    is_draft: false,
    team: [],
    ...overrides,
  } as Project;
}

function makeRegistration(overrides: Partial<EventRegistrationData> = {}): EventRegistrationData {
  return {
    max_participants: 50,
    available_seats: 20,
    registration_end_date: FUTURE_DATE,
    status: "open",
    ...overrides,
  };
}

const defaultContextValue = {
  locale: "en" as any,
  user: null,
  locales: [],
  pathName: "/",
  donationGoals: [],
};

function renderModal({
  project = makeProject(),
  eventRegistration = makeRegistration(),
  onClose = jest.fn(),
  onSaved = jest.fn(),
}: {
  project?: Project;
  eventRegistration?: EventRegistrationData;
  onClose?: jest.Mock;
  onSaved?: jest.Mock;
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={defaultContextValue as any}>
        <EditEventRegistrationModal
          open={true}
          onClose={onClose}
          onSaved={onSaved}
          project={project}
          eventRegistration={eventRegistration}
        />
      </UserContext.Provider>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockApiRequest.mockResolvedValue({ data: makeRegistration() });
});

describe("EditEventRegistrationModal", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("pre-fills max_participants from eventRegistration", () => {
      renderModal({ eventRegistration: makeRegistration({ max_participants: 42 }) });
      expect(screen.getByRole("spinbutton")).toHaveValue(42);
    });

    it("shows the switch as ON when status is open", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "open" }) });
      expect(screen.getByRole("checkbox")).toBeChecked();
      expect(screen.getByText(/registration is open/i)).toBeInTheDocument();
    });

    it("shows the switch as OFF when status is closed", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "closed" }) });
      expect(screen.getByRole("checkbox")).not.toBeChecked();
      expect(screen.getByText(/registration is closed/i)).toBeInTheDocument();
    });

    it("shows the 'Full' chip and switch when status is full", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "full" }) });
      expect(screen.getByText(/full/i)).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("shows an 'Ended' chip and no switch when status is ended", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "ended" }) });
      expect(screen.getByText(/ended/i)).toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
  });

  // ── Status switch ──────────────────────────────────────────────────────────

  describe("status switch", () => {
    it("toggles label from open to closed", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "open" }) });
      fireEvent.click(screen.getByRole("checkbox"));
      expect(screen.getByText(/registration is closed/i)).toBeInTheDocument();
    });

    it("toggles label from closed to open", () => {
      renderModal({ eventRegistration: makeRegistration({ status: "closed" }) });
      fireEvent.click(screen.getByRole("checkbox"));
      expect(screen.getByText(/registration is open/i)).toBeInTheDocument();
    });
  });

  // ── Capacity guard (status: full) ─────────────────────────────────────────

  describe("capacity guard", () => {
    // 30 max, 0 available → all 30 seats taken; initial form value (30) won't free a seat
    const fullReg = makeRegistration({ status: "full", max_participants: 30, available_seats: 0 });

    it("blocks switching to open when max_participants is not increased", () => {
      renderModal({ eventRegistration: fullReg });
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox); // → closed
      expect(screen.getByText(/registration is closed/i)).toBeInTheDocument();
      // Try to turn it back on without raising max — should be blocked
      fireEvent.click(checkbox);
      expect(screen.getByText(/registration is closed/i)).toBeInTheDocument();
    });

    it("shows the capacity hint when max_participants has not freed a seat", () => {
      renderModal({ eventRegistration: fullReg });
      expect(screen.getByText(/registration is fully booked/i)).toBeInTheDocument();
    });

    it("allows switching to open after max_participants is raised above participant count", () => {
      renderModal({ eventRegistration: fullReg });
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox); // → closed
      // Raise max above 30 (current participant count)
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "31" } });
      // Now switching to open should work
      fireEvent.click(checkbox);
      expect(screen.getByText(/registration is open/i)).toBeInTheDocument();
    });
  });

  // ── Validation — published project ────────────────────────────────────────

  describe("validation (published project)", () => {
    it("shows an error when max_participants is empty on save", async () => {
      renderModal({ eventRegistration: makeRegistration({ max_participants: null }) });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows an error when max_participants is less than 1", async () => {
      renderModal();
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows an error when registration_end_date is empty on save", async () => {
      renderModal({ eventRegistration: makeRegistration({ registration_end_date: null }) });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows an error when registration_end_date is in the past", async () => {
      renderModal({
        eventRegistration: makeRegistration({ registration_end_date: PAST_DATE }),
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/must be in the future/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows an error when registration_end_date is after the event end date", async () => {
      const afterEventEnd = "2100-01-01T00:00:00.000Z";
      renderModal({
        eventRegistration: makeRegistration({ registration_end_date: afterEventEnd }),
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/before.*event end/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("calls apiRequest with correct payload when form is valid", async () => {
      const onSaved = jest.fn();
      renderModal({ onSaved });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload } = mockApiRequest.mock.calls[0][0];
      expect(payload.max_participants).toBe(50);
      expect(payload.status).toBe("open");
      expect(typeof payload.registration_end_date).toBe("string");
    });
  });

  // ── Validation — draft project ────────────────────────────────────────────

  describe("validation (draft project)", () => {
    const draftProject = makeProject({ is_draft: true });

    it("saves without error when both fields are empty (draft)", async () => {
      renderModal({
        project: draftProject,
        eventRegistration: makeRegistration({
          max_participants: null,
          registration_end_date: null,
        }),
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      // Neither field should appear in the payload
      const { payload } = mockApiRequest.mock.calls[0][0];
      expect(payload.max_participants).toBeUndefined();
      expect(payload.registration_end_date).toBeUndefined();
    });

    it("shows an error for an entered max_participants that is less than 1 (draft)", async () => {
      renderModal({
        project: draftProject,
        eventRegistration: makeRegistration({ max_participants: null }),
      });
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("does NOT show a 'must be in the future' error for a past date (draft)", async () => {
      renderModal({
        project: draftProject,
        eventRegistration: makeRegistration({ registration_end_date: PAST_DATE }),
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      expect(screen.queryByText(/must be in the future/i)).not.toBeInTheDocument();
    });

    it("still shows an error when registration_end_date is after the event end date (draft)", async () => {
      const afterEventEnd = "2100-01-01T00:00:00.000Z";
      renderModal({
        project: draftProject,
        eventRegistration: makeRegistration({ registration_end_date: afterEventEnd }),
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/before.*event end/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });
  });

  // ── Payload construction ───────────────────────────────────────────────────

  describe("payload construction", () => {
    it("omits status from payload when status is ended", async () => {
      renderModal({ eventRegistration: makeRegistration({ status: "ended" }) });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload } = mockApiRequest.mock.calls[0][0];
      expect(payload.status).toBeUndefined();
    });

    it("includes status in payload when status is open", async () => {
      renderModal({ eventRegistration: makeRegistration({ status: "open" }) });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload } = mockApiRequest.mock.calls[0][0];
      expect(payload.status).toBe("open");
    });

    it("sends status=closed after toggling the switch off", async () => {
      renderModal({ eventRegistration: makeRegistration({ status: "open" }) });
      fireEvent.click(screen.getByRole("checkbox")); // open → closed
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload } = mockApiRequest.mock.calls[0][0];
      expect(payload.status).toBe("closed");
    });
  });

  // ── API error handling ────────────────────────────────────────────────────

  describe("API error handling", () => {
    it("shows a general error when the API returns a detail message", async () => {
      mockApiRequest.mockRejectedValueOnce({
        response: { data: { detail: "Something went wrong." } },
      });
      renderModal();
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it("shows a field-level error for max_participants returned by the API", async () => {
      mockApiRequest.mockRejectedValueOnce({
        response: { data: { max_participants: ["Must be a positive integer."] } },
      });
      renderModal();
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/must be a positive integer/i)).toBeInTheDocument();
      });
    });
  });
});
