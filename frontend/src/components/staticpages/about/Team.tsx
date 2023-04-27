import { Container, Typography, Link } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import InfoLinkBox from "../InfoLinkBox";

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    display: "flex",
    marginTop: theme.spacing(6),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "center",
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  textContainer: {
    marginLeft: theme.spacing(6),
    padding: theme.spacing(3),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    maxWidth: 550,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    [theme.breakpoints.down("md")]: {
      maxWidth: 600,
      padding: 0,
      margin: 0,
      marginTop: theme.spacing(3),
    },
  },
  textBody: {
    fontWeight: 600,
    textAlign: "center",
  },
  infoLinkBox: {
    width: "100% !important",
    marginLeft: 0,
  },
  image: {
    visibility: "hidden",
    width: "100%",
    maxWidth: 600,
  },
  imageWrapper: {
    background: `url('/images/team.jpg')`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function Team({ headlineClass, className }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  const link_to_team_page = getLocalePrefix(locale) + "/team";

  return (
    <Container className={className}>
      <Typography color="primary" component="h1" className={headlineClass}>
        {texts.our_team}
      </Typography>

      <div className={classes.contentWrapper}>
        <Link href={link_to_team_page} underline="hover">
          <div className={classes.imageContainer}>
            <div className={classes.imageWrapper}>
              <img
                src="/images/team.jpg"
                alt={texts.our_team_image_text}
                className={classes.image}
              />
            </div>
          </div>
        </Link>
        <div className={classes.textContainer}>
          <Typography color="secondary" className={classes.textBody}>
            {texts.our_team_text}
            <br />
            <br />
            {texts.contact_us_if_youre_interested_in_joining_the_team}
          </Typography>
          <InfoLinkBox
            className={classes.infoLinkBox}
            iconSrc="/icons/group-icon.svg"
            link={link_to_team_page}
            iconAlt={texts.icon_displays_2_people}
            headline={texts.find_out_more}
            text={texts.learn_more_about_out_team}
          />
        </div>
      </div>
    </Container>
  );
}
