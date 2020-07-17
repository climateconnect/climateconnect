const projectOverviewStyles = theme => {
  //general styling
  return {
    projectOverview: {
      width: "100%",
      padding: 0,
      textAlign: "left"
    },
    followButton: {
      marginLeft: theme.spacing(1)
    },
    projectInfoEl: {
      textAlign: "left",
      paddingTop: theme.spacing(1)
    },
    icon: {
      verticalAlign: "bottom",
      marginTop: 2,
      paddingRight: theme.spacing(0.5)
    },
    //small screen styling
    blockProjectInfo: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(1)
    },
    fullWidthImage: {
      width: "100%"
    },
    smallScreenHeader: {
      textAlign: "center",
      paddingBottom: theme.spacing(2)
    },
    infoBottomBar: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      display: "inline-block",
      width: "100%"
    },
    //large screen styling
    largeScreenHeader: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
      textAlign: "center"
    },
    flexContainer: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: theme.spacing(1),
      flexWrap: "wrap"
    },
    inlineImage: {
      display: "inline-block",
      width: "50%",
      maxWidth: 550
    },
    inlineProjectInfo: {
      display: "inline-block",
      width: "50%",
      verticalAlign: "top",
      padding: theme.spacing(1),
      [theme.breakpoints.up("md")]: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4)
      }
    },
    infoTopBar: {
      paddingBottom: theme.spacing(2)
    },
    subHeader: {
      fontWeight: 600,
      marginBottom: theme.spacing(1)
    },
    skill: {
      display: "flex",
      border: "1px solid black",
      height: theme.spacing(5),
      minWidth: 220,
      maxWidth: "100%",
      marginRight: theme.spacing(1),
      background: "none",
      borderRadius: 0,
      fontSize: 16,
      marginTop: theme.spacing(1)
    }
  };
};

export default projectOverviewStyles;
