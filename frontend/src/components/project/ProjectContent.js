import React from "react";
import Link from "next/link";
import TimeAgo from "react-timeago";
import humanizeDuration from "humanize-duration";
import { Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import DateDisplay from "./../general/DateDisplay";
import Posts from "./../communication/Posts.js";
import ProjectStatus from "./ProjectStatus";

import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
const MAX_DISPLAYED_DESCRIPTION_LENGTH = 500;

const useStyles = makeStyles(theme => ({
  createdBy: {
    fontSize: 16
  },
  info: {
    fontStyle: "italic",
    marginBottom: theme.spacing(1),
    display: "block",
    fontSize: 14
  },
  creator: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.grey[800]
  },
  creatorImage: {
    height: 24,
    marginBottom: -6,
    paddingRight: theme.spacing(0.5)
  },
  statusContainer: {
    marginTop: theme.spacing(2)
  },
  subHeader: {
    fontWeight: "bold",
    paddingBottom: theme.spacing(2)
  },
  expandButton: {
    width: "100%"
  },
  icon: {
    verticalAlign: "bottom",
    marginTop: 2,
    paddingRight: theme.spacing(0.5)
  },
  chip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    marinTop: theme.spacing(1)
  },
  subSubHeader: {
    fontWeight: 600,
    marginTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  contentBlock: {
    marginBottom: theme.spacing(4)
  },
  collabList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    "& li": {
      paddingLeft: theme.spacing(3),
      position: "relative",
      lineHeight: "30px",
      "&::before": {
        content: '"• "',
        fontWeight: "bold",
        fontSize: 20,
        lineHeight: "30px",
        position: "absolute",
        top: 0,
        left: 0,
        color: theme.palette.primary.main
      }
    }
  },
  progressContent: {
    marginTop: theme.spacing(5)
  },
  collabSection: {
    display: "inline-block",
    width: "50%",
    minWidth: 450
  },
  openToCollabBool: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: "bold"
  }
}));

export default function ProjectContent({ project }) {
  const classes = useStyles();

  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);

  return (
    <div>
      <div className={classes.contentBlock}>
        <div className={classes.createdBy}>
          <Typography>
            Created: <DateDisplay date={new Date(project.creation_date)} />
          </Typography>
          <div>
            <Typography component="span">
              Started <TimeAgo date={new Date(project.start_date)} /> by
            </Typography>
            <Link href={"/organizations/" + project.creator.url_slug}>
              <a className={classes.creator}>
                <img src={project.creator.image} className={classes.creatorImage} />
                <Typography component="span">{project.creator.name}</Typography>
              </a>
            </Link>
          </div>
          {project.end_date && project.status.key === "finished" && (
            <Typography>
              Finished <TimeAgo date={new Date(project.end_date)} />. Total Duration:{" "}
              {humanizeDuration(new Date(project.end_date) - new Date(project.start_date), {
                largest: 1
              })}
            </Typography>
          )}
          {project.end_date && project.status.key === "cancelled" && (
            <Typography>Cancelled :(</Typography>
          )}
        </div>
        <div className={classes.statusContainer}>
          <ProjectStatus status={project.status} />
        </div>
      </div>
      <div className={classes.contentBlock}>
        <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
          Project description
        </Typography>
        <Typography>
          {showFullDescription || project.description.length <= MAX_DISPLAYED_DESCRIPTION_LENGTH
            ? project.description
            : project.description.substr(0, MAX_DISPLAYED_DESCRIPTION_LENGTH) + "..."}
        </Typography>
        {project.description.length > MAX_DISPLAYED_DESCRIPTION_LENGTH && (
          <Button className={classes.expandButton} onClick={handleToggleFullDescriptionClick}>
            {showFullDescription ? (
              <div>
                <ExpandLessIcon className={classes.icon} /> Show less
              </div>
            ) : (
              <div>
                <ExpandMoreIcon className={classes.icon} /> Show more
              </div>
            )}
          </Button>
        )}
      </div>
      <div className={classes.contentBlock}>
        <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
          Collaboration
        </Typography>
        {project.collaborators_welcome ? (
          <CollaborateContent project={project} />
        ) : (
          <Typography className={classes.openToCollabBool}>
            This project is not looking for collaborators right now.
          </Typography>
        )}
      </div>
      <div className={classes.contentBlock}>
        <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
          Progress
        </Typography>
        <Typography variant="body2" fontStyle="italic" fontWeight="bold">
          Follow the project to be notified when they make an update post
        </Typography>
        <div className={classes.progressContent}>
          <Posts
            posts={project.timeline_posts.sort((a, b) => new Date(b.date) - new Date(a.date))}
            type="progresspost"
          />
        </div>
      </div>
    </div>
  );
}

function CollaborateContent({ project }) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="body2" className={classes.info}>
        To fight climate change, we all need to work together! If you like the project, offer to
        work with the team to make it a success!
      </Typography>
      <Typography className={classes.openToCollabBool}>
        This project is open to collaborators.
      </Typography>
      <div>
        <div className={classes.collabSection}>
          <Typography component="h3" color="primary" className={classes.subSubHeader}>
            Helpful skills for collaborating
          </Typography>
          <ul className={classes.collabList}>
            {project.helpful_skills.map((skill, index) => {
              return <li key={index}>{skill}</li>;
            })}
          </ul>
        </div>
        <div className={classes.collabSection}>
          <Typography component="h3" color="primary" className={classes.subSubHeader}>
            Connections to these organizations could help the project:
          </Typography>
          <ul className={classes.collabList}>
            {project.helpful_connections.map((connection, index) => {
              return <li key={index}>{connection}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
