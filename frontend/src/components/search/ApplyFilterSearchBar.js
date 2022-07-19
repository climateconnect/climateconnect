import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import throttle from "lodash/throttle";
import React, { useContext } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Cookies from "universal-cookie";

export default function ApplyFilterSearchBar({
  applyFilter,
  label,
  baseUrl,
  className,
  clearOnSelect,
  onSelect,
  helperText,
  freeSolo,
  onUnselect,
  handleSetIsLoading
}) {
  const token = new Cookies().get("auth_token");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    let active = true;
    
    (async () => {
   
        handleSetIsLoading(true);
       
        const response = await apiRequest({
          token: token,
          method: "get",
          url: (baseUrl + searchValue).replace(process.env.API_URL, ""),
          locale: locale,
        });


        handleSetIsLoading(false); 
        applyFilter(response.data.results);
      
      
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

  const handleChange = (value, reason) => {
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
      options={options}
      freeSolo={freeSolo}
      inputValue={inputValue}
      noOptionsText={!searchValue && !inputValue ? texts.start_typing : texts.no_options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          onChange={handleInputChange}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
          }}
        />
      )}
    />
  );
}