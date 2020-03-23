import React from "react";
import { Container, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import ExploreIcon from "@material-ui/icons/Explore";

const useStyles = makeStyles(theme => ({
  //general styling
  projectOverview: {
    width: "100%",
    padding: 0,
    textAlign: "left"
  },
  contactProjectButton: {
    width: 100,
    height: 36
  },
  followButton: {
    float: "right",
    marginRight: theme.spacing(4)
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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    textAlign: "center"
  },
  flexContainer: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1)
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
  }
}));

export default function ProjectOverview({ project, smallScreen }) {
  const classes = useStyles();
  return (
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview project={project} />
      ) : (
        <LargeScreenOverview project={project} />
      )}
    </Container>
  );
}

function SmallScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <>
      <img className={classes.fullWidthImage} src={project.image} />
      <div className={classes.blockProjectInfo}>
        <Typography component="h1" variant="h3" className={classes.smallScreenHeader}>
          {project.name}
        </Typography>

        <Typography>{project.shortdescription}</Typography>
        <div className={classes.projectInfoEl}>
          <Typography>
            <PlaceIcon className={classes.icon} /> {project.location}
          </Typography>
        </div>
        <div className={classes.projectInfoEl}>
          <Typography>
            <ExploreIcon className={classes.icon} /> {project.labels.join(", ")}
          </Typography>
        </div>
        <div className={classes.infoBottomBar}>
          <Button className={classes.contactProjectButton} variant="contained" color="primary">
            Contact
          </Button>
          <Button className={classes.followButton} variant="outlined" color="primary">
            Follow
          </Button>
        </div>
      </div>
    </>
  );
}

function LargeScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <>
      <Typography component="h1" variant="h1" className={classes.largeScreenHeader}>
        {project.name}
      </Typography>
      <div className={classes.flexContainer}>
        <img className={classes.inlineImage} src={project.image} />
        <div className={classes.inlineProjectInfo}>
          <div className={classes.infoTopBar}>
            <Button className={classes.contactProjectButton} variant="contained" color="primary">
              Contact
            </Button>
            <Button className={classes.followButton} variant="outlined" color="primary">
              Follow
            </Button>
          </div>
          <Typography>{project.shortdescription}</Typography>
          <div className={classes.projectInfoEl}>
            <Typography>
              <PlaceIcon className={classes.icon} /> {project.location}
            </Typography>
          </div>
          <div className={classes.projectInfoEl}>
            <Typography>
              <ExploreIcon className={classes.icon} /> {project.labels.join(",")}
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
}
