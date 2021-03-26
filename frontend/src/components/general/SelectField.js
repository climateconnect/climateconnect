import React from "react";
import { TextField, MenuItem, Checkbox, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

const useStyles = makeStyles({
  white: {
    color: "white",
  },
});

export default function SelectField({
  className,
  controlled,
  controlledValue,
  defaultValue,
  disabled,
  InputProps,
  isInOverlay,
  label,
  multiple,
  onChange,
  options,
  required,
  size,
  values,
}) {
  const classes = useStyles();

  if (!defaultValue) {
    defaultValue = "";
  }

  // TODO(Piper): have to manage controlled value?
  // console.log("select field: ");
  // console.log(options);
  // console.log(defaultValue);
  // console.log(values);

  // TODO(): transform default values into usable
  // state here:?

  // If we want to force the checkboxes to be checked
  // based on a persisted query param URL, then
  // we update the value and values here...
  const [value, setValue] = React.useState({
    name: defaultValue.name,
    key: defaultValue.key,
  });

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: isInOverlay ? "50%" : ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        marginTop: 40,
      },
    },
    variant: "menu",
    getContentAnchorEl: null,
  };

  const handleChange = (event) => {
    if (!multiple) {
      setValue({ name: event.target.value });
    }

    if (onChange) {
      onChange(event);
    }
  };

  //TODO: possibly address warnings, that are produced by this component
  return (
    <TextField
      className={className}
      disabled={disabled}
      InputProps={InputProps}
      fullWidth
      label={label}
      onChange={handleChange}
      required={required}
      select
      // Handle values differently depending on if this is being used
      // within a Multiselect or controlled context
      value={multiple ? values : controlled ? controlledValue.name : value.name}
      variant="outlined"
      SelectProps={{
        native: !multiple,
        multiple: multiple,
        renderValue: !multiple ? null : () => "Select more",
        MenuProps: MenuProps,
      }}
      size={size}
    >
      {!controlledValue && (!defaultValue || defaultValue === "") && !multiple && (
        <option value="" />
      )}

      {options &&
        options.map((value, index) => {
          if (multiple) {
            return (
              <MenuItem key={index} value={value.name}>
                <Checkbox
                  // TODO(Piper): force checkbox selected...
                  // checked={true}
                  checked={values.indexOf(value.name) > -1}
                  checkedIcon={<CheckBoxIcon className={classes.white} />}
                />
                <ListItemText
                  className={values.indexOf(value.name) > -1 ? classes.white : classes.none}
                  primary={value.name}
                />
              </MenuItem>
            );
          } else {
            return (
              <option value={value.name} key={index} data-key={value.key}>
                {value.name}
              </option>
            );
          }
        })}
    </TextField>
  );
}
