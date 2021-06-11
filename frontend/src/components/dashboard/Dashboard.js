import { makeStyles, Typography, withTheme } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import React from "react";

const useStyles = makeStyles((theme) => {
  return {
    profileBlurb: {
      backgroundColor: theme.palette.primary.main,
      minWidth: 300,
      borderRadius: 5,
      color: "white",
      //   position: "absolute",
      position: "relative",
      padding: theme.spacing(3),
      //   position: fixed;
      // min-width: 100px;
      // border-radius: 5px;
      // z-index: 100;
    },
    profileInner: {
      float: "left",
      position: "absolute",
      left: "0px",
      top: "0px",
      "z-index": " 1000",
      // background-color:" #92AD40",
      padding: "5px",
    },
    root: {
      marginBottom: theme.spacing(1.5),
      borderLeft: `5px solid ${theme.palette.primary.main}`,
    },
    questionWrapper: {
      width: "100%",
      backgroundColor: "#2071781A",
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    questionText: {
      fontWeight: "bold",
      fontSize: 19,
      width: "100%",
      [theme.breakpoints.down("xs")]: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    answerWrapper: {
      width: "100%",
      backgroundColor: "#F2F2F2",
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      fontSize: 17,
      lineHeight: 1.5,
      [theme.breakpoints.down("xs")]: {
        fontSize: 16,
      },
    },
  };
});

// TODO: might have to actually move this inside the image
// https://stackoverflow.com/questions/18339549/floating-div-over-an-image
export default function Dashboard({ questionObject, className, questionTextClassName }) {
  const classes = useStyles();
  //   const [open, setOpen] = React.useState(false);
  return (
    <div className={`${classes.profileBlurb}`}>
      <Typography variant="h4" component="h1" className={`${classes.headingText}`}>
        Welcome
      </Typography>
      <div>profile image</div>
    </div>
  );
  //   return (
  //     <div className={`${classes.root} ${className}`}>
  //       <div className={classes.questionWrapper} onClick={() => setOpen(!open)}>
  //         <Typography component="h3" className={`${classes.questionText} ${questionTextClassName}`}>
  //           {questionObject.question}
  //         </Typography>
  //         {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  //       </div>
  //       {/* {open && <div className={classes.answerWrapper}>{questionObject.answer}</div>} */}
  //     </div>
  //   );
}
