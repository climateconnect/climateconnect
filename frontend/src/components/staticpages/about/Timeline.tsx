import { Container, Divider, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";
import CustomDot from "../../general/CustomDot";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
  },
  headline: {
    maxWidth: 800,
    textAlign: "center",
    margin: "0 auto",
  },
  timelineElementsWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(6),
  },
  timelineElement: {
    maxWidth: 250,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    textAlign: "center",
  },
  date: {
    fontSize: 30,
    fontWeight: "bold",
  },
  timelineElDivider: {
    background: theme.palette.yellow.main,
    height: theme.spacing(0.75),
    maxWidth: "50%",
    margin: "0 auto",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  elementHeadline: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  carouselElement: {
    margin: "0 auto",
  },
  carousel: {
    paddingBottom: theme.spacing(5),
    marginTop: theme.spacing(6),
  },
}));

export default function Timeline({ headlineClass }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.only("md"));
  const useCarousel = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };

  return (
    <Container className={classes.root}>
      {!isNarrowScreen && (
        <Typography
          color="primary"
          component="h1"
          className={`${headlineClass} ${classes.headline}`}
        >
          {texts.after_realizing_the_need_for_global_collaboration}
        </Typography>
      )}
      {!useCarousel ? (
        <div className={classes.timelineElementsWrapper}>
          {getTimelineData(isMediumScreen, texts).map((d, index) => (
            <TimelineElement
              key={index}
              className={classes.timelineElement}
              date={d.date}
              headline={d.headline}
              content={d.content}
            />
          ))}
        </div>
      ) : (
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={5000}
          showDots
          arrows={false}
          className={classes.carousel}
          customDot={<CustomDot />}
        >
          {getTimelineData(isMediumScreen, texts).map((d, index) => (
            <TimelineElement
              key={index}
              className={`${classes.timelineElement} ${classes.carouselElement}`}
              date={d.date}
              headline={d.headline}
              content={d.content}
            />
          ))}
        </Carousel>
      )}
    </Container>
  );
}

const getTimelineData = (isMediumScreen, texts) => [
  {
    date: texts.july + " 2019",
    headline: texts.the_idea_is_born,
    content: texts.the_idea_is_born_text,
  },
  {
    date: isMediumScreen ? texts.november_short + " 2019" : texts.november + " 2019",
    headline: texts.first_prototype,
    content: texts.first_prototype_text,
  },
  {
    date: texts.july + " 2020",
    headline: texts.beta_launch,
    content: texts.beta_launch_text,
  },
  {
    date: texts.winter + " 2021/22",
    headline: texts.leaving_beta,
    content: texts.leaving_beta_text,
  },
];

const TimelineElement = ({ date, headline, content, className }) => {
  const classes = useStyles();
  return (
    <div className={className}>
      <Typography color="secondary" className={classes.date}>
        {date}
      </Typography>
      <Divider className={classes.timelineElDivider} />
      <Typography color="primary" component="h3" className={classes.elementHeadline}>
        {headline}
      </Typography>
      <Typography>{content}</Typography>
    </div>
  );
};
