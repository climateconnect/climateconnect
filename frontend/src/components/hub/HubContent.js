import {
  Container,
  Typography,
  makeStyles,
  Button,
  Collapse,
  useMediaQuery,
} from "@material-ui/core";
import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import StatBox from "./StatBox";
import MessageContent from "../communication/MessageContent";
import ElementOnScreen from "../hooks/ElementOnScreen";
import theme from "../../themes/theme";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
  h1: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      fontSize: 25,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 20,
    },
  },
  expandMoreButton: {
    width: "100%",
  },
  h2: {
    color: theme.palette.secondary.main,
    fontWeight: 600,
    fontSize: 21,
    marginBottom: theme.spacing(1),
  },
  textHeadline: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 22,
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
    },
  },
  infoBoxContainer: {
    marginLeft: theme.spacing(4),
    float: "right",
  },
  infoBoxContainerMobile: {
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
  },
  showSolutionsButton: {
    width: "100%",
    marginBottom: theme.spacing(0.25),
    height: 40,
  },
  showMoreFixed: {
    width: 250,
    position: "fixed",
    bottom: theme.spacing(2),
    left: "50%",
    marginLeft: -125,
    zIndex: 1,
    border: "1px solid white",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    height: 40,
    marginTop: theme.spacing(2),
  },
  quickInfo: {
    fontSize: 17,
  },
}));

export default function HubContent({
  headline,
  quickInfo,
  detailledInfo,
  stats,
  statBoxTitle,
  scrollToSolutions,
  subHeadline,
}) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = React.useState(false);
  const handleClickExpand = () => {
    if (expanded === false) {
      setFixed(true);
    }
    setExpanded(!expanded);
  };
  const [fixed, setFixed] = React.useState(false);
  const [showMoreEl, setShowMoreEl] = React.useState(null);
  const showMoreVisible = ElementOnScreen({ el: showMoreEl, triggerIfUnderScreen: true });
  if (!fixed && !showMoreVisible) {
    setFixed(true);
  }
  if (fixed && showMoreVisible) {
    setFixed(false);
  }
  return (
    <Container>
      <div className={classes.root}>
        {!isNarrowScreen && (
          <div className={classes.infoBoxContainer}>
            <StatBox title={statBoxTitle} stats={stats} />
          </div>
        )}
        <div>
          <Typography color="primary" component="h1" className={classes.h1}>
            {headline}
          </Typography>
          <Typography component="h2" className={classes.textHeadline}>
            {subHeadline}
          </Typography>
          <div className={classes.quickInfo}>
            <MessageContent content={quickInfo} />
          </div>
          <div>
            <Collapse in={expanded}>{detailledInfo}</Collapse>
          </div>
          <div className={classes.buttonContainer}>
            <Button className={classes.expandMoreButton} onClick={handleClickExpand}>
              {expanded ? (
                <>
                  <ExpandLessIcon />
                  Less Info{" "}
                </>
              ) : (
                <>
                  <ExpandMoreIcon />
                  More Info
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <div
        className={classes.buttonContainer}
        ref={(node) => {
          if (node) {
            setShowMoreEl(node);
          }
        }}
      >
        <Button
          className={`${classes.showSolutionsButton} ${fixed && classes.showMoreFixed}`}
          variant="contained"
          color="primary"
          onClick={scrollToSolutions}
        >
          <ExpandMoreIcon /> Show Solutions
        </Button>
      </div>
    </Container>
  );
}
