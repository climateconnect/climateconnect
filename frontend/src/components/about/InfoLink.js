import React from "react";
import Link from "next/link";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center",
      display: "flex",
      flex: 1
    },
    link: {
      color: "inherit",
      display: "block",
      margin: "0 auto"
    },
    linkText: {
      textDecoration: "underline",
      color: theme.palette.secondary.main
    },
    icon: {
      width: 90,
      height: 90
    }
  };
});

export default function InfoLink({ data }) {
  const classes = useStyles();

  //use <Link> component only if link href is also on the climateconnect.earth domain
  return (
    <Typography variant="h4" color="primary" className={classes.root}>
      {data.internal ? (
        <Link href={data.href}>
          <a className={classes.link}>
            <data.icon className={classes.icon} name={data.iconName} />
            <div className={classes.linkText}>{data.text}</div>
          </a>
        </Link>
      ) : (
        <a href={data.href} className={classes.link} target="_blank" rel="noopener noreferrer">
          <data.icon className={classes.icon} name={data.iconName} />
          <div className={classes.linkText}>{data.text}</div>
        </a>
      )}
    </Typography>
  );
}
