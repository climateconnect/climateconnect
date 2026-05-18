import React from "react";
import { Box, Checkbox, FormHelperText, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  checkbox: {
    paddingTop: 0,
  },
  content: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  required: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(0.5),
  },
  descriptionHtml: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    color: theme.palette.text.secondary,
    "& a": {
      color: theme.palette.primary.main,
    },
    "& p": {
      margin: 0,
    },
  },
  errorText: {
    color: theme.palette.error.main,
  },
}));

type Props = {
  field: RegistrationField;
  value: boolean;
  onChange: (_checked: boolean) => void;
  error?: string;
};

export default function RegistrationCheckboxField({ field, value, onChange, error }: Props) {
  const classes = useStyles();
  const description = field.settings.description ?? "";

  return (
    <Box className={classes.root}>
      <Box className={classes.content}>
        <Checkbox
          className={classes.checkbox}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
        />
        <Box className={classes.textBlock}>
          <Typography component="div" className={classes.descriptionHtml}>
            {field.is_required && (
              <Typography component="span" className={classes.required} aria-hidden="true">
                {"* "}
              </Typography>
            )}
            {/* Render sanitized rich-text description stored by the organiser. */}
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              style={{ display: "inline-block" }} // Adjust for checkbox padding
            />
          </Typography>
        </Box>
      </Box>
      {error && (
        <FormHelperText className={classes.errorText} error>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
