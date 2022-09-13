import React from "react";
import { Button, IconButton, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import ProjectPreview from "./ProjectPreview";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";


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

  const link = getLocalePrefix(locale) + "/browse";

  return (
    <>
      <IconButton size="small" onClick={handleHideContent}>
        <MenuIcon fontSize="medium" />
      </IconButton>
      {showSimilarProjects && (
        <div className={classes.cardContainer}>
          {similarProjects.map((sp, index) => (
            <ProjectPreview project={sp} key={index} className={classes.projectCard} />
          ))}
          <Link href={link} className={classes.showAllProjectsButton}>
            <Button color="primary" variant="outlined" className={classes.showAllProjectsButton}>
              <SearchIcon />
              {texts.view_all_projects}
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
