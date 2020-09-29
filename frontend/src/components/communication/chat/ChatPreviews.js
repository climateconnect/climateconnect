import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemText, Divider, Badge } from "@material-ui/core";
import Truncate from "react-truncate";
import { makeStyles } from "@material-ui/core/styles";
import DateDisplay from "../../general/DateDisplay";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import { getDateTime } from "../../../../public/lib/dateOperations";

const useStyles = makeStyles(theme => {
  return {
    date: {
      color: theme.palette.grey[600]
    },
    unreadBadge: {
      "& span": {
        backgroundColor: theme.palette.success.main
      }
    },
    unread: {
      color: theme.palette.success.main
    },
    miniProfilePreview: {
      display: "flex",
      alignItems: "center",
      flexBasis: 250,
      flexShrink: 0
    },
    unreadPreview: {
      fontWeight: "bold"
    },
    badgeAndTimeContainer: {
      float: "right",
      height: 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
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
              href={"/messageUser/" + chat.chatting_partner.url_slug}
              alignItems="center"
              key={index}
              className={classes.listItem}
            >
              <MiniProfilePreview className={classes.miniProfilePreview} profile={chat.chatting_partner} size="medium" nolink />
              <ListItemText
                secondary={
                  <>
                    <Truncate
                      lines={1}
                      className={`${classes.contentPreview} ${
                        chat.unread_count ? classes.unreadPreview : ""
                      }`}
                      ellipsis={"..."}
                    >
                      {chat.content}
                    </Truncate>
                    <div className={classes.badgeAndTimeContainer}>
                      {chat.unread_count > 0 && (
                        <div className={classes.badgeContainer}>
                          <Badge
                            color="primary"
                            className={classes.unreadBadge}
                            badgeContent={chat.unread_count}
                          />
                        </div>
                      )}
                      <div className={classes.timeContainer}>
                        <div className={classes.time}>{getDateTime(chat.last_message.sent_at)}</div>
                      </div>  
                    </div>
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
