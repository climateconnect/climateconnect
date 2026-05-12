import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import OptionSelectFieldEditor from "./OptionSelectFieldEditor";
import { RegistrationFieldOption } from "../../types";

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

function renderEditor({
  title = "",
  options = [] as RegistrationFieldOption[],
  onChange = jest.fn(),
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={defaultContext as any}>
        <OptionSelectFieldEditor title={title} options={options} onChange={onChange} />
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

describe("OptionSelectFieldEditor", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the title input", () => {
      renderEditor();
      expect(screen.getByRole("textbox", { name: /title/i })).toBeInTheDocument();
    });

    it("renders existing option values", () => {
      renderEditor({
        options: [
          { title: "Vegetarian", order: 0 },
          { title: "Vegan", order: 1 },
        ],
      });
      expect(screen.getByDisplayValue("Vegetarian")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Vegan")).toBeInTheDocument();
    });

    it("renders the Add option button", () => {
      renderEditor();
      expect(screen.getByText(/add option/i)).toBeInTheDocument();
    });
  });

  // ── Title change ──────────────────────────────────────────────────────────

  describe("title change", () => {
    it("calls onChange with updated title when the title input changes", () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      fireEvent.change(screen.getByRole("textbox", { name: /title/i }), {
        target: { value: "Meal preference?" },
      });
      expect(onChange).toHaveBeenCalledWith({
        title: "Meal preference?",
        options: [],
      });
    });
  });

  // ── Adding options ────────────────────────────────────────────────────────

  describe("adding options", () => {
    it("calls onChange with a new empty option appended when Add option is clicked", () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      fireEvent.click(screen.getByText(/add option/i));
      const [{ options }] = onChange.mock.calls[0];
      expect(options).toHaveLength(1);
      expect(options[0]).toMatchObject({ title: "", order: 0 });
    });

    it("assigns an incremented order to a subsequent option", () => {
      const onChange = jest.fn();
      renderEditor({ options: [{ title: "Existing", order: 0 }], onChange });
      fireEvent.click(screen.getByText(/add option/i));
      const [{ options }] = onChange.mock.calls[0];
      expect(options[1].order).toBe(1);
    });
  });

  // ── Editing option title ──────────────────────────────────────────────────

  describe("editing option title", () => {
    it("calls onChange with updated option title", () => {
      const onChange = jest.fn();
      renderEditor({
        options: [{ title: "Old label", order: 0 }],
        onChange,
      });
      fireEvent.change(screen.getByDisplayValue("Old label"), {
        target: { value: "New label" },
      });
      const [{ options }] = onChange.mock.calls[0];
      expect(options[0].title).toBe("New label");
    });
  });

  // ── Deleting options ──────────────────────────────────────────────────────

  describe("deleting options", () => {
    it("calls onChange without the deleted option", () => {
      const onChange = jest.fn();
      renderEditor({
        options: [
          { title: "Option A", order: 0 },
          { title: "Option B", order: 1 },
        ],
        onChange,
      });
      const deleteButtons = screen.getAllByRole("button", { name: /delete option/i });
      fireEvent.click(deleteButtons[0]);
      const [{ options }] = onChange.mock.calls[0];
      expect(options).toHaveLength(1);
      expect(options[0].title).toBe("Option B");
    });

    it("reassigns orders contiguously after deletion", () => {
      const onChange = jest.fn();
      renderEditor({
        options: [
          { title: "A", order: 0 },
          { title: "B", order: 1 },
          { title: "C", order: 2 },
        ],
        onChange,
      });
      const deleteButtons = screen.getAllByRole("button", { name: /delete option/i });
      fireEvent.click(deleteButtons[1]); // delete "B"
      const [{ options }] = onChange.mock.calls[0];
      expect(options).toHaveLength(2);
      expect(options[0]).toMatchObject({ title: "A", order: 0 });
      expect(options[1]).toMatchObject({ title: "C", order: 1 });
    });
  });

  // ── Reordering options ────────────────────────────────────────────────────

  describe("reordering options", () => {
    const twoOptions: RegistrationFieldOption[] = [
      { title: "First", order: 0 },
      { title: "Second", order: 1 },
    ];

    it("moves an option down by swapping it with the next", () => {
      const onChange = jest.fn();
      renderEditor({ options: twoOptions, onChange });
      const moveDownButtons = screen.getAllByRole("button", { name: /move down/i });
      fireEvent.click(moveDownButtons[0]);
      const [{ options }] = onChange.mock.calls[0];
      expect(options[0]).toMatchObject({ title: "Second", order: 0 });
      expect(options[1]).toMatchObject({ title: "First", order: 1 });
    });

    it("moves an option up by swapping it with the previous", () => {
      const onChange = jest.fn();
      renderEditor({ options: twoOptions, onChange });
      const moveUpButtons = screen.getAllByRole("button", { name: /move up/i });
      fireEvent.click(moveUpButtons[1]);
      const [{ options }] = onChange.mock.calls[0];
      expect(options[0]).toMatchObject({ title: "Second", order: 0 });
      expect(options[1]).toMatchObject({ title: "First", order: 1 });
    });

    it("disables Move up for the first option", () => {
      renderEditor({ options: twoOptions });
      const moveUpButtons = screen.getAllByRole("button", { name: /move up/i });
      expect(moveUpButtons[0]).toBeDisabled();
      expect(moveUpButtons[1]).not.toBeDisabled();
    });

    it("disables Move down for the last option", () => {
      renderEditor({ options: twoOptions });
      const moveDownButtons = screen.getAllByRole("button", { name: /move down/i });
      expect(moveDownButtons[0]).not.toBeDisabled();
      expect(moveDownButtons[1]).toBeDisabled();
    });
  });
});
