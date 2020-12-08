import React from "react";
import PropTypes from "prop-types";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Typography,
  useMediaQuery,
  Grid,
  CircularProgress
} from "@material-ui/core";
import Truncate from "react-truncate";
import { makeStyles } from "@material-ui/core/styles";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import { getDateTime } from "../../../../public/lib/dateOperations";
import ChatTitle from "./ChatTitle";
import MobileChatPreview from "./MobileChatPreview";
import InfiniteScroll from "react-infinite-scroller";

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
    },
    spinner: {
      marginTop: "48px"
    }
  };
});

export default function ChatPreviews({ chats, loadFunc, hasMore }) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(false)
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));
  const loadMore = async () => {
    //sometimes InfiniteScroll calls loadMore twice really fast. Therefore we're using isLoading to make sure it doesn't catch 2 pages at once
    if (!isLoading) {
      setIsLoading(true);
      await loadFunc();
      setIsLoading(false);
    }
  };
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
  
  const loadingSpinner = () => {
    return isLoading ? (
      <Grid container justify="center">
        <CircularProgress className={classes.spinner} />
      </Grid>
    ) : null;
  };

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      element={List}
    >
      {chats.map((chat, index) => (
        <ChatPreview key={index} isFirstChat={index===0} isNarrowScreen={isNarrowScreen} chat={chat}/>
      ))}
      {loadingSpinner()}
    </InfiniteScroll>
  );
}

const ChatPreview = ({chat, isNarrowScreen, isFirstChat}) => {
  const lastAction = chat.last_message ? chat.last_message.sent_at : chat.created_at;
  if(!lastAction)
    console.log(chat)
  const classes = useStyles()
  if (isNarrowScreen)
    return <MobileChatPreview chat={chat} isFirstChat={isFirstChat} />;
  else
    return (
      <React.Fragment >
        {isFirstChat && <Divider component="li" />}
        <ListItem
          button
          component="a"
          href={"/chat/" + chat.chat_uuid}
          alignItems="center"
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
}

ChatPreviews.propTypes = {
  chats: PropTypes.array.isRequired
};
