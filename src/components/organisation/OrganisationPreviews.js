import React from "react";
import OrganisationPreview from "./OrganisationPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});

export default function OrgnanisationPreviews({ organisations }) {
  const classes = useStyles();

  // TODO: use `organisation.id` instead of index when using real organisations
  return (
    <Grid container component="ul" className={`${classes.reset} ${classes.root}`} spacing={2}>
      {organisations.map((organisation, index) => (
        <Grid item xs={6} sm={6} md={3} lg={3} component="li" key={index}>
          <OrganisationPreview organisation={organisation} />
        </Grid>
      ))}
    </Grid>
  );
}
