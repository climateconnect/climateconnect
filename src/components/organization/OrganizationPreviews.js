import React from "react";
import OrganizationPreview from "./OrganizationPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});

export default function OrgnanisationPreviews({ organizations }) {
  const classes = useStyles();

  // TODO: use `organization.id` instead of index when using real organizations
  return (
    <Grid container component="ul" className={`${classes.reset} ${classes.root}`} spacing={2}>
      {organizations.map((organization, index) => (
        <Grid item xs={6} sm={6} md={3} lg={3} component="li" key={index}>
          <OrganizationPreview organization={organization} />
        </Grid>
      ))}
    </Grid>
  );
}
