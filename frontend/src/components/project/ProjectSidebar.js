import { Typography, Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
    test: {
        
        
    }
})) 


export default function ProjectSideBar({similarProjects, handleHideContent}){
    const classes = useStyles();
    console.log(similarProjects);
    return (
<>
        <Box className={classes.test}>
            {similarProjects.map((sp) => (
            <Typography>
                 {sp.name}
             </Typography>
            ))
            
            
            }
           

        </Box>
        <Button onClick={handleHideContent}> Hide</Button>
        </>
    )

}