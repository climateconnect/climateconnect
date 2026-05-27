import { RegistrationField, RegistrationFieldAnswer } from "../types";
import { resolveAnswerToStrings } from "./resolveRegistrationFieldAnswer";

const LOCALE = "en";

function makeField(overrides: Partial<RegistrationField> & { id: number }): RegistrationField {
  return {
    field_type: "checkbox",
    order: 0,
    is_required: false,
    label: "Test field",
    settings: {},
    ...overrides,
  };
}

function makeAnswer(
  overrides: Partial<RegistrationFieldAnswer> & { field: number }
): RegistrationFieldAnswer {
  return {
    value_boolean: null,
    value_option: null,
    value_number: null,
    ...overrides,
  };
}

describe("resolveAnswerToStrings", () => {
  describe("checkbox fields", () => {
    it("returns TRUE when value_boolean is true", () => {
      const field = makeField({ id: 1, field_type: "checkbox" });
      const answer = makeAnswer({ field: 1, value_boolean: true });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "TRUE" }]);
    });

    it("returns FALSE when value_boolean is false", () => {
      const field = makeField({ id: 1, field_type: "checkbox" });
      const answer = makeAnswer({ field: 1, value_boolean: false });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "FALSE" }]);
    });

    it("returns empty string when value_boolean is null", () => {
      const field = makeField({ id: 1, field_type: "checkbox" });
      const answer = makeAnswer({ field: 1, value_boolean: null });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });

    it("returns empty when no answer provided", () => {
      const field = makeField({ id: 1, field_type: "checkbox" });
      const result = resolveAnswerToStrings(field, undefined, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });
  });

  describe("option_select fields", () => {
    it("returns option title for a valid selection", () => {
      const field = makeField({
        id: 2,
        field_type: "option_select",
        options: [
          { id: 10, title: "Vegan", order: 0 },
          { id: 11, title: "Vegetarian", order: 1 },
        ],
      });
      const answer = makeAnswer({ field: 2, value_option: 11 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "Vegetarian" }]);
    });

    it("returns empty string when selected option no longer exists", () => {
      const field = makeField({
        id: 2,
        field_type: "option_select",
        options: [{ id: 10, title: "Vegan", order: 0 }],
      });
      const answer = makeAnswer({ field: 2, value_option: 99 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });

    it("returns empty when no answer provided", () => {
      const field = makeField({
        id: 2,
        field_type: "option_select",
        options: [{ id: 10, title: "Vegan", order: 0 }],
      });
      const result = resolveAnswerToStrings(field, undefined, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });
  });

  describe("inventory fields", () => {
    it("returns two columns: -item and -amount", () => {
      const field = makeField({
        id: 3,
        field_type: "inventory",
        options: [
          { id: 20, title: "T-shirt", order: 0 },
          { id: 21, title: "Mug", order: 1 },
        ],
      });
      const answer = makeAnswer({ field: 3, value_option: 20, value_number: 3 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([
        { columnSuffix: "-item", value: "T-shirt" },
        { columnSuffix: "-amount", value: "3" },
      ]);
    });

    it("returns empty values when no answer provided", () => {
      const field = makeField({
        id: 3,
        field_type: "inventory",
        options: [],
      });
      const result = resolveAnswerToStrings(field, undefined, LOCALE);
      expect(result).toEqual([
        { columnSuffix: "-item", value: "" },
        { columnSuffix: "-amount", value: "" },
      ]);
    });

    it("returns empty when selected option no longer exists", () => {
      const field = makeField({
        id: 3,
        field_type: "inventory",
        options: [{ id: 20, title: "T-shirt", order: 0 }],
      });
      const answer = makeAnswer({ field: 3, value_option: 99, value_number: 2 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([
        { columnSuffix: "-item", value: "" },
        { columnSuffix: "-amount", value: "2" },
      ]);
    });
  });

  describe("time_slot_select fields", () => {
    it("returns localized time range for options with start/end time", () => {
      const field = makeField({
        id: 4,
        field_type: "time_slot_select",
        options: [
          {
            id: 30,
            title: "Morning",
            order: 0,
            start_time: "2026-06-01T09:00:00Z",
            end_time: "2026-06-01T12:00:00Z",
          },
        ],
      });
      const answer = makeAnswer({ field: 4, value_option: 30 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toHaveLength(1);
      expect(result[0].columnSuffix).toBe("");
      // Should contain en-dash separator between start and end times
      expect(result[0].value).toContain("\u2013");
      // Should contain date and time components
      expect(result[0].value).toContain("Jun");
    });

    it("falls back to option title when start/end times are missing", () => {
      const field = makeField({
        id: 4,
        field_type: "time_slot_select",
        options: [{ id: 31, title: "Afternoon", order: 0 }],
      });
      const answer = makeAnswer({ field: 4, value_option: 31 });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "Afternoon" }]);
    });

    it("returns empty when no answer provided", () => {
      const field = makeField({
        id: 4,
        field_type: "time_slot_select",
        options: [],
      });
      const result = resolveAnswerToStrings(field, undefined, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });
  });

  describe("edge cases", () => {
    it("returns empty when field has no id", () => {
      const field = makeField({ id: (undefined as unknown) as number, field_type: "checkbox" });
      const answer = makeAnswer({ field: 0, value_boolean: true });
      const result = resolveAnswerToStrings(field, answer, LOCALE);
      expect(result).toEqual([{ columnSuffix: "", value: "" }]);
    });
  });
});
