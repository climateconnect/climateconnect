import {
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  Switch,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "universal-cookie";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Truncate from "react-truncate";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getChatPreviewDataTime } from "../../../../public/lib/dateOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import LoadingSpinner from "../../general/LoadingSpinner";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import ChatTitle from "./ChatTitle";
import MobileChatPreview from "./MobileChatPreview";
import {
  getCookieProps,
  getShowUnreadLabelFromCookie,
} from "../../../../public/lib/cookieOperations";

const useStyles = makeStyles((theme) => {
  return {
    date: {
      color: theme.palette.grey[600],
    },

    previewContent: {
      display: "flex",
    },

    previewTextContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      marginRight: theme.spacing(1),
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
      marginTop: theme.spacing(0.5),
    },
    needToReplyChip: {
      borderRadius: 30,
    },
    timeContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "right",
    },
    NoChatsMessage: {
      marginTop: theme.spacing(2),
      textAlign: "center",
      maxWidth: 600,
      margin: "0 auto",
    },
    listItem: {
      display: "flex",
      height: 100,
    },
    badge: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1.25),
      marginRight: theme.spacing(2.25),
      color: "white",
      "& span": {
        backgroundColor: theme.palette.success.main,
      },
    },
    switch: {
      marginLeft: theme.spacing(1),
    },
  };
});

export default function ChatPreviews({ chats, loadFunc, hasMore, chatSearchEnabled }) {
  const classes = useStyles();

  const cookies = new Cookies();
  const showUnreadLabelCookie = cookies.get("show_unread_label");
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [isLoading, setIsLoading] = useState(false);
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const loadMore = async () => {
    //sometimes InfiniteScroll calls loadMore twice really fast. Therefore we're using isLoading to make sure it doesn't catch 2 pages at once
    if (!isLoading) {
      setIsLoading(true);
      await loadFunc();
      setIsLoading(false);
    }
  };
  const [showUnreadLabel, setShowUnreadLabel] = useState(
    getShowUnreadLabelFromCookie(showUnreadLabelCookie)
  );

  const handleSwitch = () => {
    const expiryDate = new Date();
    const month = (expiryDate.getMonth() + 1) % 12;
    expiryDate.setMonth(month);
    const cookieProps = getCookieProps(expiryDate);
    cookies.set("show_unread_label", !showUnreadLabel, cookieProps);
    setShowUnreadLabel(!showUnreadLabel);
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
    <>
      {!isNarrowScreen &&
        (
        <div className={classes.switch}>
          {texts.hide_not_replied_label}
          <Switch
            checked={showUnreadLabel}
            onChange={handleSwitch}
            inputProps={{ "aria-label": "toggle label switch" }}
            color="primary"
          />
           {texts.show_not_replied_label}     
        </div>
      )}

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
            showUnreadLabel={showUnreadLabel}
          />
        ))}
        <LoadingSpinner />
      </InfiniteScroll>
    </>
  );
}

const ChatPreview = ({ chat, isNarrowScreen, isFirstChat, locale, texts, showUnreadLabel }) => {
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
                  {(!chat.last_message || chat.last_message.last_sender !== chat.user.id) &&
                    showUnreadLabel && (
                      <div className={classes.needToReplyContainer}>
                        <Chip
                          className={classes.needToReplyChip}
                          variant="outlined"
                          label={texts.you_havent_replied}
                        />
                      </div>
                    )}
                </div>

                <div className={classes.timeContainer}>
                  <div>{getChatPreviewDataTime(lastAction, texts.today_at)}</div>

                  {chat.unread_count > 0 && (
                    <Badge badgeContent={chat.unread_count} className={classes.badge} />
                  )}
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
