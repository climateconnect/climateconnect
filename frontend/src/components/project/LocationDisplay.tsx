import { Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PlaceIcon from "@mui/icons-material/Place";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.75),
    marginRight: theme.spacing(0.5),
  },
}));

export default function LocationDisplay({
  location,
  textClassName,
  color,
  iconClassName,
  className,
}: any) {
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
