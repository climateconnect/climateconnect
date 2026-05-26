import React, { useImperativeHandle, forwardRef, useState } from "react";
import { Box } from "@mui/material";
import { RegistrationField, RegistrationFieldAnswerValue } from "../../types";
import RegistrationCheckboxField from "./RegistrationCheckboxField";
import RegistrationInventoryField from "./RegistrationInventoryField";
import RegistrationOptionSelectField from "./RegistrationOptionSelectField";
import RegistrationTimeSlotField from "./RegistrationTimeSlotField";

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
    please_select_inventory_option: string;
    please_enter_quantity: string;
    quantity_available: string;
    max_per_guest: string;
    quantity_exceeds_max: string;
    please_select_time_slot: string;
    seats_available: string;
  };
};

const RegistrationFieldAnswersForm = forwardRef<RegistrationFieldAnswersFormHandle, Props>(
  function RegistrationFieldAnswersForm({ fields, serverErrors = {}, texts }, ref) {
    const [booleanValues, setBooleanValues] = useState<Record<number, boolean>>({});
    const [optionValues, setOptionValues] = useState<Record<number, number>>({});
    const [inventoryValues, setInventoryValues] = useState<
      Record<number, { optionId?: number; quantity?: number }>
    >({});
    const [timeSlotValues, setTimeSlotValues] = useState<Record<number, number>>({});
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
          } else if (field.field_type === "inventory") {
            const inv = inventoryValues[id];
            const opt = field.options?.find((o) => o.id === inv?.optionId);
            const max = opt
              ? Math.min(opt.max_amount_per_guest ?? Infinity, opt.remaining_amount ?? Infinity)
              : undefined;
            if (field.is_required) {
              if (inv?.optionId == null) {
                errors[id] = texts.please_select_inventory_option;
              } else if (inv?.quantity == null || inv.quantity < 1) {
                errors[id] = texts.please_enter_quantity;
              } else if (max != null && inv.quantity > max) {
                errors[id] = texts.quantity_exceeds_max;
              }
            } else if (inv?.optionId != null) {
              if (inv.quantity == null || inv.quantity < 1) {
                errors[id] = texts.please_enter_quantity;
              } else if (max != null && inv.quantity > max) {
                errors[id] = texts.quantity_exceeds_max;
              }
            }
          } else if (field.field_type === "time_slot_select") {
            if (field.is_required && timeSlotValues[id] == null) {
              errors[id] = texts.please_select_time_slot;
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
          } else if (field.field_type === "inventory") {
            const inv = inventoryValues[id];
            if (inv?.optionId != null && inv?.quantity != null && inv.quantity >= 1) {
              answers.push({
                fieldId: id,
                valueOption: inv.optionId,
                valueNumber: inv.quantity,
              });
            }
          } else if (field.field_type === "time_slot_select") {
            if (timeSlotValues[id] != null) {
              answers.push({ fieldId: id, valueOption: timeSlotValues[id] });
            }
          }
        }
        return answers;
      },
    }));

    const handleBooleanChange = (fieldId: number, checked: boolean) => {
      setBooleanValues((prev) => ({ ...prev, [fieldId]: checked }));
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

    const handleInventoryOptionChange = (fieldId: number, optionId: number) => {
      setInventoryValues((prev) => ({
        ...prev,
        [fieldId]: { ...prev[fieldId], optionId, quantity: undefined },
      }));
      if (fieldErrors[fieldId]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    };

    const handleInventoryQuantityChange = (fieldId: number, quantity: number | undefined) => {
      setInventoryValues((prev) => ({
        ...prev,
        [fieldId]: { ...prev[fieldId], quantity },
      }));
      if (fieldErrors[fieldId]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    };

    const handleTimeSlotChange = (fieldId: number, optionId: number) => {
      setTimeSlotValues((prev) => ({ ...prev, [fieldId]: optionId }));
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

          if (field.field_type === "inventory") {
            return (
              <RegistrationInventoryField
                key={id}
                field={field}
                optionId={inventoryValues[id]?.optionId}
                quantity={inventoryValues[id]?.quantity}
                onOptionChange={(optionId) => handleInventoryOptionChange(id, optionId)}
                onQuantityChange={(quantity) => handleInventoryQuantityChange(id, quantity)}
                error={error}
                texts={{
                  please_select_inventory_option: texts.please_select_inventory_option,
                  please_enter_quantity: texts.please_enter_quantity,
                  quantity_available: texts.quantity_available,
                  max_per_guest: texts.max_per_guest,
                  quantity_exceeds_max: texts.quantity_exceeds_max,
                }}
              />
            );
          }

          if (field.field_type === "time_slot_select") {
            return (
              <RegistrationTimeSlotField
                key={id}
                field={field}
                optionId={timeSlotValues[id]}
                onChange={(optionId) => handleTimeSlotChange(id, optionId)}
                error={error}
                texts={{
                  please_select_time_slot: texts.please_select_time_slot,
                  seats_available: texts.seats_available,
                }}
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
