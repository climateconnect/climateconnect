import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import throttle from "lodash/throttle";
import React, { useContext } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

type Props = {
  label?;
  baseUrl?;
  filterOut?;
  className?;
  clearOnSelect?;
  onSelect?;
  getOptionLabel?;
  renderOption?;
  helperText?;
  freeSolo?;
  onUnselect?;
  color?;
};
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
  onUnselect,
  color = "primary",
}: Props) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (searchValue) {
        try {
          const response = await apiRequest({
            method: "get",
            url: (baseUrl + searchValue).replace(process.env.API_URL!, ""),
            locale: locale,
          });
          if (active) {
            setOptions(
              response.data.results
                .map((o) => ({ ...o, key: o.url_slug }))
                .filter((o) =>
                  filterOut ? !filterOut.find((fo) => fo.url_slug === o.url_slug) : true
                )
            );
          }
        } catch (error) {
          console.error(error);
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setSearchValueThrottled(event.target.value);
    if (onUnselect) onUnselect();
  };

  const setSearchValueThrottled = React.useMemo(
    () =>
      throttle((value) => {
        setSearchValue(value);
      }, 1000),
    []
  );

  const handleChange = (event, value, reason) => {
    if (reason === "selectOption") {
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
      noOptionsText={!searchValue && !inputValue ? texts.start_typing : texts.no_options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          onChange={handleInputChange}
          helperText={helperText}
          color={color}
          InputProps={{
            ...params.InputProps,
            endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
          }}
        />
      )}
    />
  );
}
