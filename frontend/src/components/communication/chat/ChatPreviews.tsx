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
import React, { Fragment, useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getDateTime } from "../../../../public/lib/dateOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import LoadingSpinner from "../../general/LoadingSpinner";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import ChatTitle from "./ChatTitle";
import MobileChatPreview from "./MobileChatPreview";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

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

export default function ChatPreviews({
  chats,
  loadFunc,
  hasMore,
  chatSearchEnabled,
  isLoading = false,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const loadMore = async () => {
    if (loadFunc) {
      await loadFunc();
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    hasMore: hasMore || false,
    isLoading: isLoading,
    onLoadMore: loadMore,
  });

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

  return (
    <>
      <List>
        {chats.map((chat, index) => {
          const isLastElement = index === chats.length - 1;
          return (
            <ChatPreview
              key={index}
              isFirstChat={index === 0}
              isNarrowScreen={isNarrowScreen}
              chat={chat}
              locale={locale}
              forwardedRef={isLastElement ? lastElementRef : null}
            />
          );
        })}
      </List>
      {isLoading && <LoadingSpinner isLoading />}
    </>
  );
}

const ChatPreview = ({ chat, isNarrowScreen, isFirstChat, locale, forwardedRef }) => {
  const lastAction = chat.last_message ? chat.last_message.sent_at : chat.created_at;
  if (!lastAction) console.log(chat);
  const classes = useStyles();

  if (isNarrowScreen)
    return <MobileChatPreview chat={chat} isFirstChat={isFirstChat} forwardedRef={forwardedRef} />;
  else
    return (
      <Fragment>
        {isFirstChat && <Divider component="li" />}
        <ListItem
          ref={forwardedRef}
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
                    <span>{getDateTime(lastAction)}</span>
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
      </Fragment>
    );
};

ChatPreviews.propTypes = {
  chats: PropTypes.array.isRequired,
};
