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
  projectMembers,
  blockClassName,
  handleRemoveMember,
  availabilityOptions
}) {
  const classes = useStyles();

  return (
    <div className={blockClassName}>
      <Typography className={classes.info}>
        <InfoOutlinedIcon className={classes.infoIcon} /> Use the search bar to add members to your
        project.
      </Typography>
      <div className={classes.memberContainer}>
        {projectMembers.map((m, index) => {
          return (
            <MiniProfileInput
              key={index}
              className={classes.member}
              profile={m}
              onDelete={() => handleRemoveMember(m)}
              availabilityOptions={availabilityOptions}
            />
          );
        })}
      </div>
    </div>
  );
}
