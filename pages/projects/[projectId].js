import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
import { Container, Typography } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import ExploreIcon from "@material-ui/icons/Explore";
import TEMP_FEATURED_DATA from "../../public/data/projects.json";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center"
  },
  projectOverview: {
    width: "100%",
    padding: 0
  },
  fullWidthImage: {
    width: "100%"
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
    padding: theme.spacing(1)
  },
  largeScreenHeader: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2)
  },
  projectInfoEl: {
    textAlign: "left"
  }
}));

export default function ProjectPage({ project }) {
  return (
    <WideLayout title={project ? project.name : "Project not found"}>
      {project ? <ProjectLayout project={project} /> : <NoProjectFoundLayout />}
    </WideLayout>
  );
}

ProjectPage.getInitialProps = async ctx => {
  return {
    project: await getProjectByIdIfExists(ctx.query.projectId)
  };
};

function ProjectLayout({ project }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

  return (
    <div className={classes.root}>
      {isNarrowScreen ? (
        <SmallScreenOverview project={project} />
      ) : (
        <LargeScreenOverview project={project} />
      )}
    </div>
  );
}

function SmallScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <Container className={classes.projectOverview}>
      <img className={classes.fullWidthImage} src={project.image} />
      <Typography variant="h1" className={classes.smallScreenHeader}>
        {project.name}
      </Typography>
      <p>{project.shortdescription}</p>
      <div className={classes.projectInfoEl}>
        <span className={classes.iconBox}>
          <PlaceIcon className={classes.cardIcon} />
        </span>
        {project.location}
      </div>
      <div className={classes.projectInfoEl}>
        <span className={classes.iconBox}>
          <ExploreIcon className={classes.cardIcon} />
        </span>
        {project.labels.join(",")}
      </div>
    </Container>
  );
}

function LargeScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <Container className={classes.projectOverview}>
      <Typography variant="h1" className={classes.largeScreenHeader}>
        {project.name}
      </Typography>
      <div>
        <img className={classes.inlineImage} src={project.image} />
        <div className={classes.inlineProjectInfo}>
          <Typography>{project.shortdescription}</Typography>
          <div className={classes.projectInfoEl}>
            <span className={classes.iconBox}>
              <PlaceIcon className={classes.cardIcon} />
            </span>
            {project.location}
          </div>
          <div className={classes.projectInfoEl}>
            <span className={classes.iconBox}>
              <ExploreIcon className={classes.cardIcon} />
            </span>
            {project.labels.join(",")}
          </div>
        </div>
      </div>
    </Container>
  );
}

function NoProjectFoundLayout() {
  return (
    <>
      <p>Project not found.</p>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProjectByIdIfExists(projectId) {
  return TEMP_FEATURED_DATA.projects.find(({ id }) => id === projectId);
}
