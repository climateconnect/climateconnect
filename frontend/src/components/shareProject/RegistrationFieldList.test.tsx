import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import RegistrationFieldList from "./RegistrationFieldList";
import { RegistrationField } from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Avoid tiptap browser-API dependency in tests
jest.mock("./CheckboxFieldEditor", () => ({
  __esModule: true,
  default: ({ description, onChange }: any) => (
    <textarea
      data-testid="checkbox-description"
      value={description}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
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

function renderFieldList({ fields = [] as RegistrationField[], onFieldsChange = jest.fn() } = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={defaultContext as any}>
        <RegistrationFieldList fields={fields} onFieldsChange={onFieldsChange} />
      </UserContext.Provider>
    </ThemeProvider>
  );
}

function makeField(overrides: Partial<RegistrationField> = {}): RegistrationField {
  return {
    field_type: "checkbox",
    order: 0,
    is_required: false,
    settings: { description: "" },
    _clientKey: `test_key_${Math.random()}`,
    ...overrides,
  };
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

describe("RegistrationFieldList", () => {
  // ── Spec test case 1: empty state ─────────────────────────────────────────

  describe("empty state", () => {
    it("renders the Add field button", () => {
      renderFieldList();
      expect(screen.getByRole("button", { name: /add field/i })).toBeInTheDocument();
    });

    it("renders no field cards when fields array is empty", () => {
      renderFieldList();
      expect(screen.queryByRole("button", { name: /delete field/i })).not.toBeInTheDocument();
    });
  });

  // ── Spec test case 2: add checkbox field and verify rendered card ──────────

  describe("checkbox field rendering", () => {
    it("renders field type label, description editor, and required toggle for a checkbox field", () => {
      renderFieldList({ fields: [makeField()] });
      expect(screen.getByText(/checkbox/i)).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-description")).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /required/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete field/i })).toBeInTheDocument();
    });
  });

  // ── Spec test case 3: add option select field and verify rendered card ─────

  describe("option select field rendering", () => {
    it("renders field type label, title input, and add option button for an option_select field", () => {
      renderFieldList({
        fields: [makeField({ field_type: "option_select", settings: { title: "" }, options: [] })],
      });
      expect(screen.getByText(/single choice/i)).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /title/i })).toBeInTheDocument();
      expect(screen.getByText(/add option/i)).toBeInTheDocument();
    });
  });

  // ── Adding fields via type picker ─────────────────────────────────────────

  describe("adding fields", () => {
    it("opens type picker menu when Add field is clicked", () => {
      renderFieldList();
      fireEvent.click(screen.getByRole("button", { name: /add field/i }));
      expect(screen.getByRole("menuitem", { name: /checkbox/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /single choice/i })).toBeInTheDocument();
    });

    it("calls onFieldsChange with a checkbox field at order 0 when Checkbox is selected", () => {
      const onFieldsChange = jest.fn();
      renderFieldList({ onFieldsChange });
      fireEvent.click(screen.getByRole("button", { name: /add field/i }));
      fireEvent.click(screen.getByRole("menuitem", { name: /checkbox/i }));
      expect(onFieldsChange).toHaveBeenCalledTimes(1);
      const [fields] = onFieldsChange.mock.calls[0];
      expect(fields).toHaveLength(1);
      expect(fields[0]).toMatchObject({
        field_type: "checkbox",
        order: 0,
        is_required: false,
        settings: { description: "" },
      });
    });

    it("calls onFieldsChange with an option_select field when Single choice is selected", () => {
      const onFieldsChange = jest.fn();
      renderFieldList({ onFieldsChange });
      fireEvent.click(screen.getByRole("button", { name: /add field/i }));
      fireEvent.click(screen.getByRole("menuitem", { name: /single choice/i }));
      const [fields] = onFieldsChange.mock.calls[0];
      expect(fields[0]).toMatchObject({
        field_type: "option_select",
        order: 0,
        is_required: false,
        options: [],
      });
    });

    it("assigns an incremented order to additional fields", () => {
      const onFieldsChange = jest.fn();
      const existing = makeField({ order: 0 });
      renderFieldList({ fields: [existing], onFieldsChange });
      fireEvent.click(screen.getByRole("button", { name: /add field/i }));
      fireEvent.click(screen.getByRole("menuitem", { name: /checkbox/i }));
      const [fields] = onFieldsChange.mock.calls[0];
      expect(fields[1].order).toBe(1);
    });
  });

  // ── Spec test case 4: max 5 fields limit ──────────────────────────────────

  describe("max fields limit", () => {
    it("disables the Add field button when 5 fields are already present", () => {
      const fields = Array.from({ length: 5 }, (_, i) =>
        makeField({ order: i, _clientKey: `key_${i}` })
      );
      renderFieldList({ fields });
      expect(screen.getByRole("button", { name: /add field/i })).toBeDisabled();
    });

    it("shows the max-reached message on the button when 5 fields are present", () => {
      const fields = Array.from({ length: 5 }, (_, i) =>
        makeField({ order: i, _clientKey: `key_${i}` })
      );
      renderFieldList({ fields });
      expect(screen.getByText(/maximum of 5 fields reached/i)).toBeInTheDocument();
    });
  });

  // ── Spec test case 5: reordering fields ───────────────────────────────────

  describe("reordering fields", () => {
    const twoFields: RegistrationField[] = [
      makeField({ field_type: "checkbox", order: 0, _clientKey: "k1" }),
      makeField({
        field_type: "option_select",
        order: 1,
        settings: { title: "" },
        options: [],
        _clientKey: "k2",
      }),
    ];

    it("swaps field types and orders when Move down is clicked on the first field", () => {
      const onFieldsChange = jest.fn();
      renderFieldList({ fields: twoFields, onFieldsChange });
      const moveDownButtons = screen.getAllByRole("button", { name: /move down/i });
      fireEvent.click(moveDownButtons[0]);
      const [result] = onFieldsChange.mock.calls[0];
      expect(result[0]).toMatchObject({ field_type: "option_select", order: 0 });
      expect(result[1]).toMatchObject({ field_type: "checkbox", order: 1 });
    });

    it("swaps field types and orders when Move up is clicked on the second field", () => {
      const onFieldsChange = jest.fn();
      renderFieldList({ fields: twoFields, onFieldsChange });
      const moveUpButtons = screen.getAllByRole("button", { name: /move up/i });
      fireEvent.click(moveUpButtons[1]);
      const [result] = onFieldsChange.mock.calls[0];
      expect(result[0]).toMatchObject({ field_type: "option_select", order: 0 });
      expect(result[1]).toMatchObject({ field_type: "checkbox", order: 1 });
    });

    it("disables Move up for the first field", () => {
      renderFieldList({ fields: twoFields });
      const moveUpButtons = screen.getAllByRole("button", { name: /move up/i });
      expect(moveUpButtons[0]).toBeDisabled();
      expect(moveUpButtons[1]).not.toBeDisabled();
    });

    it("disables Move down for the last field", () => {
      renderFieldList({ fields: twoFields });
      const moveDownButtons = screen.getAllByRole("button", { name: /move down/i });
      expect(moveDownButtons[0]).not.toBeDisabled();
      expect(moveDownButtons[1]).toBeDisabled();
    });
  });

  // ── Deleting fields ────────────────────────────────────────────────────────

  describe("deleting fields", () => {
    it("calls onFieldsChange with an empty array when the only field is deleted", () => {
      const onFieldsChange = jest.fn();
      renderFieldList({ fields: [makeField()], onFieldsChange });
      fireEvent.click(screen.getByRole("button", { name: /delete field/i }));
      expect(onFieldsChange).toHaveBeenCalledWith([]);
    });

    it("reassigns orders contiguously after deleting the middle field", () => {
      const fields: RegistrationField[] = [
        makeField({ order: 0, _clientKey: "k1" }),
        makeField({
          field_type: "option_select",
          order: 1,
          settings: { title: "" },
          options: [],
          _clientKey: "k2",
        }),
        makeField({ order: 2, _clientKey: "k3" }),
      ];
      const onFieldsChange = jest.fn();
      renderFieldList({ fields, onFieldsChange });
      const deleteButtons = screen.getAllByRole("button", { name: /delete field/i });
      fireEvent.click(deleteButtons[1]); // delete field at index 1
      const [result] = onFieldsChange.mock.calls[0];
      expect(result).toHaveLength(2);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });
  });

  // ── Required toggle ────────────────────────────────────────────────────────

  describe("required toggle", () => {
    it("calls onFieldsChange with is_required=true when the toggle is switched on", () => {
      const field = makeField({ is_required: false });
      const onFieldsChange = jest.fn();
      renderFieldList({ fields: [field], onFieldsChange });
      fireEvent.click(screen.getByRole("checkbox", { name: /required/i }));
      const [result] = onFieldsChange.mock.calls[0];
      expect(result[0].is_required).toBe(true);
    });

    it("calls onFieldsChange with is_required=false when the toggle is switched off", () => {
      const field = makeField({ is_required: true });
      const onFieldsChange = jest.fn();
      renderFieldList({ fields: [field], onFieldsChange });
      fireEvent.click(screen.getByRole("checkbox", { name: /required/i }));
      const [result] = onFieldsChange.mock.calls[0];
      expect(result[0].is_required).toBe(false);
    });
  });

  // ── Answer-lock: delete confirmation ─────────────────────────────────────

  describe("delete confirmation for fields with answers", () => {
    function renderWithDeleteCallback(fields: RegistrationField[]) {
      const onFieldsChange = jest.fn();
      const onRequestDeleteField = jest.fn();
      render(
        <ThemeProvider theme={theme}>
          <UserContext.Provider value={defaultContext as any}>
            <RegistrationFieldList
              fields={fields}
              onFieldsChange={onFieldsChange}
              onRequestDeleteField={onRequestDeleteField}
            />
          </UserContext.Provider>
        </ThemeProvider>
      );
      return { onFieldsChange, onRequestDeleteField };
    }

    it("calls onRequestDeleteField instead of immediate delete when has_answers is true", () => {
      const field = makeField({ id: 1, has_answers: true });
      const { onFieldsChange, onRequestDeleteField } = renderWithDeleteCallback([field]);
      fireEvent.click(screen.getByRole("button", { name: /delete field/i }));
      expect(onRequestDeleteField).toHaveBeenCalledWith(0, field);
      expect(onFieldsChange).not.toHaveBeenCalled();
    });

    it("deletes immediately (no callback) when has_answers is false even if field has an id", () => {
      const field = makeField({ id: 1, has_answers: false });
      const { onFieldsChange, onRequestDeleteField } = renderWithDeleteCallback([field]);
      fireEvent.click(screen.getByRole("button", { name: /delete field/i }));
      expect(onRequestDeleteField).not.toHaveBeenCalled();
      expect(onFieldsChange).toHaveBeenCalledWith([]);
    });

    it("deletes immediately when has_answers is undefined", () => {
      const field = makeField({ id: 1 }); // has_answers not set
      const { onFieldsChange, onRequestDeleteField } = renderWithDeleteCallback([field]);
      fireEvent.click(screen.getByRole("button", { name: /delete field/i }));
      expect(onRequestDeleteField).not.toHaveBeenCalled();
      expect(onFieldsChange).toHaveBeenCalledWith([]);
    });
  });
});
