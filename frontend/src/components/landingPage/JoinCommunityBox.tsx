import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import LightBigButton from "../staticpages/LightBigButton";
import SmallCloud from "../staticpages/SmallCloud";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    height: 700,
    marginTop: theme.spacing(-20),
    paddingTop: theme.spacing(23),
    [theme.breakpoints.down("md")]: {
      height: 850,
    },
  },
  content: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  cloudContainer: {
    background: "url(/icons/join-community-cloud.svg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    flex: 1,
    height: "auto",
    backgroundPosition: "left center",
    minHeight: 550,
    minWidth: 550,
    marginLeft: -200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    [theme.breakpoints.down("xl")]: {
      marginLeft: -100,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: -300,
      marginTop: -100,
      minWidth: 400,
      justifyContent: "flex-end",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: 475,
    },
  },
  loginIconContainer: {
    width: 500,
    height: 500,
    maxWidth: "70%",
    marginTop: "-5%",
    background: "url(/icons/login_story.svg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "right center",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "65%",
    },
    [theme.breakpoints.down("md")]: {
      maxWidth: "65%",
      marginRight: 50,
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "55%",
    },
    ["@media (max-width: 400px)"]: {
      maxWidth: "45%",
    },
  },
  headline: {
    marginBottom: theme.spacing(3),
    position: "relative",
    textAlign: "left",
  },
  textContainer: {
    color: "white",
    marginLeft: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
    },
  },
  yellow: {
    color: theme.palette.yellow.main,
  },
  signUpButtonContainer: {
    display: "flex",
    justifyContent: "center",
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(-5),
    marginTop: theme.spacing(5),
    zIndex: 10,
    [theme.breakpoints.down("md")]: {
      justifyContent: "flex-end",
      marginBottom: 0,
    },
  },
  bePartOfCommunityText: {
    fontSize: 18,
    maxWidth: 580,
    [theme.breakpoints.down("md")]: {
      fontWeight: 600,
      fontSize: 17,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 15,
    },
  },
  smallCloud1: {
    position: "absolute",
    top: -130,
    right: 150,
    width: 120,
    height: 80,
    [theme.breakpoints.down("md")]: {
      top: -60,
      right: 200,
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  smallCloud2: {
    position: "absolute",
    top: -80,
    right: 0,
    [theme.breakpoints.down("md")]: {
      top: -60,
    },
  },
}));

export default function JoinCommunityBox({ h1ClassName }) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale, classes: classes });
  return (
    <div className={classes.root}>
      <Container className={classes.content}>
        {isMediumScreen && (
          <JoinCommunityText h1ClassName={h1ClassName} texts={texts} locale={locale} />
        )}
        <div className={classes.cloudContainer}>
          <div className={classes.loginIconContainer} />
        </div>
        {!isMediumScreen && <JoinCommunityText h1ClassName={h1ClassName} texts={texts} />}
      </Container>
    </div>
  );
}

const JoinCommunityText = ({ h1ClassName, texts, locale }: any) => {
  const classes = useStyles();
  return (
    <div className={classes.textContainer}>
      <Typography component="h1" className={`${h1ClassName} ${classes.headline}`}>
        <SmallCloud type={1} className={classes.smallCloud1} light />
        <SmallCloud type={2} className={classes.smallCloud2} light />
        {texts.be_part_of_the_community}
      </Typography>
      <Typography className={classes.bePartOfCommunityText}>
        {texts.be_part_of_the_community_text}
        <br /> <br />
        {texts.whether_youre_working_on_climate_action_fulltime}
      </Typography>
      <div className={classes.signUpButtonContainer}>
        <LightBigButton href={getLocalePrefix(locale) + "/signup"}>{texts.sign_up}</LightBigButton>
      </div>
    </div>
  );
};
