import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => {
  return {
    outerContainer: {
      paddingTop: theme.spacing(2),
      maxWidth: 1280,
      margin: "0 auto",
      [theme.breakpoints.down("sm")]: {
        paddingTop: theme.spacing(1),
      },
    },
    storyIconBox: {
      flex: "0 0 75px",
      height: 150,
      overflow: "hidden",
      backgroundRepeat: "no-repeat",
      backgroundSize: "150px 150px",
      [theme.breakpoints.up("lg")]: {
        flex: "0 0 150px",
      },
    },
    storyIconBoxLeft: {
      backgroundPosition: "right",
    },
    storyIconBoxRight: {
      backgroundPosition: "left",
    },
    headingContainer: {
      display: "flex",
      alignItems: "top",
      justifyContent: "space-between",
      marginTop: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
        marginBottom: theme.spacing(2),
      },
    },
    content: {
      alignSelf: "center",
    },
    contentHeader: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(-1),
    },
    contentHeaderLoggedIn: {
      marginBottom: theme.spacing(-3),
    },
    textContent: {
      textAlign: "center",
      fontSize: 20,
      color: theme.palette.secondary.main,
      [theme.breakpoints.down("sm")]: {
        fontSize: 15,
      },
    },
    signUpButtonBox: {
      marginTop: theme.spacing(1),
      display: "flex",
      justifyContent: "center",
    },
    shareLink: {
      textDecoration: "none",
      color: "white",
    },
  };
});

const getCarouselContent = (texts) => [
  {
    headline: texts.climate_action_platform,
    text: [texts.climate_action_platform_text],
    images: [
      {
        link: "/icons/mainpage-left.svg",
      },
      {
        link: "/icons/mainpage-right.svg",
      },
    ],
  },
  {
    headline: texts.get_inspired,
    text: [texts.get_inspired_text],
    images: [
      {
        link: "/icons/mainpage-right.svg",
      },
      {
        link: "/icons/mainpage-creativity.svg",
      },
    ],
  },
  {
    headline: texts.share_your_solutions,
    text: [texts.share_your_solutions_text_1, texts.share_your_solutions_text_2],
    images: [
      {
        link: "/icons/mainpage-creativity.svg",
      },
      {
        link: "/icons/mainpage-team.svg",
      },
    ],
  },
  {
    headline: texts.spread_solutions_globally,
    text: [texts.spread_solutions_globally_text_1, texts.spread_solutions_globally_text_2],
    images: [
      {
        link: "/icons/mainpage-team.svg",
      },
      {
        link: "/icons/mainpage-resume.svg",
      },
    ],
  },
  {
    headline: texts.connect_with_the_right_people,
    text: [texts.connect_with_the_right_people_text],
    images: [
      {
        link: "/icons/mainpage-resume.svg",
      },
      {
        link: "/icons/mainpage-team.svg",
      },
    ],
  },
  {
    headline: texts.world_wide_collaboration,
    text: [texts.world_wide_collaboration_text_1, texts.world_wide_collaboration_text_2],
    images: [
      {
        link: "/icons/mainpage-team.svg",
      },
      {
        link: "/icons/mainpage-left.svg",
      },
    ],
  },
];

const responsive = {
  all: {
    breakpoint: { max: 10000, min: 0 },
    items: 1,
  },
};

export default function MainHeadingContainerMobile() {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const carouselContent = getCarouselContent(texts);

  return (
    <div className={classes.outerContainer}>
      <Carousel
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={5000}
      >
        {carouselContent.map((c, index) => (
          <div key={index}>
            <Typography
              key={index}
              color="primary"
              className={`${classes.contentHeader} ${user && classes.contentHeaderLoggedIn}`}
            >
              {c.headline}
            </Typography>
            <div className={classes.headingContainer}>
              <div
                className={`${classes.storyIconBox} ${classes.storyIconBoxLeft}`}
                style={{ backgroundImage: `url(${c.images[0].link})` }}
              />
              <div className={classes.content}>
                {c.text.map((textPiece, index) => (
                  <Typography key={index} className={classes.textContent}>
                    {textPiece}
                  </Typography>
                ))}
                {!user && (
                  <div className={classes.signUpButtonBox}>
                    <Button
                      component="div"
                      href={getLocalePrefix(locale) + "/signup"}
                      variant="contained"
                      color="primary"
                    >
                      <a className={classes.shareLink} href={getLocalePrefix(locale) + "/signup"}>
                        {texts.join_now}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div
                className={`${classes.storyIconBox} ${classes.storyIconBoxRight}`}
                style={{ backgroundImage: `url(${c.images[1].link})` }}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
