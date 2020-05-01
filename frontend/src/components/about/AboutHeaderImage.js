import React from "react";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    imageContainer: image => ({
      width: "100%",
      height: 373,
      backgroundImage: image.url,
      backgroundPosition: "center",
      backgroundSize: "cover",
      marginBottom: theme.spacing(2.5),
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center"
    }),
    headlineText: {
      color: "white",
      border: "5px solid white",
      display: "inline-block",
      margin: "0 auto",
      paddingTop: "3%",
      paddingBottom: "3%",
      paddingRight: "5%",
      paddingLeft: "5%",
      textTransform: "uppercase",
      textShadow: "3px 3px 4px black"
    }
  };
});

export default function AboutHeaderImage() {
  const image = { url: `url("images/about_background.jpg")` };
  const classes = useStyles(image);
  return (
    <Container className={classes.imageContainer} maxWidth={false}>
      <Typography variant="h1" className={classes.headlineText}>
        Climate Connect
      </Typography>
    </Container>
  );
}
