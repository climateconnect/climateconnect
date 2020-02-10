import React from "react";
import { Select } from "@material-ui/core";
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
  console.log(field);
  const defaultValue = field.select.defaultValue ? field.select.defaultValue : "";
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = event => {
    setValue(event.target.value);
  };

  return (
    <>
      <Select
        required={field.required}
        fullWidth
        autoFocus
        native
        className={classes.blockElement}
        key={field.label}
        type={field.type}
        value={value}
        variant={"outlined"}
        onChange={handleChange}
      >
        {!field.defaultValue || field.defaultValue === "" ? <option value="" /> : <></>}
        {field.select.values.map(value => (
          <option value={value} key={value}>
            {value}
          </option>
        ))}
      </Select>
    </>
  );
}
