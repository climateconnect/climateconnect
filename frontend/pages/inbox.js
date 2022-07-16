import { Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import NextCookies from "next-cookies";
import React from "react";
import Cookies from "universal-cookie";
import { apiRequest, sendToLogin } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import UserContext from "../src/components/context/UserContext";
import LoadingContainer from "../src/components/general/LoadingContainer";
import WideLayout from "../src/components/layouts/WideLayout";
import UserSearchField from "../src/components/communication/chat/UserSearchField";
import ChatSearchField from "../src/components/communication/chat/ChatSearchField";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      padding: 0,
    },
    headline: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      textAlign: "center",
    },
    newChatButton: {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1),
      },
    },
    searchChatButton: {
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1),
      },
    },
    searchSectionContainer: {
      marginBottom: theme.spacing(4),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      },
    },
    buttonBar: {
      position: "relative",
      height: 40,
    },
    cancelButton: {
      position: "absolute",
      right: 0,
    },
    newChatParticipantsContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down("xs")]: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
      },
    },
    miniProfilePreview: {
      padding: theme.spacing(2),
      display: "inline-flex",
    },
    groupChatName: {
      marginLeft: theme.spacing(2),
      width: 250,
    },
  };
});

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "chat", locale: ctx.locale });
    const message = texts.you_have_to_log_in_to_see_your_inbox;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const chatData = await getChatsOfLoggedInUser(auth_token, null, ctx.locale);
  return {
    props: {
      chatData: chatData.chats,
      next: chatData.next,
    },
  };
}

export default function Inbox({ chatData, next }) {
  const token = new Cookies().get("auth_token");
  const classes = useStyles();
  const { user, locale } = React.useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [userSearchEnabled, setUserSearchEnabled] = React.useState(false);
  const [chatSearchEnabled, setChatSearchEnabled] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [chatsState, setChatsState] = React.useState({
    chats: parseChats(chatData, texts),
    next: next,
  });

  const [searchedChats, setSearchedChats] = React.useState(parseChats([], texts));

  const applyFilterToChats = (e) => {
    e = parseChatData(e);
    e = parseChats(e, texts);
    setSearchedChats(e);
  };

  const updateErrorMessage = (e) => {
    setErrorMessage(e);
  };

  const enableUserSearch = () => {
    setUserSearchEnabled(true);
  };

  const enableChatSearch = () => {
    setChatSearchEnabled(true);
  };

  const disableUserSearch = () => {
    setUserSearchEnabled(false);
  };

  const disableChatSearch = () => {
    setSearchedChats([]); // removes old search value
    setChatSearchEnabled(false);
  };

  const loadMoreChats = async () => {
    console.log("does this get called?");
    const newChatData = await getChatsOfLoggedInUser(token, next, locale);
    console.log(newChatData);
    const newChats = newChatData.chats;

    setChatsState({
      ...chatsState,
      next: newChatData.next,
      chats: [...chatsState.chats, ...parseChats(newChats, user, texts)],
    });
  };

  return (
    <div>
      <WideLayout
        title={texts.inbox}
        messageType="error"
        message={errorMessage}
        resetAlertMessage={updateErrorMessage}
      >
        <Container maxWidth="md" className={classes.root}>
          <Typography component="h1" variant="h4" className={classes.headline}>
            {texts.inbox}
          </Typography>
          <div className={classes.searchSectionContainer}>
            {(() => {
              if (userSearchEnabled)
                return (
                  <span>
                    <UserSearchField
                      cancelUserSearch={disableUserSearch}
                      setErrorMessage={updateErrorMessage}
                      UserSearchField
                    />
                    <ChatPreviews
                      chatSearchEnabled={chatSearchEnabled}
                      loadFunc={loadMoreChats}
                      chats={chatsState.chats}
                      user={user}
                      hasMore={!!chatsState.next}
                    />
                  </span>
                );

              if (chatSearchEnabled)
                return (
                  <span>
                    <ChatSearchField
                      cancelChatSearch={disableChatSearch}
                      applyFilterToChats={applyFilterToChats}
                      ChatSearchField
                    />

                    <ChatPreviews
                      loadFunc={loadMoreChats}
                      chats={searchedChats}
                      user={user}
                      hasMore={!!chatsState.next}
                      chatSearchEnabled={chatSearchEnabled}
                    />
                  </span>
                );
              if (!userSearchEnabled && !chatSearchEnabled)
                return (
                  <span>
                    <Button
                      className={classes.newChatButton}
                      startIcon={<AddIcon />}
                      variant="contained"
                      color="primary"
                      onClick={enableUserSearch}
                    >
                      {texts.new_chat}
                    </Button>
                    <Button
                      className={classes.searchChatButton}
                      startIcon={<SearchIcon />}
                      variant="contained"
                      color="primary"
                      onClick={enableChatSearch}
                    >
                      {texts.find_a_chat}
                    </Button>
                    {user ? (
                      <ChatPreviews
                        chatSearchEnabled={chatSearchEnabled}
                        loadFunc={loadMoreChats}
                        chats={chatsState.chats}
                        user={user}
                        hasMore={!!chatsState.next}
                      />
                    ) : (
                      <LoadingContainer />
                    )}
                  </span>
                );
            })()}
          </div>
        </Container>
      </WideLayout>
    </div>
  );
}

const parseChats = (chats, texts) =>
  chats
    ? chats.map((chat) => ({
        ...chat,
        chatting_partner:
          chat.participants.length === 2 && chat.participants.find((p) => p.id !== chat.user.id),
        unread_count: chat.unread_count,
        content: chat.last_message ? chat.last_message.content : texts.chat_has_been_created,
      }))
    : [];

async function getChatsOfLoggedInUser(token, next, locale) {
  try {
    const url = next ? next : `/api/chats/?page=1`;
    const resp = await apiRequest({
      method: "get",
      url: url,
      token: token,
      locale: locale,
    });
    console.log(resp);
    return {
      chats: parseChatData(resp.data.results),
      next: resp.data.next,
    };
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}

const parseChatData = (chats) => {
  return chats.map((c) => ({
    ...c,
    participants: c.participants.map((p) => ({
      ...p.user_profile,
      role: p.role,
      created_at: p.created_at,
    })),
  }));
};
