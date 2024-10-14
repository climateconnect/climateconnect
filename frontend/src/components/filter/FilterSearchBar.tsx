import { IconButton, InputAdornment, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState } from "react";

export default function FilterSearchBar({
  className,
  InputLabelClasses,
  label,
  // onChange,
  onSubmit,
  initialValue,
}: any) {
  const [searchValue, setSearchValue] = useState(initialValue);

  // TODO: One could also just use a form?
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Perform the search: this invokes the search
      // handling func from its top-level ancestor, within browse.js
      const currentSearchValue = event?.target?.value;
      onSubmit(currentSearchValue);
      event.target.blur();
    }
  };

  const removeSearchFilter = () => {
    if (searchValue !== "") {
      // onChange({ preventDefault: () => {}, target: { value: "" } });
      setSearchValue("");
      onSubmit("");
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
        endAdornment: searchValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={removeSearchFilter}>
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        ),
        classes: InputLabelClasses,
      }}
      InputLabelProps={{
        classes: InputLabelClasses,
      }}
      onChange={(e) => {
        setSearchValue(e.target.value);
      }}
      onKeyDown={handleKeyDown}
      placeholder={label}
      size="small"
      variant="outlined"
      value={searchValue}
    />
  );
}
