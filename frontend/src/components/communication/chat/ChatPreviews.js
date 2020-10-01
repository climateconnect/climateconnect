import React from "react";
import PropTypes from "prop-types";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Typography,
  useMediaQuery
} from "@material-ui/core";
import Truncate from "react-truncate";
import { makeStyles } from "@material-ui/core/styles";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import { getDateTime } from "../../../../public/lib/dateOperations";
import ChatTitle from "./ChatTitle";
import MobileChatPreview from "./MobileChatPreview";

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
    },
    NoChatsMessage: {
      marginTop: theme.spacing(2),
      textAlign: "center",
      maxWidth: 600,
      margin: "0 auto"
    },
    listItem: {
      display: "flex"
    }
  };
});

export default function ChatPreviews({ chats }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));
  if (chats.length === 0)
    return (
      <>
        <Divider />
        <Typography variant="h6" className={classes.NoChatsMessage}>
          {
            'You haven\'t chatted to anybody yet! Click on the "New Chat" button to start reaching out to other climate actors!'
          }
        </Typography>
      </>
    );

  return (
    <List>
      {chats.map((chat, index) => {
        const lastAction = chat.last_message ? chat.last_message.sent_at : chat.created_at;
        if (isNarrowScreen)
          return <MobileChatPreview key={index} chat={chat} isFirstChat={index === 0} />;
        else
          return (
            <React.Fragment key={index}>
              {index === 0 && <Divider component="li" />}
              <ListItem
                button
                component="a"
                href={"/chat/" + chat.chat_uuid}
                alignItems="center"
                key={index}
                className={classes.listItem}
              >
                {!chat.chatting_partner && chat.name ? (
                  <ChatTitle
                    chat={chat}
                    className={classes.miniProfilePreview}
                    mobile={isNarrowScreen}
                  />
                ) : (
                  <MiniProfilePreview
                    className={classes.miniProfilePreview}
                    profile={chat.chatting_partner}
                    size="medium"
                    nolink
                  />
                )}
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
                      <span className={classes.badgeAndTimeContainer}>
                        <span>
                          <span className={classes.time}>{getDateTime(lastAction)}</span>
                        </span>
                        {chat.unread_count > 0 && (
                          <span>
                            <Badge
                              color="primary"
                              className={classes.unreadBadge}
                              badgeContent={chat.unread_count}
                            />
                          </span>
                        )}
                      </span>
                    </>
                  }
                />
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
