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
      color: theme.palette.background.default_contrastText,
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
  hubUrl,
}: {
  notification?: any;
  isPlaceholder?: boolean;
  hubUrl?: string;
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, idea: notification?.idea });
  if (isPlaceholder) {
    return <PlaceholderNotification hubUrl={hubUrl} />;
  }

  const type = NOTIFICATION_TYPES[notification.notification_type];
  if (type === "private_message") {
    return <PrivateMessageNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "project_comment") {
    return <ProjectCommentNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "reply_to_project_comment") {
    return <ProjectCommentReplyNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "project_follower") {
    return <ProjectFollowerNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "group_message") {
    return <GroupMessageNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "join_project_request") {
    return <JoinProjectRequestNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "project_join_request_approved") {
    return <JoinProjectRequestApprovedNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "mention") {
    return (
      <MentionNotification
        notification={notification}
        texts={texts}
        locale={locale}
        hubUrl={hubUrl}
      />
    );
  } else if (type === "idea_comment") {
    return <IdeaCommentNotification notification={notification} />;
  } else if (type === "reply_to_idea_comment") {
    return <IdeaCommentReplyNotification notification={notification} />;
  } else if (type === "person_joined_idea") {
    return <PersonJoinedIdeaNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "project_like") {
    return <ProjectLikeNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "organization_follower") {
    return <OrganizationFollowerNotification notification={notification} hubUrl={hubUrl} />;
  } else if (type === "org_project_published") {
    return <OrgProjectSharedNotification notification={notification} hubUrl={hubUrl} />;
  } else return <></>;
}

const JoinProjectRequestNotification = ({ notification, hubUrl }) => {
  const requester = notification.membership_requester;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", project: notification.project, locale: locale });
  const requesterName = requester?.first_name + " " + requester?.last_name;
  const baseUrl = `/projects/${notification?.project?.url_slug}`;
  const notifLink = hubUrl
    ? `${baseUrl}?hub=${hubUrl}&show_join_requests=true`
    : `${baseUrl}?show_join_requests=true`;
  return (
    <GenericNotification
      link={notifLink}
      avatar={{
        alt: requesterName,
        image: requester?.thumbnail_image,
      }}
      primaryText={requesterName + " " + texts.wants_to_join_your_project}
      notification={notification}
    />
  );
};

const JoinProjectRequestApprovedNotification = ({ notification, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", project: notification.project, locale: locale });
  const baseUrl = `/projects/${notification.project.url_slug}`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}#team` : `${baseUrl}#team`;
  return (
    <GenericNotification
      link={notifLink}
      notificationIcon={{
        icon: GroupIcon,
      }}
      primaryText={texts.project_accepted_you_as_a_member}
      notification={notification}
    />
  );
};

const PersonJoinedIdeaNotification = ({ notification, hubUrl }) => {
  const supporter = notification.idea_supporter;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, idea: notification.idea });
  const baseUrl = `/chat/${notification.idea_supporter_chat}`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}` : baseUrl;
  //TODO: Link to group chat
  return (
    <GenericNotification
      link={notifLink}
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

const PrivateMessageNotification = ({ notification, hubUrl }) => {
  const sender = notification.last_message.sender;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const baseUrl = `/chat/${notification.chat_uuid}/`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}` : baseUrl;
  return (
    <GenericNotification
      link={notifLink}
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

const GroupMessageNotification = ({ notification, hubUrl }) => {
  const group_title = notification.chat_title;
  const sender = notification.last_message.sender;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const baseUrl = `/chat/${notification.chat_uuid}/`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}` : baseUrl;
  return (
    <GenericNotification
      link={notifLink}
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

const PlaceholderNotification = ({ hubUrl }) => {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const baseUrl = `${getLocalePrefix(locale)}/inbox`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}` : baseUrl;
  return (
    <Link href={notifLink} underline="none" color="inherit">
      <StyledMenuItem>
        <ListItemText className={classes.listItemText} disableTypography>
          {texts.placeholderNotification}
          <div>
            <span className={classes.goToInboxText}>{texts.go_to_inbox}</span>
          </div>
        </ListItemText>
      </StyledMenuItem>
    </Link>
  );
};

const MentionNotification = ({ notification, texts, locale, hubUrl }) => {
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
        ? `/projects/${notification.project.url_slug}/#comments`
        : `/hubs/${notification.idea.hub_url_slug}/browse?idea=${notification.idea.url_slug}#ideas`;
  }

  const previewText = getFragmentsWithMentions(notification[commentProp]?.content, false, locale);

  let notifLink = urlEnding && getLocalePrefix(locale) + urlEnding;
  if (notifLink && hubUrl) {
    const [pathAndQuery, hash] = notifLink.split("#");
    const separator = pathAndQuery.includes("?") ? "&" : "?";
    notifLink = `${pathAndQuery}${separator}hub=${hubUrl}${hash ? `#${hash}` : ""}`;
  }

  return (
    <GenericNotification
      link={notifLink}
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

const ProjectFollowerNotification = ({ notification, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const followerName =
    notification.project_follower.first_name + " " + notification.project_follower.last_name;
  const baseUrl = `/projects/${notification.project.url_slug}`;
  const notifLink = hubUrl
    ? `${baseUrl}?hub=${hubUrl}&show_followers=true`
    : `${baseUrl}?show_followers=true`;
  return (
    <GenericNotification
      link={notifLink}
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

const ProjectLikeNotification = ({ notification, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, project: notification.project });
  const likingUserName =
    notification.project_like.first_name + " " + notification.project_like.last_name;
  const baseUrl = `/projects/${notification.project.url_slug}`;
  const notifLink = hubUrl
    ? `${baseUrl}?hub=${hubUrl}&show_likes=true`
    : `${baseUrl}?show_likes=true`;
  return (
    <GenericNotification
      link={notifLink}
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
const OrganizationFollowerNotification = ({ notification, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const followerName =
    notification.organization_follower.first_name +
    " " +
    notification.organization_follower.last_name;
  const baseUrl = `/organizations/${notification.organization.url_slug}`;
  const notifLink = hubUrl
    ? `${baseUrl}?hub=${hubUrl}&show_followers=true`
    : `${baseUrl}?show_followers=true`;
  return (
    <GenericNotification
      link={notifLink}
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
const OrgProjectSharedNotification = ({ notification, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });

  const projectName = notification.project.name;
  const baseUrl = `/projects/${notification.project.url_slug}`;
  const notifLink = hubUrl ? `${baseUrl}?hub=${hubUrl}` : baseUrl;
  return (
    <GenericNotification
      link={notifLink}
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
