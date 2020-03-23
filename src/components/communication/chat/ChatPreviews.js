import React from "react";
import PropTypes from "prop-types";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Badge
} from "@material-ui/core";
import Truncate from "react-truncate";
import { makeStyles } from "@material-ui/core/styles";
import DateDisplay from "../../general/DateDisplay";

const useStyles = makeStyles(theme => {
  return {
    date: {
      float: "right",
      color: theme.palette.grey[600]
    },
    unreadBadge: {
      float: "right",
      marginTop: theme.spacing(1.5),
      marginRight: theme.spacing(2.5),
      "& span": {
        backgroundColor: theme.palette.success.main
      }
    },
    unread: {
      color: theme.palette.success.main
    },
    unreadPreview: {
      fontWeight: "bold"
    }
  };
});

export default function ChatPreviews({ chats }) {
  const classes = useStyles();
  return (
    <List>
      {chats.map((chat, index) => {
        return (
          <React.Fragment key={index}>
            {index === 0 && <Divider component="li" />}
            <ListItem
              button
              component="a"
              href={"/messageUser/" + chat.chatting_partner.url}
              alignItems="flex-start"
              key={index}
            >
              <ListItemAvatar>
                <Avatar alt={chat.chatting_partner.name} src={chat.chatting_partner.image} />
              </ListItemAvatar>
              <ListItemText
                secondary={
                  <>
                    <Truncate
                      lines={2}
                      className={chat.unread_count ? classes.unreadPreview : ""}
                      ellipsis={"..."}
                    >
                      {chat.content}
                    </Truncate>
                    {chat.unread_count > 0 && (
                      <Badge
                        color="primary"
                        className={classes.unreadBadge}
                        badgeContent={chat.unread_count}
                      />
                    )}
                  </>
                }
              >
                {chat.chatting_partner.name}
                <DateDisplay
                  className={`${classes.date} ${chat.unread_count && classes.unread}`}
                  date={new Date(chat.date)}
                />
              </ListItemText>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        );
      })}
    </List>
  );
}

ChatPreviews.propTypes = {
  chats: PropTypes.array.isRequired
};
