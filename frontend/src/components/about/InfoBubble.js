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
    },
    bold: {
      fontWeight: 600
    },
    maxWidth: props => ({
      maxWidth: props.maxWidth,
      textAlign: "center"
    })
  };
});

export default function InfoBubble({ data, iconColor, textColor, bold, maxWidth }) {
  const classes = useStyles({maxWidth: maxWidth});
  return (
    <div className={classes.bubble}>
      <Box>
        <data.icon
          name={data.iconName}
          className={`${classes.icon}`}
          color= {iconColor ? iconColor : "primary"}
          style={{ fontSize: 60 }}
        />
      </Box>
      <Typography variant="h4" color="secondary" className={`${classes.title} ${bold && classes.bold} ${maxWidth && classes.maxWidth}`} color={textColor&&textColor}>
        {data.title}
      </Typography>
    </div>
  );
}
