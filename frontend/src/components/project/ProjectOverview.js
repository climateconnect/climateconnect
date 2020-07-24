import React from "react";
import { Container, Typography, Button, Tooltip, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import ExploreIcon from "@material-ui/icons/Explore";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import MessageContent from "../communication/MessageContent";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import LanguageIcon from '@material-ui/icons/Language';
import Linkify from "react-linkify";

const useStyles = makeStyles(theme => ({
  ...projectOverviewStyles(theme)
}));

const componentDecorator = (href, text, key) => (
  <Link color="primary" underline="always" href={href} key={key} target="_blank" rel="noopener noreferrer">
    {text}
  </Link>
);

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
      <img className={classes.fullWidthImage} src={getImageUrl(project.image)} />
      <div className={classes.blockProjectInfo}>
        <Typography component="h1" variant="h3" className={classes.smallScreenHeader}>
          {project.name}
        </Typography>

        <Typography>{project.shortdescription}</Typography>
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title="Location">
              <PlaceIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.location}
          </Typography>
        </div>
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title="Website">
              <LanguageIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
            
          </Typography>
        </div>
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title="Categories">
              <ExploreIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.tags.join(", ")}
          </Typography>
        </div>
        <div className={classes.infoBottomBar}>
          <Button className={classes.contactProjectButton} variant="contained" color="primary">
            Contact
          </Button>
          <Button className={classes.followButton} variant="contained" color="primary">
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
      <Typography component="h1" variant="h4" className={classes.largeScreenHeader}>
        {project.name}
      </Typography>
      <div className={classes.flexContainer}>
        <img className={classes.inlineImage} src={getImageUrl(project.image)} />
        <div className={classes.inlineProjectInfo}>
          <Typography component="h2" variant="h5" className={classes.subHeader}>
            Summary
          </Typography>
          <Typography component="div">
            <MessageContent content={project.shortdescription} />
          </Typography>
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Location">
                <PlaceIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.location}
            </Typography>
          </div>
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Website">
                <LanguageIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
            </Typography>
          </div>
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Categories">
                <ExploreIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.tags.join(", ")}
            </Typography>
          </div>
          <div className={classes.infoBottomBar}>
            <Button className={classes.contactProjectButton} variant="contained" color="primary">
              Contact
            </Button>
            <Button className={classes.followButton} variant="contained" color="primary">
              Follow
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
