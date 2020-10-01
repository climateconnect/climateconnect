import React from "react";
import {
  withStyles,
  MenuItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Link
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GroupIcon from "@material-ui/icons/Group";

const useStyles = makeStyles(theme => {
  return {
    messageSender: {
      fontWeight: "bold"
    },
    listItemText: {
      whiteSpace: "normal"
    },
    goToInboxText: {
      textAlign: "center",
      display: "block",
      marginTop: theme.spacing(1)
    },
    notificationText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  };
});
const StyledMenuItem = withStyles(theme => ({
  root: {
    "&:focus": {
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white
      }
    },
    maxWidth: 450
  }
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
  "group_message"
];

export default function Notification({ notification, isPlaceholder }) {
  if (isPlaceholder) return <PlaceholderNotification />;
  else {
    const type = NOTIFICATION_TYPES[notification.notification_type];
    if (type === "private_message")
      return <PrivateMessageNotification notification={notification} />;
    else if (type === "group_message")
      return <GroupMessageNotification notification={notification} />;
    else return <></>;
  }
}

const PrivateMessageNotification = ({ notification }) => {
  const sender = notification.last_message.sender;
  const classes = useStyles();
  //TODO update to chat/<chat_uuid>/
  return (
    <Link href={"/chat/" + notification.chat_uuid + "/"} underline="none">
      <StyledMenuItem>
        <ListItemAvatar>
          <Avatar
            alt={sender.first_name + " " + sender.last_name}
            src={process.env.API_URL + sender.image}
          />
        </ListItemAvatar>
        <ListItemText
          primary={"Message from " + sender.first_name + " " + sender.last_name}
          secondary={notification.last_message.content}
          primaryTypographyProps={{
            className: classes.messageSender
          }}
          secondaryTypographyProps={{
            className: classes.notificationText
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const GroupMessageNotification = ({ notification }) => {
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
          primary={"Message in " + group_title}
          secondary={
            sender.first_name + " " + sender.last_name + ": " + notification.last_message.content
          }
          primaryTypographyProps={{
            className: classes.messageSender
          }}
          secondaryTypographyProps={{
            className: classes.notificationText
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};

const PlaceholderNotification = () => {
  const classes = useStyles();
  return (
    <Link href="/inbox" underline="none" color="inherit">
      <StyledMenuItem>
        <ListItemText className={classes.listItemText} disableTypography>
          {`You're all caught up! Here you will be notified on private messages, interactions with
          your content and updates from projects you follow.`}
          <div>
            <Link className={classes.goToInboxText}>Go to Inbox</Link>
          </div>
        </ListItemText>
      </StyledMenuItem>
    </Link>
  );
};
