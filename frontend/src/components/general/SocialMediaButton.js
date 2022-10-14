import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  inheritColor: {
    color: "inherit",
  },
  socialMediaLink: (props) => ({
    
    height: props.isFooterIcon ? 20 : 40,
    marginTop: props.isEditPage ? theme.spacing(0.5) : theme.spacing(0),
    marginLeft: theme.spacing(1),
    color: props.isFooterIcon ? "inherit" : theme.palette.primary.main,

    "&:hover": {
      color: theme.palette.primary.main,
    },
  }),
 
}));

export default function SocialMediaButton({ href, socialMediaIcon, altText, isFooterIcon, isEditPage }) {
  const classes = useStyles({ 
    isFooterIcon: isFooterIcon,
    isEditPage: isEditPage
   });
 
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes.inheritColor}>
        <socialMediaIcon.icon className={classes.socialMediaLink} alt={altText} />
      </a>
    );
  
  
 

}
