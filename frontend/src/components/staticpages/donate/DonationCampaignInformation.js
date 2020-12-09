import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { getCookieProps } from "../../../../public/lib/cookieOperations";
import {
  makeStyles,
  Typography,
  Button,
  IconButton,
  Link,
  Container,
  Collapse,
  useMediaQuery,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import CloseIcon from "@material-ui/icons/Close";
import UserContext from "../../context/UserContext";
import DonationGoal from "./DonationGoal";
import theme from "../../../themes/theme";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    background: theme.palette.primary.main,
    color: "white",
    textAlign: "center",
    padding: theme.spacing(1),
    paddingBottom: 0,
    position: "relative",
  },
  text: {
    fontWeight: 600,
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(6),
    position: "relative",
    display: "inline-block",
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
    marginBottom: theme.spacing(4),
  },
  link: {
    color: "white",
  },
  textBlock: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    [theme.breakpoints.down("xs")]: {
      textAlign: "left",
    },
  },
  donateButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
    background: "white",
    [theme.breakpoints.down("xs")]: {
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
    position: "absolute",
    left: 5,
  },
}));

export default function DonationCampaignInformation() {
  const classes = useStyles();
  const cookies = new Cookies();
  const expiry = daysInFuture(3);
  const cookieProps = getCookieProps(expiry);
  const [open, setOpen] = React.useState(!cookies.get("hideDonationCampaign"));
  const [expanded, setExpanded] = React.useState(false);
  const { donationGoal } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const handleClose = () => {
    cookies.set("hideDonationCampaign", true, cookieProps);
    setOpen(false);
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {open && (
        <div className={classes.root}>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography className={classes.text}>
            <img src="/icons/christmas-icon.svg" className={classes.christmasIcon} />
            {isNarrowScreen
              ? `Win the compensation of your footprint`
              : `Win the compensation of your 2020 CO2-footprint by donating to Climate Connect during
              December`}
          </Typography>
          <Collapse in={expanded}>
            <Container className={classes.expandableContent}>
              <DonationGoal
                current={donationGoal.current_amount}
                goal={donationGoal.goal_amount}
                name={donationGoal.goal_name}
                embedded
                className={classes.donationGoal}
                barColor={theme.palette.primary.light}
              />
              {isNarrowScreen && (
                <Button href="/donate" variant="contained" className={classes.donateButton}>
                  Donate now
                </Button>
              )}
              <Typography className={classes.textBlock}>
                Your donation will help scale up effective climate solutions, support us in growing
                a global network of climate actors and allow Climate Connect to stay free and
                independent. In our December raffle everybody who donates to Climate Connect in the
                month of December has a chance to win the compensation of their {"year's"}{" "}
                CO2-footprint kindly sponsored by{" "}
                <Link
                  underline="always"
                  className={classes.link}
                  href="https://ecologi.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ecologi
                </Link>
                !
              </Typography>
              <Typography>
                You can find the terms of the raffle{" "}
                <Link
                  underline="always"
                  className={classes.link}
                  href="/raffleterms"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </Link>
              </Typography>
              {!isNarrowScreen && (
                <Button href="/donate" variant="contained" className={classes.donateButton}>
                  Donate now
                </Button>
              )}
            </Container>
          </Collapse>
          <Button className={classes.showMoreButton} onClick={handleToggleExpanded}>
            {expanded ? (
              <>
                <ExpandLessIcon /> Show less
              </>
            ) : (
              <>
                <ExpandMoreIcon /> Show more
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
