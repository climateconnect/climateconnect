import { Link, ListItemText, MenuItem, withStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GroupIcon from "@material-ui/icons/Group";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
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

const NOTIFICATION_TYPES = [
  "broadcast",
  "private_message",
  "project_comment",
  "reply_to_project_comment",
  "project_follower",
  "project_update_post",
  "post_comment",
  "reply_to_post_comment",
  "group_message",
  null,
  null,
  "idea_comment",
  "reply_to_idea_comment",
  "person_joined_idea",
];

export default function Notification({ notification, isPlaceholder }) {
  if (isPlaceholder) return <PlaceholderNotification />;
  else {
    const type = NOTIFICATION_TYPES[notification.notification_type];
    if (type === "private_message")
      return <PrivateMessageNotification notification={notification} />;
    else if (type === "group_message")
      return <GroupMessageNotification notification={notification} />;
    else if (type === "project_comment")
      return <ProjectCommentNotification notification={notification} />;
    else if (type === "reply_to_project_comment")
      return <ProjectCommentReplyNotification notification={notification} />;
    else if (type === "project_follower")
      return <ProjectFollowerNotification notification={notification} />;
    else if (type === "idea_comment")
      return <IdeaCommentNotification notification={notification} />;
    else if (type === "reply_to_idea_comment")
      return <IdeaCommentReplyNotification notification={notification} />;
    else if (type === "person_joined_idea")
      return <PersonJoinedIdeaNotification notification={notification} />;
    else return <></>;
  }
}

const PersonJoinedIdeaNotification = ({ notification }) => {
  const supporter = notification.idea_supporter;
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale, idea: notification.idea });
  //TODO: Link to group chat
  return (
    <GenericNotification
      link={`/chat/${notification.idea_supporter_chat}`}
      avatar={{
        alt: supporter.first_name + " " + supporter.last_name,
        image: supporter.thumbnail_image,
      }}
      primaryText={supporter.first_name + " " + supporter.last_name + " " + texts.joined_your_idea}
      secondaryText={texts.send_a_Message_to_welcome_them_in_the_group_chat}
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
        alt: sender.first_name + " " + sender.last_name,
        image: sender.thumbnail_image,
      }}
      primaryText={texts.message_from + " " + sender.first_name + " " + sender.last_name}
      secondaryText={notification.last_message.content}
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
      primaryText={texts.message_in + group_title}
      secondaryText={
        sender.first_name + " " + sender.last_name + ": " + notification.last_message.content
      }
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
            <Link className={classes.goToInboxText}>{texts.go_to_inbox}</Link>
          </div>
        </ListItemText>
      </StyledMenuItem>
    </Link>
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
    />
  );
};
