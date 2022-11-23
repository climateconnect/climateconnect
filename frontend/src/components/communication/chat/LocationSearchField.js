import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button, Chip } from "@material-ui/core";
import LocationSearchBar from "../../search/LocationSearchBar";

const useStyles = makeStyles(() => {
  return {
    buttonBar: {
      marginTop: 20,
      marginBottom: 10,
      position: "relative",
      height: 40,
    },
    cancelButton: {
      position: "absolute",
      right: 0,
    },
  };
});

export default function LocationSearchField({ cancelChatSearch, applyLocationFilterToChats }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [selectedLocation, setSelectedLocation] = useState("test");

  const handleLocationChange = (newValue) => {
    setSelectedLocation(newValue.simple_name);
    applyLocationFilterToChats(newValue.place_id, newValue.osm_id, newValue.osm_type);
  };

  return (
    <>
      <LocationSearchBar
        label={"enter a location to search for"}
        freeSolo
        helperText={"search for a location"}
        onSelect={(newValue) => handleLocationChange(newValue)}
      />
      <Chip label={selectedLocation}></Chip>
      <div className={classes.buttonBar}>
        <Button variant="contained" className={classes.cancelButton} onClick={cancelChatSearch}>
          {texts.cancel}
        </Button>
      </div>
    </>
  );
}
