import { Button, Container, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
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
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import RemoveIcon from "@material-ui/icons/Remove";

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
    extraFilterButtonContainer: {
      display: "flex",
      flexDirection: "column",
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
    },
    toggleMoreFiltersButton: {
      height: 42,
      width: 42,
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchingOpen, setSearchingOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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

  const handleToggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  const resetAlertMessage = () => setErrorMessage("");

  const applyFilterByNameToChats = async (filter) => {
    setSearchingOpen(true);
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

  const applyLocationFilterToChats = async (filter) => {
    console.log(filter);
    setSearchingOpen(true);
    setSearchTerm(filter);
    handleSetIsLoading(true);
    const url = `/api/filtered_by_location_chats/?page=1&search=${filter}`; // update API / url
    const response = await getResponseFromAPI(locale, token, url);
    console.log(response);
    handleSetIsLoading(false);
    const parsedChats = getParsedChats(response,texts);

    setSearchedByLocationChatsState({
      chats: parsedChats,
      nextPage: response.data.next ? 2 : null,
    });
  };

  const applyFilterToChatsForNeedToReply = async () => {
    setSearchingOpen(true);
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
  }

  const disableLocationSearch = () => {
    setLocationSearchEnabled(false);
  }

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
    const url = `/api/filtered_by_location_chats/?page=${searchedByLocationChatsState.nextPage}&search=${searchTerm}`;
    const response = await getResponseFromAPI(locale, token, url);
    const parsedChats = getParsedChats(response, texts);
    setSearchedByLocationChatsState({
      ...searchedByLocationChatsState,
      nextPage: response.data.next ? searchedByLocationChatsState.nextPage + 1 : null,
      chats: [...searchedByLocationChatsState.chats, ...parsedChats],
    });
  }

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
                      chatSearchEnabled={chatSearchEnabled}
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

                    {!searchingOpen ? (
                      <ChatPreviews
                        chatSearchEnabled={chatSearchEnabled}
                        loadFunc={loadMoreChats}
                        chats={chatsState.chats}
                        user={user}
                        hasMore={!!chatsState.nextPage}
                      />
                    ) : (
                      [
                        !isLoading ? (
                          <ChatPreviews
                            chatSearchEnabled={chatSearchEnabled}
                            loadFunc={loadMoreFilteredByNameChats}
                            chats={searchedChatsState.chats}
                            user={user}
                            hasMore={!!searchedChatsState.nextPage}
                          />
                        ) : (
                          <LoadingSpinner isLoading />
                        ),
                      ]
                    )}
                  </span>
                );
              if (locationSearchEnabled) {
                return(
                <span>
                    <LocationSearchField
                      cancelChatSearch={disableLocationSearch} 
                      applyLocationFilterToChats={applyLocationFilterToChats}
                    />

                    {!searchingOpen ? (
                      <ChatPreviews
                        chatSearchEnabled={locationSearchEnabled}
                        loadFunc={loadMoreChats}
                        chats={chatsState.chats}
                        user={user}
                        hasMore={!!chatsState.nextPage}
                      />
                    ) : (
                      [
                        !isLoading ? (
                          <ChatPreviews
                            chatSearchEnabled={locationSearchEnabled}
                            loadFunc={loadMoreFilteredByLocationChats}
                            chats={searchedByLocationChatsState.chats}
                            user={user}
                            hasMore={!!searchedByLocationChatsState.nextPage}
                          />
                        ) : (
                          <LoadingSpinner isLoading />
                        ),
                      ]
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
                    {!searchingOpen ? (
                      <ChatPreviews
                        chatSearchEnabled={filterChatsByNeedToReply}
                        loadFunc={loadMoreNeedToReplyChats}
                        chats={needToReplyChatsState.chats}
                        user={user}
                        hasMore={!!needToReplyChatsState.nextPage}
                      />
                    ) : (
                      [
                        !isLoading ? (
                          <ChatPreviews
                            chatSearchEnabled={filterChatsByNeedToReply}
                            loadFunc={loadMoreNeedToReplyChats}
                            chats={needToReplyChatsState.chats}
                            user={user}
                            hasMore={!!needToReplyChatsState.nextPage}
                          />
                        ) : (
                          <LoadingSpinner isLoading />
                        ),
                      ]
                    )}
                  </span>
                );
              }
              if (!userSearchEnabled && !chatSearchEnabled)
                return (
                  <span>
                    <div className={classes.buttonContainer}>
                      <div>
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
                      </div>
                      {true && ( // if super user
                        <>
                          <IconButton
                            className={classes.toggleMoreFiltersButton}
                            onClick={handleToggleMoreFilters}
                          >
                            {showMoreFilters ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                          </IconButton>
                          {showMoreFilters && (
                            <div className={classes.extraFilterButtonContainer}>
                              <Button
                                className={classes.newChatButton}
                                startIcon={<SearchIcon />}
                                variant="contained"
                                color="primary"
                                onClick={enableLocationSearch}
                              >
                                {texts.find_a_chat} {texts.via_location}
                              </Button>
                              <Button
                                className={classes.newChatButton}
                                startIcon={<SearchIcon />}
                                variant="contained"
                                color="primary"
                                onClick={toggleShowChatsByNeedToReply}
                              >
                                {texts.filter_by_need_to_reply}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
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
}

const getResponseFromAPI = async (
  locale,
  token,
  url,
) => {
  return await apiRequest({
    token: token,
    method: "get",
    url: url,
    locale: locale,
  });
}