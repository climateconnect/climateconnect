import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import getTexts from "../../../public/texts/texts";
import ProjectPreview from "./ProjectPreview";

const useStyles = makeStyles((theme) => ({
  projectCard: {
    maxWidth: 290,
    maxHeight: 320,
    flex: 1,
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  cardContainer: {
   
    display: "flex",
    flexDirection: "column",
    alignItems: "space-between",
   

    borderRadius: 30,
    backgroundColor: "#f0f2f5",
    position: "absolute",
    zIndex: "1",
    right: 45,

    top: "calc(15vh - 55px)",
  },

  boxTitle: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    fontSize: 18,
  },
  buttonText: {
    color: theme.palette.primary.main,
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
