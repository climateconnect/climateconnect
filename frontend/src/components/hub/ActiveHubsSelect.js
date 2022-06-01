import { makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniHubPreviews from "./MiniHubPreviews";

const useStyles = makeStyles(() => ({
  headline: {
    fontWeight: 700,
  },
}));

export default function ActiveHubsSelect({
  selectedHubs,
  hubsToSelectFrom,
  onSelectNewHub,
  onClickRemoveHub,
  type,
  onInterestsInfoTextFieldChange
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const isProfile = type === "profile";
  const texts = getTexts({ page: "hub", locale: locale });
  
  return (
    <div>
      <Typography color="secondary" className={classes.headline}>
        {isProfile
          ? texts.add_hubs_you_are_interested_in
          : texts.add_hubs_in_which_your_organization_is_active}
      </Typography>
      <MiniHubPreviews
        allowCreate={isProfile && selectedHubs?.length > 2 ? false : true}
        editMode
        allHubs={hubsToSelectFrom}
        hubs={selectedHubs}
        onSelectNewHub={onSelectNewHub}
        onClickRemoveHub={onClickRemoveHub}
        isProfile={isProfile}
        onInterestsInfoTextFieldChange={onInterestsInfoTextFieldChange}
      />
    </div>
  );
}
