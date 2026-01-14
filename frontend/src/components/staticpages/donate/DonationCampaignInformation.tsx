import { Button, IconButton, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: "relative",
    borderTop: `1px solid ${theme.palette.primary.extraLight}`,
  },
  text: {
    fontWeight: 700,
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
  textBlock: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    color: "white",
    [theme.breakpoints.down("sm")]: {
      textAlign: "left",
    },
  },
  donateButton: {
    marginTop: theme.spacing(1),
    borderRadius: "4px",
    backgroundColor: "hsla(176.25, 66.67%, 90.59%, 1.00)",
    color: theme.palette.primary.main,
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 600,
    textDecoration: "none",
    textTransform: "uppercase",
    transition: "opacity 200ms ease",
    "&:hover": {
      backgroundColor: "hsla(176.25, 66.67%, 85%, 1.00)",
      opacity: 0.9,
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(1),
    },
  },
  flexWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  christmasIcon: {
    height: 50,
  },
  textAndBarContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    marginRight: "40px",
    marginLeft: "40px",
  },
  white: {
    color: "white",
  },
}));

type Props = {
  hubUrl?: string;
};

//If we want to reuse this, this has to be translated!
export default function DonationCampaignInformation({ hubUrl }: Props) {
  const classes = useStyles();
  const cookies = new Cookies();
  const [open, setOpen] = useState(!cookies.get("hideDonationCampaign"));
  const { CUSTOM_HUB_URLS, donationGoals, locale } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);
  const texts = getTexts({ page: "donate", locale: locale, classes: classes });
  const donationGoal =
    donationGoals?.find((goal) => goal.hub === hubUrl) || donationGoals?.find((goal) => !goal.hub);

  const handleClose = () => {
    const expiry = daysInFuture(3);
    const cookieProps = getCookieProps(expiry);
    cookies.set("hideDonationCampaign", true, cookieProps);
    setOpen(false);
  };

  if ((isCustomHub && !donationGoal?.hub) || !donationGoal?.goal_amount) return <></>;
  return (
    <>
      {open && (
        <div className={classes.root}>
          <IconButton className={classes.closeButton} onClick={handleClose} size="large">
            <CloseIcon />
          </IconButton>
          <div>
            <div className={classes.textAndBarContainer}>
              {donationGoal && (
                <DonationGoal
                  current={donationGoal?.current_amount}
                  goal={donationGoal?.goal_amount}
                  name={donationGoal?.goal_name}
                  embedded
                  barColor={theme.palette.yellow.main}
                />
              )}
              <Typography className={classes.text}>{donationGoal?.call_to_action_text}</Typography>
              {donationGoal?.call_to_action_link && (
                <Button
                  variant="contained"
                  href={donationGoal.call_to_action_link}
                  className={classes.donateButton}
                >
                  {texts.donate_now}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const daysInFuture = (numberOfDays) => {
  const now = new Date();
  return new Date(now.getTime() + numberOfDays * 24 * 60 * 60 * 1000);
};
