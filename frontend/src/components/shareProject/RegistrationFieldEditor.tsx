import React from "react";
import { Box } from "@mui/material";
import { RegistrationField, RegistrationFieldOption } from "../../types";
import CheckboxFieldEditor from "./CheckboxFieldEditor";
import OptionSelectFieldEditor from "./OptionSelectFieldEditor";
import InventoryFieldEditor from "./InventoryFieldEditor";

type Props = {
  field: RegistrationField;
  onChange: (_updated: RegistrationField) => void;
  onRequestDeleteOption?: (_index: number, _option: RegistrationFieldOption) => void;
};

export default function RegistrationFieldEditor({ field, onChange, onRequestDeleteOption }: Props) {
  const answersLocked = !!field.has_answers;
  return (
    <Box>
      {field.field_type === "checkbox" && (
        <CheckboxFieldEditor
          description={field.settings?.description ?? ""}
          onChange={(description) =>
            onChange({ ...field, settings: { ...field.settings, description } })
          }
          disabled={answersLocked}
        />
      )}
      {field.field_type === "option_select" && (
        <OptionSelectFieldEditor
          title={field.settings?.title ?? ""}
          options={field.options ?? []}
          onChange={({ title, options }) =>
            onChange({ ...field, settings: { ...field.settings, title }, options })
          }
          onRequestDeleteOption={onRequestDeleteOption}
          titleDisabled={answersLocked}
        />
      )}
      {field.field_type === "inventory" && (
        <InventoryFieldEditor
          title={field.settings?.title ?? ""}
          description={field.settings?.description ?? ""}
          options={field.options ?? []}
          onChange={({ title, description, options }) =>
            onChange({
              ...field,
              settings: { ...field.settings, title, description },
              options,
            })
          }
          onRequestDeleteOption={onRequestDeleteOption}
          titleDisabled={answersLocked}
        />
      )}
    </Box>
  );
}
