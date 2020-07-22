import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    imageContainer: props => ({
      width: "100%",
      [theme.breakpoints.down("xs")]: {
        marginBottom: theme.spacing(1)
      },
      position: "relative",
      textAlign: "center",
      backgroundImage: "url(" + props.image + ")",
      backgroundSize: "cover",
      height: 250,
      [theme.breakpoints.down("xs")]: {
        height: 180
      }
    })
  };
});

export default function HeaderImage({ src, children, className }) {
  const classes = useStyles({ image: src });
  return <div className={`${classes.imageContainer} ${className}`}>{children}</div>;
}
