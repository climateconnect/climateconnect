import { Button, Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import getPitchElements from "../../../../public/data/pitch_elements";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";
import CustomDot from "../../general/CustomDot";

const useStyles = makeStyles<Theme, { img?: string }>((theme) => ({
  root: {
    marginTop: theme.spacing(8),
  },
  elementRoot: {
    display: "flex",
    paddingRight: theme.spacing(14),
    paddingLeft: theme.spacing(14),
    [theme.breakpoints.down("lg")]: {
      flexDirection: "column",
      maxWidth: 440,
      justifyContent: "center",
      margin: "0 auto",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  imageBackground: {
    background: theme.palette.primary.light,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down("lg")]: {
      background: "transparent",
      flexBasis: 0,
    },
  },
  imageWrapper: (props) => ({
    background: `url('${props?.img}')`,
    backgroundSize: "contain",
  }),
  image: {
    visibility: "hidden",
    width: "100%",
    height: "100%",
  },
  textSection: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 15,
  },
  carousel: {
    marginTop: theme.spacing(6),
    paddingBottom: theme.spacing(5),
  },
  elementHeadline: {
    fontSize: 23,
    fontWeight: 600,
    [theme.breakpoints.down("lg")]: {
      marginBottom: theme.spacing(3),
    },
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
    cursor: "pointer",
  },
  arrowContainerRight: {
    right: "calc(4% + 1px)",
  },
  arrowContainerLeft: {
    left: "calc(4% + 1px)",
  },
}));

const responsive = {
  all: {
    breakpoint: { max: 10000, min: 0 },
    items: 1,
  },
};

export default function HowItWorks({ headlineClass }) {
  const classes = useStyles({});
  const isSmallerScreen = useMediaQuery<Theme>(theme.breakpoints.down("lg"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  const pitch_elements = getPitchElements(texts);
  return (
    <Container className={classes.root}>
      <Typography color="primary" className={headlineClass}>
        {texts.how_climate_connect_works}
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
            link={getLocalePrefix(locale) + e.link}
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
  const classes = useStyles({ img });
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
          <div /*TODO(undefined) className={classes.buttonWrapper}*/>
            <Button variant="contained" color="primary" href={link}>
              {linkText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomArrow = ({ direction, onClick }: { direction; onClick? }) => {
  const classes = useStyles({});
  return (
    <div
      className={`${classes.arrowContainer} ${
        direction === "left" ? classes.arrowContainerLeft : classes.arrowContainerRight
      }`}
      onClick={() => onClick()}
    >
      {direction === "left" ? (
        <ArrowBackIcon color="primary" /*TODO(undefined) className={classes.arrow} */ />
      ) : (
        <ArrowForwardIcon color="primary" /*TODO(undefined) className={classes.arrow} */ />
      )}
    </div>
  );
};
