import React from "react";
import Router from "next/router";
import { Typography, Card, CardMedia, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      "&:hover": {
        cursor: "pointer"
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: "inherit",
      borderRadius: 0
    },
    bold: {
      fontWeight: "bold"
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block"
    }
  };
});

export default function ProfilePreview({ profile }) {
  const classes = useStyles();

  return (
    <Card
      className={classes.root}
      variant="outlined"
      onClick={() => {
        Router.push(`/profiles/${profile.url}`);
      }}
    >
      <CardMedia
        className={classes.media}
        component={"img"}
        title={profile.name}
        image={"/images/" + profile.image}
      />
      <CardContent>
        <Typography variant="subtitle1" component="h2" className={classes.bold}>
          {profile.name}
        </Typography>
      </CardContent>
    </Card>
  );
}
