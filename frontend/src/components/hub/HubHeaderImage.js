import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPosition: "bottom center",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      minHeight: 100,
      backgroundSize: "cover",
    },
  }),
  img: (props) => ({
    width: props.fullWidth ? "80%" : "50%",
    visibility: "hidden",
  }),
}));

export default function HubHeaderImage({ image, fullWidth }) {
  const classes = useStyles({ image: image, fullWidth: fullWidth });
  return (
    <div className={classes.root}>
      <img src={image} className={classes.img} />
    </div>
  );
}
