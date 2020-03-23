import React from "react";
import Link from "next/link";
import TimeAgo from "react-timeago";
import humanizeDuration from "humanize-duration";
import { Typography, Chip, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import DateDisplay from "./../general/DateDisplay";
import Posts from "./../communication/Posts.js";
import ProjectStatus from "./ProjectStatus";

import CheckIcon from "@material-ui/icons/Check";
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
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
    fontWeight: "bold",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5)
  }
}));

export default function ProjectContent({ project }) {
  const classes = useStyles();

  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);

  return (
    <div>
      <div className={classes.createdBy}>
        <Typography className={classes.info}>
          Created: <DateDisplay date={new Date(project.creation_date)} />
        </Typography>
        <div>
          <Typography component="span">
            Started <TimeAgo date={new Date(project.start_date)} /> by
          </Typography>
          <Link href={"/organizations/" + project.creator_url}>
            <a className={classes.creator}>
              <img src={project.creator_image} className={classes.creatorImage} />
              <Typography component="span">{project.creator_name}</Typography>
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
      <div>
        <Typography component="h2" variant="h4" className={classes.subHeader}>
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
        <Typography component="h2" variant="h4" className={classes.subHeader}>
          Collaboration
        </Typography>
        {project.collaborators_welcome ? (
          <CollaborateContent project={project} />
        ) : (
          <Typography>This project is not looking for collaborators right now</Typography>
        )}
        <Typography component="h2" variant="h4" className={classes.subHeader}>
          Progress
        </Typography>
        <Typography variant="body2" fontStyle="italic">
          Follow the project to be notified when they make an update post
        </Typography>
        <Posts
          posts={project.timeline_posts.sort((a, b) => new Date(b.date) - new Date(a.date))}
          type="openingpost"
        />
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
      <Typography>
        <CheckIcon style={{ color: "green" }} className={classes.icon} />
        This project is open to collaborators
      </Typography>
      <div>
        <Typography component="h3" className={classes.subSubHeader}>
          Helpful skills for collaborating
        </Typography>
        {project.helpful_skills.map((skill, index) => {
          return <Chip size="medium" key={index} label={skill} className={classes.chip} />;
        })}
        <Typography component="h3" className={classes.subSubHeader}>
          Connections to these organizations could help the project:
        </Typography>
        {project.helpful_connections.map((connection, index) => {
          return <Chip size="medium" key={index} label={connection} className={classes.chip} />;
        })}
      </div>
    </>
  );
}
