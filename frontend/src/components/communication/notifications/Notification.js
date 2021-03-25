import {
  Avatar,
  Link,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  withStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CommentIcon from "@material-ui/icons/Comment";
import GroupIcon from "@material-ui/icons/Group";
import React, { useContext } from "react";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";

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
const StyledMenuItem = withStyles((theme) => ({
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
];

export default function Notification({ notification, isPlaceholder }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  if (isPlaceholder) return <PlaceholderNotification texts={texts} />;
  else {
    const type = NOTIFICATION_TYPES[notification.notification_type];
    if (type === "private_message")
      return <PrivateMessageNotification notification={notification} texts={texts} />;
    else if (type === "group_message")
      return <GroupMessageNotification notification={notification} texts={texts} />;
    else if (type === "project_comment")
      return <ProjectCommentNotification notification={notification} texts={texts} />;
    else if (type === "reply_to_project_comment")
      return <ProjectCommentReplyNotification notification={notification} texts={texts} />;
    else if (type === "project_follower")
      return <ProjectFollowerNotification notification={notification} texts={texts} />;
    else return <></>;
  }
}

const PrivateMessageNotification = ({ notification, texts }) => {
  const sender = notification.last_message.sender;
  const classes = useStyles();
  //TODO update to chat/<chat_uuid>/
  return (
    <Link href={"/chat/" + notification.chat_uuid + "/"} underline="none">
      <StyledMenuItem>
        <ListItemAvatar>
          <Avatar
            alt={sender.first_name + " " + sender.last_name}
            src={getImageUrl(sender.image)}
          />
        </ListItemAvatar>
        <ListItemText
          primary={texts.message_from + " " + sender.first_name + " " + sender.last_name}
          secondary={notification.last_message.content}
          primaryTypographyProps={{
            className: classes.messageSender,
          }}
          secondaryTypographyProps={{
            className: classes.notificationText,
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const GroupMessageNotification = ({ notification, texts }) => {
  const group_title = notification.chat_title;
  const sender = notification.last_message.sender;
  const classes = useStyles();
  return (
    <Link href={"/chat/" + notification.chat_uuid + "/"} underline="none">
      <StyledMenuItem>
        <ListItemAvatar>
          <Avatar alt={group_title}>
            <GroupIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={texts.message_in + group_title}
          secondary={
            sender.first_name + " " + sender.last_name + ": " + notification.last_message.content
          }
          primaryTypographyProps={{
            className: classes.messageSender,
          }}
          secondaryTypographyProps={{
            className: classes.notificationText,
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const PlaceholderNotification = ({ texts }) => {
  const classes = useStyles();
  return (
    <Link href="/inbox" underline="none" color="inherit">
      <StyledMenuItem>
        <ListItemText className={classes.listItemText} disableTypography>
          {texts.placeholderNotification}
          <div>
            <Link className={classes.goToInboxText}>Go to Inbox</Link>
          </div>
        </ListItemText>
      </StyledMenuItem>
    </Link>
  );
};

const ProjectCommentNotification = ({ notification, texts }) => {
  const classes = useStyles();
  return (
    <Link href={"/projects/" + notification.project.url_slug + "/#comments"} underline="none">
      <StyledMenuItem>
        <ListItemIcon>
          <CommentIcon />
        </ListItemIcon>
        <ListItemText
          primary={texts.comment_on + ' "' + notification.project.name + '"'}
          secondary={notification.project_comment.content}
          primaryTypographyProps={{
            className: classes.messageSender,
          }}
          secondaryTypographyProps={{
            className: classes.notificationText,
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const ProjectCommentReplyNotification = ({ notification, texts }) => {
  const classes = useStyles();
  return (
    <Link href={"/projects/" + notification.project.url_slug + "/#comments"} underline="none">
      <StyledMenuItem>
        <ListItemIcon>
          <CommentIcon />
        </ListItemIcon>
        <ListItemText
          primary={texts.reply_to_your_comment_on + ' "' + notification.project.name + '"'}
          secondary={notification.project_comment.content}
          primaryTypographyProps={{
            className: classes.messageSender,
          }}
          secondaryTypographyProps={{
            className: classes.notificationText,
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const ProjectFollowerNotification = ({ notification, texts }) => {
  const classes = useStyles();
  return (
    <Link
      href={"/projects/" + notification.project.url_slug + "?show_followers=true"}
      underline="none"
    >
      <StyledMenuItem>
        <ListItemAvatar>
          <Avatar
            alt={
              notification.project_follower.first_name +
              " " +
              notification.project_follower.last_name
            }
            src={getImageUrl(notification.project_follower.image)}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            notification.project_follower.first_name +
            " " +
            notification.project_follower.last_name +
            " " +
            texts.now_follows_your_project +
            ' "' +
            notification.project.name +
            '"'
          }
          secondary={texts.congratulations}
          primaryTypographyProps={{
            className: classes.messageSender,
          }}
          secondaryTypographyProps={{
            className: classes.notificationText,
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};
