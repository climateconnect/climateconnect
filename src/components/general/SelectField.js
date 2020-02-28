import React from "react";
import { TextField } from "@material-ui/core";

export default function SelectField({ defaultValue, label, values, onChange, required }) {
  if (!defaultValue) defaultValue = "";
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = event => {
    setValue(event.target.value);
    onChange(event);
  };

  //TODO: possibly address warnings, that are produced by this component
  return (
    <TextField
      select
      required={required}
      fullWidth
      label={label}
      value={value}
      variant="outlined"
      onChange={handleChange}
      SelectProps={{
        native: true
      }}
    >
      {!defaultValue || defaultValue === "" ? <option value="" /> : <></>}
      {values.map(value => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </TextField>
  );
}
