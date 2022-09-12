import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import ProjectPreview from "./ProjectPreview";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  projectCard: {
    maxWidth: 290,
    maxHeight: 320,
  },

  cardContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f0f2f5", //
    padding: theme.spacing(1),
    maxWidth: 300,
  },
  showAllProjectsButton: {
    marginTop: theme.spacing(1),
    fontSize: 12,
    width: "100%",
  },
}));

// add show all projects button -> redirect
export default function ProjectSideBar({
  similarProjects,
  handleHideContent,
  showSimilarProjects,
  locale,
  texts,
}) {
  const classes = useStyles({
    showSimilarProjects: showSimilarProjects,
  });

  const router = useRouter();
  const handleShowAllProjects = () => {
    router.push("/" + locale + "/browse");
  };

  return (
    <>
      {showSimilarProjects ? (
        <>
          <IconButton size="small" onClick={handleHideContent}>
            <MenuIcon fontSize="medium" />
          </IconButton>
          <div className={classes.cardContainer}>
            {similarProjects.map((sp, index) => (
              <ProjectPreview project={sp} key={index} className={classes.projectCard} />
            ))}
            <Button
              color="primary"
              className={classes.showAllProjectsButton}
              variant="outlined"
              onClick={handleShowAllProjects}
            >
              <SearchIcon />
              {texts.view_all_projects}
            </Button>
          </div>
        </>
      ) : (
        <IconButton size="small" onClick={handleHideContent}>
          <MenuIcon fontSize="medium" />
        </IconButton>
      )}
    </>
  );
}
