import React from "react";
import Link from "next/link";
import TimeAgo from "react-timeago";
import humanizeDuration from "humanize-duration";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProfilePreviews from "./../../src/components/profile/ProfilePreviews";
import Posts from "../../src/components/communication/Posts.js";
import { Container, Typography, Chip, Button, Tabs, Tab } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import ExploreIcon from "@material-ui/icons/Explore";
import TEMP_FEATURED_DATA from "../../public/data/projects.json";
import TEMP_FEATURED_PROFILE_DATA from "../../public/data/profiles.json";
import TEMP_FEATURED_ORGANIZATION_DATA from "../../public/data/organizations.json";
import CheckIcon from "@material-ui/icons/Check";
import BuildIcon from "@material-ui/icons/Build";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    color: theme.palette.grey[800]
  },
  projectOverview: {
    width: "100%",
    padding: 0,
    textAlign: "left"
  },
  blockProjectInfo: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1)
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
    padding: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4)
    }
  },
  largeScreenHeader: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    textAlign: "center"
  },
  tabsWrapper: {
    borderTop: `1px solid ${theme.palette.grey[500]}`,
    borderBottom: `1px solid ${theme.palette.grey[500]}`
  },
  tabContent: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  noPadding: {
    padding: 0
  },
  smallScreenHeader: {
    textAlign: "center",
    paddingBottom: theme.spacing(2)
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
  contactProjectButton: {
    width: 100,
    height: 36
  },
  followButton: {
    float: "right",
    marginRight: theme.spacing(4)
  },
  infoTopBar: {
    paddingBottom: theme.spacing(2)
  },
  infoBottomBar: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: "inline-block",
    width: "100%"
  },
  createdBy: {
    fontSize: 16
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
  subHeader: {
    fontWeight: "bold",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  subSubHeader: {
    fontWeight: "bold",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5)
  },
  checkIcon: {
    color: theme.palette.grey[800]
  },
  chip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    marinTop: theme.spacing(1)
  },
  statusContainer: {
    marginTop: theme.spacing(2)
  },
  italic: {
    fontStyle: "italic"
  },
  info: {
    fontStyle: "italic",
    marginBottom: theme.spacing(1),
    display: "block"
  },
  flexContainer: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1)
  },
  expandButton: {
    width: "100%"
  },
  limitHeight: {
    height: 10
  },
  smallText: {
    fontSize: 14
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
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className={classes.root}>
      {isNarrowScreen ? (
        <SmallScreenOverview project={project} />
      ) : (
        <LargeScreenOverview project={project} />
      )}
      <div className={classes.tabsWrapper}>
        <Container className={classes.noPadding}>
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab className={classes.tab} color="primary" label="Project" />
            <Tab className={classes.tab} label="Team" />
            <Tab className={classes.tab} label="Discussion" />
          </Tabs>
        </Container>
      </div>
      <Container className={classes.tabContent}>
        <TabContent value={tabValue} index={0}>
          <ProjectContent project={project} />
        </TabContent>
        <TabContent value={tabValue} index={1}>
          <TeamContent team={project.team} />
        </TabContent>
        <TabContent value={tabValue} index={2}>
          <CommentsContent comments={project.comments} />
        </TabContent>
      </Container>
    </div>
  );
}

function SmallScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <Container className={classes.projectOverview}>
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
    </Container>
  );
}

function LargeScreenOverview({ project }) {
  const classes = useStyles();
  return (
    <Container className={classes.projectOverview}>
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
    </Container>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

function ProjectContent({ project }) {
  const classes = useStyles();

  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const MAX_DISPLAYED_DESCRIPTION_LENGTH = 500;

  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);

  const statusIcons = {
    Idea: <EmojiObjectsIcon />,
    "In progress": <BuildIcon />,
    "Successfully finished": <DoneAllIcon />,
    Cancelled: <CancelIcon />,
    Recurring: <RotateRightIcon />
  };

  return (
    <div>
      <div className={classes.createdBy}>
        <Typography className={`${classes.info} ${classes.smallText}`}>
          Created <TimeAgo date={new Date(project.creation_date)} />
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
        {project.end_date && project.status === "Successfully finished" && (
          <Typography>
            Finished <TimeAgo date={new Date(project.end_date)} />. Total Duration:{" "}
            {humanizeDuration(new Date(project.end_date) - new Date(project.start_date), {
              largest: 1
            })}
          </Typography>
        )}
        {project.end_date && project.status === "Cancelled" && (
          <Typography>Cancelled :(</Typography>
        )}
      </div>
      <div className={classes.statusContainer}>
        <Chip icon={statusIcons[project.status]} label={project.status} />
      </div>
      <div className={classes.projectContentElement}>
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
        <Typography variant="body2" className={classes.italic}>
          Follow the project to be notified when they make an update post
        </Typography>
        <Posts posts={project.timeline_posts.sort((a, b) => a.date < b.date)} type="openingpost" />
      </div>
    </div>
  );
}

function getAdditionalInfo(team) {
  return team.map(m => {
    const additionalInfo = [];
    if (m.role) additionalInfo.push(m.role);
    if (m.timeperweek)
      additionalInfo.push(m.timeperweek + (m.timeperweek > 1 ? " hours" : " hour") + " per week");
    return additionalInfo;
  });
}

function TeamContent({ team }) {
  return <ProfilePreviews profiles={team} allowMessage additionalInfo={getAdditionalInfo(team)} />;
}

function CommentsContent({ comments }) {
  return (
    <div>
      <Posts posts={comments} type="openingpost" />
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
  const project = TEMP_FEATURED_DATA.projects.find(({ id }) => id === projectId);
  project.team = await getFullProfiles(project.team);
  project.timeline_posts = await Promise.all(
    project.timeline_posts.map(async post => {
      return {
        ...post,
        creator: await getProfileOfPostCreator(post.creator),
        comments: await Promise.all(
          post.replies.map(async reply => {
            return { ...reply, creator: await getProfileOfPostCreator(reply.creator) };
          })
        )
      };
    })
  );
  project.comments = await Promise.all(
    project.comments.map(async comment => {
      return {
        ...comment,
        creator: await getProfileOfPostCreator(comment.creator),
        replies: await Promise.all(
          comment.replies.map(async reply => {
            return { ...reply, creator: await getProfileOfPostCreator(reply.creator) };
          })
        )
      };
    })
  );
  return project;
}

async function getFullProfiles(shortProfiles) {
  const profiles = TEMP_FEATURED_PROFILE_DATA.profiles.filter(
    profile => shortProfiles.filter(shortprofile => shortprofile.url === profile.url).length === 1
  );
  return profiles.map(profile => {
    return {
      ...profile,
      ...shortProfiles.filter(shortprofile => shortprofile.url === profile.url)[0]
    };
  });
}

async function getProfileOfPostCreator(creator) {
  if (creator.type === "organization") {
    const profile = TEMP_FEATURED_ORGANIZATION_DATA.organizations.filter(
      o => o.url === creator.url
    )[0];
    return { ...profile, url: "/organizations/" + profile.url };
  } else if (creator.type === "profile") {
    const profile = TEMP_FEATURED_PROFILE_DATA.profiles.filter(p => p.url === creator.url)[0];
    return { ...profile, url: "/profiles/" + profile.url };
  } else {
    throw new Error(
      "Unaccepted input for 'creator.type':'" +
        creator.type +
        "'. creator.type must be 'organization' or 'project'"
    );
  }
}
