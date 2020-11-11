import React from "react";
import { Typography, makeStyles, useMediaQuery } from "@material-ui/core";
import SmallCloud from "./SmallCloud";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(10),
    position: "relative",
    maxWidth: 1280,
    margin: "0 auto"
  },
  pitchElementsWrapper: {
    marginTop: theme.spacing(8),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(5)
    }
  },
  pitchElementRoot: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: theme.spacing(3),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 500
    }
  },
  pitchElementHeadline: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: theme.spacing(3)
  },
  pitchElementImageContainer: props => ({
    flexBasis: 450,
    flexShrink: 0,
    height: 300,
    background: theme.palette.primary.light,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: props.alternate ? 0 : theme.spacing(3),
    marginLeft: props.alternate ? theme.spacing(3) : 0,
    [theme.breakpoints.down("sm")]: {
      background: "none",
      height: "auto",
      maxHeight: 230,
      margin: 0
    }
  }),
  pitchElementImage: {
    maxWidth: "100%"
  },
  smallCloud1: {
    position: "absolute",
    top: -100,
    width: 120,
    height: 80,
    left: -50
  },
  smallCloud2: {
    position: "absolute",
    top: 0,
    left: 0
  },
  smallCloud3: {
    position: "absolute",
    top: 0,
    right: -200
  },
  smallCloud4: {
    position: "absolute",
    top: 115,
    left: -180,
    height: 80,
    width: 145
  },
  smallCloud5: {
    position: "absolute",
    top: 295,
    right: -170,
    width: 120,
    height: 80
  },
  smallCloud6: {
    position: "absolute",
    top: 380,
    right: -100
  },
  smallCloud7: {
    position: "absolute",
    right: 40,
    top: 0
  },
  pitchElementText: {
    maxWidth: 500,
    [theme.breakpoints.down("xs")]: {
      paddingBottom: theme.spacing(4)
    }
  },
  mobileCloud1: {
    position: "absolute",
    left: 50,
    top: -30,
    width: 120,
    height: 80,
    [theme.breakpoints.down("xs")]: {
      left: -60
    }
  },
  mobileCloud2: {
    position: "absolute",
    left: -75,
    width: 130,
    height: 80
  },
  mobileCloud3: {
    position: "absolute",
    right: -80,
    top: 130,
    width: 120,
    height: 80
  },
  mobileCloud4: {
    position: "absolute",
    left: -30,
    top: -80
  },
  mobileCloud5: {
    position: "absolute",
    right: -50,
    top: -40
  },
  mobileCloud6: {
    position: "absolute",
    bottom: -60,
    left: 0,
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  }
}));

export default function PitchBox({ h1ClassName }) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div className={classes.root}>
      {!isMediumScreen && (
        <>
          <SmallCloud type={1} className={classes.smallCloud1} />
          <SmallCloud type={2} className={classes.smallCloud2} reverse />
        </>
      )}
      <Typography color="primary" component="h1" className={h1ClassName}>
        {'"Effective climate action only works with global collaboration"'}
      </Typography>
      <div className={classes.pitchElementsWrapper}>
        <PitchElement
          image={"/images/online_world_story.svg"}
          headline="Spread your solution globally"
          text="Share your climate change solutions with the climate action community and find people who can use your experience to replicate your solutions somewhere else. Receive help and feedback on what you are doing to combat global warming and increase your impact!"
        >
          {!isMediumScreen ? (
            <SmallCloud type={1} className={classes.smallCloud7} reverse />
          ) : (
            <SmallCloud type={2} className={classes.mobileCloud1} reverse />
          )}
        </PitchElement>
        <PitchElement
          alternate={!isMediumScreen}
          image={"/images/creativity_story.svg"}
          headline="Get inspired"
          text="Find inspiring solutions to global warming. Replicate succesful projects and benefit from the experience of others. Find solutions that actually make a difference! Contact the project owners directly to ask about their lessons learned and knowledge on any specific project."
        >
          {!isMediumScreen ? (
            <>
              <SmallCloud type={2} className={classes.smallCloud3} reverse />
              <SmallCloud type={1} className={classes.smallCloud4} reverse />
            </>
          ) : (
            <>
              <SmallCloud type={2} className={classes.mobileCloud2} reverse />
              <SmallCloud type={1} className={classes.mobileCloud3} reverse />
            </>
          )}
        </PitchElement>
        <PitchElement
          image={"/images/team_story.svg"}
          headline="Worldwide collaboration"
          text="Worldwide collaboration in climate action is the main goal of Climate Connect. We want everyone involved in fighting climate change to work together! Filter projects by what skills they are looking for to find out where you can make the biggest difference with your individual skillset!"
        >
          {!isMediumScreen ? (
            <>
              <SmallCloud type={1} className={classes.smallCloud5} reverse />
              <SmallCloud type={2} className={classes.smallCloud6} />
            </>
          ) : (
            <>
              <SmallCloud type={1} className={classes.mobileCloud4} />
              <SmallCloud type={1} className={classes.mobileCloud5} reverse />
              <SmallCloud type={1} className={classes.mobileCloud6} reverse />
            </>
          )}
        </PitchElement>
      </div>
    </div>
  );
}

const PitchElement = ({ image, headline, text, alternate, children }) => {
  const classes = useStyles({ alternate: alternate });
  return (
    <div className={classes.pitchElementRoot}>
      {children}
      {!alternate && (
        <div className={classes.pitchElementImageContainer}>
          <img
            src={image}
            className={classes.pitchElementImage}
            alt="5 people positioned around a globe connected through lines"
          />
        </div>
      )}
      <div>
        <Typography
          component="h1"
          className={classes.pitchElementHeadline}
          color="primary"
          alt="Man floating in the air with a lightbulb, a book, a pen, a notebook, a baloon and Saturn floating around him"
        >
          {headline}
        </Typography>
        <Typography
          color="secondary"
          className={classes.pitchElementText}
          alt="4 people at a table working together and giving each other a high 5"
        >
          {text}
        </Typography>
      </div>
      {alternate && (
        <div className={classes.pitchElementImageContainer}>
          <img src={image} className={classes.pitchElementImage} />
        </div>
      )}
    </div>
  );
};
