import {
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React, { useContext } from "react";
//TODO depricated libraries react-infinite-scroller
import InfiniteScroll from "react-infinite-scroller";

import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getDateTime } from "../../../../public/lib/dateOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import LoadingSpinner from "../../general/LoadingSpinner";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import ChatTitle from "./ChatTitle";
import MobileChatPreview from "./MobileChatPreview";

const useStyles = makeStyles((theme) => {
  return {
    date: {
      color: theme.palette.grey[600],
    },
    unreadBadge: {
      "& span": {
        backgroundColor: theme.palette.success.main,
      },
    },
    unread: {
      color: theme.palette.success.main,
    },
    miniProfilePreview: {
      display: "flex",
      alignItems: "center",
      flexBasis: 250,
      flexShrink: 0,
    },
    unreadPreview: {
      fontWeight: "bold",
    },
    contentPreview: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      display: "block",
    },
    badgeAndTimeContainer: {
      float: "right",
      height: 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    NoChatsMessage: {
      marginTop: theme.spacing(2),
      textAlign: "center",
      maxWidth: 600,
      margin: "0 auto",
    },
    listItem: {
      display: "flex",
    },
  };
});

export default function ChatPreviews({ chats, loadFunc, hasMore, chatSearchEnabled }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [isLoading, setIsLoading] = React.useState(false);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const loadMore = async () => {
    //sometimes InfiniteScroll calls loadMore twice really fast. Therefore we're using isLoading to make sure it doesn't catch 2 pages at once
    if (!isLoading) {
      setIsLoading(true);
      await loadFunc();
      setIsLoading(false);
    }
  };

  if (chats.length === 0 && !chatSearchEnabled)
    return (
      <>
        <Divider />
        <Typography variant="h6" className={classes.NoChatsMessage}>
          {texts.you_havent_chatted_to_anybody_yet_click_on}
        </Typography>
      </>
    );
  if (chats.length === 0 && chatSearchEnabled)
    return (
      <>
        <Divider />
        <Typography variant="h6" className={classes.NoChatsMessage}>
          {texts.no_chats_found_for_this_search}
        </Typography>
      </>
    );

  const InfiniteScrollComponent = InfiniteScroll as any;

  return (
    <InfiniteScrollComponent
      pageStart={1}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      element={List as any}
    >
      {chats.map((chat, index) => (
        <ChatPreview
          key={index}
          isFirstChat={index === 0}
          isNarrowScreen={isNarrowScreen}
          chat={chat}
          locale={locale}
        />
      ))}
      <LoadingSpinner />
    </InfiniteScrollComponent>
  );
}

const ChatPreview = ({ chat, isNarrowScreen, isFirstChat, locale }) => {
  const lastAction = chat.last_message ? chat.last_message.sent_at : chat.created_at;
  if (!lastAction) console.log(chat);
  const classes = useStyles();

  if (isNarrowScreen) return <MobileChatPreview chat={chat} isFirstChat={isFirstChat} />;
  else
    return (
      <React.Fragment>
        {isFirstChat && <Divider component="li" />}
        <ListItem
          button
          component="a"
          href={getLocalePrefix(locale) + "/chat/" + chat.chat_uuid}
          alignItems="center"
          className={classes.listItem}
        >
          {!chat.chatting_partner ? (
            <ChatTitle
              chat={chat}
              className={classes.miniProfilePreview}
              //TODO(unused) mobile={isNarrowScreen}
              size="medium"
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
                <span
                  className={`${classes.contentPreview} ${
                    chat.unread_count ? classes.unreadPreview : ""
                  }`}
                >
                  {chat.content}
                </span>
                <span className={classes.badgeAndTimeContainer}>
                  <span>
                    <span>
                      {getDateTime(lastAction)}
                    </span>
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
};

ChatPreviews.propTypes = {
  chats: PropTypes.array.isRequired,
};
