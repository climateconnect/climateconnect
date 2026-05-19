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
    marginLeft: theme.spacing(-0.15),
    paddingLeft: 0,
  },
  content: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: theme.spacing(1.125),
  },
  required: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
  },
  descriptionHtml: {
    color: theme.palette.text.secondary,
    "& a": {
      color: theme.palette.primary.main,
    },
    "& p": {
      margin: 0,
      display: "inline",
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
          <Typography component="div" variant="body2" className={classes.descriptionHtml}>
            {/* Render sanitized rich-text description stored by the organiser. */}
            <div dangerouslySetInnerHTML={{ __html: description }} style={{ display: "inline" }} />
            {field.is_required && (
              <span className={classes.required} aria-hidden="true">
                {"*"}
              </span>
            )}
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
