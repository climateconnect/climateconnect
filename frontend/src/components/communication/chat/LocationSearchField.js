import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button, Chip } from "@material-ui/core";
import LocationSearchBar from "../../search/LocationSearchBar";
import PlaceIcon from "@material-ui/icons/Place";
import theme from "../../../themes/theme";

const useStyles = makeStyles(() => {
  return {
    buttonBar: {
      display: "flex",

      justifyContent: "flex-start",
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
      flexWrap: "wrap",
    },
    cancelButton: {
      width: 100,
      marginLeft: "auto",
    },
    locationChip: {
      marginTop: theme.spacing(1),
    },
  };
});

export default function LocationSearchField({
  cancelChatSearch,
  applyLocationFilterToChats,
  handleRemoveLocationFilterFromChats,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showLocationChip, setShowLocationChip] = useState(false);
  const [locationTextFieldValue, setLocationTextFieldValue] = useState("");

  const handleShowLocationChip = () => {
    setShowLocationChip(true);
  };

  const handleRemoveSelection = () => {
    setShowLocationChip(false);
    setLocationTextFieldValue("");
    setSelectedLocation("");
    handleRemoveLocationFilterFromChats();
  };

  const handleLocationChange = (newValue) => {
    setSelectedLocation(newValue.simple_name);
    setLocationTextFieldValue(newValue.simple_name);
    handleShowLocationChip();
    applyLocationFilterToChats(newValue.place_id, newValue.osm_id, newValue.osm_type);
  };
  const handleLocationTextFieldValueChange = (newLocationString) => {
    setLocationTextFieldValue(newLocationString);
  };
  return (
    <>
      <LocationSearchBar
        label={texts.location}
        freeSolo
        value={locationTextFieldValue}
        helperText={texts.search_for_a_location}
        onSelect={(newValue) => handleLocationChange(newValue)}
        onChange={handleLocationTextFieldValueChange}
      />
      <div className={classes.buttonBar}>
        {showLocationChip && (
          <Chip
            className={classes.locationChip}
            icon={<PlaceIcon />}
            label={selectedLocation}
            onDelete={handleRemoveSelection}
          />
        )}

        <Button variant="contained" className={classes.cancelButton} onClick={cancelChatSearch}>
          {texts.cancel}
        </Button>
      </div>
    </>
  );
}
