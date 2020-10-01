import React from "react";
import { TextField, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

export default function FilterSearchBar({
  type,
  label,
  className,
  onSubmit,
  value,
  onChange,
  InputLabelClasses
}) {
  const handleKeyDown = event => {
    if (event.key === "Enter") {
      onSubmit(type);
    }
  };
  const handleChange = event => {
    onChange(type, event.target.value);
  };
  return (
    <TextField
      placeholder={label}
      variant="outlined"
      size="small"
      className={className}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        classes: InputLabelClasses
      }}
      InputLabelProps={{
        classes: InputLabelClasses
      }}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
