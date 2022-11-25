import React from "react";
import { Button, IconButton, Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import ProjectPreviews from "./ProjectPreviews";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";
import MenuIcon from "@material-ui/icons/Menu";

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
    maxWidth: 300,
  },
  showAllProjectsButton: (props) => ({
    marginBottom: props.isSmallScreen ? theme.spacing(0) : theme.spacing(1),
    marginTop: props.isSmallScreen ? theme.spacing(0) : theme.spacing(1),
    fontSize: props.isSmallScreen ? 14 : 12,
    width: props.isSmallScreen ? "100%" : "95%",
  }),
}));

export default function ProjectSideBar({
  similarProjects,
  handleHideContent,
  showSimilarProjects,
  locale,
  texts,
  isSmallScreen,
}) {
  const classes = useStyles({
    showSimilarProjects: showSimilarProjects,
    isSmallScreen: isSmallScreen,
  });

  const link = getLocalePrefix(locale) + "/browse";
  const shouldDisplayOneProjectInRow = !isSmallScreen;

  return (
    <>
      {isSmallScreen ? (
        <>
          <Divider className={classes.divider} />
          <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
            {texts.you_may_also_like_these_projects}
          </Typography>
        </>
      ) : (
        <IconButton size="small" onClick={handleHideContent}>
          <MenuIcon />
        </IconButton>
      )}

      <div
        className={
          isSmallScreen
            ? classes.smallSimilarProjectsContainer
            : classes.largeSimilarProjectsContainer
        }
      >
        {isSmallScreen && (
          <Button onClick={handleHideContent}>
            {showSimilarProjects ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        )}
        {showSimilarProjects && (
          <>
            <ProjectPreviews
              displayOnePreviewInRow={shouldDisplayOneProjectInRow}
              projects={similarProjects}
            />

            <Button
              color="primary"
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
