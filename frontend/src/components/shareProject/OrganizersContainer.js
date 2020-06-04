import React from "react";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    openDialogLink: {
      color: theme.palette.primary.main,
      textDecoration: "underline",
      cursor: "pointer"
    },
    header: {
      marginBottom: theme.spacing(2),
      fontSize: 20
    }
  };
});

export default function OrganizersContainer({ parentOrganization, blockClassName }) {
  const classes = useStyles();
  return (
    <div>
      <Typography component="h2" variant="subtitle2" className={classes.header}>
        Responsible Organization
      </Typography>
      <div className={blockClassName}>
        <MiniOrganizationPreview organization={parentOrganization} type="parentOrganization" />
      </div>
      <Typography className={classes.openDialogLink}>Add collaborating organizations</Typography>
    </div>
  );
}
