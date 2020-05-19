import React from "react";
import { Typography } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center",
      marginLeft: 75,
      marginRight: 75,
      marginBottom: 60
    },
    image: {
      width: 250,
      height: 250,
      alignSelf: "center",
      borderRadius: 200
    },
    name: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(0.5)
    },
    location: {
      display: "inline-block",
      textAlign: "center"
    },
    locationIcon: {
      paddingRight: theme.spacing(1),
      fontSize: 35,
      marginBottom: -8
    }
  };
});

export default function Member({ member }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <img className={classes.image} src={"images/" + member.image} />
      <Typography variant="h4" color="primary" className={classes.name}>
        {member.name}
      </Typography>
      <div>
        <Typography variant="h6" color="secondary" className={classes.location}>
          <PlaceIcon className={classes.locationIcon} />
          {member.location}
        </Typography>
      </div>
    </div>
  );
}
