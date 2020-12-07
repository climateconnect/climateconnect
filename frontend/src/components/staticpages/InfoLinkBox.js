import React from "react";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  infoLinkBox: props => ({
    display: "flex",
    alignItems: "center",
    maxWidth: 600,
    marginLeft: props.centerContent ? theme.spacing(5) : 0,
    background: "#E6E5E5",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: 700,
      margin: "0 auto",
      marginTop: theme.spacing(3)
    }
  }),
  icon: props => ({
    marginRight: props.centerContent ? 0 : theme.spacing(3),
    width: 80,
    ["@media (max-width: 400px)"]: {
      width: 45
    }
  }),
  headline: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    ["@media (max-width: 400px)"]: {
      fontSize: 21
    }
  },
  text: {
    fontWeight: 600
  }
}));

export default function InfoLinkBox({
  className,
  iconSrc,
  iconAlt,
  text,
  headline,
  children,
  centerContent
}) {
  const classes = useStyles({ centerContent: centerContent });
  return (
    <div className={`${classes.infoLinkBox} ${className}`}>
      <img src={iconSrc} className={classes.icon} alt={iconAlt} />
      <div>
        <Typography color="primary" component="h2" className={classes.headline}>
          {headline}
        </Typography>
        <Typography color="secondary" className={classes.text}>
          {text}
        </Typography>
        {children}
      </div>
    </div>
  );
}
