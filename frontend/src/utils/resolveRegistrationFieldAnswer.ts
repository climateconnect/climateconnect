import { RegistrationField, RegistrationFieldAnswer, RegistrationFieldOption } from "../types";

export type ResolvedColumn = {
  columnSuffix: string;
  value: string;
};

export function formatTimeRange(startIso: string, endIso: string, locale: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${dateFmt.format(start)}, ${timeFmt.format(start)} \u2013 ${timeFmt.format(end)}`;
  }
  return `${dateFmt.format(start)}, ${timeFmt.format(start)} \u2013 ${dateFmt.format(
    end
  )}, ${timeFmt.format(end)}`;
}

export function findOption(
  options: RegistrationFieldOption[] | undefined,
  optionId: number | null
): RegistrationFieldOption | undefined {
  if (optionId == null || !options) return undefined;
  return options.find((opt) => opt.id != null && opt.id === optionId);
}

/**
 * Resolves a single RegistrationFieldAnswer to a human-readable string
 * for CSV/print export.
 *
 * Returns an array because inventory fields expand into two columns
 * ({label}-item and {label}-amount).
 */
export function resolveAnswerToStrings(
  field: RegistrationField,
  answer: RegistrationFieldAnswer | undefined,
  locale: string
): ResolvedColumn[] {
  if (answer == null || field.id == null) {
    const empty: ResolvedColumn = { columnSuffix: "", value: "" };
    if (field.field_type === "inventory") {
      return [
        { columnSuffix: "-item", value: "" },
        { columnSuffix: "-amount", value: "" },
      ];
    }
    return [empty];
  }

  switch (field.field_type) {
    case "checkbox":
      return [
        {
          columnSuffix: "",
          value:
            answer.value_boolean === true ? "TRUE" : answer.value_boolean === false ? "FALSE" : "",
        },
      ];

    case "option_select": {
      const option = findOption(field.options, answer.value_option);
      return [{ columnSuffix: "", value: option?.title ?? "" }];
    }

    case "inventory": {
      const option = findOption(field.options, answer.value_option);
      return [
        { columnSuffix: "-item", value: option?.title ?? "" },
        {
          columnSuffix: "-amount",
          value: answer.value_number != null ? String(answer.value_number) : "",
        },
      ];
    }

    case "time_slot_select": {
      const option = findOption(field.options, answer.value_option);
      if (option?.start_time && option?.end_time) {
        return [
          { columnSuffix: "", value: formatTimeRange(option.start_time, option.end_time, locale) },
        ];
      }
      return [{ columnSuffix: "", value: option?.title ?? "" }];
    }

    default:
      return [{ columnSuffix: "", value: "" }];
  }
}
