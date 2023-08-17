import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { debounce } from "lodash";
import React, { useContext, useEffect } from "react";
import { getNameFromLocation } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

type Props = {
  label?;
  required?;
  helperText?;
  inputClassName?;
  smallInput?;
  onSelect?;
  className?;
  value?;
  initialValue?;
  onChange?;
  open?;
  handleSetOpen?;
  locationInputRef?;
  textFieldClassName?;
  disabled?;
};
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
  textFieldClassName,
  disabled,
}: Props) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const getValue = (newValue, inputValue) => {
    if (!newValue) {
      return inputValue ? inputValue : "";
    } else if (typeof newValue === "object") {
      return newValue.name ? newValue.name : newValue.simple_name;
    } else {
      return newValue;
    }
  };

  const [options, setOptions] = React.useState<{ simple_name: string }[]>([]);
  // If no 'open' prop is passed to the component, the component handles its 'open' state with this internal state
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState(getValue(initialValue, ""));
  useEffect(
    function () {
      if (inputValue?.length > 0 && value?.length === 0) {
        setInputValue("");
        setSearchValue("");
        setOptions([]);
      }
    },
    [value]
  );
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
          `https://nominatim.openstreetmap.org/search?q=${searchValue}&format=json&addressdetails=1&polygon_geojson=1&polygon_threshold=0.001&accept-language=en-US,en;q=0.9`,
          config as any
        );
        const bannedClasses = [
          "tourism",
          "railway",
          "waterway",
          "natural",
          "shop",
          "leisure",
          "amenity",
          "highway",
          "aeroway",
          "historic",
        ];
        const additionalOptions = [
          {
            simple_name: "Global",
            name: "Global",
            type: "global",
            added_manually: "true",
            city: "",
            country: "Global",
            state: "",
            place_id: 1,
            osm_id: -1,
            lon: -1,
            lat: -1,
          },
        ];
        const bannedTypes = ["claimed_administrative", "isolated_dwelling", "croft"];
        if (active) {
          const filteredData = response.data.filter((o) => {
            return (
              o.importance > 0.5 &&
              !bannedClasses.includes(o.class) &&
              !bannedTypes.includes(o.type)
            );
          });
          const data =
            filteredData.length > 0
              ? filteredData
              : response.data.slice(0, 2).filter((o) => !bannedClasses.includes(o.class));
          for (const option of additionalOptions) {
            if (option.simple_name.toLowerCase().includes(searchValue.toLowerCase())) {
              data.push(option);
            }
          }
          const options = data.map((o) => ({
            ...o,
            simple_name: getNameFromLocation(o).name,
            key: o.place_id,
          }));
          setOptions(getOptionsWithoutRedundancies(options));
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

  const getOptionsWithoutRedundancies = (options) => {
    const type_hierarchy = ["administrative", "county"];
    console.log(options);
    //If there is multiple locations with the same name, only let the one with the "strongest" type in.
    //e.g. don't display both a city and a county if their names are identical
    return options.filter((cur) => {
      for (const o of options) {
        if (
          cur !== o &&
          cur.simple_name === o.simple_name &&
          type_hierarchy.indexOf(cur.type) > -1 &&
          type_hierarchy.indexOf(o.type) < type_hierarchy.indexOf(cur.type)
        ) {
          return false;
        }
      }
      return true;
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const setOpen = (newOpenValue) => {
    if (open === undefined) setUncontrolledOpen(newOpenValue);
    else handleSetOpen(newOpenValue);
  };

  const renderSearchOption = (props, option) => {
    return <li {...props}>{option}</li>;
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
    if (reason === "selectOption") {
      setInputValue(value);
      if (onSelect) {
        onSelect(options.filter((o) => o.simple_name === value)[0]);
      }
    }
  };

  const handleGetOptionDisabled = (/*option*/) => {
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
      inputValue={getValue(value, inputValue)}
      filterOptions={handleFilterOptions}
      getOptionDisabled={handleGetOptionDisabled}
      renderOption={renderSearchOption}
      disabled={disabled}
      noOptionsText={!searchValue && !inputValue ? texts.start_typing + "..." : texts.no_options}
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
            className: textFieldClassName,
          }}
        />
      )}
    />
  );
}
