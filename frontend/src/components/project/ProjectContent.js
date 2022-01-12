import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import humanizeDuration from "humanize-duration";
import React, { useContext } from "react";
import TimeAgo from "react-timeago";
import ROLE_TYPES from "../../../public/data/role_types";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { germanYearAndDayFormatter, yearAndDayFormatter } from "../../utils/formatting";
import FollowButton from "./Buttons/FollowButton";
import MessageContent from "../communication/MessageContent";
import UserContext from "../context/UserContext";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import DateDisplay from "./../general/DateDisplay";
import ProjectStatus from "./ProjectStatus";
import DiscussionPreview from "./DiscussionPreview";
import ProgressPosts from "./ProjectProgressPosts/ProgressPosts";
import youtubeRegex from "youtube-regex";

const MAX_DISPLAYED_DESCRIPTION_LENGTH = 500;

const useStyles = makeStyles((theme) => ({
  createdBy: {
    fontSize: 16,
  },
  info: {
    fontStyle: "italic",
    marginBottom: theme.spacing(1),
    display: "block",
    fontSize: 14,
  },
  creator: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.grey[800],
    cursor: "pointer",
  },
  collaboratingOrganization: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    color: theme.palette.grey[800],
    cursor: "pointer",
  },
  creatorImage: {
    height: 24,
    marginBottom: -6,
    paddingRight: theme.spacing(0.5),
  },
  statusContainer: {
    marginTop: theme.spacing(2),
  },
  subHeader: {
    fontWeight: "bold",
    paddingBottom: theme.spacing(2),
  },
  expandButton: {
    width: "100%",
  },
  icon: {
    verticalAlign: "bottom",
    marginTop: 2,
    paddingRight: theme.spacing(0.5),
  },
  chip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    marinTop: theme.spacing(1),
  },
  subSubHeader: {
    fontWeight: 600,
    marginTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  contentBlock: {
    marginBottom: theme.spacing(4),
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
        color: theme.palette.primary.main,
      },
    },
  },
  progressContent: {
    marginTop: theme.spacing(5),
  },
  collabSection: {
    display: "inline-block",
    width: "50%",
    "@media (max-width:900px)": {
      width: "100%",
    },
  },
  collabSectionContainer: {
    display: "flex",
    marginRight: theme.spacing(3),
    justifyContent: "space-between",
    "@media (max-width:900px)": {
      display: "block",
    },
  },
  openToCollabBool: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
  },
  memberButtons: {
    float: "right",
    display: "flex",
    flexDirection: "column",
  },
  editProjectButton: {
    marginTop: theme.spacing(1),
  },
  leaveProjectButton: {
    background: theme.palette.error.main,
    color: "white",
    ["&:hover"]: {
      backgroundColor: theme.palette.error.main,
    },
  },
  finishedDate: {
    marginTop: theme.spacing(0.5),
  },
  progressPostsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  newPostButton: {
    marginTop: theme.spacing(1),
    whiteSpace: "nowrap",
  },
}));

