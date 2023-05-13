import { Checkbox, ListItemText, MenuItem, TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { string } from "prop-types";
import React, { useContext, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(theme => ({
  white: {
    color: "white",
  },
  selectedItem: {
    backgroundColor: `${theme.palette.primary.main} !important`
  }
}));

type Props = {
  className?: string;
  controlled?: boolean;
  controlledValue?: any;
  defaultValue?: any;
  disabled?;
  InputProps?;
  isInOverlay?;
  label;
  multiple?;
  onChange;
  options;
  required?;
  size?: "small" | "medium";
  values?;
};
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
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  if (!defaultValue) {
    defaultValue = "";
  }

  // If we want to force the checkboxes to be checked
  // based on a persisted query param URL, then
  // we update the value and values here...
  const [value, setValue] = useState<{ name: string; key?: string }>({
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
      value={multiple ? values : controlled ? controlledValue && controlledValue.name : value.name}
      variant="outlined"
      SelectProps={{
        native: !multiple,
        multiple: multiple,
        renderValue: (!multiple ? null : () => texts.select_more) as any,
        MenuProps: MenuProps as any,
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
              <MenuItem key={index} value={value.name} classes={{selected: classes.selectedItem}}>
                <Checkbox
                  checked={values.indexOf(value.name) > -1}
                  checkedIcon={<CheckBoxIcon className={classes.white} />}
                />
                <ListItemText
                  className={values.indexOf(value.name) > -1 ? classes.white : undefined}
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
