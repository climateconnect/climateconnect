import React from "react";
import { Theme } from "@mui/material/styles";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles<Theme, { image: string }>((theme) => {
  return {
    imageContainer: (props) => ({
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        marginBottom: theme.spacing(1),
      },
      position: "relative",
      textAlign: "center",
      backgroundImage: "url(" + props.image + ")",
      backgroundSize: "cover",
      height: 250,
      [theme.breakpoints.down("sm")]: {
        height: 180,
      },
    }),
  };
});

export default function HeaderImage({ src, children, className }) {
  const classes = useStyles({ image: src });
  return <div className={`${classes.imageContainer} ${className}`}>{children}</div>;
}
