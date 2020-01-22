import React from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  imageContainer: image => ({
    width: "100%",
    height: 373,
    backgroundImage: image.url,
    backgroundPosition: "center",
    backgroundSize: "cover",
    marginBottom: 75,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center"
  }),
  headlineText: {
    color: "white",
    fontSize: 85,
    border: "5px solid white",
    display: "inline-block",
    margin: "0 auto",
    paddingTop: "3%",
    paddingBottom: "3%",
    paddingRight: "10%",
    paddingLeft: "10%"
  }
});

//props: {headerImage:`url("images/imagepath")`}
export default function AboutHeaderImage({ image }) {
  console.log(image);
  const classes = useStyles(image);
  console.log(classes);
  return (
    <Container className={classes.imageContainer} maxWidth={false}>
      <div className={classes.headlineText}>CLIMATE CONNECT</div>
    </Container>
  );
}
