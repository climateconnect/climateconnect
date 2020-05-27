import React from "react";
import { TextField, MenuItem, Checkbox, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

const useStyles = makeStyles({
  white: {
    color: "white"
  }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

export default function SelectField({
  defaultValue,
  label,
  options,
  onChange,
  required,
  className,
  InputProps,
  size,
  multiple,
  values
}) {
  const classes = useStyles();

  if (!defaultValue) defaultValue = "";
  const [value, setValue] = React.useState({
    name: defaultValue.name,
    key: defaultValue.key
  });

  const handleChange = event => {
    if (!multiple) setValue({ name: event.target.value });
    if (onChange) onChange(event);
  };
  //TODO: possibly address warnings, that are produced by this component
  return (
    <TextField
      select
      required={required}
      fullWidth
      label={label}
      value={multiple ? values : value.name}
      variant="outlined"
      onChange={handleChange}
      className={className}
      MenuProps={MenuProps}
      SelectProps={{
        native: !multiple,
        multiple: multiple,
        renderValue: !multiple ? null : () => "Select more",
        MenuProps: { variant: "menu" }
      }}
      InputProps={InputProps}
      size={size}
    >
      {!defaultValue || defaultValue === "" ? <option value="" /> : <></>}
      {options.map(value => {
        if (multiple)
          return (
            <MenuItem key={value.key} value={value.name}>
              <Checkbox
                checked={values.indexOf(value.name) > -1}
                checkedIcon={<CheckBoxIcon className={classes.white} />}
              />
              <ListItemText
                className={values.indexOf(value.name) > -1 && classes.white}
                primary={value.name}
              />
            </MenuItem>
          );
        else
          return (
            <option value={value.name} key={value.key} data-key={value.key}>
              {value.name}
            </option>
          );
      })}
    </TextField>
  );
}
