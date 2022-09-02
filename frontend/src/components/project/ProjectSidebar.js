import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import ProjectPreview from "./ProjectPreview";

const useStyles = makeStyles((theme) => ({
  projectCard: {
    maxWidth: 290,
    maxHeight: 320,

    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#f0f2f5",
  },

  boxTitle: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    fontSize: 18,
    [theme.breakpoints.down(1180)]: {
      width: "100%",
      fontSize: 14,
    },
  },
}));

export default function ProjectSideBar({ similarProjects, texts }) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.cardContainer}>
        <Typography className={classes.boxTitle}>{texts.projects_recommend_for_you}</Typography>

        {similarProjects.map((sp, index) => (
          <ProjectPreview project={sp} key={index} className={classes.projectCard} />
        ))}
      </div>
    </>
  );
}
