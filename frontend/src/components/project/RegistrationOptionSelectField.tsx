import React from "react";
import { Box, FormHelperText, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";
import SelectField from "../general/SelectField";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    paddingLeft: 0,
  },
  label: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  required: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
  },
  errorText: {
    color: theme.palette.error.main,
  },
}));

type Props = {
  field: RegistrationField;
  value: number | undefined;
  onChange: (_optionId: number) => void;
  error?: string;
};

export default function RegistrationOptionSelectField({ field, value, onChange, error }: Props) {
  const classes = useStyles();
  const title = field.settings.title ?? "";
  const sortedOptions = [...(field.options ?? [])].sort((a, b) => a.order - b.order);
  const selectedOption = sortedOptions.find((option) => option.id === value);

  const handleChange = (event: any) => {
    const selectedKey = event.target.selectedOptions?.[0]?.dataset?.key;

    if (selectedKey) {
      onChange(Number(selectedKey));
      return;
    }

    const option = sortedOptions.find((item) => item.title === event.target.value);

    const optionId = option?.id;

    if (typeof optionId === "number") {
      onChange(optionId);
    }
  };

  return (
    <Box className={classes.root}>
      <Typography component="div" variant="body2" className={classes.label}>
        {title}
        {field.is_required && (
          <span className={classes.required} aria-hidden="true">
            {" *"}
          </span>
        )}
      </Typography>
      <SelectField
        controlled
        controlledValue={
          selectedOption
            ? { name: selectedOption.title, key: String(selectedOption.id) }
            : { name: "" }
        }
        options={sortedOptions.map((option) => ({ name: option.title, key: String(option.id) }))}
        label=""
        onChange={handleChange}
        required={field.is_required}
      />
      {error && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
    </Box>
  );
}
