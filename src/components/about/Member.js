import React from "react";
import { Box, Icon, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center",
      display: "inline-block",
      marginLeft: 75,
      marginRight: 75,
      marginBottom: 60
    },
    image: {
      width: 250,
      height: 250,
      alignSelf: "center"
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
      paddingRight: theme.spacing(1)
    }
  };
});

export default function Member({ member }) {
  const classes = useStyles();
  const locationIconClass = "fa fa-map-marker-alt";
  return (
    <div className={classes.root}>
      <Box component="img" className={classes.image} src={"images/" + member.image} />
      <Typography variant="h5" color="primary" className={classes.name}>
        {member.name}
      </Typography>
      <div>
        <Typography variant="h6" color="secondary" className={classes.location}>
          <Icon fontSize="small" className={`${classes.locationIcon} ${locationIconClass}`} />
          {member.location}
        </Typography>
      </div>
    </div>
  );
}
