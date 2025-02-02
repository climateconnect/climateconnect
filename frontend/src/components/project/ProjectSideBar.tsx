import React from "react";
import { Button, IconButton, Typography, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import ProjectPreviews from "./ProjectPreviews";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import HubSupporters from "../hub/HubSupporters";

type useStylesProps = {
  isSmallScreen: boolean;
};

const useStyles = makeStyles((theme) => ({
  projectCard: {
    maxWidth: 290,
    maxHeight: 320,
  },

  smallSimilarProjectsContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  subHeader: {
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  largeSimilarProjectsContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    borderRadius: 10,
    backgroundColor: "#f0f2f5",
    maxWidth: "100%",
  },
  showAllProjectsButton: (props: useStylesProps) => ({
    marginBottom: props.isSmallScreen ? theme.spacing(0) : theme.spacing(1),
    marginTop: props.isSmallScreen ? theme.spacing(0) : theme.spacing(1),
    fontSize: props.isSmallScreen ? 14 : 12,
    width: props.isSmallScreen ? "100%" : "95%",
    color: theme.palette.background.default_contrastText,
    borderColor: theme.palette.background.default_contrastText
  }),
  supporterSliderWidth: {
    width: "95%",
    marginTop: "8px",
    marginBottom: theme.spacing(2),
    [`@media (min-width: 900px) and (max-width: 1200px)`]: {
      marginLeft: 0,
    },
  },
  expandButton: {
    color: theme.palette.background.default_contrastText,
  }
}));

export default function ProjectSideBar({
  similarProjects,
  handleHideContent,
  showSimilarProjects,
  locale,
  texts,
  isSmallScreen,
  hubSupporters,
  hubName,
}) {
  const classes = useStyles({
    isSmallScreen: isSmallScreen,
  });

  const link = getLocalePrefix(locale) + "/browse";
  const shouldDisplayOneProjectInRow = !isSmallScreen;

  return (
    <>
      {isSmallScreen ? (
        <>
          <Divider className={classes.divider} />
          <Typography
            component="h2"
            variant="h6"
            color="background.default_contrastText"
            className={classes.subHeader}
          >
            {texts.you_may_also_like_these_projects}
          </Typography>
        </>
      ) : (
        <>
          <IconButton size="small" onClick={handleHideContent}>
            <MenuIcon />
          </IconButton>
        </>
      )}
      <div
        className={
          isSmallScreen
            ? classes.smallSimilarProjectsContainer
            : classes.largeSimilarProjectsContainer
        }
      >
        {isSmallScreen && (
          <Button className={classes.expandButton} onClick={handleHideContent}>
            {showSimilarProjects ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        )}
        {showSimilarProjects && (
          <>
            {hubSupporters && (
              <HubSupporters
                supportersList={hubSupporters}
                containerClass={classes.supporterSliderWidth}
                mobileVersion={isSmallScreen}
                hubName={hubName}
              />
            )}
            <ProjectPreviews
              displayOnePreviewInRow={shouldDisplayOneProjectInRow}
              projects={similarProjects}
              hubUrl={hubName}
            />
            <Button
              variant="outlined"
              className={classes.showAllProjectsButton}
              href={link}
            >
              <SearchIcon />
              {texts.view_all_projects}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
