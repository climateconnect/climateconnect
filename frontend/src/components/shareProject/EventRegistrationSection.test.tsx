import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import { FeatureToggleProvider } from "../featureToggle";
import EventRegistrationSection from "./EventRegistrationSection";
import { Project } from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("../general/DatePicker", () => ({
  __esModule: true,
  default: ({ label }: any) => <input aria-label={label} />,
}));

jest.mock("./CheckboxFieldEditor", () => ({
  __esModule: true,
  default: () => <div data-testid="checkbox-editor" />,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultContext = {
  locale: "en" as any,
  user: null,
  locales: [],
  pathName: "/",
  donationGoals: [],
};

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    project_type: { type_id: "event" } as any,
    max_participants: null,
    registration_end_date: null,
    notify_admins: true,
    registration_fields: [],
    collaborators_welcome: false,
    collaborating_organizations: [],
    loc: {},
    parent_organization: null,
    isPersonalProject: true,
    is_organization_project: false,
    team_members: [],
    website: "",
    language: "en",
    ...overrides,
  } as Project;
}

function renderSection({
  project = makeProject(),
  handleSetProjectData = jest.fn(),
  errors = {},
  customFieldsToggleEnabled = true,
}: {
  project?: Project;
  handleSetProjectData?: jest.Mock;
  errors?: Record<string, string>;
  customFieldsToggleEnabled?: boolean;
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={defaultContext as any}>
        <FeatureToggleProvider
          initialToggles={{ REGISTRATION_CUSTOM_FIELDS: customFieldsToggleEnabled }}
        >
          <EventRegistrationSection
            projectData={project}
            handleSetProjectData={handleSetProjectData}
            errors={errors}
          />
        </FeatureToggleProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EventRegistrationSection", () => {
  // ── Core registration fields always visible ───────────────────────────────

  describe("core registration settings", () => {
    it("renders max participants and registration end date inputs regardless of toggle", () => {
      renderSection({ customFieldsToggleEnabled: false });
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /end of registration/i })).toBeInTheDocument();
    });

    it("renders the notify admins toggle regardless of the custom fields toggle", () => {
      renderSection({ customFieldsToggleEnabled: false });
      expect(screen.getByRole("checkbox", { name: /send a notification/i })).toBeInTheDocument();
    });
  });

  // ── Spec test case 6: feature toggle gating ───────────────────────────────

  describe("REGISTRATION_CUSTOM_FIELDS toggle gating", () => {
    it("renders the custom fields section header and Add field button when the toggle is enabled", () => {
      renderSection({ customFieldsToggleEnabled: true });
      expect(screen.getByText(/additional registration fields/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add field/i })).toBeInTheDocument();
    });

    it("does not render the custom fields section when the toggle is disabled", () => {
      renderSection({ customFieldsToggleEnabled: false });
      expect(screen.queryByText(/additional registration fields/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /add field/i })).not.toBeInTheDocument();
    });
  });

  // ── Custom fields list pre-populated from projectData ─────────────────────

  describe("pre-populated fields from projectData", () => {
    it("renders existing fields passed via projectData.registration_fields", () => {
      const project = makeProject({
        registration_fields: [
          {
            field_type: "option_select",
            order: 0,
            is_required: false,
            settings: { title: "Meal preference?" },
            options: [],
            _clientKey: "k1",
          },
        ],
      });
      renderSection({ project });
      expect(screen.getByText(/single choice/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Meal preference?")).toBeInTheDocument();
    });
  });
});
