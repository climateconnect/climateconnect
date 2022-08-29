import { Typography, Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import ProjectPreview from "./ProjectPreview";

const useStyles = makeStyles((theme) => ({
    projectCard: {
        width:290,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        
    },
    cardContainer: {
        overflowY: "auto",
        display: "flex",
  
        flexDirection: "column",
        justifyContent: "center",
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 20,
        backgroundColor:  "#f0f2f5",
        position: "absolute",
        right: 315,
        marginTop: theme.spacing(230),
      
    
    
    },
    boxTitle: {
        display: "flex",
        justifyContent:"center",
        marginTop: theme.spacing(1),
        
    }
})) 


export default function ProjectSideBar({similarProjects, handleHideContent}){
    const classes = useStyles();
    console.log(similarProjects);
    return (
        <>
          
<  Box className={classes.cardContainer}>
<Typography className={classes.boxTitle}>
                Recommended for you!
            </Typography>
           
            {similarProjects.map((sp) => (
            <ProjectPreview project={sp} className={classes.projectCard} />
            ))
            
            
            }
           

       
        
        </Box>
        
        </>
    )

}