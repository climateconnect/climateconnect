import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniHubPreviews from "./MiniHubPreviews";

const useStyles = makeStyles(() => ({
  headline: {
    fontWeight: 700,
  },
}));

//Change to ActiveSectorSelector
export default function ActiveHubsSelect({
  selectedHubs,
  hubsToSelectFrom,
  onSelectNewHub,
  onClickRemoveHub,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <div>
      <Typography color="text" className={classes.headline}>
        {texts.add_hubs_in_which_your_organization_is_active}
      </Typography>
      <MiniHubPreviews
        allowCreate
        editMode
        allHubs={hubsToSelectFrom}
        hubs={selectedHubs}
        onSelectNewHub={onSelectNewHub}
        onClickRemoveHub={onClickRemoveHub}
      />
    </div>
  );
}
