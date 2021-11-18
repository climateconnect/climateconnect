import { Avatar, Chip, makeStyles } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
  },
  chip: {
    borderRadius: 100,
    width: 140,
    marginTop: theme.spacing(-3),
    zIndex: 1,
  },
}));

export default function OrganizationAvatar({ organization }) {
  const classes = useStyles();
  const type = organization?.types[0]?.organization_tag;
  return (
    <div className={classes.root}>
      <Avatar size="large" src={getImageUrl(organization.image)} className={classes.avatar} />
      <Chip color="primary" size="small" label={type?.name} className={classes.chip} />
    </div>
  );
}
