import React from "react";
import { TextField, MenuItem, Checkbox, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

const useStyles = makeStyles({
  white: {
    color: "white"
  }
});

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
  values,
  isInOverlay,
  disabled,
  controlled,
  controlledValue
}) {
  const classes = useStyles();

  if (!defaultValue) defaultValue = "";
  const [value, setValue] = React.useState({
    name: defaultValue.name,
    key: defaultValue.key
  });

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: isInOverlay ? "50%" : ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        marginTop: 40
      }
    },
    variant: "menu",
    getContentAnchorEl: null
  };

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
      value={multiple ? values : controlled ? controlledValue.name : value.name}
      variant="outlined"
      onChange={handleChange}
      className={className}
      SelectProps={{
        native: !multiple,
        multiple: multiple,
        renderValue: !multiple ? null : () => "Select more",
        MenuProps: MenuProps
      }}
      InputProps={InputProps}
      size={size}
      disabled={disabled}
    >
      {!controlledValue && (!defaultValue || defaultValue === "") && !multiple && (
        <option value="" />
      )}
      {options.map((value, index) => {
        if (multiple)
          return (
            <MenuItem key={index} value={value.name}>
              <Checkbox
                checked={values.indexOf(value.name) > -1}
                checkedIcon={<CheckBoxIcon className={classes.white} />}
              />
              <ListItemText
                className={values.indexOf(value.name) > -1 ? classes.white : classes.none}
                primary={value.name}
              />
            </MenuItem>
          );
        else
          return (
            <option value={value.name} key={index} data-key={value.key}>
              {value.name}
            </option>
          );
      })}
    </TextField>
  );
}
