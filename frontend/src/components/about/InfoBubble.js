import React from "react";
import { Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    bubble: props => ({
      minWidth: props.size !== "small" && 180,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      textAlign: "center"
    }),
    icon: props => ({
      width: props.size === "small" ? 45 : props.size === "medium" ? 60 : 90,
      height: props.size === "small" ? 45 : props.size === "medium" ? 60 : 90,
      display: "block",
      margin: "0 auto"
    }),
    title: props => ({
      fontSize: (props.size === "small" && 14) || (props.size === "medium" && 20),
      fontWeight: props.size === "small" && "bold",
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(2)
    }),
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

export default function InfoBubble({ data, iconColor, textColor, bold, maxWidth, size }) {
  const classes = useStyles({ maxWidth: maxWidth, size: size });
  return (
    <div className={classes.bubble}>
      <Box>
        <data.icon
          name={data.iconName}
          className={`${classes.icon}`}
          color={iconColor ? iconColor : "primary"}
          style={{ fontSize: 60 }}
        />
      </Box>
      <Typography
        variant="h4"
        className={`${classes.title} ${bold && classes.bold} ${maxWidth && classes.maxWidth}`}
        color={textColor ? textColor : "secondary"}
      >
        {data.title}
      </Typography>
    </div>
  );
}
