import { Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getPitchElements from "../../../public/data/pitch_elements";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import SmallCloud from "../staticpages/SmallCloud";

const useStyles = makeStyles<Theme, { alternate?: boolean }>((theme) => ({
  root: {
    position: "relative",
    maxWidth: 1280,
    margin: "0 auto",
  },
  pitchElementsWrapper: {
    marginTop: theme.spacing(8),
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(5),
    },
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
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 500,
    },
  },
  pitchElementHeadline: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: theme.spacing(3),
  },
  pitchElementImageContainer: (props) => ({
    flexBasis: 450,
    flexShrink: 0,
    height: 300,
    background: theme.palette.primary.light,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: props.alternate ? 0 : theme.spacing(3),
    marginLeft: props.alternate ? theme.spacing(3) : 0,
    [theme.breakpoints.down("md")]: {
      background: "none",
      height: "auto",
      maxHeight: 230,
      margin: 0,
    },
  }),
  pitchElementImage: {
    maxWidth: "100%",
  },
  smallCloud1: {
    position: "absolute",
    top: -100,
    width: 120,
    height: 80,
    left: -50,
  },
  smallCloud2: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  smallCloud3: {
    position: "absolute",
    top: 0,
    right: -200,
  },
  smallCloud4: {
    position: "absolute",
    top: 115,
    left: -180,
    height: 80,
    width: 145,
  },
  smallCloud5: {
    position: "absolute",
    top: 295,
    right: -170,
    width: 120,
    height: 80,
  },
  smallCloud6: {
    position: "absolute",
    top: 380,
    right: -100,
  },
  smallCloud7: {
    position: "absolute",
    right: 40,
    top: 0,
  },
  pitchElementText: {
    maxWidth: 500,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: theme.spacing(4),
    },
  },
  mobileCloud1: {
    position: "absolute",
    left: 50,
    top: -30,
    width: 120,
    height: 80,
    [theme.breakpoints.down("sm")]: {
      left: -60,
    },
  },
  mobileCloud2: {
    position: "absolute",
    left: -75,
    width: 130,
    height: 80,
  },
  mobileCloud3: {
    position: "absolute",
    right: -80,
    top: 130,
    width: 120,
    height: 80,
  },
  mobileCloud4: {
    position: "absolute",
    left: -30,
    top: -80,
  },
  mobileCloud5: {
    position: "absolute",
    right: -50,
    top: -40,
  },
  mobileCloud6: {
    position: "absolute",
    bottom: -60,
    left: 0,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

export default function PitchBox({ h1ClassName, className }) {
  const classes = useStyles({});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  const pitch_elements = getPitchElements(texts);
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  return (
    <div className={`${classes.root} ${className}`}>
      {!isMediumScreen && (
        <>
          <SmallCloud type={1} className={classes.smallCloud1} />
          <SmallCloud type={2} className={classes.smallCloud2} reverse />
        </>
      )}
      <Typography color="primary" component="h1" className={h1ClassName}>
        {'"' + texts.effective_climate_action_only_works_with_global_collaboration + '"'}
      </Typography>
      <div className={classes.pitchElementsWrapper}>
        <PitchElement
          image={pitch_elements[0].img}
          headline={pitch_elements[0].headline}
          text={pitch_elements[0].text}
        >
          {!isMediumScreen ? (
            <SmallCloud type={1} className={classes.smallCloud7} reverse />
          ) : (
            <SmallCloud type={2} className={classes.mobileCloud1} reverse />
          )}
        </PitchElement>
        <PitchElement
          alternate={!isMediumScreen}
          image={pitch_elements[1].img}
          headline={pitch_elements[1].headline}
          text={pitch_elements[1].text}
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
          image={pitch_elements[2].img}
          headline={pitch_elements[2].headline}
          text={pitch_elements[2].text}
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

const PitchElement = ({ image, headline, text, alternate, children }: any) => {
  const classes = useStyles({ alternate: alternate });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale });
  return (
    <div className={classes.pitchElementRoot}>
      {children}
      {!alternate && (
        <div className={classes.pitchElementImageContainer}>
          <img
            src={image}
            className={classes.pitchElementImage}
            alt={texts.five_people_positioned_around_a_globe_connected_through_lines}
          />
        </div>
      )}
      <div>
        <Typography className={classes.pitchElementHeadline} color="primary">
          {headline}
        </Typography>
        <Typography color="secondary" className={classes.pitchElementText}>
          {text}
        </Typography>
      </div>
      {alternate && (
        <div className={classes.pitchElementImageContainer}>
          <img src={image} className={classes.pitchElementImage} alt="pitch Image" />
        </div>
      )}
    </div>
  );
};
