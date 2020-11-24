import React from "react";
import { makeStyles, Container, Typography, Button } from "@material-ui/core";
import Carousel from "react-multi-carousel";
import pitch_elements from "../../../public/data/pitch_elements.json";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(8)
  },
  elementRoot: {
    display: "flex",
    paddingRight: theme.spacing(14),
    paddingLeft: theme.spacing(14)
  },
  imageWrapper: {
    background: theme.palette.primary.light,
    flexBasis: 450,
    flexShrink: 0,
    height: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(4)
  },
  image: {},
  textSection: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  carousel: {
    marginTop: theme.spacing(6)
  },
  elementHeadline: {
    fontSize: 23,
    fontWeight: 600
  },
  arrowContainer: {
    position: "absolute",
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: "100%",
    width: 30,
    height: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer"
  },
  arrowContainerRight: {
    right: "calc(4% + 1px)"
  },
  arrowContainerLeft: {
    left: "calc(4% + 1px)"
  }
}));

const responsive = {
  all: {
    breakpoint: { max: 10000, min: 0 },
    items: 1
  }
};

export default function HowItWorks({ headlineClass }) {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Typography color="primary" className={headlineClass}>
        How Climate Connect Works
      </Typography>
      <Carousel
        responsive={responsive}
        infinite
        arrows
        autoPlay
        autoPlaySpeed={7000}
        className={classes.carousel}
        customRightArrow={<CustomArrow direction="right" />}
        customLeftArrow={<CustomArrow direction="left" />}
      >
        {pitch_elements.map((e, index) => (
          <Element
            headline={e.headline}
            text={e.text}
            link={e.link}
            img={e.img}
            key={index}
            linkText={e.linkText}
          />
        ))}
      </Carousel>
    </Container>
  );
}

const Element = ({ headline, text, link, img, linkText }) => {
  const classes = useStyles();
  return (
    <div className={classes.elementRoot}>
      <div className={classes.imageWrapper}>
        <img src={img} className={classes.image} />
      </div>
      <div className={classes.textSection}>
        <Typography color="primary" component="h2" className={classes.elementHeadline}>
          {headline}
        </Typography>
        <Typography>{text}</Typography>
        <div className={classes.buttonWrapper}>
          <Button variant="contained" color="primary" href={link}>
            {linkText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomArrow = ({ direction, onClick }) => {
  const classes = useStyles();
  return (
    <div
      className={`${classes.arrowContainer} ${
        direction === "left" ? classes.arrowContainerLeft : classes.arrowContainerRight
      }`}
      onClick={() => onClick()}
    >
      {direction === "left" ? (
        <ArrowBackIcon color="primary" className={classes.arrow} />
      ) : (
        <ArrowForwardIcon color="primary" className={classes.arrow} />
      )}
    </div>
  );
};
