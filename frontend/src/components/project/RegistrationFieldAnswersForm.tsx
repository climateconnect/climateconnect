import React, { useImperativeHandle, forwardRef, useState } from "react";
import { Box } from "@mui/material";
import { RegistrationField, RegistrationFieldAnswerValue } from "../../types";
import RegistrationCheckboxField from "./RegistrationCheckboxField";
import RegistrationOptionSelectField from "./RegistrationOptionSelectField";

export type RegistrationFieldAnswersFormHandle = {
  /** Validate all fields and return the answers payload if valid, or null if invalid. */
  validate(): RegistrationFieldAnswerValue[] | null;
};

type Props = {
  fields: RegistrationField[];
  /** Error map returned from the backend, keyed by field ID. */
  serverErrors?: Record<number, string>;
  /** Translation helper for validation messages. */
  texts: {
    this_field_is_required: string;
    you_must_check_this_box: string;
    please_select_an_option: string;
  };
};

const RegistrationFieldAnswersForm = forwardRef<RegistrationFieldAnswersFormHandle, Props>(
  function RegistrationFieldAnswersForm({ fields, serverErrors = {}, texts }, ref) {
    // Map of fieldId → answer value
    const [booleanValues, setBooleanValues] = useState<Record<number, boolean>>({});
    const [optionValues, setOptionValues] = useState<Record<number, number>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

    const sortedFields = [...fields].sort((a, b) => a.order - b.order);

    useImperativeHandle(ref, () => ({
      validate() {
        const errors: Record<number, string> = {};

        for (const field of sortedFields) {
          if (field.id == null) continue;
          const id = field.id;

          if (field.field_type === "checkbox") {
            if (field.is_required && !booleanValues[id]) {
              errors[id] = texts.you_must_check_this_box;
            }
          } else if (field.field_type === "option_select") {
            if (field.is_required && optionValues[id] == null) {
              errors[id] = texts.please_select_an_option;
            }
          }
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
          return null;
        }

        const answers: RegistrationFieldAnswerValue[] = [];
        for (const field of sortedFields) {
          if (field.id == null) continue;
          const id = field.id;

          if (field.field_type === "checkbox") {
            answers.push({ fieldId: id, valueBoolean: booleanValues[id] ?? false });
          } else if (field.field_type === "option_select") {
            if (optionValues[id] != null) {
              answers.push({ fieldId: id, valueOption: optionValues[id] });
            }
          }
        }
        return answers;
      },
    }));

    const handleBooleanChange = (fieldId: number, checked: boolean) => {
      setBooleanValues((prev) => ({ ...prev, [fieldId]: checked }));
      // Clear error on change
      if (fieldErrors[fieldId]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    };

    const handleOptionChange = (fieldId: number, optionId: number) => {
      setOptionValues((prev) => ({ ...prev, [fieldId]: optionId }));
      if (fieldErrors[fieldId]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    };

    return (
      <Box>
        {sortedFields.map((field) => {
          if (field.id == null) return null;
          const id = field.id;
          const error = fieldErrors[id] ?? serverErrors[id];

          if (field.field_type === "checkbox") {
            return (
              <RegistrationCheckboxField
                key={id}
                field={field}
                value={booleanValues[id] ?? false}
                onChange={(checked) => handleBooleanChange(id, checked)}
                error={error}
              />
            );
          }

          if (field.field_type === "option_select") {
            return (
              <RegistrationOptionSelectField
                key={id}
                field={field}
                value={optionValues[id]}
                onChange={(optionId) => handleOptionChange(id, optionId)}
                error={error}
              />
            );
          }

          return null;
        })}
      </Box>
    );
  }
);

export default RegistrationFieldAnswersForm;
