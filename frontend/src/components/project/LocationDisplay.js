import { makeStyles, Tooltip, Typography } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    marginBottom: -2,
    marginRight: theme.spacing(0.5),
  },
}));

export default function LocationDisplay({
  location,
  textClassName,
  color,
  iconClassName,
  className,
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const classes = useStyles();
  return (
    <Tooltip title={texts.location}>
      <div className={`${classes.root} ${className}`}>
        <PlaceIcon className={iconClassName} color={color} />
        <Typography className={textClassName}>{location}</Typography>
      </div>
    </Tooltip>
  );
}
