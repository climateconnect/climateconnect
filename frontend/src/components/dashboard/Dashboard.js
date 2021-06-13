import { Box, makeStyles, Typography, withTheme } from "@material-ui/core";
import React from "react";
import theme from "../../themes/theme";

const useStyles = makeStyles((theme) => {
  return {
    // TODO: fix "floating" state on top of the
    // background image
    welcomeBanner: {
      backgroundColor: theme.palette.primary.main,
      minWidth: 300,
      borderRadius: 5,
      border: theme.borders.thick,
      color: "white",
      //   position: "absolute",
      position: "relative",
      // padding: theme.spacing(3),
      //   position: fixed;
      // min-width: 100px;
      maxWidth: "800px",
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

    userProfileImage: {
      // Thin gray border
      // TODO(design): what color should this actually be -- I
      // don't see it represented in the XD mockup? Ideally
      // it'd be from our emerging design system
      // border: `1px solid ${theme.palette.secondary.main}`,
      border: `1px solid gray`,
      borderRadius: "50%",
      height: "40px",
      width: "40px",
      background: "white",
    },
    subsection: {
      // TODO(design): again want to make sure we reflect this color
      // scheme in our design system or in code. I just grabbed
      // this color from the color picker in Chrome DevTools
      background: "#f0f2f5",
      borderRadius: 4,
      display: "flex",
    },

    // TODO(Chris): is there a standard
    // set of Typography headings, components?
    headingText: {
      fontWeight: "bold",
    },

    welcomeMessage: {
      background: "white",
      borderRadius: "25px",
      color: theme.palette.secondary.main,
      display: "flex",
      alignItems: "center",
      width: "100%",
      // TODO: not sure about correct weight here
      fontWeight: "400",
      padding: "10px",
    },

    hubName: {
      color: theme.palette.yellow.main,
    },
  };
});

const UserProfile = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.userProfileImage}`}>
      {/* Generic profile image if user is not logged in */}
      {/* <img /> */}
    </div>
  );
};

// TODO: generalize this spacing unit to be used in other places,
// for consistency
const HorizontalSpacing = ({ children, size }) => {
  return (
    <Box css={{ marginTop: theme.spacing(size), marginBottom: theme.spacing(size) }}>
      {children}
    </Box>
  );
};

// TODO: might have to actually move this inside the image
// https://stackoverflow.com/questions/18339549/floating-div-over-an-image
export default function Dashboard({ className }) {
  const classes = useStyles();
  //   const [open, setOpen] = React.useState(false);

  return (
    <div className={`${classes.welcomeBanner}`}>
      <Typography variant="h4" bold component="h1" className={`${classes.headingText}`}>
        Welcome to <span className={classes.hubName}>Test Hub</span>
      </Typography>
      <HorizontalSpacing size={1}>
        <div className={`${classes.subsection}`}>
          <UserProfile />
          {/* TODO: doing some left spacing here -- trying to keep spacing directly out of the UI components, and isolated within Box components directly  */}
          <Box css={{ marginLeft: theme.spacing(1) }}>
            {/* TODO: how do we want to handle longer text here... will it be static? */}
            <div className={`${classes.welcomeMessage}`}>This is standard user blurb text.</div>
          </Box>
        </div>
      </HorizontalSpacing>
    </div>
  );
}
