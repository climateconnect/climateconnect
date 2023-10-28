import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import makeStyles from "@mui/styles/makeStyles";
import axios from "axios";
import { debounce } from "lodash";
import React, { useContext, useEffect } from "react";
import {
  getNameFromLocation,
  getNameFromExactLocation,
  isExactLocation,
} from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  additionalInfos: (props) => ({
    width: "100%",
    marginTop: props.hideHelperText ? 0 : theme.spacing(2),
  }),
  input: {
    marginBottom: theme.spacing(2),
  },
  formHelperText: {
    marginTop: theme.spacing(-2),
  },
}));

type Props = {
  label?: string | Element;
  required?: boolean;
  helperText?: string;
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
  enableExactLocation?: boolean;
  additionalInfoText?: string;
  onChangeAdditionalInfoText?;
  enableAdditionalInfo?: boolean;
  hideHelperText?: boolean;
  filterMode?: boolean;
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
  enableExactLocation,
  additionalInfoText,
  onChangeAdditionalInfoText,
  enableAdditionalInfo,
  hideHelperText,
  filterMode=false, //Are we filtering any content by this location?
}: Props) {
  const { locale } = useContext(UserContext);
  const classes = useStyles({ hideHelperText: hideHelperText });
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const getValue = (newValue, inputValue) => {
    if (!newValue) {
      return inputValue ? inputValue : "";
    } else if (typeof newValue === "object") {
      if (enableExactLocation) {
        return getNameFromExactLocation(newValue).name;
      } else {
        return newValue.name ? newValue.name : newValue.simple_name;
      }
    } else {
      return newValue;
    }
  };

  const [options, setOptions] = React.useState<{ simple_name: string }[]>([]);
  // If no 'open' prop is passed to the component, the component handles its 'open' state with this internal state
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState(getValue(value ? value : initialValue, ""));
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
        const bannedTypes = [
          "claimed_administrative",
          "isolated_dwelling",
          "croft",
          "construction",
          "postcode"
        ];
        const minimumImportance = {
          exactAddresses: 0.25,
          places: 0.5,
        };
        if (active) {
          const filteredData = response.data.filter((o) => {
            return (
              (isExactLocation(o)
                ? o.importance > minimumImportance.exactAddresses
                : o.importance > minimumImportance.places) &&
              (enableExactLocation || !bannedClasses.includes(o.class)) &&
              !bannedTypes.includes(o.type)
            );
          });
          const data =
            filteredData.length > 0
              ? filteredData
              : response.data
                  .slice(0, 2)
                  .filter((o) => {
                    if(filterMode && o.type === "postcode"){
                      return false;
                    } else {
                      return enableExactLocation || !bannedClasses.includes(o.class)
                    }
                  });
          for (const option of additionalOptions) {
            if (option.simple_name.toLowerCase().includes(searchValue.toLowerCase())) {
              data.push(option);
            }
          }
          const options = data.map((o) => ({
            ...o,
            simple_name: enableExactLocation
              ? getNameFromExactLocation(o).name
              : getNameFromLocation(o).name,
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
    //For the classes_without_hierarchy we simply return the first element if there is a redundancy
    const classes_without_hierarchy = ["highway"];
    //If any of these types apply we want the types to trump each other in this order instead of just taking the first element
    const type_hierarchy = ["administrative", "county", "political"];
    //e.g. don't display both a city and a county if their names are identical
    return options.filter((cur) => {
      for (const o of options) {
        if (cur !== o && cur.simple_name === o.simple_name) {
          //if the elements are both a class without hierarchy, filter out every element but the first one
          if (
            classes_without_hierarchy.includes(cur.class) &&
            o.class === cur.class &&
            o !== options.find((e) => e.class === cur.class)
          ) {
            return false;
          }
          //if the elements are part of the type hierarchy, filter out every element but the strongest
          if (
            type_hierarchy.indexOf(cur.type) > -1 &&
            type_hierarchy.indexOf(o.type) < type_hierarchy.indexOf(cur.type)
          ) {
            return false;
          }
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

  const handleChangeAdditionalInfoText = (e) => {
    onChangeAdditionalInfoText(e.target.value);
  };

  return (
    <div className={className}>
      <Autocomplete
        className={inputClassName}
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
              className: `${textFieldClassName} ${classes.input}`,
            }}
            FormHelperTextProps={{
              classes: {
                root: classes.formHelperText,
              },
            }}
          />
        )}
      />
      {enableAdditionalInfo && (
        <TextField
          label={texts.additional_infos_for_location}
          className={classes.additionalInfos}
          value={additionalInfoText}
          onChange={handleChangeAdditionalInfoText}
        />
      )}
    </div>
  );
}
