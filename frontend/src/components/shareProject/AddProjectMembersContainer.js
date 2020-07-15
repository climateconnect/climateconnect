import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import MiniProfileInput from "../profile/MiniProfileInput";

const useStyles = makeStyles(theme => {
  return {
    memberContainer: {
      display: "flex",
      flexWrap: "wrap"
    },
    member: {
      width: theme.spacing(40),
      textAlign: "center",
      marginRight: theme.spacing(4),
      marginTop: theme.spacing(2)
    },
    info: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: theme.spacing(2)
    },
    infoIcon: {
      marginBottom: -6
    }
  };
});

export default function AddProjectMembersContainer({
  projectData,
  blockClassName,
  handleRemoveMember,
  availabilityOptions,
  rolesOptions,
  handleSetProjectData
}) {
  const classes = useStyles();

  const handleChangeMember = m => {
    handleSetProjectData({
      ...projectData,
      team_members: [
        ...projectData.team_members.map(t => {
          if (t.url_slug === m.url_slug) return m;
          else return t;
        })
      ]
    });
  };
  return (
    <div className={blockClassName}>
      <Typography className={classes.info}>
        <InfoOutlinedIcon className={classes.infoIcon} /> Use the search bar to add members to your
        project.
      </Typography>
      <div className={classes.memberContainer}>
        {projectData.team_members.map((m, index) => {
          if (m)
            return (
              <MiniProfileInput
                key={index}
                className={classes.member}
                profile={m}
                onDelete={m.role.name !== "Creator" && (() => handleRemoveMember(m))}
                availabilityOptions={availabilityOptions}
                rolesOptions={rolesOptions}
                onChange={handleChangeMember}
                creatorRole={rolesOptions.find(r => r.name === "Creator")}
                fullRolesOptions={rolesOptions}
              />
            );
        })}
      </div>
    </div>
  );
}
