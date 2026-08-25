import React, { useContext } from "react";
import { Box, FormHelperText, TextField, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import getTexts from "../../../public/texts/texts";
import { RegistrationField } from "../../types";
import UserContext from "../context/UserContext";

const MAX_LENGTH = 300;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  required: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  errorText: {
    color: theme.palette.error.main,
  },
  counter: {
    textAlign: "right",
  },
}));

type Props = {
  field: RegistrationField;
  value: string;
  onChange: (_value: string) => void;
  error?: string;
};

export default function RegistrationTextField({ field, value, onChange, error }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  const title = field.settings.title ?? "";
  const description = field.settings.description ?? "";
  const isMultiline = field.settings.is_multiline ?? false;
  const currentLength = value.length;

  return (
    <Box className={classes.root}>
      <Typography variant="body1" gutterBottom>
        {title}
        {field.is_required && (
          <span className={classes.required} aria-hidden="true">
            {"*"}
          </span>
        )}
      </Typography>
      {description && (
        <Typography variant="body2" className={classes.description}>
          {description}
        </Typography>
      )}
      <TextField
        fullWidth
        size="small"
        multiline={isMultiline}
        minRows={isMultiline ? 3 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={texts.registration_text_field_placeholder}
        inputProps={{ maxLength: MAX_LENGTH }}
        error={!!error}
      />
      {isMultiline && (
        <Typography
          variant="caption"
          className={classes.counter}
          color={currentLength >= MAX_LENGTH ? "error" : "textSecondary"}
        >
          {currentLength} / {MAX_LENGTH}
        </Typography>
      )}
      {error && (
        <FormHelperText className={classes.errorText} error>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
