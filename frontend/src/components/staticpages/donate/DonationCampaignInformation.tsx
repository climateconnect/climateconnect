import {
  Button,
  Collapse,
  Container,
  IconButton,
  Link,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getCookieProps } from "../../../../public/lib/cookieOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";
import DonationGoal from "./DonationGoal";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    background: theme.palette.primary.main,
    color: "white",
    textAlign: "center",
    padding: theme.spacing(1),
    paddingBottom: 0,
    position: "relative",
    borderTop: `1px solid ${theme.palette.primary.extraLight}`,
  },
  text: {
    fontWeight: 600,
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    position: "relative",
    display: "inline-block",
    color: "white",
    marginTop: theme.spacing(2),
    fontSize: 20,
    [theme.breakpoints.down("sm")]: {
      fontSize: 15,
    },
  },
  linkText: {
    fontSize: 20,
  },
  showMoreButton: {
    color: "white",
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    color: "white",
  },
  expandableContent: {
    marginTop: theme.spacing(2),
  },
  donationGoal: {
    marginBottom: theme.spacing(3),
  },
  link: {
    color: "white",
  },
  textBlock: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    color: "white",
    [theme.breakpoints.down("sm")]: {
      textAlign: "left",
    },
  },
  donateButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
    background: "white",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(-2),
      marginBottom: theme.spacing(1),
    },
  },
  flexWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  christmasIcon: {
    height: 50,
  },
  topLineContainer: {
    display: "flex",
    justifyContent: "center",
  },
  textAndBarContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  white: {
    color: "white",
  },
}));

//If we want to reuse this, this has to be translated!
export default function DonationCampaignInformation() {
  const classes = useStyles();
  const cookies = new Cookies();
  const [open, setOpen] = React.useState(!cookies.get("hideDonationCampaign"));
  const [expanded, setExpanded] = React.useState(false);
  const { donationGoal, locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const texts = getTexts({ page: "donate", locale: locale, classes: classes });

  const handleClose = () => {
    const expiry = daysInFuture(3);
    const cookieProps = getCookieProps(expiry);
    cookies.set("hideDonationCampaign", true, cookieProps);
    setOpen(false);
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };
  if (!donationGoal?.goal_amount) return <></>;
  return (
    <>
      {open && (
        <div className={classes.root}>
          <IconButton className={classes.closeButton} onClick={handleClose} size="large">
            <CloseIcon />
          </IconButton>
          <div className={classes.topLineContainer}>
            <img src="/icons/christmas-icon.svg" className={classes.christmasIcon} />
            <div className={classes.textAndBarContainer}>
              <Typography className={classes.text}>
                {isNarrowScreen
                  ? texts.donation_campaign_headline_short
                  : texts.donation_campaign_headline_long}
              </Typography>
              {!expanded && donationGoal && (
                <DonationGoal
                  current={donationGoal?.current_amount}
                  goal={donationGoal?.goal_amount}
                  name={donationGoal?.goal_name}
                  embedded
                  barColor={theme.palette.primary.light}
                  barOnly
                  small
                />
              )}
              <Typography className={classes.text}>{donationGoal?.call_to_action_text}</Typography>
              <Link
                color="white"
                className={`${classes.linkText} ${classes.text}`}
                href={donationGoal?.call_to_action_link}
                target="_blank"
              >
                {texts.donate_now}
              </Link>
            </div>
          </div>
          <Collapse in={expanded}>
            <Container className={classes.expandableContent}>
              {donationGoal && (
                <DonationGoal
                  current={donationGoal?.current_amount}
                  goal={donationGoal?.goal_amount}
                  name={donationGoal?.goal_name}
                  embedded
                  className={classes.donationGoal}
                  barColor={theme.palette.primary.light}
                />
              )}
              {isNarrowScreen && (
                <Button
                  href={getLocalePrefix(locale) + "/donate"}
                  variant="contained"
                  className={classes.donateButton}
                >
                  {texts.donate_now}
                </Button>
              )}
              <Typography className={classes.textBlock}>
                {texts.donation_campaing_info_text_first_sentence}
              </Typography>
              {!isNarrowScreen && (
                <Button
                  href={getLocalePrefix(locale) + "/donate"}
                  variant="contained"
                  className={classes.donateButton}
                >
                  {texts.donate_now}
                </Button>
              )}
            </Container>
          </Collapse>
          <Button className={classes.showMoreButton} onClick={handleToggleExpanded}>
            {expanded ? (
              <>
                <ExpandLessIcon /> {texts.show_less}
              </>
            ) : (
              <>
                <ExpandMoreIcon /> {texts.show_more}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

const daysInFuture = (numberOfDays) => {
  const now = new Date();
  return new Date(now.getTime() + numberOfDays * 24 * 60 * 60 * 1000);
};
