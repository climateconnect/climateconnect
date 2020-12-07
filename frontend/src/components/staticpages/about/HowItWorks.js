import React from "react";
import { makeStyles, Container, Typography, Button, useMediaQuery } from "@material-ui/core";
import Carousel from "react-multi-carousel";
import pitch_elements from "../../../../public/data/pitch_elements.json";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import theme from "../../../themes/theme";
import CustomDot from "../../general/CustomDot";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(8)
  },
  elementRoot: {
    display: "flex",
    paddingRight: theme.spacing(14),
    paddingLeft: theme.spacing(14),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      maxWidth: 440,
      justifyContent: "center",
      margin: "0 auto",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    }
  },
  imageBackground: {
    background: theme.palette.primary.light,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(2)
    },
    [theme.breakpoints.down("md")]: {
      background: "transparent",
      flexBasis: 0
    }
  },
  imageWrapper: props => ({
    background: `url('${props.img}')`,
    backgroundSize: "contain"
  }),
  image: {
    visibility: "hidden",
    width: "100%",
    height: "100%"
  },
  textSection: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  carousel: {
    marginTop: theme.spacing(6),
    paddingBottom: theme.spacing(5)
  },
  elementHeadline: {
    fontSize: 23,
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(3)
    }
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
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down("md"));
  console.log(isSmallerScreen);
  return (
    <Container className={classes.root}>
      <Typography color="primary" className={headlineClass}>
        How Climate Connect Works
      </Typography>
      <Carousel
        responsive={responsive}
        infinite
        arrows={!isSmallerScreen}
        autoPlaySpeed={7000}
        showDots={isSmallerScreen}
        className={classes.carousel}
        customRightArrow={<CustomArrow direction="right" />}
        customLeftArrow={<CustomArrow direction="left" />}
        customDot={<CustomDot />}
      >
        {pitch_elements.map((e, index) => (
          <Element
            headline={e.headline}
            text={e.text}
            link={e.link}
            img={e.img}
            key={index}
            linkText={e.linkText}
            mobile={isSmallerScreen}
          />
        ))}
      </Carousel>
    </Container>
  );
}

const Element = ({ headline, text, link, img, linkText, mobile }) => {
  const classes = useStyles({ img: img });
  return (
    <div className={classes.elementRoot}>
      <div className={classes.imageBackground}>
        <div className={classes.imageWrapper}>
          <img src={img} className={classes.image} />
        </div>
      </div>
      <div className={classes.textSection}>
        <Typography color="primary" component="h2" className={classes.elementHeadline}>
          {headline}
        </Typography>
        <Typography>{text}</Typography>
        {!mobile && (
          <div className={classes.buttonWrapper}>
            <Button variant="contained" color="primary" href={link}>
              {linkText}
            </Button>
          </div>
        )}
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
