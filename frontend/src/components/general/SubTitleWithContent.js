import React from "react";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  subtitleWithIcon: {
    display: "flex",
    alignItems: "center",
    color: `${theme.palette.secondary.main}`,
    fontWeight: 700,
    minWidth: 200,
    fontSize: 15,
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold",
  },
  content: {
    paddingBottom: theme.spacing(2),
    color: `${theme.palette.secondary.main}`,
    fontSize: 16,
  },
  marginRight: {
    marginRight: theme.spacing(0.5),
  },
  iconAndTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },
}));

export default function SubTitleWithContent({ subTitleIcon, subtitle, content }) {
  const classes = useStyles();
  return (
    <>
      <div className={`${subTitleIcon ? classes.subtitleWithIcon : classes.subtitle}`}>
        {subTitleIcon?.icon ? (
          <div className={classes.iconAndTitleWrapper}>
            <subTitleIcon.icon />
            <div className={classes.marginRight} />
            {subtitle}
          </div>
        ) : (
          <>{subtitle}</>
        )}
      </div>
      <div className={classes.content}>{content}</div>
    </>
  );
}
