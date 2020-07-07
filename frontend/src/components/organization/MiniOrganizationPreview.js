import React from "react";
import { Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { getImageUrl } from "./../../../public/lib/imageOperations";

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

export default function MiniOrganizationPreview({ organization, className, size, onDelete }) {
  const classes = useStyles();
  return (
    <a className={className}>
      <img
        src={getImageUrl(organization.image)}
        className={`${classes.orgImage} ${size === "small" && classes.smallOrgImage}`}
      />
      {size === "small" ? (
        <>{organization.name}</>
      ) : (
        <Typography variant="h5" className={classes.orgName}>
          {organization.name}
        </Typography>
      )}
      {onDelete && (
        <IconButton onClick={() => onDelete(organization)}>
          <CloseIcon />
        </IconButton>
      )}
    </a>
  );
}
