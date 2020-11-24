import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import MosaicImage from "./MosaicImage";

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: "relative",
    ["&:hover #hover-image-container"]: {
      transform: "scale(0.3)",
      transitionDuration: "0.5s",
      transformOrigin: "0% 100%"
    }
  },
  imageContainer: props => ({
    background: `url('${props.image}')`,
    transformOrigin: "0% 100%",
    transitionDuration: "0.5s",
    backgroundSize: "contain",
    backgroundRepeat: "none",
    height: "100%",
    width: "100%",
    position: "relative",
    zIndex: 1
  }),
  image: {
    width: "100%",
    height: "100%"
  },
  backgroundDiv: props => ({
    position: "absolute",
    background:
      props.background === "primary" ? theme.palette.primary.main : theme.palette.yellow.main,
    top: -20,
    bottom: 20,
    right: -20,
    left: 20,
    textAlign: "center"
  }),
  text: {
    fontWeight: 600,
    fontSize: 14
  },
  textDivInnerWrapper: {
    position: "relative",
    padding: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%"
  },
  arrowIcon: props => ({
    position: "absolute",
    top: 0,
    right: 0,
    transform: "rotate(-45deg)",
    fontSize: 22,
    color: props.background === "primary" ? "white" : theme.palette.primary.main
  }),
  innerMosaicImage: {
    position: "absolute",
    top: 20,
    right: 20,
    bottom: -20,
    left: -20
  }
}));

export default function HoverImage({
  src,
  text,
  className,
  background,
  innerMosaicImage,
  itemsPerLine,
  itemsPerRow
}) {
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
          {text ? <Text /> : innerMosaicImage && <InnerMosaicImage mosaicImage={innerMosaicImage} itemsPerLine={itemsPerLine} itemsPerRow={itemsPerRow}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({ text }) {
  const classes = useStyles();
  return (        
    <Typography className={classes.text}>{text}</Typography>
  );
}

function InnerMosaicImage({mosaicImage, itemsPerLine, itemsPerRow}) {
  const classes = useStyles()
  return (
    <div className={classes.innerMosaicImage}>
      <MosaicImage items={mosaicImage} itemsPerLine={itemsPerLine} itemsPerRow={itemsPerRow}/>
    </div>
  )
}