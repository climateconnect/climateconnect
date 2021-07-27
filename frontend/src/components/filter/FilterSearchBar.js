import { InputAdornment, TextField } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";

export default function FilterSearchBar({
  className,
  InputLabelClasses,
  label,
  onChange,
  onSubmit = () => {},
  type,
  value,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Perform the search: this invokes the search
      // handling func from its top-level ancestor, within browse.js
      const currentSearchValue = event?.target?.value;
      onSubmit(type, currentSearchValue);
      event.target.blur();
    }
  };

  return (
    <TextField
      className={className}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        classes: InputLabelClasses,
      }}
      InputLabelProps={{
        classes: InputLabelClasses,
      }}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={label}
      size="small"
      variant="outlined"
      value={value && value}
    />
  );
}
