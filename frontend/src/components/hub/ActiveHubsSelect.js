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
  interestsInfo,
  onSelectNewHub,
  onClickRemoveHub,
  type,
  onInterestsInfoTextFieldChange,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const isUserProfile = type === "userprofile";
  const texts = getTexts({ page: "hub", locale: locale });

  return (
    <div>
      <Typography color="secondary" className={classes.headline}>
        {isUserProfile
          ? texts.add_hubs_you_are_interested_in
          : texts.add_hubs_in_which_your_organization_is_active}
      </Typography>
      <MiniHubPreviews
        allowCreate={isUserProfile && selectedHubs?.length > 2 ? false : true}
        editMode
        allHubs={hubsToSelectFrom}
        hubs={selectedHubs}
        interestsInfo={interestsInfo}
        allowDescription={isUserProfile}
        onSelectNewHub={onSelectNewHub}
        onClickRemoveHub={onClickRemoveHub}
        onInterestsInfoTextFieldChange={onInterestsInfoTextFieldChange}
      />
    </div>
  );
}
