import { makeStyles, Tooltip } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  hubIcon: {
    color: theme.palette.primary.main,
    fill: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
  },
}));

export default function IdeaHubIcon({ idea, className }) {
  const classes = useStyles();
  return (
    <Tooltip title={idea.hub.name}>
      <img src={getImageUrl(idea.hub.icon)} className={`${classes.hubIcon} ${className}`} />
    </Tooltip>
  );
}
