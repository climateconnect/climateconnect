import React from "react";
import { Box, FormHelperText, TextField, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";

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
  texts: {
    please_select_an_option: string;
  };
};

export default function RegistrationOptionSelectField({
  field,
  value,
  onChange,
  error,
  texts,
}: Props) {
  const classes = useStyles();
  const title = field.settings.title ?? "";
  const sortedOptions = [...(field.options ?? [])].sort((a, b) => a.order - b.order);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === "") return;
    const optionId = Number(val);
    if (!isNaN(optionId)) {
      onChange(optionId);
    }
  };

  return (
    <Box className={classes.root}>
      <Typography component="div" variant="body1" className={classes.label}>
        {title}
        {field.is_required && (
          <span className={classes.required} aria-hidden="true">
            {" *"}
          </span>
        )}
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        value={value ?? ""}
        onChange={handleChange}
        required={field.is_required}
        SelectProps={{ native: true }}
      >
        <option value="">{texts.please_select_an_option}</option>
        {sortedOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title}
          </option>
        ))}
      </TextField>
      {error && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
    </Box>
  );
}
