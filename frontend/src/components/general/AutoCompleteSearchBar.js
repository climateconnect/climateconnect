import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import throttle from "lodash/throttle";
import axios from "axios";

export default function AutoCompleteSearchBar({
  label,
  baseUrl,
  filterOut,
  className,
  clearOnSelect,
  onSelect,
  getOptionLabel,
  renderOption,
  helperText,
  freeSolo,
  onUnselect
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (searchValue) {
        const response = await axios.get(baseUrl + searchValue);
        if (active) {
          setOptions(
            response.data.results
              .map(o => ({ ...o, key: o.url_slug }))
              .filter(o => (filterOut ? !filterOut.find(fo => fo.url_slug === o.url_slug) : true))
          );
        }
      } else {
        setOptions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [searchValue]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const handleInputChange = event => {
    setInputValue(event.target.value);
    setSearchValueThrottled(event.target.value);
    if (onUnselect) onUnselect();
  };

  const setSearchValueThrottled = React.useMemo(
    () =>
      throttle(value => {
        setSearchValue(value);
      }, 1000),
    []
  );

  const handleChange = (event, value, reason) => {
    if (reason === "select-option") {
      if (onSelect) onSelect(value);
      if (clearOnSelect) {
        setInputValue("");
        setSearchValue("");
      } else {
        setInputValue(value.name);
        setSearchValue("");
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Autocomplete
      open={open}
      className={className}
      onOpen={() => {
        setOpen(true);
      }}
      handleHomeEndKeys
      disableClearable
      onClose={handleClose}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      options={options}
      freeSolo={freeSolo}
      inputValue={inputValue}
      renderOption={renderOption}
      noOptionsText={!searchValue && !inputValue ? "Start typing" : "No options"}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          onChange={handleInputChange}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>
          }}
        />
      )}
    />
  );
}
