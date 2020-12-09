import React from "react";
import { ListItem, Avatar, ListItemText, makeStyles, Divider, Badge } from "@material-ui/core";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import GroupIcon from "@material-ui/icons/Group";
import { getDateTime } from "../../../../public/lib/dateOperations";

const useStyles = makeStyles((theme) => {
  return {
    mobileAvatar: {
      marginRight: theme.spacing(2),
    },
    time: {
      color: theme.palette.grey[600],
    },
    unreadBadge: {
      "& span": {
        backgroundColor: theme.palette.success.main,
      },
    },
    badgeAndTimeContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: theme.spacing(2),
    },
    content: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };
});

export default function MobileChatPreview({ chat, isFirstChat }) {
  const classes = useStyles();
  const isGroupChat = !chat.chatting_partner && !!chat.name;
  const last_activity = chat.last_message ? chat.last_message.sent_at : chat.created_at;
  return (
    <>
      {isFirstChat && <Divider component="li" />}
      <ListItem button component="a" href={"/chat/" + chat.chat_uuid} alignItems="center">
        {isGroupChat ? (
          <Avatar className={classes.mobileAvatar}>
            <GroupIcon />
          </Avatar>
        ) : (
          <Avatar className={classes.mobileAvatar} src={getImageUrl(chat.chatting_partner.image)} />
        )}
        <ListItemText
          primary={
            isGroupChat
              ? chat.name
              : chat.chatting_partner.first_name + " " + chat.chatting_partner.last_name
          }
          secondary={chat.content}
          secondaryTypographyProps={{
            className: classes.content,
          }}
        />
        <span className={classes.badgeAndTimeContainer}>
          <span className={classes.timeContainer}>
            <span className={classes.time}>{getDateTime(last_activity)}</span>
          </span>
          {chat.unread_count > 0 && (
            <span className={classes.badgeContainer}>
              <Badge
                color="primary"
                className={classes.unreadBadge}
                badgeContent={chat.unread_count}
              />
            </span>
          )}
        </span>
      </ListItem>
      <Divider component="li" />
    </>
  );
}
