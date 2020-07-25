import React, { useContext } from "react";
import ProfilePreviews from "./../profile/ProfilePreviews";
import { Typography, Button, makeStyles } from "@material-ui/core";
import UserContext from "../context/UserContext";
import LoginNudge from "../general/LoginNudge";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import AccountBoxIcon from "@material-ui/icons/AccountBox";

const useStyles = makeStyles(theme => ({
  editButton: {
    marginBottom: theme.spacing(1)
  }
}));

function getTeamWithAdditionalInfo(team) {
  return team.map(m => {
    const additionalInfo = [];
    if (m.location)
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
        toolTipText: "Role in project"
      });
    if (m.availability && m.availability !== "not_specified")
      additionalInfo.push({
        text: m.availability.name,
        importance: "low"
      });
    return { ...m, additionalInfo: additionalInfo };
  });
}

export default function TeamContent({ project }) {
  const { user } = useContext(UserContext);
  const classes = useStyles();
  if (!user) return <LoginNudge whatToDo="see this project's team  members" />;
  else if (project.team)
    return (
      <>
        {user &&
          !!project.team.find(m => m.id === user.id) &&
          ["Creator", "Administrator"].includes(
            project.team.find(m => m.id === user.id).permission
          ) && (
            <div>
              <Button
                className={classes.editButton}
                variant="contained"
                color="primary"
                href={"/manageProjectMembers/" + project.url_slug}
              >
                Manage members
              </Button>
            </div>
          )}
        <ProfilePreviews
          profiles={getTeamWithAdditionalInfo(project.team)}
          allowMessage
          showAdditionalInfo={true}
        />
      </>
    );
  else return <Typography>We could not find any members of this project.</Typography>;
}
