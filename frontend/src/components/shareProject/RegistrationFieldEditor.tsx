import React from "react";
import { Box, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { RegistrationField, RegistrationFieldOption } from "../../types";
import CheckboxFieldEditor from "./CheckboxFieldEditor";
import OptionSelectFieldEditor from "./OptionSelectFieldEditor";
import InventoryFieldEditor from "./InventoryFieldEditor";
import TimeSlotFieldEditor from "./TimeSlotFieldEditor";
import TextFieldEditor from "./TextFieldEditor";

type Props = {
  field: RegistrationField;
  onChange: (_updated: RegistrationField) => void;
  onRequestDeleteOption?: (_index: number, _option: RegistrationFieldOption) => void;
  isDraft?: boolean;
  fieldError?: string;
  optionsError?: string;
  optionErrors?: Record<string, string>;
  onClearFieldError?: (_key: string) => void;
  eventStartDate?: string | Dayjs | null;
  eventEndDate?: string | Dayjs | null;
};

export default function RegistrationFieldEditor({
  field,
  onChange,
  onRequestDeleteOption,
  isDraft,
  fieldError,
  optionsError,
  optionErrors,
  onClearFieldError,
  eventStartDate,
  eventEndDate,
}: Props) {
  const answersLocked = !!field.has_answers;
  return (
    <Box>
      {field.field_type === "checkbox" && (
        <CheckboxFieldEditor
          description={field.settings?.description ?? ""}
          onChange={(description) => {
            onChange({ ...field, settings: { ...field.settings, description } });
            onClearFieldError?.(`field:${field.order}`);
          }}
          disabled={answersLocked}
          isDraft={isDraft}
          error={fieldError}
        />
      )}
      {field.field_type === "option_select" && (
        <OptionSelectFieldEditor
          title={field.settings?.title ?? ""}
          options={field.options ?? []}
          onChange={({ title, options }) => {
            onChange({ ...field, settings: { ...field.settings, title }, options });
            onClearFieldError?.(`field:${field.order}`);
            onClearFieldError?.(`field:${field.order}:options`);
          }}
          onRequestDeleteOption={onRequestDeleteOption}
          titleDisabled={answersLocked}
          isDraft={isDraft}
          fieldError={fieldError}
          onClearFieldError={onClearFieldError}
        />
      )}
      {field.field_type === "inventory" && (
        <InventoryFieldEditor
          title={field.settings?.title ?? ""}
          description={field.settings?.description ?? ""}
          options={field.options ?? []}
          onChange={({ title, description, options }) => {
            onChange({
              ...field,
              settings: { ...field.settings, title, description },
              options,
            });
            onClearFieldError?.(`field:${field.order}`);
            onClearFieldError?.(`field:${field.order}:options`);
          }}
          onRequestDeleteOption={onRequestDeleteOption}
          titleDisabled={answersLocked}
          isDraft={isDraft}
          fieldError={fieldError}
          optionErrors={optionErrors}
          onClearFieldError={onClearFieldError}
          fieldOrder={field.order}
        />
      )}
      {field.field_type === "time_slot_select" && (
        <TimeSlotFieldEditor
          title={field.settings?.title ?? ""}
          description={field.settings?.description ?? ""}
          options={field.options ?? []}
          onChange={({ title, description, options }) => {
            onChange({
              ...field,
              settings: { ...field.settings, title, description },
              options,
            });
            onClearFieldError?.(`field:${field.order}`);
            onClearFieldError?.(`field:${field.order}:options`);
          }}
          onRequestDeleteOption={onRequestDeleteOption}
          titleDisabled={answersLocked}
          isDraft={isDraft}
          fieldError={fieldError}
          onClearFieldError={onClearFieldError}
          fieldOrder={field.order}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
        />
      )}
      {field.field_type === "text" && (
        <TextFieldEditor
          title={field.settings?.title ?? ""}
          description={field.settings?.description ?? ""}
          isMultiline={field.settings?.is_multiline ?? false}
          onChange={({ title, description, is_multiline }) => {
            onChange({
              ...field,
              settings: { ...field.settings, title, description, is_multiline },
            });
            onClearFieldError?.(`field:${field.order}`);
          }}
          titleDisabled={answersLocked}
          isDraft={isDraft}
          fieldError={fieldError}
        />
      )}
      {optionsError && (
        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
          {optionsError}
        </Typography>
      )}
    </Box>
  );
}
