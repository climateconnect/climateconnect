import React from "react";
import { Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const useStyles = makeStyles<Theme, { background?: string; image?: string }>((theme) => ({
  wrapper: {
    position: "relative",
    ["&:hover #hover-image-container"]: {
      transform: "scale(0.3)",
      transitionDuration: "0.5s",
      transformOrigin: "0% 100%",
    },
  },
  imageContainer: (props) => ({
    background: `url('${props.image}')`,
    transformOrigin: "0% 100%",
    transitionDuration: "0.5s",
    backgroundSize: "contain",
    backgroundRepeat: "none",
    height: "100%",
    width: "100%",
    position: "relative",
    zIndex: 1,
  }),
  image: {
    width: "100%",
    height: "100%",
  },
  backgroundDiv: (props) => ({
    position: "absolute",
    background:
      props.background === "primary" ? theme.palette.primary.main : theme.palette.yellow.main,
    top: -20,
    bottom: 20,
    right: -20,
    left: 20,
    textAlign: "center",
  }),
  text: {
    fontWeight: 600,
    fontSize: 14,
  },
  textDivInnerWrapper: {
    position: "relative",
    padding: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  arrowIcon: (props) => ({
    position: "absolute",
    top: 0,
    right: 0,
    transform: "rotate(-45deg)",
    fontSize: 22,
    color: props.background === "primary" ? "white" : theme.palette.primary.main,
  }),
}));

export default function HoverImage({ src, text, className, background }: any) {
  const classes = useStyles({ image: src, background });
  return (
    <div className={className}>
      <div className={classes.wrapper}>
        <div className={classes.imageContainer} id="hover-image-container">
          <img src={src} className={classes.image} />
        </div>
        <div className={classes.backgroundDiv}>
          <div className={classes.textDivInnerWrapper}>
            <ArrowBackIcon className={classes.arrowIcon} />
            {<Text text={text} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({ text }) {
  const classes = useStyles({});
  return <Typography className={classes.text}>{text}</Typography>;
}
