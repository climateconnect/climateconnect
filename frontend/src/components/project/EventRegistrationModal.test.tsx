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

// Mock LocationSearchBar so signup form can be filled without async location fetching
jest.mock("../search/LocationSearchBar", () => {
  return function MockLocationSearchBar({ onSelect, label }: any) {
    return (
      <input
        aria-label={label}
        data-testid="location-search-bar"
        onChange={(e) =>
          onSelect(e.target.value ? { name: e.target.value, simple_name: e.target.value } : null)
        }
      />
    );
  };
});

// Mock sessionStorage for AuthOtp
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

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
  mockApiRequest.mockReset();
  mockSessionStorage.clear();
  // Suppress console.error during tests to keep output clean
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Restore console.error after each test
  jest.restoreAllMocks();
});

// ── Authenticated user ──────────────────────────────────────────────────────

describe("EventRegistrationModal – authenticated user", () => {
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
  it("shows the email entry step (AuthEmailStep)", () => {
    renderModal({ user: null });

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeInTheDocument();
  });

  it("'Next' button is disabled when email is empty", () => {
    renderModal({ user: null });

    expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();
  });

  it("enables 'Next' button when email is entered", () => {
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "new@user.com" },
    });

    expect(screen.getByRole("button", { name: /^next$/i })).not.toBeDisabled();
  });

  it("shows the password login form for returning_password users", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_password" } });
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "returning@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows the OTP form for returning_otp users", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_otp" } });
    mockApiRequest.mockResolvedValueOnce({ data: { session_key: "session-123" } });
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "returning@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^verify$/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/6-digit code/i)).toBeInTheDocument();
  });

  it("shows the signup form for new users", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "new" } });
    renderModal({ user: null });

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "new@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByText(/you don't have an account yet/i)).toBeInTheDocument();
    });
  });

  it("submits email via Enter key and shows login form", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_password" } });
    renderModal({ user: null });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();
    });
  });

  it("shows inline error on failed login", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_password" } });
    mockApiRequest.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    renderModal({ user: null });

    // Go to login step
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => screen.getByLabelText(/password/i));

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("calls signIn on successful password login", async () => {
    const token = "abc123";
    const expiry = "2099-12-31";
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_password" } });
    mockApiRequest.mockResolvedValueOnce({ data: { token, expiry } });
    mockSignIn.mockResolvedValueOnce(undefined);

    renderModal({ user: null });

    // Go to login step
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => screen.getByLabelText(/password/i));

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correctpass" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    });

    expect(mockSignIn).toHaveBeenCalledWith(token, expiry);
  });

  it("calls signIn on successful OTP verification", async () => {
    const token = "otp-token-123";
    const expiry = "2099-12-31";
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_otp" } });
    mockApiRequest.mockResolvedValueOnce({ data: { session_key: "session-otp" } }); // request-token
    mockApiRequest.mockResolvedValueOnce({ data: { token, expiry } }); // verify-token
    mockSignIn.mockResolvedValueOnce(undefined);

    renderModal({ user: null });

    // Enter email and proceed to OTP
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "otp@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => screen.getByLabelText(/6-digit code/i));

    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: "123456" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^verify$/i }));
    });

    expect(mockSignIn).toHaveBeenCalledWith(token, expiry);
  });

  it("transitions from signup to OTP after account creation and then calls signIn", async () => {
    const token = "signup-token-456";
    const expiry = "2099-12-31";

    // 1. check-email → new
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "new" } });
    // 2. signup
    mockApiRequest.mockResolvedValueOnce({ status: 200 });
    // 3. request-token (called by AuthOtp on mount)
    mockApiRequest.mockResolvedValueOnce({ data: { session_key: "session-signup" } });
    // 4. verify-token
    mockApiRequest.mockResolvedValueOnce({ data: { token, expiry } });
    mockSignIn.mockResolvedValueOnce(undefined);

    renderModal({ user: null });

    // Enter email and proceed to signup
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "new@user.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByText(/you don't have an account yet/i)).toBeInTheDocument();
    });

    // Fill personal info
    fireEvent.change(screen.getByRole("textbox", { name: /first name/i }), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByTestId("location-search-bar"), {
      target: { value: "Berlin" },
    });

    // Accept terms
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Submit personal info → triggers signup → transitions to OTP
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    });

    // Should now be on OTP step
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^verify$/i })).toBeInTheDocument();
    });

    // Enter OTP code
    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: "654321" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^verify$/i }));
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

  it("resets auth state after closing unauthenticated flow", async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { user_status: "returning_password" } });
    const onClose = jest.fn();
    const { rerender } = renderModal({ user: null, onClose });

    // Fill in email and advance to login
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
    await waitFor(() => screen.getByLabelText(/password/i));

    // Close via the dialog close button (X icon)
    fireEvent.click(screen.getByLabelText("close"));
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
