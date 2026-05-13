import React from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    paddingLeft: "10px",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
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

  return (
    <Box className={classes.root}>
      <FormControl component="fieldset" error={!!error} fullWidth>
        <FormLabel component="legend" className={classes.label}>
          {title}
          {field.is_required && (
            <span className={classes.required} aria-hidden="true">
              {" *"}
            </span>
          )}
        </FormLabel>
        <RadioGroup
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {sortedOptions.map((option) => (
            <FormControlLabel
              key={option.id}
              value={String(option.id)}
              control={<Radio color="primary" />}
              label={option.title}
            />
          ))}
        </RadioGroup>
        {error && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
      </FormControl>
    </Box>
  );
}
