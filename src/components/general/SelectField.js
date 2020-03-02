import React from "react";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  blockElement: {
    display: "block",
    maxWidth: 250,
    height: 56,
    margin: "0 auto",
    marginTop: theme.spacing(2)
  },
  maxHeight: {
    maxHeight: 100
  }
}));

export default function SelectField({ field }) {
  const classes = useStyles();
  const defaultValue = field.select.defaultValue ? field.select.defaultValue : "";
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = event => {
    setValue(event.target.value);
  };

  //TODO: possibly address warnings, that are produced by this component
  return (
    <TextField
      select
      fullWidth
      label={field.label}
      className={classes.blockElement}
      value={value}
      variant="outlined"
      onChange={handleChange}
      required={field.required}
      SelectProps={{
        native: true
      }}
    >
      {!field.defaultValue || field.defaultValue === "" ? <option value="" /> : <></>}
      {field.select.values.map(value => {
        return (
          <option value={value.name} key={value.key}>
            {value.name}
          </option>
        );
      })}
    </TextField>
  );
}
