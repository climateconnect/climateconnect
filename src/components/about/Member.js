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
    location: {
      display: "inline-block",
      marginRight: theme.spacing(6)
    }
  };
});

export default function Member({ member }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box component="img" className={classes.image} src={"images/" + member.image} />
      <Typography variant="h4" color="primary">
        {member.name}
      </Typography>
      <div>
        <Typography variant="h5" color="secondary" className={classes.location}>
          <Icon className="fa fa-map-marker-alt" />
          {member.location}
        </Typography>
      </div>
    </div>
  );
}
