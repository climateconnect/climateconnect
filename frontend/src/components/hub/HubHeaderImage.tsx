import { Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles<Theme, any>((theme) => ({
  imageContainer: (props) => ({
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPosition: "bottom center",
    zIndex: -1,
    width: "100%",
    isLocationHub: {
      marginTop: 200,
    },
    [theme.breakpoints.down("md")]: {
      minHeight: 100,
      backgroundSize: "cover",
    },
    position: "relative",
    [theme.breakpoints.up("md")]: {
      position: props.isLocationHub ? "absolute" : "relative", // we want to have absolute positioning when its a location hub and user is not logged out
      zIndex: -1,
      minHeight: 200,
    },
  }),
  img: (props) => ({
    width: props.fullWidth ? "80%" : "50%",
    visibility: "hidden",
  }),
  attribution: {
    float: "right",
    fontSize: 12,
    marginRight: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    fontWeight: "bold",
    fontSize: 30,
    cursor: "pointer",
  },
}));

export default function HubHeaderImage({ image, source, fullWidth, isLocationHub }: any) {
  const { locale } = useContext(UserContext);

  const classes = useStyles({
    image: image,
    fullWidth: fullWidth,
    isLocationHub: isLocationHub,
  });

  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <>
      <div className={classes.imageContainer}>
        <img src={image} className={classes.img} alt="hub header" />
      </div>
      {source && (
        <Typography className={classes.attribution}>
          {texts.image}: {source}
        </Typography>
      )}
    </>
  );
}
