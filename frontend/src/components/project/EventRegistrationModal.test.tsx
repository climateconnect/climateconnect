import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import EventRegistrationModal from "./EventRegistrationModal";
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

const AUTHENTICATED_USER = {
  id: "1",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
};

const mockSignIn = jest.fn();

function makeContextValue(user: typeof AUTHENTICATED_USER | null = null) {
  return {
    locale: "en" as const,
    user,
    locales: [] as any,
    pathName: "/",
    donationGoals: [],
    hubUrl: "",
    signIn: mockSignIn,
  };
}

function renderModal({
  project = makeProject(),
  user = null as typeof AUTHENTICATED_USER | null,
  open = true,
  onClose = jest.fn(),
  onRegistrationSuccess = jest.fn(),
}: {
  project?: Project;
  user?: typeof AUTHENTICATED_USER | null;
  open?: boolean;
  onClose?: jest.Mock;
  onRegistrationSuccess?: jest.Mock;
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={makeContextValue(user) as any}>
        <EventRegistrationModal
          open={open}
          onClose={onClose}
          project={project}
          onRegistrationSuccess={onRegistrationSuccess}
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
});

// ── Authenticated user ──────────────────────────────────────────────────────

describe("EventRegistrationModal – authenticated user", () => {
  it("renders pre-filled name and email fields", () => {
    renderModal({ user: AUTHENTICATED_USER });

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
  });

  it("renders 'Confirm Registration' button enabled", () => {
    renderModal({ user: AUTHENTICATED_USER });

    const btn = screen.getByRole("button", { name: /confirm registration/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("calls apiRequest with correct URL on submit", async () => {
    mockApiRequest.mockResolvedValueOnce({ status: 201 });
    renderModal({ user: AUTHENTICATED_USER });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: "/api/projects/test-event/registrations/",
        })
      );
    });
  });

  it("calls onRegistrationSuccess and shows success state after successful submit", async () => {
    mockApiRequest.mockResolvedValueOnce({ status: 201 });
    const onRegistrationSuccess = jest.fn();
    renderModal({ user: AUTHENTICATED_USER, onRegistrationSuccess });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're registered/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/a confirmation email has been sent/i)).toBeInTheDocument();
    expect(onRegistrationSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows error state when API call fails", async () => {
    mockApiRequest.mockRejectedValueOnce({
      response: { data: { message: "Event is fully booked" } },
    });
    renderModal({ user: AUTHENTICATED_USER });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^registration failed$/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/event is fully booked/i)).toBeInTheDocument();
  });

  it("shows a generic error message when API error has no message", async () => {
    mockApiRequest.mockRejectedValueOnce({ response: { data: {} } });
    renderModal({ user: AUTHENTICATED_USER });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^registration failed$/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/registration failed\. please try again/i)).toBeInTheDocument();
  });

  it("shows a loading spinner while submitting", async () => {
    // Never resolve so we can observe the loading state
    mockApiRequest.mockReturnValueOnce(new Promise(() => {}));
    renderModal({ user: AUTHENTICATED_USER });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

// ── Unauthenticated user ────────────────────────────────────────────────────

describe("EventRegistrationModal – unauthenticated user", () => {
  it("shows the email field and prompt message", () => {
    renderModal({ user: null });

    expect(
      screen.getByText(/to register for this event, please log in or sign up/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
  });

  it("'Continue' button is disabled when email is empty", () => {
    renderModal({ user: null });

    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("enables 'Continue' button when email is entered", () => {
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "new@user.com" },
    });

    expect(screen.getByRole("button", { name: /continue/i })).not.toBeDisabled();
  });

  it("shows the login form after submitting email", async () => {
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "new@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });
    // Password field appears
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("submits email via Enter key and shows login form", async () => {
    renderModal({ user: null });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.keyDown(emailInput, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });
  });

  it("shows inline error on failed login", async () => {
    mockApiRequest.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    renderModal({ user: null });

    // Go to login step
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByLabelText(/password/i));

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("calls signIn and transitions to authenticated view on successful login", async () => {
    const token = "abc123";
    const expiry = "2099-12-31";
    mockApiRequest.mockResolvedValueOnce({ data: { token, expiry } });
    mockSignIn.mockResolvedValueOnce(undefined);

    renderModal({ user: null });

    // Go to login step
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByLabelText(/password/i));

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correctpass" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    });

    expect(mockSignIn).toHaveBeenCalledWith(token, expiry);
  });
});

// ── Error state – Try Again ─────────────────────────────────────────────────

describe("EventRegistrationModal – error state", () => {
  it("'Try Again' button resets to the initial (registration) step", async () => {
    mockApiRequest.mockRejectedValueOnce({ response: { data: {} } });
    renderModal({ user: AUTHENTICATED_USER });

    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^registration failed$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    // Should be back at the registration form
    expect(screen.getByRole("button", { name: /confirm registration/i })).toBeInTheDocument();
  });
});

// ── Modal close resets all state ────────────────────────────────────────────

describe("EventRegistrationModal – close behaviour", () => {
  it("calls onClose when Cancel is clicked", () => {
    const onClose = jest.fn();
    renderModal({ user: AUTHENTICATED_USER, onClose });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets to initial state after closing from error state", async () => {
    mockApiRequest.mockRejectedValueOnce({ response: { data: {} } });
    const onClose = jest.fn();
    const { rerender } = renderModal({ user: AUTHENTICATED_USER, onClose });

    // Trigger error state
    fireEvent.click(screen.getByRole("button", { name: /confirm registration/i }));
    await waitFor(() => screen.getByRole("heading", { name: /^registration failed$/i }));
    // Close
    // Target the visible "Close" button specifically, ignoring the "X" icon
    fireEvent.click(screen.getByText(/^close$/i, { selector: "button" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Reopen – should start fresh
    rerender(
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={makeContextValue(AUTHENTICATED_USER) as any}>
          <EventRegistrationModal
            key="reset-test"
            open={true}
            onClose={onClose}
            project={makeProject()}
            onRegistrationSuccess={jest.fn()}
          />
        </UserContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: /confirm registration/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^registration failed$/i })
    ).not.toBeInTheDocument();
  });

  it("resets email/password fields after closing unauthenticated flow", async () => {
    const onClose = jest.fn();
    const { rerender } = renderModal({ user: null, onClose });

    // Fill in email and advance to login
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => screen.getByLabelText(/password/i));

    // Cancel/close
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Reopen – email step should be shown again with empty field
    rerender(
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={makeContextValue(null) as any}>
          <EventRegistrationModal
            open={true}
            onClose={onClose}
            project={makeProject()}
            onRegistrationSuccess={jest.fn()}
          />
        </UserContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue("");
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});
