import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../themes/theme";
import RegistrationActionButton from "./RegistrationActionButton";
import { Project } from "../../../types";
import { RegistrationUIState } from "../../../utils/eventRegistrationHelpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEXTS = {
  you_attended_this_event: "You attended this event",
  cancel_registration: "Cancel registration",
  registration_closed: "Registration closed",
  register_now: "Register now",
  booked_out: "Booked out",
  already_registered: "Registered ✓",
};

function makeProject(status: string): Project {
  return {
    url_slug: "test-event",
    name: "Test Event",
    registration_config: { status },
  } as Project;
}

function renderButton({
  registrationState,
  project = makeProject("open"),
  isUserRegistered = false,
  handleRegisterClick = jest.fn(),
  handleCancelClick = jest.fn(),
  fallback = null,
}: {
  registrationState: RegistrationUIState;
  project?: Project;
  isUserRegistered?: boolean;
  handleRegisterClick?: jest.Mock;
  handleCancelClick?: jest.Mock;
  fallback?: React.ReactNode;
}) {
  return render(
    <ThemeProvider theme={theme}>
      <RegistrationActionButton
        registrationState={registrationState}
        project={project}
        texts={TEXTS}
        isUserRegistered={isUserRegistered}
        handleRegisterClick={handleRegisterClick}
        handleCancelClick={handleCancelClick}
        fallback={fallback}
      />
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RegistrationActionButton", () => {
  // ── attended ──────────────────────────────────────────────────────────────

  describe('state: "attended"', () => {
    it('renders the "You attended this event" label', () => {
      renderButton({ registrationState: "attended" });
      expect(screen.getByText("You attended this event")).toBeInTheDocument();
    });

    it("does not render a button", () => {
      renderButton({ registrationState: "attended" });
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('state: "cancel"', () => {
    it('renders the "Cancel registration" button', () => {
      renderButton({ registrationState: "cancel" });
      expect(screen.getByRole("button", { name: /cancel registration/i })).toBeInTheDocument();
    });

    it("calls handleCancelClick when clicked", () => {
      const handleCancelClick = jest.fn();
      renderButton({ registrationState: "cancel", handleCancelClick });
      fireEvent.click(screen.getByRole("button", { name: /cancel registration/i }));
      expect(handleCancelClick).toHaveBeenCalledTimes(1);
    });

    it("button is not disabled", () => {
      renderButton({ registrationState: "cancel" });
      expect(screen.getByRole("button", { name: /cancel registration/i })).not.toBeDisabled();
    });
  });

  // ── adminClosed ───────────────────────────────────────────────────────────

  describe('state: "adminClosed"', () => {
    it('renders a disabled "Registration closed" button', () => {
      renderButton({ registrationState: "adminClosed" });
      const btn = screen.getByRole("button", { name: /registration closed/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });

    it("does not call any handler when clicked (disabled)", () => {
      const handleRegisterClick = jest.fn();
      const handleCancelClick = jest.fn();
      renderButton({ registrationState: "adminClosed", handleRegisterClick, handleCancelClick });
      const btn = screen.getByRole("button", { name: /registration closed/i });
      fireEvent.click(btn);
      expect(handleRegisterClick).not.toHaveBeenCalled();
      expect(handleCancelClick).not.toHaveBeenCalled();
    });
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('state: "register"', () => {
    it('renders the "Register now" button for an open event', () => {
      renderButton({ registrationState: "register", project: makeProject("open") });
      expect(screen.getByRole("button", { name: /register now/i })).toBeInTheDocument();
    });

    it("button is enabled for an open event", () => {
      renderButton({ registrationState: "register", project: makeProject("open") });
      expect(screen.getByRole("button", { name: /register now/i })).not.toBeDisabled();
    });

    it("calls handleRegisterClick when clicked", () => {
      const handleRegisterClick = jest.fn();
      renderButton({
        registrationState: "register",
        project: makeProject("open"),
        handleRegisterClick,
      });
      fireEvent.click(screen.getByRole("button", { name: /register now/i }));
      expect(handleRegisterClick).toHaveBeenCalledTimes(1);
    });
  });

  // ── closed ────────────────────────────────────────────────────────────────

  describe('state: "closed"', () => {
    it('renders a disabled "Registration closed" button for a closed event', () => {
      renderButton({ registrationState: "closed", project: makeProject("closed") });
      const btn = screen.getByRole("button", { name: /registration closed/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });

    it('renders a disabled "Booked out" button for a full event', () => {
      renderButton({ registrationState: "closed", project: makeProject("full") });
      const btn = screen.getByRole("button", { name: /booked out/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });

  // ── hidden ────────────────────────────────────────────────────────────────

  describe('state: "hidden"', () => {
    it("renders the fallback node when provided", () => {
      renderButton({
        registrationState: "hidden",
        fallback: <span>Follow instead</span>,
      });
      expect(screen.getByText("Follow instead")).toBeInTheDocument();
    });

    it("renders nothing when no fallback is provided", () => {
      const { container } = renderButton({ registrationState: "hidden" });
      expect(container.firstChild).toBeNull();
    });
  });
});
