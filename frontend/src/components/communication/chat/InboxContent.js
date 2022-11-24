import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button } from "@material-ui/core";
import ChatPreviews from "./ChatPreviews";
import UserSearchField from "./UserSearchField";
import LocationSearchField from "./LocationSearchField";
import LoadingSpinner from "../../general/LoadingSpinner";
import { getResponseFromAPI, getParsedChats } from "../../../../public/lib/communicationOperations";
import InboxControlButtons from "./InboxControlButtons";
import RemoveIcon from "@material-ui/icons/Remove";
import ChatSearchField from "./ChatSearchField";

const useStyles = makeStyles((theme) => {
  return {
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
      },
    },
    searchSectionContainer: {
      marginBottom: theme.spacing(4),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      },
    },
    newChatButton: {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1),
      },
    },
  };
});

export default function InboxBoxContent({ updateErrorMessage, loadMoreChats, chatsState, token }) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [userSearchEnabled, setUserSearchEnabled] = useState(false);
  const [chatSearchEnabled, setChatSearchEnabled] = useState(false);
  const [locationSearchEnabled, setLocationSearchEnabled] = useState(false);
  const [filterChatsByNeedToReply, setFilterChatsByNeedToReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState({ place: 0, osm: 0, loc_type: [""] });
  const [isLoading, setIsLoading] = useState(false);

  const handleSetIsLoading = (newValue) => {
    setIsLoading(newValue);
  };

  // filtered chat states
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

  // Button press handlers
  const toggleShowChatsByNeedToReply = () => {
    setFilterChatsByNeedToReply(!filterChatsByNeedToReply);
    if (!filterChatsByNeedToReply) applyFilterToChatsForNeedToReply();
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

  // Applying filters
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

  const handleRemoveLocationFilterFromChats = () => {
    setSearchedByLocationChatsState({
      chats: [],
      nextPage: 0,
    });
  };

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
  }; // API call every button press or should it be a serversideprop, loaded once like the default chat state? (currently every press)

  // Loading more chats functions
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

  return (
    <>
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
                  handleRemoveLocationFilterFromChats={handleRemoveLocationFilterFromChats}
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
                  hasMore={!!chatsState.nextPage}
                />
              </span>
            );
        })()}
      </div>
    </>
  );
}
