import { Link, ListItemText, MenuItem } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import makeStyles from "@mui/styles/makeStyles";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import GroupIcon from "@mui/icons-material/Group";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import { getFragmentsWithMentions } from "../../../utils/mentions_markdown";
import UserContext from "../../context/UserContext";
import {
  IdeaCommentNotification,
  IdeaCommentReplyNotification,
  ProjectCommentNotification,
  ProjectCommentReplyNotification,
} from "./CommentNotifications";
import GenericNotification from "./GenericNotification";
import { buildHubUrl } from "../../../../public/lib/urlBuilder";

const useStyles = makeStyles((theme) => {
  return {
    messageSender: {
      fontWeight: 600,
      whiteSpace: "normal",
    },
    listItemText: {
      whiteSpace: "normal",
    },
    goToInboxText: {
      textAlign: "center",
      display: "block",
      marginTop: theme.spacing(1),
    },
    notificationText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };
});
export const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
    maxWidth: 450,
  },
}))(MenuItem);

//When editing this: make sure all entries are still at the correct index afterwards
//It has to match with Notification.NOTIFICATION_TYPES in the backend
const NOTIFICATION_TYPES = [
  "broadcast", // 0
  "private_message", // 1
  "project_comment", // 2
  "reply_to_project_comment", // 3
  "project_follower", // 4
  "project_update_post", // 5
  "post_comment", // 6
  "reply_to_post_comment", // 7
  "group_message", // 8
  "join_project_request", // 9
  "project_join_request_approved", // 10
  "mention", // 11
  "project_like", // 12
  "idea_comment", // 13
  "reply_to_idea_comment", // 14
  "person_joined_idea", // 15
  "organization_follower", // 16
  "org_project_published", // 17
];

//component for rendering the notifications that are shown when clicking on the bell on the right side of the header
export default function Notification({
  notification,
  isPlaceholder,
}: {
  notification?: any;
  isPlaceholder?: boolean;
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, idea: notification?.idea });
  if (isPlaceholder) {
    return <PlaceholderNotification />;
  }

  const type = NOTIFICATION_TYPES[notification.notification_type];
  if (type === "private_message") {
    return <PrivateMessageNotification notification={notification} />;
  } else if (type === "project_comment") {
    return <ProjectCommentNotification notification={notification} />;
  } else if (type === "reply_to_project_comment") {
    return <ProjectCommentReplyNotification notification={notification} />;
  } else if (type === "project_follower") {
    return <ProjectFollowerNotification notification={notification} />;
  } else if (type === "group_message") {
    return <GroupMessageNotification notification={notification} />;
  } else if (type === "join_project_request") {
    return <JoinProjectRequestNotification notification={notification} />;
  } else if (type === "project_join_request_approved") {
    return <JoinProjectRequestApprovedNotification notification={notification} />;
  } else if (type === "mention") {
    return <MentionNotification notification={notification} texts={texts} locale={locale} />;
  } else if (type === "idea_comment") {
    return <IdeaCommentNotification notification={notification} />;
  } else if (type === "reply_to_idea_comment") {
    return <IdeaCommentReplyNotification notification={notification} />;
  } else if (type === "person_joined_idea") {
    return <PersonJoinedIdeaNotification notification={notification} />;
  } else if (type === "project_like") {
    return <ProjectLikeNotification notification={notification} />;
  } else if (type === "organization_follower") {
    return <OrganizationFollowerNotification notification={notification} />;
  } else if (type === "org_project_published") {
    return <OrgProjectSharedNotification notification={notification} />;
  } else return <></>;
}

const JoinProjectRequestNotification = ({ notification }) => {
  const requester = notification.membership_requester;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", project: notification.project, locale: locale });
  const requesterName = requester?.first_name + " " + requester?.last_name;
  return (
    <GenericNotification
      link={`/projects/${notification?.project?.url_slug}?show_join_requests=true`}
      avatar={{
        alt: requesterName,
        image: requester?.thumbnail_image,
      }}
      primaryText={requesterName + " " + texts.wants_to_join_your_project}
      notification={notification}
    />
  );
};

const JoinProjectRequestApprovedNotification = ({ notification }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", project: notification.project, locale: locale });
  return (
    <GenericNotification
      link={`/projects/${notification.project.url_slug}#team`}
      notificationIcon={{
        icon: GroupIcon,
      }}
      primaryText={texts.project_accepted_you_as_a_member}
      notification={notification}
    />
  );
};

const PersonJoinedIdeaNotification = ({ notification }) => {
  const supporter = notification.idea_supporter;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, idea: notification.idea });
  //TODO: Link to group chat
  return (
    <GenericNotification
      link={`/chat/${notification.idea_supporter_chat}`}
      avatar={{
        alt: supporter?.first_name + " " + supporter?.last_name,
        image: supporter?.thumbnail_image,
      }}
      primaryText={
        supporter?.first_name + " " + supporter?.last_name + " " + texts.joined_your_idea
      }
      secondaryText={texts.send_a_Message_to_welcome_them_in_the_group_chat}
      notification={notification}
    />
  );
};

