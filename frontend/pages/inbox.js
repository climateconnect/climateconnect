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
import WideLayout from "../src/components/layouts/WideLayout";
import UserSearchField from "../src/components/communication/chat/UserSearchField";
import ChatSearchField from "../src/components/communication/chat/ChatSearchField";
import LoadingSpinner from "../src/components/general/LoadingSpinner";

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
    }
  };
});

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "chat", locale: ctx.locale });
    const message = texts.you_have_to_log_in_to_see_your_inbox;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const chatData = await getChatsOfLoggedInUser(auth_token, 1, ctx.locale);
  return {
    props: {
      chatData: chatData.chats,
      nextPage: chatData.nextPage,
    },
  };
}

export default function Inbox({ chatData, nextPage }) {
  const token = new Cookies().get("auth_token");
  const classes = useStyles();
  const { user, locale } = React.useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [userSearchEnabled, setUserSearchEnabled] = React.useState(false);
  const [chatSearchEnabled, setChatSearchEnabled] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [chatsState, setChatsState] = React.useState({
    chats: parseChats(chatData, texts),
    nextPage: nextPage,
  });

  const [searchedChats, setSearchedChats] = React.useState(parseChats([], texts));
  const [isLoading, setIsLoading] = React.useState(false);

  const applyFilterToChats = (chatsAfterFilter) => {
    const parsedChatData = parseChatData(chatsAfterFilter);
    const parsedChats = parseChats(parsedChatData, texts);
    setSearchedChats(parsedChats);
  };

  const handleSetIsLoading = (newValue) => {
    setIsLoading(newValue);
  };

  const updateErrorMessage = (e) => {
    setErrorMessage(e);
  };

  const enableChatSearch = () => {
    setChatSearchEnabled(true);
  };

  const enableUserSearch = () => {
    setUserSearchEnabled(true);
  };

  const disableUserSearch = () => {
    setUserSearchEnabled(false);
  };

  const disableChatSearch = () => {
    setChatSearchEnabled(false);
  };


  const loadMoreChats = async () => {
    const newChatData = await getChatsOfLoggedInUser(token, chatsState.nextPage, locale);
    const newChats = newChatData.chats;
    setChatsState({
      ...chatsState,
      nextPage: newChatData.nextPage,
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
                      handleSetIsLoading={handleSetIsLoading}
                    />
                    {!isLoading ? (
                      <ChatPreviews
                        chatSearchEnabled={chatSearchEnabled}
                        loadFunc={loadMoreChats}
                        chats={searchedChats}
                        user={user}
                        hasMore={!!chatsState.next}
                      />
                    ) : (
                      <LoadingSpinner isLoading />
                    )}
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
                    {user && !isLoading ? (
                      <ChatPreviews
                        chatSearchEnabled={chatSearchEnabled}
                        loadFunc={loadMoreChats}
                        chats={chatsState.chats}
                        user={user}
                        hasMore={!!chatsState.next}
                      />
                    ) : (
                      <LoadingSpinner isLoading />
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

async function getChatsOfLoggedInUser(token, nextPage, locale) {
  try {
    const url = `/api/chats/?page=${nextPage}`;
    const resp = await apiRequest({
      method: "get",
      url: url,
      token: token,
      locale: locale,
    });
    return {
      chats: parseChatData(resp.data.results),
      nextPage: resp.data.next ? nextPage+1 : null,
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
