import { Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NextCookies from "next-cookies";
import React, { useEffect, useState, useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest, sendToLogin, redirect } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";
import UserSearchField from "../src/components/communication/chat/UserSearchField";
import ChatSearchField from "../src/components/communication/chat/ChatSearchField";
import LocationSearchField from "../src/components/communication/chat/LocationSearchField";
import LoadingSpinner from "../src/components/general/LoadingSpinner";
import RemoveIcon from "@material-ui/icons/Remove";
import InboxControlButtons from "../src/components/communication/chat/InboxControlButtons";

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
    searchSectionContainer: {
      marginBottom: theme.spacing(4),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      },
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
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
  const chatData = await getChatsOfLoggedInUser(auth_token, 1, ctx.locale);
  return {
    props: {
      chatData: chatData.chats,
      initialNextPage: chatData.nextPage,
    },
  };
}

export default function Inbox({ chatData, initialNextPage }) {
  const token = new Cookies().get("auth_token");
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [userSearchEnabled, setUserSearchEnabled] = useState(false);
  const [chatSearchEnabled, setChatSearchEnabled] = useState(false);
  const [locationSearchEnabled, setLocationSearchEnabled] = useState(false);
  const [filterChatsByNeedToReply, setFilterChatsByNeedToReply] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState({ place: 0, osm: 0, loc_type: [""] });
  const [isLoading, setIsLoading] = useState(false);

  const [chatsState, setChatsState] = useState({
    chats: parseChats(chatData, texts),
    nextPage: initialNextPage,
  });

  const [searchedChatsState, setSearchedChatsState] = useState({
    chats: [],
    nextPage: 0,
  });

  const [searchedByLocationChatsState, setSearchedByLocationChatsState] = useState({
    chats: [],
    nextPage: 0,
  });

  const [needToReplyChatsState, setNeedToReplyChatsState] = useState({
    chats: [],
    nextPage: 0,
  });

  const resetAlertMessage = () => setErrorMessage("");

  const applyFilterByNameToChats = async (filter) => {
    setSearchTerm(filter);
    handleSetIsLoading(true);
    const url = `/api/chat/?page=1&search=${filter}`;
    const response = await getResponseFromAPI(locale, token, url);
    handleSetIsLoading(false);

    const parsedChats = getParsedChats(response, texts);
    setSearchedChatsState({
      chats: parsedChats,
      nextPage: response.data.next ? 2 : null,
    });
  };

  const applyLocationFilterToChats = async (placeId, osmId, locType) => {
    setLocationSearch({ place: placeId, osm: osmId, loc_type: locType });
    handleSetIsLoading(true);
    const url = `/api/filtered_by_location_chats/?page=1&place=${placeId}&osm=${osmId}&loc_type=${locType}`;
    const response = await getResponseFromAPI(locale, token, url);

    handleSetIsLoading(false);
    const parsedChats = getParsedChats(response, texts);

    setSearchedByLocationChatsState({
      chats: parsedChats,
      nextPage: response.data.next ? 2 : null,
    });
  };

  // API call every button press or once and use the chat state? (currently every press)
  const applyFilterToChatsForNeedToReply = async () => {
    handleSetIsLoading(true);
    const url = `/api/filtered_by_need_to_reply_chats/?page=1`;
    const response = await getResponseFromAPI(locale, token, url);
    handleSetIsLoading(false);

    const parsedChats = getParsedChats(response, texts);

    setNeedToReplyChatsState({
      chats: parsedChats,
      nextPage: response.data.next ? 2 : null,
    });
  };

  const toggleShowChatsByNeedToReply = () => {
    setFilterChatsByNeedToReply(!filterChatsByNeedToReply);
    if (!filterChatsByNeedToReply) applyFilterToChatsForNeedToReply();
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

  const enableLocationSearch = () => {
    setLocationSearchEnabled(true);
  };

  const disableLocationSearch = () => {
    setSearchedByLocationChatsState({
      chats: [],
      nextPage: 0,
    });
    setLocationSearchEnabled(false);
  };

  const disableUserSearch = () => {
    setUserSearchEnabled(false);
  };

  const disableChatSearch = () => {
    setSearchedChatsState({
      chats: [],
      nextPage: 0,
    });
    setChatSearchEnabled(false);
  };

  const loadMoreChats = async () => {
    const newChatData = await getChatsOfLoggedInUser(token, chatsState.nextPage, locale);
    const newChats = newChatData.chats;
    setChatsState({
      ...chatsState,
      nextPage: newChatData.nextPage,
      chats: [...chatsState.chats, ...parseChats(newChats, texts)],
    });
  };

  const loadMoreFilteredByNameChats = async () => {
    const url = `/api/chat/?page=${searchedChatsState.nextPage}&search=${searchTerm}`;
    const response = await getResponseFromAPI(locale, token, url);
    const parsedChats = getParsedChats(response, texts);
    setSearchedChatsState({
      ...searchedChatsState,
      nextPage: response.data.next ? searchedChatsState.nextPage + 1 : null,
      chats: [...searchedChatsState.chats, ...parsedChats],
    });
  };

  const loadMoreFilteredByLocationChats = async () => {
    const urlEnding = `&place=${locationSearch.place}&osm=${locationSearch.osm}&loc_type=${locationSearch.loc_type}`;
    const url = `/api/filtered_by_location_chats/?page=${searchedByLocationChatsState.nextPage}${urlEnding}`;
    const response = await getResponseFromAPI(locale, token, url);
    const parsedChats = getParsedChats(response, texts);
    setSearchedByLocationChatsState({
      ...searchedByLocationChatsState,
      nextPage: response.data.next ? searchedByLocationChatsState.nextPage + 1 : null,
      chats: [...searchedByLocationChatsState.chats, ...parsedChats],
    });
  };

  const loadMoreNeedToReplyChats = async () => {
    const url = `/api/filtered_by_need_to_reply_chats/?page=${needToReplyChatsState.nextPage}`;
    const response = await getResponseFromAPI(locale, token, url);
    const parsedChats = getParsedChats(response, texts);
    setNeedToReplyChatsState({
      ...needToReplyChatsState,
      nextPage: response.data.next ? needToReplyChatsState.nextPage + 1 : null,
      chats: [...needToReplyChatsState.chats, ...parsedChats],
    });
  };

  useEffect(() => {
    if (!user)
      redirect("/signin", {
        redirect: window.location.pathname + window.location.search,
        message: texts.login_required,
      });
  }, [user]);

  return (
    <div>
      <WideLayout
        title={texts.inbox}
        messageType="error"
        message={errorMessage}
        resetAlertMessage={resetAlertMessage}
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
                    />
                    <ChatPreviews
                      isSearchingEnabled={false}
                      loadFunc={loadMoreChats}
                      chats={chatsState.chats}
                      user={user}
                      hasMore={!!chatsState.nextPage}
                    />
                  </span>
                );

              if (chatSearchEnabled)
                return (
                  <span>
                    <ChatSearchField
                      cancelChatSearch={disableChatSearch}
                      applyFilterByNameToChats={applyFilterByNameToChats}
                    />

                    {!isLoading ? (
                      <ChatPreviews
                        isSearchingEnabled={true}
                        loadFunc={loadMoreFilteredByNameChats}
                        chats={searchedChatsState.chats}
                        user={user}
                        hasMore={!!searchedChatsState.nextPage}
                      />
                    ) : (
                      <LoadingSpinner isLoading />
                    )}
                  </span>
                );
              if (locationSearchEnabled) {
                return (
                  <span>
                    <LocationSearchField
                      cancelChatSearch={disableLocationSearch}
                      applyLocationFilterToChats={applyLocationFilterToChats}
                    />
                    {!isLoading ? (
                      <ChatPreviews
                        isSearchingEnabled={true}
                        loadFunc={loadMoreFilteredByLocationChats}
                        chats={searchedByLocationChatsState.chats}
                        user={user}
                        hasMore={!!searchedByLocationChatsState.nextPage}
                      />
                    ) : (
                      <LoadingSpinner isLoading />
                    )}
                  </span>
                );
              }
              if (filterChatsByNeedToReply) {
                return (
                  <span>
                    <Button
                      className={classes.newChatButton}
                      startIcon={<RemoveIcon />}
                      variant="contained"
                      color="primary"
                      onClick={toggleShowChatsByNeedToReply}
                    >
                      {texts.remove_filter_by_need_to_reply}
                    </Button>

                    {!isLoading ? (
                      <ChatPreviews
                        isSearchingEnabled={true}
                        loadFunc={loadMoreNeedToReplyChats}
                        chats={needToReplyChatsState.chats}
                        user={user}
                        hasMore={!!needToReplyChatsState.nextPage}
                      />
                    ) : (
                      <LoadingSpinner isLoading />
                    )}
                  </span>
                );
              }
              if (
                !userSearchEnabled &&
                !chatSearchEnabled &&
                !locationSearchEnabled &&
                !filterChatsByNeedToReply
              )
                return (
                  <span>
                    <div className={classes.buttonContainer}>
                      <InboxControlButtons
                        enableChatSearch={enableChatSearch}
                        enableLocationSearch={enableLocationSearch}
                        enableUserSearch={enableUserSearch}
                        toggleShowChatsByNeedToReply={toggleShowChatsByNeedToReply}
                      />
                    </div>

                    <ChatPreviews
                      chatSearchEnabled={chatSearchEnabled}
                      loadFunc={loadMoreChats}
                      chats={chatsState.chats}
                      user={user}
                      hasMore={!!chatsState.nextPage}
                    />
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
      nextPage: resp.data.next ? nextPage + 1 : null,
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

const getParsedChats = (response, texts) => {
  const parsedChatData = parseChatData(response.data.results);
  const parsedChats = parseChats(parsedChatData, texts);
  return parsedChats;
};

const getResponseFromAPI = async (locale, token, url) => {
  try {
    return await apiRequest({
      method: "get",
      url: url,
      token: token,
      locale: locale,
    });
  }  catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
  
};
