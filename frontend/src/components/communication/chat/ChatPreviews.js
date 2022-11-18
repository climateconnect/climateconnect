import {
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  Avatar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Truncate from "react-truncate";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getChatPreviewDataTime, getDateTime } from "../../../../public/lib/dateOperations";
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

    previewContent: {
      display: "flex",
      height: 50,
    },
    time: {
      backgroundColor: "white",
    },
    previewTextContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
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
    needToReplyContainer: {
      marginRight: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(0.5),
    },
    needToReplyChip: {
      borderRadius: 30,
      maxHeight: 30,
    },
    unreadAvatar: {
      backgroundColor: theme.palette.success.main,
    },
    timeContainer: {
      display: "flex",
      textAlign: "right",
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
    avatarLabelText: {
      color: "white",
    },
  };
});

export default function ChatPreviews({ chats, loadFunc, hasMore, chatSearchEnabled }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [isLoading, setIsLoading] = React.useState(false);
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
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

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      element={List}
    >
      {chats.map((chat, index) => (
        <ChatPreview
          key={index}
          isFirstChat={index === 0}
          isNarrowScreen={isNarrowScreen}
          chat={chat}
          locale={locale}
          texts={texts}
        />
      ))}
      <LoadingSpinner />
    </InfiniteScroll>
  );
}

const ChatPreview = ({ chat, isNarrowScreen, isFirstChat, locale, texts }) => {
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
              mobile={isNarrowScreen}
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
              <div className={classes.previewContent}>
                <div className={classes.previewTextContent}>
                  <Truncate
                    lines={1}
                    className={`${classes.contentPreview} ${
                      chat.unread_count ? classes.unreadPreview : ""
                    }`}
                    ellipsis={"..."}
                  >
                    {chat.content}
                  </Truncate>
                  {(!chat.last_message || chat.last_message.last_sender !== chat.user.id) && (
                    <div className={classes.needToReplyContainer}>
                      {chat.unread_count > 0 ? (
                        <Chip
                          avatar={
                            <Avatar className={classes.unreadAvatar}>
                              <div className={classes.avatarLabelText}>
                                {chat.unread_count > 0 && chat.unread_count}
                              </div>
                            </Avatar>
                          }
                          className={classes.needToReplyChip}
                          variant="outlined"
                          label={texts.you_havent_replied}
                        ></Chip>
                      ) : (
                        <Chip
                          className={classes.needToReplyChip}
                          variant="outlined"
                          label={texts.you_havent_replied}
                        ></Chip>
                      )}
                    </div>
                  )}
                </div>

                <div className={classes.timeContainer}>
                  <span>
                    <span className={classes.time}>{getChatPreviewDataTime(lastAction, texts.today_at)}</span>
                  </span>
                </div>
              </div>
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