export default function ProjectContent({
  project,
  leaveProject,
  projectDescriptionRef,
  collaborationSectionRef,
  discussionTabLabel,
  latestParentComment,
  handleTabChange,
  typesByTabValue,
  projectTabsRef,
  token,
  isUserFollowing,
  handleToggleFollowProject,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  numberOfFollowers,
}) {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);
  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;

  const [currentPosts, setCurrentPosts] = React.useState(project.timeline_posts);
  const [userIsEditingPost, setUserIsEditingPost] = React.useState(false);
  const displayEditingInterface = (bool) => {
    setUserIsEditingPost(bool);
  };
  const [disableEditingButton, setDisableEditingButton] = React.useState(false);
  const refreshCurrentPosts = (post) => {
    if (post.deletePost) {
      setCurrentPosts([
        ...currentPosts.filter((f) => f.id > post.id),
        ...currentPosts.filter((f) => f.id < post.id),
      ]);
      return;
    }
    setDisableEditingButton(false);
    displayEditingInterface(false);
    setCurrentPosts([
      ...currentPosts.filter((f) => f.id > post.id),
      post,
      ...currentPosts.filter((f) => f.id < post.id),
    ]);
  };
  const handleNewPost = () => {
    displayEditingInterface(true);
    setDisableEditingButton(true);
    const emptyPost = {
      id: currentPosts[0].id + 1,
      currentlyEdited: true,
    };
    setCurrentPosts([emptyPost, ...currentPosts]);
  };
  const closeEditingInterface = (deleteUnsaved) => {
    displayEditingInterface(false);
    setDisableEditingButton(false);
    deleteUnsaved && setCurrentPosts([...currentPosts.filter((f) => f.currentlyEdited !== true)]);
  };

  const CalculateMaxDisplayedDescriptionLength = (description) => {
    const words = description.split(" ");
    const youtubeLink = words.find((el) => youtubeRegex().test(el));
    if (youtubeLink) {
      const firstIndex = description.indexOf(youtubeLink);
      const lastIndex = firstIndex + youtubeLink.length - 1;
      const maxLength =
        firstIndex <= MAX_DISPLAYED_DESCRIPTION_LENGTH &&
        lastIndex > MAX_DISPLAYED_DESCRIPTION_LENGTH
          ? lastIndex
          : MAX_DISPLAYED_DESCRIPTION_LENGTH;
      return maxLength;
    } else {
      return MAX_DISPLAYED_DESCRIPTION_LENGTH;
    }
  };
  const maxDisplayedDescriptionLength = project.description
    ? CalculateMaxDisplayedDescriptionLength(project.description)
    : null;
  return (
    <div>
      <div className={classes.contentBlock}>
        <div className={classes.createdBy}>
          {user && project.team && project.team.find((m) => m.id === user.id) && (
            <div className={classes.memberButtons}>
              <Button
                className={classes.leaveProjectButton}
                variant="contained"
                onClick={leaveProject}
              >
                {texts.leave_project}
              </Button>
              {user_permission &&
                [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(user_permission) && (
                  <Button
                    className={classes.editProjectButton}
                    variant="contained"
                    color="primary"
                    href={getLocalePrefix(locale) + "/editProject/" + project.url_slug}
                  >
                    {project.is_draft ? texts.edit_draft : texts.edit_project}
                  </Button>
                )}
            </div>
          )}
          {/* Note: created date is not the same as the start date, for projects */}
          <Typography>
            {texts.created}: <DateDisplay date={new Date(project.creation_date)} />
          </Typography>
          <div>
            <Typography component="span">
              {texts.started + " "}
              <TimeAgo
                date={new Date(project.start_date)}
                formatter={locale === "de" ? germanYearAndDayFormatter : yearAndDayFormatter}
              />{" "}
              {texts.by}
            </Typography>
            {project.isPersonalProject ? (
              <MiniProfilePreview
                className={classes.creator}
                profile={project.creator}
                size="small"
              />
            ) : (
              <MiniOrganizationPreview
                size="small"
                className={classes.creator}
                organization={project.creator}
              />
            )}
            {project.end_date && (
              <Typography className={classes.finishedDate}>
                {texts.finished + " "}
                <TimeAgo
                  date={new Date(project.end_date)}
                  formatter={locale === "de" ? germanYearAndDayFormatter : yearAndDayFormatter}
                />{" "}
              </Typography>
            )}
            {project.collaborating_organizations && project.collaborating_organizations.length > 0 && (
              <div>
                <span> {texts.in_collaboration_with}</span>
                {project.collaborating_organizations.map((o) => (
                  <MiniOrganizationPreview
                    key={o.id}
                    size="small"
                    className={classes.collaboratingOrganization}
                    organization={o}
                  />
                ))}
              </div>
            )}
          </div>
          {project.end_date && project.status.key === "finished" && (
            <Typography>
              {texts.finished} <TimeAgo date={new Date(project.end_date)} />. {texts.total_duration}
              :{" "}
              {humanizeDuration(new Date(project.end_date) - new Date(project.start_date), {
                largest: 1,
                language: locale,
              })}
            </Typography>
          )}
          {project.end_date && project.status.key === "cancelled" && (
            <Typography>{texts.cancelled} :(</Typography>
          )}
        </div>
        <div className={classes.statusContainer}>
          <ProjectStatus status={project.status} />
        </div>
      </div>
      <div className={classes.contentBlock}>
        <Typography
          component="h2"
          variant="h6"
          color="primary"
          ref={projectDescriptionRef}
          className={classes.subHeader}
        >
          {texts.project_description}
        </Typography>
        <Typography component="div">
          {project.description ? (
            showFullDescription || project.description.length <= maxDisplayedDescriptionLength ? (
              <MessageContent content={project.description} renderYoutubeVideos={1} />
            ) : (
              <MessageContent
                content={project.description.substr(0, maxDisplayedDescriptionLength) + "..."}
                renderYoutubeVideos={1}
              />
            )
          ) : (
            <Typography variant="body2">
              {texts.this_project_hasnt_added_a_description_yet}
            </Typography>
          )}
        </Typography>
        {project.description && project.description.length > maxDisplayedDescriptionLength && (
          <Button className={classes.expandButton} onClick={handleToggleFullDescriptionClick}>
            {showFullDescription ? (
              <div>
                <ExpandLessIcon className={classes.icon} /> {texts.show_less}
              </div>
            ) : (
              <div>
                <ExpandMoreIcon className={classes.icon} /> {texts.show_more}
              </div>
            )}
          </Button>
        )}
      </div>
      {latestParentComment[0] && (
        <DiscussionPreview
          latestParentComment={latestParentComment}
          discussionTabLabel={discussionTabLabel}
          locale={locale}
          project={project}
          handleTabChange={handleTabChange}
          typesByTabValue={typesByTabValue}
          projectTabsRef={projectTabsRef}
        />
      )}
      <div className={classes.contentBlock} ref={collaborationSectionRef}>
        <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
          {texts.collaboration}
        </Typography>
        {project.collaborators_welcome ? (
          <CollaborateContent project={project} texts={texts} />
        ) : (
          <Typography className={classes.openToCollabBool}>
            {texts.this_project_is_not_looking_for_collaborators_right_now}
          </Typography>
        )}
      </div>
      <div className={classes.contentBlock}>
        <div className={classes.progressPostsHeader}>
          <div>
            <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
              {texts.progress}
            </Typography>
            <Typography variant="body2" fontStyle="italic" fontWeight="bold">
              {texts.follow_the_project_to_be_notified_when_they_make_an_update_post}
            </Typography>
          </div>
          {user_permission ? (
            [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(user_permission) && (
              <Button
                className={classes.newPostButton}
                variant="contained"
                color="primary"
                onClick={handleNewPost}
                disabled={disableEditingButton}
              >
                {texts.new_update}
              </Button>
            )
          ) : (
            <FollowButton 
              texts={texts}
              isUserFollowing={isUserFollowing}
              handleToggleFollowProject={handleToggleFollowProject}
              hasAdminPermissions={hasAdminPermissions}
              toggleShowFollowers={toggleShowFollowers}
              followingChangePending={followingChangePending}
              numberOfFollowers={numberOfFollowers} />
          )}
        </div>
        {project.timeline_posts && project.timeline_posts.length > 0 && (
          <div className={classes.progressContent}>
            <ProgressPosts
              posts={currentPosts}
              locale={locale}
              token={token}
              texts={texts}
              closeEditingInterface={closeEditingInterface}
              project={project}
              refreshCurrentPosts={refreshCurrentPosts}
              displayEditingInterface={displayEditingInterface}
              userPermission={user_permission}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CollaborateContent({ project, texts }) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="body2" className={classes.info}>
        {texts.to_fight_climate_change_we_all_need_to_work_together}
      </Typography>
      <Typography className={classes.openToCollabBool}>
        {texts.this_project_is_open_to_collaborators}
      </Typography>
      <div className={classes.collabSectionContainer}>
        {project.helpful_skills && project.helpful_skills.length > 0 && (
          <div className={classes.collabSection}>
            <Typography component="h3" color="primary" className={classes.subSubHeader}>
              {texts.helpful_skills_for_collaborating}:
            </Typography>
            <ul className={classes.collabList}>
              {project.helpful_skills.length > 0 &&
                project.helpful_skills.map((skill) => {
                  return <li key={skill.id}>{skill.name}</li>;
                })}
            </ul>
          </div>
        )}
        {project.helpful_connections && project.helpful_connections.length > 0 && (
          <div className={classes.collabSection}>
            <Typography component="h3" color="primary" className={classes.subSubHeader}>
              {texts.connections_to_these_organizations_could_help_the_project}:
            </Typography>
            <ul className={classes.collabList}>
              {project.helpful_connections.map((connection, index) => {
                return <li key={index}>{connection}</li>;
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
