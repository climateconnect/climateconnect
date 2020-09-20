import React, { useContext } from "react";
import { Typography, makeStyles, Button } from "@material-ui/core";
import UserContext from "../context/UserContext";
import Carousel from "react-multi-carousel";

const useStyles = makeStyles(theme => {
  return {
    outerContainer: {
      paddingTop: theme.spacing(2),
      [theme.breakpoints.down("xs")]: {
        paddingTop: theme.spacing(1)
      }
    },
    storyIconBox: {
      flex: "0 0 75px",
      height: 150,
      overflow: "hidden",
      backgroundRepeat: "no-repeat",
      backgroundSize: "150px 150px"
    },
    storyIconBoxLeft: {
      backgroundPosition: "right"
    },
    storyIconBoxRight: {
      backgroundPosition: "left"
    },
    headingContainer: {
      display: "flex",
      alignItems: "top",
      justifyContent: "space-between",
      marginTop: theme.spacing(1),
      [theme.breakpoints.down("xs")]: {
        marginBottom: theme.spacing(2)
      }
    },
    content: {
      alignSelf: "center"
    },
    contentHeader: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(-1)
    },
    contentHeaderLoggedIn: {
      marginBottom: theme.spacing(-3)
    },
    textContent: {
      textAlign: "center",
      fontSize: 20,
      color: theme.palette.secondary.main,
      [theme.breakpoints.down("xs")]: {
        fontSize: 15
      }
    },
    signUpButtonBox: {
      marginTop: theme.spacing(1),
      display: "flex",
      justifyContent: "center"
    }
  };
});

const getCarouselContent = () => [
  {
    headline: "Climate action platform",
    text: [
      "Free climate action platform",
      "bringing everyone involved in climate action together."
    ],
    images: [
      {
        link: "/icons/mainpage-left.svg"
      },
      {
        link: "/icons/mainpage-right.svg"
      }
    ]
  },
  {
    headline: "Get inspired",
    text: [
      "Find inspiring climate projects to work on. See where you can make the biggest difference."
    ],
    images: [
      {
        link: "/icons/mainpage-right.svg"
      },
      {
        link: "/icons/mainpage-creativity.svg"
      }
    ]
  },
  {
    headline: "Share your solutions",
    text: [
      "Share your projects & ideas with the climate community!",
      "Find volunteers, partners and customers."
    ],
    images: [
      {
        link: "/icons/mainpage-creativity.svg"
      },
      {
        link: "/icons/mainpage-team.svg"
      }
    ]
  },
  {
    headline: "Spread solutions globally",
    text: [
      "Many great local solutions would work in many places!",
      "Share and find solutions to spread them worldwide."
    ],
    images: [
      {
        link: "/icons/mainpage-team.svg"
      },
      {
        link: "/icons/mainpage-resume.svg"
      }
    ]
  },
  {
    headline: "Connect with the right people",
    text: [
      "Filter for projects and people based on your skills, needs and interests. Maximize your positive impact on our planet."
    ],
    images: [
      {
        link: "/icons/mainpage-resume.svg"
      },
      {
        link: "/icons/mainpage-team.svg"
      }
    ]
  },
  {
    headline: "World wide collaboration",
    text: [
      "We need to all work together to protect our planet.",
      "Be part of the global climate community!"
    ],
    images: [
      {
        link: "/icons/mainpage-team.svg"
      },
      {
        link: "/icons/mainpage-left.svg"
      }
    ]
  }
];

const responsive = {
  all: {
    breakpoint: { max: 10000, min: 0 },
    items: 1
  }
};

export default function MainHeadingContainerMobile() {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  const carouselContent = getCarouselContent();

  return (
    <div className={classes.outerContainer}>
      <Carousel
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={7000}
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
                    <Button component="div" href="signup" variant="contained" color="primary">
                      <a className={classes.shareLink}>
                        <b>Join Now</b>
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
