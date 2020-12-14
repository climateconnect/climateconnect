import React from "react";
import { makeStyles } from "@material-ui/core";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPosition: "bottom center",
    width: "100%",
  }),
  img: {
    width: "50%",
    visibility: "hidden",
  },
}));

export default function HubHeaderImage({ image }) {
  const classes = useStyles({ image: getImageUrl(image) });
  return (
    <div className={classes.root}>
      <img src={getImageUrl(image)} className={classes.img} />
    </div>
  );
}
