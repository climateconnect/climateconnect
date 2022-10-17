import React from "react";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  subtitleWithIcon: {
    display: "flex",
    alignItems: "center",
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold",
    minWidth: 200,
   
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
}));

export default function SubTitleWithContent({ subTitleIcon, subtitle, content }) {
  const classes = useStyles();
  return (
    <>
      <div className={`${subTitleIcon ? classes.subtitleWithIcon : classes.subtitle}`}>
        {subTitleIcon?.icon ? (
          <>
            <subTitleIcon.icon />
            <div className={classes.marginRight} />
            {subtitle}
          </>
        ) : (
          <>{subtitle}</>
        )}
      </div>
      <div className={classes.content}>{content}</div>
    </>
  );
}
