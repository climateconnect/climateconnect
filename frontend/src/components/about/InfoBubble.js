import React from "react";
import { Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    bubble: {
      minWidth: 180,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      textAlign: "center"
    },
    icon: {
      width: 90,
      height: 90,
      display: "block",
      margin: "0 auto"
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
    <div className={classes.bubble}>
      <Box>
        <data.icon
          name={data.iconName}
          className={`${classes.icon}`}
          color="primary"
          style={{ fontSize: 60 }}
        />
      </Box>
      <Typography variant="h4" color="secondary" className={classes.title}>
        {data.title}
      </Typography>
    </div>
  );
}
