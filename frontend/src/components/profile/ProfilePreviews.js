import React from "react";
import ProfilePreview from "./ProfilePreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});

export default function ProfilePreviews({ profiles, allowMessage, additionalInfo }) {
  const classes = useStyles();

  // TODO: use `profile.id` instead of index when using real profiles
  return (
    <Grid container component="ul" className={classes.reset} spacing={2}>
      {profiles.map((profile, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} component="li" key={index}>
          <ProfilePreview
            profile={profile}
            allowMessage={allowMessage}
            additionalInfo={additionalInfo ? additionalInfo[index] : null}
          />
        </Grid>
      ))}
    </Grid>
  );
}
