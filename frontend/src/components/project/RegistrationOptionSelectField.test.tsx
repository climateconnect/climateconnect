import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import RegistrationOptionSelectField from "./RegistrationOptionSelectField";
import { RegistrationField } from "../../types";
import UserContext from "../context/UserContext";

function makeField(overrides: Partial<RegistrationField> = {}): RegistrationField {
  return {
    id: 1,
    field_type: "option_select",
    order: 0,
    is_required: false,
    settings: { title: "Choose an option" },
    options: [
      { id: 2, title: "Second", order: 1 },
      { id: 1, title: "First", order: 0 },
      { id: 3, title: "Third", order: 2 },
    ],
    ...overrides,
  };
}

function renderField({
  field = makeField(),
  value = undefined,
  onChange = jest.fn(),
  error,
}: {
  field?: RegistrationField;
  value?: number;
  onChange?: jest.Mock;
  error?: string;
} = {}) {
  return render(
    <UserContext.Provider value={{ locale: "en" } as any}>
      <ThemeProvider theme={theme}>
        <RegistrationOptionSelectField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      </ThemeProvider>
    </UserContext.Provider>
  );
}

describe("RegistrationOptionSelectField", () => {
  it("renders the title from settings.title", () => {
    renderField({ field: makeField({ settings: { title: "Meal preference" } }) });
    expect(screen.getByText("Meal preference")).toBeInTheDocument();
  });

  it("renders required marker when field is required", () => {
    renderField({ field: makeField({ is_required: true }) });
    expect(screen.getByText(/\*/)).toBeInTheDocument();
  });

  it("sorts options by order before rendering", () => {
    renderField();
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["First", "Second", "Third"]);
  });

  it("shows the passed value option as selected", () => {
    renderField({ value: 3 });
    expect(screen.getByDisplayValue("Third")).toBeInTheDocument();
  });

  it("calls onChange with numeric option id", () => {
    const onChange = jest.fn();
    renderField({ onChange });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Second" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("renders error message when provided", () => {
    renderField({ error: "Please select an option" });
    expect(screen.getByText("Please select an option")).toBeInTheDocument();
  });

  it("renders no options when field.options is undefined", () => {
    renderField({ field: makeField({ options: undefined }) });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
