import React from "react";
import { Box } from "@mui/material";
import { RegistrationField } from "../../types";
import CheckboxFieldEditor from "./CheckboxFieldEditor";
import OptionSelectFieldEditor from "./OptionSelectFieldEditor";

type Props = {
  field: RegistrationField;
  onChange: (_updated: RegistrationField) => void;
};

export default function RegistrationFieldEditor({ field, onChange }: Props) {
  return (
    <Box>
      {field.field_type === "checkbox" && (
        <CheckboxFieldEditor
          description={field.settings?.description ?? ""}
          onChange={(description) =>
            onChange({ ...field, settings: { ...field.settings, description } })
          }
        />
      )}
      {field.field_type === "option_select" && (
        <OptionSelectFieldEditor
          title={field.settings?.title ?? ""}
          options={field.options ?? []}
          onChange={({ title, options }) =>
            onChange({ ...field, settings: { ...field.settings, title }, options })
          }
        />
      )}
    </Box>
  );
}
