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
  initialValue,
  onChange,
  open,
  handleSetOpen,
  locationInputRef,
}) {
  const getValue = (newValue) => {
    if(!newValue){
      return ""
    }else if(typeof newValue === "object"){
      return newValue.name ? newValue.name : newValue.simple_name
    } else {
      return newValue
    }
  } 

  const [options, setOptions] = React.useState([]);
  // If no 'open' prop is passed to the component, the component handles its 'open' state with this internal state
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState(getValue(initialValue));
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    let active = true;

    (async () => {
      if (searchValue) {
        const config = {
          method: "GET",
          mode: "no-cors",
          referrerPolicy: "origin",
        };
        const response = await axios(
          `https://nominatim.openstreetmap.org/search?q=${searchValue}&format=json&addressdetails=1&polygon_geojson=1`,
          config
        );
        const bannedClasses = ["landuse", "tourism", "railway"]
        if (active) {
          const filteredData = response.data.filter(
            (o) => {
              return o.importance > 0.5 && !bannedClasses.includes(o.class) && o?.geojson?.type !== "Point"
            }
          );
          const data =
            filteredData.length > 0
              ? filteredData
              : response.data.slice(0, 2).filter((o) => !bannedClasses.includes(o.class));
          setOptions(
            data.map((o) => ({ ...o, simple_name: getNameFromLocation(o).name, key: o.place_id }))
          );
          setLoading(false);
        }
      } else {
        setOptions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [searchValue]);

  const handleClose = () => {
    setOpen(false);
  };

  const setOpen = newOpenValue => {
    if(open === undefined)
      setUncontrolledOpen(newOpenValue)
    else
      handleSetOpen(newOpenValue)
  }

  const renderSearchOption = (option) => {
    return <React.Fragment>{option}</React.Fragment>;
  };

  const handleInputChange = (event) => {
    if (!loading) setLoading(true);
    if (options?.length > 0) setOptions([]);
    if ((event.target.value || event.target.value === "") && onChange) {
      onChange(event.target.value);
    }
    setInputValue(event.target.value);
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
      setInputValue(value);
      if (onSelect) {
        onSelect(options.filter((o) => o.simple_name === value)[0]);
      }
    }
  };

  const handleGetOptionDisabled = (option) => {
    return false;
  };

  const handleFilterOptions = (options) => {
    return options;
  };  

  return (
    <Autocomplete
      className={`${className} ${inputClassName}`}
      open={open === undefined ? uncontrolledOpen : open}
      onOpen={() => {
        setOpen(true);
      }}
      handleHomeEndKeys
      disableClearable
      loading={loading}
      onClose={handleClose}
      onChange={handleChange}
      options={options.map((o) => o.simple_name)}
      inputValue={value ? getValue(value) : inputValue}
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
