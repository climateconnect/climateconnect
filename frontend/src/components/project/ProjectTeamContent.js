import React, { useContext } from "react";
import ProfilePreviews from "./../profile/ProfilePreviews";
import { Typography } from "@material-ui/core";
import UserContext from "../context/UserContext";
import LoginNudge from "../general/LoginNudge";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import AccountBoxIcon from "@material-ui/icons/AccountBox";

function getTeamWithAdditionalInfo(team) {
  return team.map(m => {
    const additionalInfo = [];
    if(m.location)
      additionalInfo.push({
        text: m.location,
        importance: "high",
        icon: LocationOnIcon,
        iconName: "LocationOnIcon",
        toolTipText: "Location"
      });
    if (m.role)
      additionalInfo.push({
        text: m.role,
        importance: "high",
        icon: AccountBoxIcon,
        iconName: "AccountBoxIcon",
        toolTipText: "Role in organization"
      });
    if (m.availability && m.availability !== "not_specified")
      additionalInfo.push({
        text: m.availability.name,
        importance: "low"
      });
    return { ...m, additionalInfo: additionalInfo };
  });
}

export default function TeamContent({ team }) {
  const { user } = useContext(UserContext);
  if (!user) return <LoginNudge whatToDo="see this project's team  members" />;
  else if (team)
    return (
      <ProfilePreviews
        profiles={getTeamWithAdditionalInfo(team)}
        allowMessage
        showAdditionalInfo={true}
      />
    );
  else return <Typography>We could not find any members of this project.</Typography>;
}
