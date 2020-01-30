import React from "react";
import { Typography, Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      width: 450,
      padding: 0,
      textAlign: "center",
      display: "inline-block",
      verticalAlign: "top",
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
      alignSelf: "center",
      margin: "auto",
      marginBottom: theme.spacing(6),
      "@media (max-width:600px)": {
        width: 350,
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    bubble: {
      width: 150,
      height: 150,
      padding: 0,
      border: "1px solid black",
      borderRadius: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    },
    icon: {
      width: "auto"
    },
    title: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    },
    infoText: {
      fontSize: 20
    }
  };
});

export default function InfoBubble({ data }) {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <div>
        <Container className={classes.bubble}>
          <Box>
            <data.icon className={`${classes.icon}`} color="primary" style={{ fontSize: 60 }} />
          </Box>
        </Container>
      </div>
      <Typography variant="h4" color="primary" className={classes.title}>
        {data.title}
      </Typography>
      <Typography lineheight={30} color="secondary" className={classes.infoText}>
        {data.text}
      </Typography>
    </Container>
  );
}
