import React from "react";
import Router from "next/router";
import {
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Box,
  Container
} from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
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
      backgroundColor: "#fafafa",
      border: 0,
      borderRadius: 0
    },
    bold: {
      fontWeight: "bold"
    },
    orgLogo: {
      height: "0.9rem",
      marginBottom: -2
    },
    cardInfo: {
      padding: 0
    },
    cardIconBox: {
      width: 40,
      display: "inline-block"
    },
    cardIcon: {
      verticalAlign: "bottom",
      marginBottom: -2,
      marginTop: 2
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block"
    }
  };
});

export default function ProjectPreview({ project }) {
  const classes = useStyles();

  return (
    <Card
      className={classes.root}
      variant="outlined"
      onClick={() => {
        Router.push(`/projects/${project.id}`);
      }}
    >
      <CardMedia
        className={classes.media}
        component={"img"}
        title={project.name}
        image={project.image}
      />
      <CardContent>
        <Typography variant="subtitle1" component="h2" className={classes.bold}>
          {project.name}
        </Typography>
        <Box>
          <span className={classes.cardIconBox}>
            <img src={project.organisation_image} className={`${classes.orgLogo} `} />
          </span>
          {project.organisation_name}
        </Box>
        <Box>
          <span className={classes.cardIconBox}>
            <PlaceIcon className={classes.cardIcon} />
          </span>
          {project.location}
        </Box>
        <Container>
          <Button variant="contained" size="small" color="primary" className={classes.button}>
            Get involved
          </Button>
        </Container>
      </CardContent>
    </Card>
  );
}
