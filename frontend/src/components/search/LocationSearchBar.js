import { TextField } from "@material-ui/core";
import React from "react"
import Autocomplete from "@material-ui/lab/Autocomplete";
import axios from "axios";
import fetch from "node-fetch"
import { debounce } from "lodash";


export default function LocationSearchBar({
  label,
  required,
  helperText,
  inputClassName,
  smallInput,
  onSelect,
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (searchValue) {
        console.log("searching for " + searchValue)
        const config = {
          method: 'GET',
          mode: 'no-cors',
          referrerPolicy: 'origin'
        }
        const response = await axios(`https://nominatim.openstreetmap.org/search?q=${searchValue}&format=json&addressdetails=1`, config)   
        console.log(response.data)
        if (active) {
          const filteredData = response.data.filter(o=>o.importance > 0.5 && o.class !== "landuse")
          console.log(filteredData)
          const data = filteredData.length > 0 ? filteredData : response.data.slice(0,2).filter(o=>o.class !== "landuse")
          setOptions(
            data.map((o) => ({ ...o, simple_name: getName(o), key: o.place_id }))
          );
        } 
      } else {
        console.log("setting options to nothing!")
        setOptions([]);
      }
    })();

    const getName = location => {
      if(!location.address || !location.address.country)
        return location.display_name
      const firstPartOrder = [
        "village", 
        "town", 
        "city_district", 
        "district",
        "suburb",
        "borough",        
        "subdivision",
        "neighbourhood",
        "place",
        "city", 
        "municipality", 
        "county", 
        "state_district", 
        "province", 
        "state", 
        "region"
      ];
      const middlePartOrder = [
        "city_district", 
        "district",
        "suburb",
        "borough",        
        "subdivision",
        "neighbourhood",
        "town"
      ];
      const middlePartSuffixes = [
        "city",
        "state"
      ]
      const firstPart = getFirstPart(location.address, firstPartOrder)
      const middlePart = getMiddlePart(location.address, middlePartOrder, middlePartSuffixes)
      return firstPart + middlePart + location.address.country
    }

    const getFirstPart = (address, order) => {
      for(const el of order){
        if(address[el]){
          return address[el] + ", "
        }
      }
      return ""
    }

    const getMiddlePart = (address, order, suffixes) => {
      for(const el of order){
        if(address[el]){
          for(const suffix of suffixes){
            if(address[suffix]){
              return `${address[suffix]}, `
            }
          }
        }
      }
      return ""
    }

    return () => {
      active = false;
    };
  }, [searchValue]);

  const handleClose = () => {
    setOpen(false);
  };

  const renderSearchOption = (option) => {
    return <React.Fragment>{option}</React.Fragment>;
  };

  const handleInputChange = (event) => {
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
      if(onSelect){
        console.log("on select")
        console.log(value)
        console.log(options.map(o=>o.simple_name).join(", "))
        console.log(options.filter(o=>o.simple_name === value)[0])
        onSelect(options.filter(o=>o.simple_name === value)[0])
      }
    }
  };

  const handleGetOptionDisabled = option => {
    console.log(option)
    return false
  }

  const handleFilterOptions = (options) =>  {
    return options
  }

  return (
    <Autocomplete
      className={inputClassName}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      handleHomeEndKeys
      disableClearable
      freeSolo
      onClose={handleClose}
      onChange={handleChange}
      options={options.map(o=>o.simple_name)}
      inputValue={inputValue}
      filterOptions={handleFilterOptions}
      getOptionDisabled={handleGetOptionDisabled}
      renderOption={renderSearchOption}
      noOptionsText={!searchValue && !inputValue ? "Start typing" : "Loading..."}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          onChange={handleInputChange}
          helperText={helperText}
          size={smallInput && "small"}
          InputProps={{
            ...params.InputProps,
            endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
          }}
        />
      )}
    />
  )
}