const PrivateMessageNotification = ({ notification }) => {
  const sender = notification.last_message.sender;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  return (
    <GenericNotification
      link={`/chat/${notification.chat_uuid}/`}
      avatar={{
        alt: sender?.first_name + " " + sender?.last_name,
        image: sender?.thumbnail_image,
      }}
      primaryText={texts.message_from + " " + sender?.first_name + " " + sender?.last_name}
      secondaryText={notification.last_message.content}
      notification={notification}
    />
  );
};

const GroupMessageNotification = ({ notification }) => {
  const group_title = notification.chat_title;
  const sender = notification.last_message.sender;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  return (
    <GenericNotification
      link={`/chat/${notification.chat_uuid}/`}
      notificationIcon={{
        icon: GroupIcon,
      }}
      primaryText={texts.message_in + " " + group_title}
      secondaryText={
        sender.first_name + " " + sender.last_name + ": " + notification.last_message.content
      }
      notification={notification}
    />
  );
};

const PlaceholderNotification = () => {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  return (
    <Link href={getLocalePrefix(locale) + "/inbox"} underline="none" color="inherit">
      <StyledMenuItem>
        <ListItemText className={classes.listItemText} disableTypography>
          {texts.placeholderNotification}
          <div>
            <Link className={classes.goToInboxText} underline="hover">
              {texts.go_to_inbox}
            </Link>
          </div>
        </ListItemText>
      </StyledMenuItem>
    </Link>
  );
};

const MentionNotification = ({ notification, texts, locale }) => {
  const entityType = notification.project_comment ? "project" : "idea";
  const commentProp = `${entityType}_comment`;

  // TODO: need to refactor this to suport the correct
  // notifications when a user has requested to join a project. See
  // https://github.com/climateconnect/climateconnect/issues/898
  const sender = notification[commentProp] ? notification[commentProp].author_user : "Anonymous";

  let urlEnding;
  if (!notification.idea && !notification.project) {
    urlEnding = null;
  } else {
    urlEnding =
      entityType === "project"
        ? `/projects/${notification?.project?.url_slug}/#comments`
        : buildHubUrl({
            hubUrlSlug: notification?.idea?.hub_url_slug,
            queryParams: `idea=${notification?.idea?.url_slug}`,
            hash: "ideas",
            pathType: "hubBrowse",
          });
    // : `/hubs/${notification.idea.hub_url_slug}?idea=${notification.idea.url_slug}#ideas`;
  }

  const previewText = getFragmentsWithMentions(notification[commentProp]?.content, false, locale);

  return (
    <GenericNotification
      link={urlEnding && getLocalePrefix(locale) + urlEnding}
      notificationIcon={{ icon: AlternateEmailIcon }}
      primaryText={
        sender.first_name +
        " " +
        sender.last_name +
        " " +
        texts.mentioned_you_in_comment_about_project
      }
      secondaryText={previewText}
      notification={notification}
    />
  );
};

const ProjectFollowerNotification = ({ notification }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const followerName =
    notification.project_follower.first_name + " " + notification.project_follower.last_name;
  return (
    <GenericNotification
      link={`/projects/${notification.project.url_slug}?show_followers=true`}
      avatar={{
        alt: followerName,
        image: notification.project_follower.thumbnail_image,
      }}
      primaryText={`${followerName} ${texts.now_follows_your_project} "${notification.project.name}"`}
      secondaryText={texts.congratulations}
      notification={notification}
    />
  );
};

const ProjectLikeNotification = ({ notification }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, project: notification.project });
  const likingUserName =
    notification.project_like.first_name + " " + notification.project_like.last_name;
  return (
    <GenericNotification
      link={`/projects/${notification.project.url_slug}?show_likes=true`}
      avatar={{
        alt: likingUserName,
        image: notification.project_like.thumbnail_image,
      }}
      primaryText={`${likingUserName} ${texts.liked_your_project}`}
      secondaryText={texts.congratulations}
      notification={notification}
    />
  );
};
const OrganizationFollowerNotification = ({ notification }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const followerName =
    notification.organization_follower.first_name +
    " " +
    notification.organization_follower.last_name;
  return (
    <GenericNotification
      link={`/organizations/${notification.organization.url_slug}?show_followers=true`}
      avatar={{
        alt: followerName,
        image: notification.organization_follower.thumbnail_image,
      }}
      primaryText={`${followerName} ${texts.now_follows_your_organization} "${notification.organization.name}"`}
      secondaryText={texts.congratulations}
      notification={notification}
    />
  );
};
const OrgProjectSharedNotification = ({ notification }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });

  const projectName = notification.project.name;

  return (
    <GenericNotification
      link={`/projects/${notification.project.url_slug}`}
      avatar={{
        alt: projectName,
        image: notification.project.image,
      }}
      primaryText={`${notification.organization.name} ${texts.just_shared_project} "${projectName}"`}
      secondaryText={texts.go_check_it_out}
      notification={notification}
    />
  );
};

export { NOTIFICATION_TYPES };
