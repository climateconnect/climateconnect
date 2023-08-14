import { Button, Typography, Badge } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import humanizeDuration from "humanize-duration";
import React, { useState, useEffect, useContext } from "react";
import TimeAgo from "react-timeago";
import youtubeRegex from "youtube-regex";

// Relative imports
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import { germanYearAndDayFormatter, yearAndDayFormatter } from "../../utils/formatting";
import DateDisplay from "./../general/DateDisplay";
import DiscussionPreview from "./DiscussionPreview";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import Posts from "./../communication/Posts";
import ProjectRequestersDialog from "../dialogs/ProjectRequestersDialog";
import ProjectStatus from "./ProjectStatus";
import ROLE_TYPES from "../../../public/data/role_types";
import UserContext from "../context/UserContext";
import JoinButton from "./Buttons/JoinButton";
import { getMembershipRequests } from "../../../public/lib/projectOperations";

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
  creator: (props) => ({
    paddingTop: props.isPersonalProject && theme.spacing(0.25),
    paddingLeft: theme.spacing(1),
    color: theme.palette.grey[800],
    cursor: "pointer",
    wordBreak: "break-word",
  }),
  collaboratingOrganization: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    color: theme.palette.grey[800],
    cursor: "pointer",
    breakWord: "break-word",
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
  showRequestsButton: {
    background: "#f7f7f7",
    color: theme.palette.secondary.main,
    "&:hover": {
      background: "#e3e3e3",
    },
  },

  leaveProjectButton: {
    // TODO: we should really encapsulate
    // spacing style into specific spacing components, akin
    // to what Braid's <Box /> component does. This makes
    // the frontend code more maintainable, and spacing more deterministic
    marginTop: theme.spacing(1),
    background: theme.palette.error.main,
    color: "white",
    ["&:hover"]: {
      backgroundColor: theme.palette.error.main,
    },
  },
  joinButton: {
    float: "right",
  },
  projectDescription: {
    wordBreak: "break-word",
  },
  projectParentContainer: {
    display: "flex",
    flexDirection: "row",
  },
  collaborationContainer: {
    display: "flex",
    flexDirection: "row",
  },
}));

export default function ProjectContent({
  collaborationSectionRef,
  discussionTabLabel,
  handleTabChange,
  latestParentComment,
  leaveProject,
  project,
  projectDescriptionRef,
  projectTabsRef,
  typesByTabValue,
  showRequesters,
  toggleShowRequests,
  handleSendProjectJoinRequest,
  requestedToJoinProject,
  token,
}) {
  const classes = useStyles({ isPersonalProject: project.isPersonalProject });
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const [showFullDescription, setShowFullDescription] = useState(false);
  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);
  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;

  const [requesters, setRequesters] = useState([]);
  const [requestersRetrieved, setRequestersRetrieved] = useState(false);
  // Fetch and populate requesters on initial load
  useEffect(() => {
    (async () => {
      //short circuit if the user doesn't have the necessary permissions to see join requests
      if (!(user_permission && hasAdminPermissions)) {
        return;
      }
      // Returns an array of objects with an ID (request ID) and
      // associated user profile.
      try {
        const membershipRequests = await getMembershipRequests(project.url_slug, locale, token);
        // Now transform to a shape of objects where a specific request ID is
        // alongside a user profile.
        const userRequests = membershipRequests.map((r) => {
          const user = {};
          user.requestId = r.id;
          user.user = r.user_profile;
          return user;
        });
        setRequesters(userRequests);
        setRequestersRetrieved(true);
      } catch (e) {
        console.log(e.response.data);
      }
    })();
  }, []);

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

  const hasAdminPermissions = [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(
    user_permission
  );
  return (
    <>
      <div className={classes.contentBlock}>
        <div className={classes.createdBy}>
          {user && project.team && project.team.find((m) => m.id === user.id) && (
            <div className={classes.memberButtons}>
              {user_permission && hasAdminPermissions && (
                <>
                  {/* Badge is dynamic based on the number of membership requesters */}
                  <Badge badgeContent={requesters.length} color="primary">
                    <Button
                      className={`${classes.editProjectButton} ${classes.showRequestsButton}`}
                      variant="contained"
                      onClick={toggleShowRequests}
                    >
                      {texts.review_join_requests}
                    </Button>
                  </Badge>
                  <Button
                    className={classes.editProjectButton}
                    variant="contained"
                    href={getLocalePrefix(locale) + "/editProject/" + project.url_slug}
                  >
                    {project.is_draft ? texts.edit_draft : texts.edit_project}
                  </Button>
                </>
              )}
              {/* Otherwise if not a project admin, just show the Leave Project button */}
              <Button
                className={classes.leaveProjectButton}
                variant="contained"
                onClick={leaveProject}
              >
                {texts.leave_project}
              </Button>
            </div>
          )}

          {/* If the user is an admin on the project, or is already part
            of the project (has read only permissions), then we don't want to show the membership request button. */}
          {!hasAdminPermissions &&
            !(user_permission && [ROLE_TYPES.read_only_type].includes(user_permission)) && (
              <JoinButton
                handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                requestedToJoin={requestedToJoinProject}
                className={classes.joinButton}
              />
            )}

          {/* Only present dialog if button has been clicked! */}
          <ProjectRequestersDialog
            open={showRequesters}
            project={project}
            requesters={requesters}
            onClose={toggleShowRequests}
            user={user}
            loading={!requestersRetrieved}
            user_permission={user_permission}
          />

          {/* Note: created date is not the same as the start date, for projects */}
          <Typography>
            {texts.shared} <DateDisplay date={new Date(project.creation_date)} />
          </Typography>
          <div>
            <div className={classes.projectParentContainer}>
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
                  className={classes.creator}
                  organization={project.creator}
                  size="small"
                />
              )}
            </div>
            {project.end_date && (
              <Typography>
                {texts.finished + " "}
                <TimeAgo
                  date={new Date(project.end_date)}
                  formatter={locale === "de" ? germanYearAndDayFormatter : yearAndDayFormatter}
                />{" "}
              </Typography>
            )}

            {project.collaborating_organizations && project.collaborating_organizations.length > 0 && (
              <div className={classes.collaborationContainer}>
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
        <Typography className={classes.projectDescription} component="div">
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
        <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
          {texts.progress}
        </Typography>
        <Typography variant="body2" fontStyle="italic" fontWeight="bold">
          {texts.follow_the_project_to_be_notified_when_they_make_an_update_post}
        </Typography>
        {project.timeline_posts && project.timeline_posts.length > 0 && (
          <div className={classes.progressContent}>
            <Posts
              posts={project.timeline_posts.sort((a, b) => new Date(b.date) - new Date(a.date))}
              type="progresspost"
            />
          </div>
        )}
      </div>
    </>
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
