import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import SendEmailToGuestsModal from "./SendEmailToGuestsModal";
import { Project } from "../../types";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    url_slug: "test-event",
    name: "Test Event",
    project_type: { type_id: "event" } as any,
    is_draft: false,
    team: [],
    ...overrides,
  } as Project;
}

const ORGANISER_EMAIL = "organiser@example.com";

function makeContextValue(email?: string) {
  return {
    locale: "en" as const,
    user: email ? { id: "1", first_name: "Jane", email } : null,
    locales: [] as any,
    pathName: "/",
    donationGoals: [],
    hubUrl: "",
  };
}

function renderModal({
  project = makeProject(),
  onClose = jest.fn(),
  email = ORGANISER_EMAIL,
  activeGuestCount = 5,
}: {
  project?: Project;
  onClose?: jest.Mock;
  email?: string;
  activeGuestCount?: number;
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={makeContextValue(email) as any}>
        <SendEmailToGuestsModal
          open={true}
          onClose={onClose}
          project={project}
          activeGuestCount={activeGuestCount}
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
  mockApiRequest.mockResolvedValue({ data: { sent_count: 42 } });
});

describe("SendEmailToGuestsModal", () => {
  // ── Initial render ─────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders subject and message fields (empty)", () => {
      renderModal();
      expect(screen.getByRole("textbox", { name: /subject/i })).toHaveValue("");
      expect(screen.getByRole("textbox", { name: /message/i })).toHaveValue("");
    });

    it("renders Send now, Send test, and Cancel buttons", () => {
      renderModal();
      expect(screen.getByRole("button", { name: /send now/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send test/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("does not show confirmation text initially", () => {
      renderModal();
      expect(screen.queryByText(/email sent to/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/test email sent to/i)).not.toBeInTheDocument();
    });
  });

  // ── Client-side validation ─────────────────────────────────────────────────

  describe("client-side validation", () => {
    it("shows subject error and does not advance to confirmation when subject is empty", async () => {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Hello guests!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() => {
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
      // Still on form, not on confirmation step
      expect(screen.getByRole("textbox", { name: /subject/i })).toBeInTheDocument();
    });

    it("shows message error and does not advance to confirmation when message is empty", async () => {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Important update" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() => {
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows both errors when both fields are empty", async () => {
      renderModal();
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() => {
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
    });
  });

  // ── Confirmation step (spec test cases 6 & 7) ─────────────────────────────

  describe("confirmation step", () => {
    async function fillAndClickSendNow(guestCount = 5) {
      renderModal({ activeGuestCount: guestCount });
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Event update" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Please note the time change." },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
    }

    it("shows confirmation step (not the API) after clicking Send now with valid form", async () => {
      await fillAndClickSendNow();
      // No API call yet
      expect(mockApiRequest).not.toHaveBeenCalled();
      // Confirmation step is visible
      expect(screen.getByRole("button", { name: /confirm and send/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("shows the active guest count in the confirmation step", async () => {
      await fillAndClickSendNow(12);
      expect(screen.getByText(/12 registered guests/i)).toBeInTheDocument();
    });

    it("shows team admins notice in the confirmation step", async () => {
      await fillAndClickSendNow();
      expect(screen.getByText(/team admins will also receive a copy/i)).toBeInTheDocument();
    });

    it("Back button returns to the compose form with subject and message preserved", async () => {
      await fillAndClickSendNow();
      fireEvent.click(screen.getByRole("button", { name: /back/i }));
      // Form is visible again
      const subjectField = screen.getByRole("textbox", { name: /subject/i });
      const messageField = screen.getByRole("textbox", { name: /message/i });
      expect(subjectField).toHaveValue("Event update");
      expect(messageField).toHaveValue("Please note the time change.");
      // No API call has happened
      expect(mockApiRequest).not.toHaveBeenCalled();
    });
  });

  // ── Bulk send — confirm and send (spec test case 8) ───────────────────────

  describe("Confirm and send", () => {
    /** Fills the form, clicks Send now, then Confirm and send. */
    async function fillAndConfirmSend(guestCount = 5) {
      renderModal({ activeGuestCount: guestCount });
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Event update" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Please note the time change." },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      // Wait for confirmation step, then confirm
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /confirm and send/i })).toBeInTheDocument()
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /confirm and send/i }));
      });
    }

    it("calls the API with is_test=false and the correct payload", async () => {
      await fillAndConfirmSend();
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload, url } = mockApiRequest.mock.calls[0][0];
      expect(url).toContain("/registrations/email/");
      expect(payload.is_test).toBe(false);
      expect(payload.subject).toBe("Event update");
      expect(payload.message).toBe("Please note the time change.");
    });

    it("shows the bulk confirmation with the recipient count after success", async () => {
      await fillAndConfirmSend();
      await waitFor(() => {
        expect(screen.getByText(/email sent to 42 registered guests/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("shows a Close button in the success view", async () => {
      await fillAndConfirmSend();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      });
    });
  });

  // ── Test send (Send test) — spec test case 9: bypasses confirmation ────────

  describe("Send test", () => {
    async function fillAndSendTest() {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Test subject" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Test body" },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /send test/i }));
      });
    }

    it("calls the API immediately with is_test=true — no confirmation step shown", async () => {
      await fillAndSendTest();
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      expect(mockApiRequest.mock.calls[0][0].payload.is_test).toBe(true);
      // Confirmation step should never have appeared
      expect(screen.queryByRole("button", { name: /confirm and send/i })).not.toBeInTheDocument();
    });

    it("returns to the form (not a locked confirmation) after a test send", async () => {
      await fillAndSendTest();
      await waitFor(() => {
        // Form fields must still be present and editable
        expect(screen.getByRole("textbox", { name: /subject/i })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: /message/i })).toBeInTheDocument();
      });
    });

    it("shows an inline success notice with the organiser's email after a test send", async () => {
      await fillAndSendTest();
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`test email sent to ${ORGANISER_EMAIL}`, "i"))
        ).toBeInTheDocument();
      });
    });

    it("shows Send now and Send test buttons after a test send (can still send for real)", async () => {
      await fillAndSendTest();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /send now/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /send test/i })).toBeInTheDocument();
      });
    });
  });

  // ── API error handling ─────────────────────────────────────────────────────

  describe("API error handling", () => {
    it("shows a general error and returns to the form when the confirm-send API fails", async () => {
      mockApiRequest.mockRejectedValueOnce({
        response: { data: { detail: "Something went wrong." } },
      });
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Hi" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Body" },
      });
      // Go through confirmation step
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /confirm and send/i })).toBeInTheDocument()
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /confirm and send/i }));
      });
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
      });
      // Returned to form
      expect(screen.getByRole("textbox", { name: /subject/i })).toBeInTheDocument();
    });

    it("shows field-level errors returned by the API", async () => {
      mockApiRequest.mockRejectedValueOnce({
        response: { data: { subject: ["Subject is too long."] } },
      });
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "x".repeat(201) },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Body" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /confirm and send/i })).toBeInTheDocument()
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /confirm and send/i }));
      });
      await waitFor(() => {
        expect(screen.getByText(/subject is too long/i)).toBeInTheDocument();
      });
    });
  });

  // ── Close behaviour ────────────────────────────────────────────────────────

  describe("close behaviour", () => {
    it("calls onClose when Cancel is clicked", () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Close is clicked after a bulk send", async () => {
      const onClose = jest.fn();
      render(
        <ThemeProvider theme={theme}>
          <UserContext.Provider value={makeContextValue(ORGANISER_EMAIL) as any}>
            <SendEmailToGuestsModal
              open={true}
              onClose={onClose}
              project={makeProject()}
              activeGuestCount={3}
            />
          </UserContext.Provider>
        </ThemeProvider>
      );
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Hi" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Body" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /confirm and send/i })).toBeInTheDocument()
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /confirm and send/i }));
      });
      // Wait for the success "Close" button
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("keeps Cancel available after a test send so the organiser can still dismiss", async () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Hi" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Body" },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /send test/i }));
      });
      await waitFor(() =>
        expect(screen.getByText(new RegExp(ORGANISER_EMAIL))).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
