import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  teamRoot: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  image: {
    width: "100%",
  },
  infoLinkBox: {
    flexDirection: "column",
    marginLeft: 0,
    marginRight: theme.spacing(5),
    flexBasis: 400,
    textAlign: "center",
  },
}));

export default function WhoWeAreContent() {
  const classes = useStyles();
  return (
    <div className={classes.teamRoot}>
      <div className={classes.imageContainer}>
        <div className={classes.imageWrapper}>
          <img src="/images/team.jpg" className={classes.image} />
        </div>
      </div>
    </div>
  );
}
