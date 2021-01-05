import React from "react";
import { makeStyles, Typography } from "@material-ui/core";

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
  attribution: {
    float: "right",
    fontSize: 12,
    marginRight: theme.spacing(2)
  }
}));

export default function HubHeaderImage({ image, source,  fullWidth }) {
  const classes = useStyles({ image: image, fullWidth: fullWidth });
  return (
    <>
      <div className={classes.root}>
        <img src={image} className={classes.img} />
      </div>
      {source &&
        <Typography className={classes.attribution}>Image: {source}</Typography>
      }
    </>
  );
}
