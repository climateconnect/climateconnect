import { Typography, Box, Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import ProjectPreview from "./ProjectPreview";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles((theme) => ({
  projectCard: {
    maxWidth: 290,
    maxHeight: 320,
    flex: 1,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  cardContainer: {
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "space-between",
    height: "70%",

    borderRadius: 30,
    backgroundColor: "#f0f2f5",
    position: "fixed",
    zIndex: "1",
    right: 45,
    
    bottom: "calc(15vh - 55px)",
   
  },
  iconButton: {
    position: "fixed",
    bottom: "calc(50vh - 80px)",
    transform: "rotate(90deg)",
    backgroundColor:"#f0f2f5",
    height: "10px",
    borderRadius: 5,
    right: 345,
  },

  boxTitle: {
    display: "flex",
    justifyContent: "center",
    marginLeft: theme.spacing(0),
    marginTop: theme.spacing(2),
    fontSize:20,
  },
  buttonText: {
    color: theme.palette.primary.main,
  },
}));

export default function ProjectSideBar({
  similarProjects,
  handleHideContent,
  showSimilarProjects,
}) {
  const classes = useStyles();
  console.log(similarProjects);
  return (
    <>
      <div className={classes.cardContainer}>
        <Typography className={classes.boxTitle}>Recommended for you!</Typography>

        {similarProjects.map((sp) => (
          <ProjectPreview project={sp} className={classes.projectCard} />
        ))}
        <Button
          variant="contained"
        
          classes={{
            root: classes.iconButton,
            label: classes.buttonText,
          }}
          onClick={handleHideContent}
          
        >
         <ExpandLessIcon></ExpandLessIcon>
        </Button>
      </div>
     
       
     
    </>
  );
}
