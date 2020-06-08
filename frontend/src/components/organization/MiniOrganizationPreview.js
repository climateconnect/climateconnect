import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  orgImage: {
    height: 35,
    marginRight: theme.spacing(1),
    marginBottom: -7.5
  },
  smallOrgImage: {
    height: 20,
    marginBottom: -5
  },
  orgName: {
    display: "inline-block"
  }
}));

export default function MiniOrganizationPreview({ organization, className, size }) {
  const classes = useStyles();
  return (
    <Box className={className}>
      <img
        src={organization.image}
        className={`${classes.orgImage} ${size === "small" && classes.smallOrgImage}`}
      />
      {size === "small" ? (
        <>{organization.name}</>
      ) : (
        <Typography variant="h5" className={classes.orgName}>
          {organization.name}
        </Typography>
      )}
    </Box>
  );
}
