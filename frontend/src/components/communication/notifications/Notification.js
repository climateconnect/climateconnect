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

const useStyles = makeStyles(() => {
  return {
    messageSender: {
      fontWeight: "bold"
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
    width: 450,
    maxWidth: "100%"
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
  "reply_to_post_comment"
];

export default function Notification({ notification }) {
  console.log("rendering notification");
  console.log(notification);
  const type = NOTIFICATION_TYPES[notification.notification_type];
  if (type) console.log("type of notification: " + type);
  if (type === "private_message") return <PrivateMessageNotification notification={notification} />;
  else return <></>;
}

const PrivateMessageNotification = ({ notification }) => {
  const sender = notification.chat_message_sender;
  const classes = useStyles();
  return (
    <Link href={"/messageUser/" + sender.url_slug + "/"} underline="none">
      <StyledMenuItem>
        <ListItemAvatar>
          <Avatar alt={sender.first_name + " " + sender.last_name} src={sender.image} />
        </ListItemAvatar>
        <ListItemText
          primary={"Message from " + sender.first_name + " " + sender.last_name}
          secondary={notification.last_message}
          primaryTypographyProps={{
            className: classes.messageSender
          }}
        />
      </StyledMenuItem>
    </Link>
  );
};
