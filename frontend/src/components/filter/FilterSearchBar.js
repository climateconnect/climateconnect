import React from "react";
import { TextField, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

export default function FilterSearchBar({
  className,
  InputLabelClasses,
  label,
  onChange,
  onSubmit = () => {},
  type,
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
    />
  );
}
