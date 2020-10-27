import React from "react";
import {
  makeStyles,
  Typography,
  IconButton,
  Button,
  Link,
  Container,
  useMediaQuery
} from "@material-ui/core";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import AlternatingText from "../general/AlternatingText";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  root: {
    height: 700,
    background: theme.palette.primary.light,
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      height: "auto"
    }
  },
  container: {
    position: "relative"
  },
  headerCloud: {
    background: "url(/icons/header-cloud.svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: -20,
    left: -110,
    width: 350,
    height: 233,
    [theme.breakpoints.down("sm")]: {
      width: 300,
      height: 200
    },
    [theme.breakpoints.down("xs")]: {
      width: 270,
      backgroundImage: "url(/icons/header-cloud-mobile.svg)",
      top: -40,
      left: -90
    }
  },
  upperFlexWrapper: {
    display: "flex",
    alignItems: "center"
  },
  callToSignupAction: {
    background: "#F8F8F8",
    borderRadius: 40,
    paddingLeft: theme.spacing(6),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textAlign: "center",
    display: "flex",
    position: "absolute",
    top: 150,
    left: "calc(50% - 260px)",
    zIndex: 10,
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  bold: {
    fontWeight: "bold"
  },
  signUpButton: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(1)
  },
  lowerWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },
  lowerFlexWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 170,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      marginTop: 150
    }
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.palette.yellow.main,
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: 23
    },
    ["@media (max-width: 400px)"]: {
      fontSize: 17
    }
  },
  titleTextContainer: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: 23,
      textAlign: "center"
    },
    ["@media (max-width: 400px)"]: {
      fontSize: 17
    }
  },
  titleTextFirstLine: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
      textAlign: "center"
    },
    ["@media (max-width: 400px)"]: {
      fontSize: 17
    }
  },
  titleTextSubHeader: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      textAlign: "center"
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 15,
      maxWidth: 375,
      margin: "0 auto",
      marginBottom: theme.spacing(3),
      ["@media (max-width: 400px)"]: {
        fontSize: 13,
        maxWidth: 350
      }
    }
  },
  exploreButtonContainer: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center"
    }
  },
  callToExploreAction: {
    position: "relative"
  },
  bigLandingCloudContainer: {
    background: "url(/icons/big-landing-cloud.svg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    flex: 1,
    backgroundPosition: "right center",
    height: 650,
    width: "calc(100% - 500px - 50% + 640px)", //callToExploreAction needs about 500px and if the screen is bigger than 1280px (640px*2), everything on the left half of the screen that's more than 640px will be left free empty.
    float: "right",
    marginTop: theme.spacing(-3),
    marginRight: -200,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginTop: theme.spacing(2),
      backgroundPosition: "top center",
      height: 400,
      width: "100%",
      minWidth: 420,
      float: "none"
    },
    ["@media (max-width: 400px)"]: {
      height: 350,
      backgroundPosition: "top center"
    }
  },
  worldIconContainer: {
    height: "90%",
    width: "70%",
    maxWidth: 500,
    background: "url(/icons/landing-world-icon.svg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "right center",
    marginRight: theme.spacing(-10),
    [theme.breakpoints.down("md")]: {
      marginRight: 0,
      width: "60%",
      height: "80%"
    },
    [theme.breakpoints.down("sm")]: {
      width: "60%",
      backgroundPosition: "center center",
      maxWidth: 330,
      height: "80%",
      marginRight: theme.spacing(-5)
    }
  },
  findOutMoreButton: {
    display: "flex",
    margin: "0 auto",
    marginTop: -90,
    maxWidth: 1280,
    alignItems: "center",
    position: "absolute",
    bottom: 110,
    [theme.breakpoints.down("sm")]: {
      position: "relative",
      marginTop: "auto",
      bottom: "auto",
      height: 60,
      justifyContent: "center"
    }
  },
  showMoreIcon: {
    fontSize: 25,
    border: `2px solid ${theme.palette.secondary.main}`,
    marginRight: theme.spacing(1),
    borderRadius: 20,
    height: 30,
    width: 30
  },
  showMoreText: {
    fontSize: 20
  }
}));

export default function LandingTopBox({ scrollToContent }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <div className={classes.headerCloud} />
        <div className={classes.upperFlexWrapper}>
          <Link
            color="inherit"
            underline="none"
            className={classes.callToSignupAction}
            href="/signup"
          >
            <div>
              <Typography component="h3">
                Feel like we can only stop the climate crisis together?
              </Typography>
              <Typography component="h3" className={classes.bold}>
                Join the global climate action network
              </Typography>
            </div>
            <IconButton color="primary" variant="contained" className={classes.signUpButton}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Link>
        </div>
        <div className={classes.lowerWrapper}>
          <div className={classes.lowerFlexWrapper}>
            <div className={classes.callToExploreAction}>
              <Typography className={classes.titleTextContainer} color="secondary" component="h1">
                <div className={classes.titleTextFirstLine}>
                  <AlternatingText classes={classes} /> climate change
                </div>
                solutions from around the world
              </Typography>
              <Typography component="h2" color="secondary" className={classes.titleTextSubHeader}>
                Join the global climate action network to connect all
                {!isNarrowScreen ? <br /> : " "}
                climate actors on our planet - the only one we have
              </Typography>
              <div className={classes.exploreButtonContainer}>
                <Button href="/browse" variant="contained" color="primary">
                  {"Explore & make a change"}
                </Button>
              </div>
            </div>
            <div className={classes.bigLandingCloudContainer}>
              <div className={classes.worldIconContainer} />
            </div>
          </div>
        </div>
        <div className={classes.findOutMoreButton}>
          <Button className={classes.showMoreButton} onClick={scrollToContent}>
            <ExpandMoreIcon color="secondary" className={classes.showMoreIcon} />
            <Typography color="secondary" className={classes.showMoreText}>
              Find out more
            </Typography>
          </Button>
        </div>
      </Container>
    </div>
  );
}
