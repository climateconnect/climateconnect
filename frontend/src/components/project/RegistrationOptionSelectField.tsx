import React from "react";
import { Box, FormHelperText } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";
import SelectField from "../general/SelectField";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
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
      <SelectField
        controlled
        controlledValue={
          selectedOption
            ? { name: selectedOption.title, key: String(selectedOption.id) }
            : { name: "" }
        }
        options={sortedOptions.map((option) => ({ name: option.title, key: String(option.id) }))}
        label={title}
        onChange={handleChange}
        required={field.is_required}
      />
      {error && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
    </Box>
  );
}
