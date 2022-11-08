import { Button, Collapse, Container, makeStyles, useMediaQuery } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import MessageContent from "../communication/MessageContent";
import UserContext from "../context/UserContext";
import Dashboard from "../dashboard/Dashboard";
import ElementOnScreen from "../hooks/ElementOnScreen";
import HubHeadlineContainer from "./HubHeadlineContainer";
import StatBox from "./StatBox";
import ContactAmbassadorButton from "./ContactAmbassadorButton";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
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
  buttonContainer: (props) => ({
    display: props.isLocationHub ? "none" : "flex",
    justifyContent: "center",
    maxWidth: 800,
    height: 40,
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(1),
    },
  }),
  quickInfo: {
    fontSize: 17,
    maxWidth: 800,
  },
  marginTop: {
    marginTop: theme.spacing(4),
  },
  dashboardAndStatboxWrapper: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    [theme.breakpoints.up("md")]: {
      marginTop: theme.spacing(8),
    },
  },
  infoBoxContainer: {
    marginTop: theme.spacing(0),
    marginLeft: theme.spacing(2),
    float: "right",
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
  hubQuickInfoRef,
  hubProjectsButtonRef,
  isLocationHub,
  hubAmbassador,
  location,
  allHubs,
  hubData,
  hubUrl,
}) {
  const { locale, user } = useContext(UserContext);
  const classes = useStyles({ isLocationHub: isLocationHub, loggedOut: !user });
  const texts = getTexts({ page: "hub", locale: locale });
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
        {!isNarrowScreen && (!isLocationHub || !user) && (
          <div className={classes.infoBoxContainer}>
            <StatBox title={statBoxTitle} stats={stats} />
          </div>
        )}
        {isLocationHub && !isNarrowScreen ? (
          <Container className={classes.dashboardContainer}>
            <div className={`${user && classes.dashboardAndStatboxWrapper}`}>
              <div>
                {user ? (
                  <Dashboard
                    allHubs={allHubs}
                    hubData={hubData}
                    location={location}
                    headline={headline}
                    hubUrl={hubUrl}
                  />
                ) : (
                  <HubHeadlineContainer
                    subHeadline={subHeadline}
                    headline={headline}
                    headlineClassName={classes.h1}
                    isLocationHub={isLocationHub}
                    hubUrl={hubUrl}
                  />
                )}
                <BottomContent
                  hubQuickInfoRef={hubQuickInfoRef}
                  detailledInfo={detailledInfo}
                  quickInfo={quickInfo}
                  expanded={expanded}
                  handleClickExpand={handleClickExpand}
                  isLocationHub={isLocationHub}
                  hubAmbassador={hubAmbassador}
                  isNarrowScreen={isNarrowScreen}
                />
              </div>
              {user && (
                <div className={classes.infoBoxContainer}>
                  <StatBox title={statBoxTitle} stats={stats} />
                </div>
              )}
            </div>
          </Container>
        ) : (
          <div>
            <HubHeadlineContainer
              subHeadline={subHeadline}
              headline={headline}
              headlineClassName={classes.h1}
              isLocationHub={isLocationHub}
              hubUrl={hubUrl}
            />
            <BottomContent
              hubQuickInfoRef={hubQuickInfoRef}
              detailledInfo={detailledInfo}
              quickInfo={quickInfo}
              expanded={expanded}
              handleClickExpand={handleClickExpand}
              isLocationHub={isLocationHub}
              hubAmbassador={hubAmbassador}
              isNarrowScreen={isNarrowScreen}
            />
          </div>
        )}
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
          ref={hubProjectsButtonRef}
        >
          <ExpandMoreIcon /> {texts.show_projects}
        </Button>
      </div>
    </Container>
  );
}

const BottomContent = ({
  hubQuickInfoRef,
  detailledInfo,
  quickInfo,
  expanded,
  handleClickExpand,
  hubAmbassador,
  isLocationHub,
  isNarrowScreen,
}) => {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <>
      <div>
        {!isLocationHub && (
          <div className={`${classes.quickInfo} ${classes.marginTop}`} ref={hubQuickInfoRef}>
            <MessageContent content={quickInfo} />
          </div>
        )}
        <Collapse in={expanded}>
          {isLocationHub && (
            <div className={`${classes.quickInfo} ${classes.marginTop}`} ref={hubQuickInfoRef}>
              <MessageContent content={quickInfo} />
            </div>
          )}
          {detailledInfo}
        </Collapse>
      </div>
      <div className={classes.buttonContainer}>
        <Button className={classes.expandMoreButton} onClick={handleClickExpand}>
          {expanded ? (
            <>
              <ExpandLessIcon />
              {texts.less_info}{" "}
            </>
          ) : (
            <>
              <ExpandMoreIcon />
              {texts.more_info}
            </>
          )}
        </Button>
      </div>
      {!isNarrowScreen && <ContactAmbassadorButton hubAmbassador={hubAmbassador} />}
    </>
  );
};
