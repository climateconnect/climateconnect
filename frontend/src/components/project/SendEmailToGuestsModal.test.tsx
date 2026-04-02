import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
}: {
  project?: Project;
  onClose?: jest.Mock;
  email?: string;
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={makeContextValue(email) as any}>
        <SendEmailToGuestsModal open={true} onClose={onClose} project={project} />
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
    it("shows subject error and does not call API when subject is empty on Send now", async () => {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Hello guests!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() => {
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      });
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("shows message error and does not call API when message is empty on Send now", async () => {
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

  // ── Bulk send (Send now) ───────────────────────────────────────────────────

  describe("Send now", () => {
    async function fillAndSendAll() {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Event update" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Please note the time change." },
      });
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
    }

    it("calls the API with is_test=false and the correct payload", async () => {
      await fillAndSendAll();
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      const { payload, url } = mockApiRequest.mock.calls[0][0];
      expect(url).toContain("/registrations/email/");
      expect(payload.is_test).toBe(false);
      expect(payload.subject).toBe("Event update");
      expect(payload.message).toBe("Please note the time change.");
    });

    it("shows the bulk confirmation with the recipient count after success", async () => {
      await fillAndSendAll();
      await waitFor(() => {
        expect(screen.getByText(/email sent to 42 registered guests/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("shows a Close button in the confirmation view", async () => {
      await fillAndSendAll();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      });
    });
  });

  // ── Test send (Send test) ──────────────────────────────────────────────────

  describe("Send test", () => {
    async function fillAndSendTest() {
      renderModal();
      fireEvent.change(screen.getByRole("textbox", { name: /subject/i }), {
        target: { value: "Test subject" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /message/i }), {
        target: { value: "Test body" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send test/i }));
    }

    it("calls the API with is_test=true", async () => {
      await fillAndSendTest();
      await waitFor(() => expect(mockApiRequest).toHaveBeenCalledTimes(1));
      expect(mockApiRequest.mock.calls[0][0].payload.is_test).toBe(true);
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
    it("shows a general error and keeps the form visible when the API fails", async () => {
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
      fireEvent.click(screen.getByRole("button", { name: /send now/i }));
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
      });
      // Form should still be visible
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
            <SendEmailToGuestsModal open={true} onClose={onClose} project={makeProject()} />
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
      // Wait for the confirmation "Close" button (exact text, not the dialog's X icon)
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
      fireEvent.click(screen.getByRole("button", { name: /send test/i }));
      await waitFor(() =>
        expect(screen.getByText(new RegExp(ORGANISER_EMAIL))).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
