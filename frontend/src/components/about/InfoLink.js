import React from "react";
import Link from "next/link";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center",
      marginBottom: theme.spacing(8)
    },
    linkText: {
      textDecoration: "underline",
      color: "inherit"
    },
    icon: {
      marginRight: theme.spacing(1),
      fontSize: 35,
      marginBottom: -5
    }
  };
});

export default function InfoLink({ data }) {
  const classes = useStyles();

  //use <Link> component only if link href is also on the climateconnect.earth domain
  if (data.internal)
    return (
      <Typography variant="h4" color="primary" className={classes.root}>
        <Link href={data.href}>
          <a className={classes.linkText}>
            <data.icon className={classes.icon} name={data.iconName} />
            {data.text}
          </a>
        </Link>
      </Typography>
    );
  else
    return (
      <Typography variant="h4" color="primary" className={classes.root}>
        <a href={data.href} className={classes.linkText} target="_blank" rel="noopener noreferrer">
          <data.icon className={classes.icon} name={data.iconName} />
          {data.text}
        </a>
      </Typography>
    );
}
