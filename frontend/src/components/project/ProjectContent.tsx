import { Button, Typography, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import humanizeDuration from "humanize-duration";
import React, { useState, useContext } from "react";
import TimeAgo from "react-timeago";
import youtubeRegex from "youtube-regex";
import { Theme } from "@mui/material/styles";

// Relative imports
import { germanYearAndDayFormatter, yearAndDayFormatter } from "../../utils/formatting";
import DateDisplay from "./../general/DateDisplay";
import DiscussionPreview from "./DiscussionPreview";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import Posts from "./../communication/Posts";
import UserContext from "../context/UserContext";
import ProjectContentSideButtons from "./Buttons/ProjectContentSideButtons";

const MAX_DISPLAYED_DESCRIPTION_LENGTH = 500;

const useStyles = makeStyles((theme: Theme) => ({
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
  subHeader: {
    fontWeight: "bold",
    paddingBottom: theme.spacing(1),
  },
  expandButton: {
    width: "100%",
    color: theme.palette.background.default_contrastText,
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
    color: theme?.palette?.background?.default_contrastText,
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
        color: theme?.palette?.background?.default_contrastText,
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
  projectDescription: {
    wordBreak: "break-word",
  },
  projectParentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  collaborationContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));

export default function ProjectContent({
  discussionTabLabel,
  handleTabChange,
  latestParentComment,
  leaveProject,
  project,
  projectTabsRef,
  typesByTabValue,
  showRequesters,
  toggleShowRequests,
  handleSendProjectJoinRequest,
  requestedToJoinProject,
  hubUrl,
}) {
  const classes = useStyles({ isPersonalProject: project.isPersonalProject });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [showFullDescription, setShowFullDescription] = useState(false);
  const handleToggleFullDescriptionClick = () => setShowFullDescription(!showFullDescription);
  const calculateMaxDisplayedDescriptionLength = (description) => {
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
    ? calculateMaxDisplayedDescriptionLength(project.description)
    : 0;

  //return the right static text depending on the project type
  const getProjectDescriptionHeadline = () => {
    const type = project.project_type.type_id;
    if (type === "event") return texts.event_description;
    if (type === "idea") return texts.idea_description;
    return texts.project_description;
  };

  const getNoProjectDescriptionText = () => {
    const type = project.project_type.type_id;
    if (type === "event") return texts.this_event_hasnt_added_a_description_yet;
    if (type === "idea") return texts.this_idea_hasnt_added_a_description_yet;
    return texts.this_project_hasnt_added_a_description_yet;
  };
  const theme = useTheme();
  
  return (
    <>
      <div className={classes.contentBlock}>
        <div className={classes.createdBy}>
          <ProjectContentSideButtons
            project={project}
            showRequesters={showRequesters}
            toggleShowRequests={toggleShowRequests}
            handleSendProjectJoinRequest={handleSendProjectJoinRequest}
            requestedToJoinProject={requestedToJoinProject}
            leaveProject={leaveProject}
            hubUrl={hubUrl}
          />
          {/* Note: created date is not the same as the start date, for projects */}
          <Typography>
            {texts.shared} <DateDisplay date={new Date(project.creation_date)} />
          </Typography>
          <div>
            <div className={classes.projectParentContainer}>
              <Typography component="span">
                {project.project_type.type_id === "event" ? (
                  <>{texts.event_organized_by}</>
                ) : (
                  <>
                    {texts.started + " "}
                    <TimeAgo
                      date={new Date(project.start_date)}
                      formatter={locale === "de" ? germanYearAndDayFormatter : yearAndDayFormatter}
                    />{" "}
                    {texts.by}
                  </>
                )}
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
                    inline
                    size="small"
                    hubUrl={hubUrl}
                  />
                )}
              </Typography>
            </div>
            {project.project_type.type_id === "project" && project.end_date && (
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
                    inline
                    className={classes.collaboratingOrganization}
                    organization={o}
                    hubUrl={hubUrl}
                  />
                ))}
              </div>
            )}
          </div>
          {
            // TODO: update remove
            project.end_date && project.status.key === "finished" && (
              <Typography>
                {texts.finished} <TimeAgo date={new Date(project.end_date)} />.{" "}
                {texts.total_duration}:{" "}
                {humanizeDuration(new Date(project.end_date) - new Date(project.start_date), {
                  largest: 1,
                  language: locale,
                })}
              </Typography>
            )
          }
          {
            // TODO: update remove
            project.end_date && project.status.key === "cancelled" && (
              <Typography>{texts.cancelled} :(</Typography>
            )
          }
        </div>
      </div>
      <div className={classes.contentBlock}>
        <Typography
          component="h2"
          variant="h6"
          color={theme.palette.background.default_contrastText}
          className={classes.subHeader}
        >
          {getProjectDescriptionHeadline()}
        </Typography>
        <Typography className={classes.projectDescription} component="div">
          {project.description ? (
            showFullDescription || project.description.length <= maxDisplayedDescriptionLength ? (
              <MessageContent content={project.description} renderYoutubeVideos={true} />
            ) : (
              <MessageContent
                content={project.description.substr(0, maxDisplayedDescriptionLength) + "..."}
                renderYoutubeVideos={true}
              />
            )
          ) : (
            <Typography variant="body2">{getNoProjectDescriptionText()}</Typography>
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
          hubUrl={hubUrl}
        />
      )}
      <div className={classes.contentBlock}>
        <Typography
          component="h2"
          variant="h6"
          color={theme.palette.background.default_contrastText}
          className={classes.subHeader}
        >
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
        <Typography
          component="h2"
          variant="h6"
          color={theme.palette.background.default_contrastText}
          className={classes.subHeader}
        >
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
              hubUrl={hubUrl}
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
