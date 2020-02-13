import React from "react";
import Router from "next/router";
import OrganisationMetaData from "./OrganisationMetadata";
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
      borderRadius: 0,
      textAlign: "center"
    },
    bold: {
      fontWeight: "bold"
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block"
    },
    media: {
      height: 80,
      backgroundSize: "contain",
      margin: "0 auto",
      marginTop: theme.spacing(3),
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      verticalAlign: "center"
    }
  };
});

export default function OrganisationPreview({ organisation }) {
  const classes = useStyles();

  return (
    <Card
      className={classes.root}
      variant="outlined"
      onClick={() => {
        Router.push(`/organisations/${organisation.url}`);
      }}
    >
      <CardMedia
        className={classes.media}
        component={"div"}
        title={organisation.name}
        image={organisation.logo}
      />
      <CardContent>
        <Typography variant="subtitle1" component="h2" className={classes.bold}>
          {organisation.name}
        </Typography>
        <OrganisationMetaData organisation={organisation} />
      </CardContent>
    </Card>
  );
}
