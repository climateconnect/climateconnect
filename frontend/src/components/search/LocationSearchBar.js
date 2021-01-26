import { TextField } from "@material-ui/core";
import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import axios from "axios";
import { debounce } from "lodash";
import { getNameFromLocation } from "../../../public/lib/locationOperations";

export default function LocationSearchBar({
  label,
  required,
  helperText,
  inputClassName,
  smallInput,
  onSelect,
  className,
  value,
  onChange,
  open,
  handleSetOpen,
  locationInputRef,
}) {
  const [options, setOptions] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (searchValue) {
        console.log("searching for " + searchValue);
        const config = {
          method: "GET",
          mode: "no-cors",
          referrerPolicy: "origin",
        };
        const response = await axios(
          `https://nominatim.openstreetmap.org/search?q=${searchValue}&format=json&addressdetails=1&polygon_geojson=1`,
          config
        );
        console.log(response.data);
        if (active) {
          const filteredData = response.data.filter(
            (o) => o.importance > 0.5 && o.class !== "landuse" && o?.geojson?.type !== "Point"
          );
          console.log(filteredData);
          const data =
            filteredData.length > 0
              ? filteredData
              : response.data.slice(0, 2).filter((o) => o.class !== "landuse");
          setOptions(
            data.map((o) => ({ ...o, simple_name: getNameFromLocation(o).name, key: o.place_id }))
          );
          setLoading(false);
        }
      } else {
        console.log("setting options to nothing!");
        setOptions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [searchValue]);

  const handleClose = () => {
    handleSetOpen(false);
  };

  const renderSearchOption = (option) => {
    return <React.Fragment>{option}</React.Fragment>;
  };

  const handleInputChange = (event) => {
    if (!loading) setLoading(true);
    if (options?.length > 0) setOptions([]);
    if (event.target.value && onChange) {
      onChange(event.target.value);
    }setInputValue(event.target.value);
    setSearchValueThrottled(event.target.value);
  };

  const setSearchValueThrottled = React.useMemo(
    () =>
      debounce((value) => {
        setSearchValue(value);
      }, 1000),
    []
  );

  const handleChange = (event, value, reason) => {
    if (reason === "select-option") {
      console.log(options.filter((o) => o.simple_name === value)[0]);
      setInputValue(value);
      if (onSelect) {
        onSelect(options.filter((o) => o.simple_name === value)[0]);
      }
    }
  };

  const handleGetOptionDisabled = (option) => {
    console.log(option);
    return false;
  };

  const handleFilterOptions = (options) => {
    return options;
  };
  console.log(options);
  return (
    <Autocomplete
      className={`${className} ${inputClassName}`}
      open={open}
      onOpen={() => {
        handleSetOpen(true);
      }}
      handleHomeEndKeys
      disableClearable
      loading={loading}
      onClose={handleClose}
      onChange={handleChange}
      options={options.map((o) => o.simple_name)}
      inputValue={value ? value : inputValue}
      filterOptions={handleFilterOptions}
      getOptionDisabled={handleGetOptionDisabled}
      renderOption={renderSearchOption}
      noOptionsText="No options"      
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          variant="outlined"
          onChange={handleInputChange}
          helperText={helperText}
          size={smallInput && "small"}
          inputRef={locationInputRef}
          InputProps={{
            ...params.InputProps,
            endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
          }}
        />
      )}
    />
  );
}
