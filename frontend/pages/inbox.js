import { Button, Container, IconButton, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import NextCookies from "next-cookies";
import Router from "next/router";
import React from "react";
import Cookies from "universal-cookie";
import { apiRequest, sendToLogin } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import UserContext from "../src/components/context/UserContext";
import LoadingContainer from "../src/components/general/LoadingContainer";
import WideLayout from "../src/components/layouts/WideLayout";
import MiniProfilePreview from "../src/components/profile/MiniProfilePreview";
import AutoCompleteSearchBar from "../src/components/search/AutoCompleteSearchBar";

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
      marginBottom: theme.spacing(2),
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
  const [newChatMembers, setNewChatMembers] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [groupName, setGroupName] = React.useState("");
  const [chatsState, setChatsState] = React.useState({
    chats: parseChats(chatData, texts),
    next: next,
  });

  const resetAlertMessage = () => setErrorMessage("")

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const enableUserSearch = () => {
    setUserSearchEnabled(true);
  };

  const disableUserSearch = () => {
    setUserSearchEnabled(false);
  };

  const handleAddNewChatMember = (member) => {
    setNewChatMembers([...newChatMembers, member]);
  };

  const handleStartChat = (e) => {
    e.preventDefault();
    const isGroupchat = newChatMembers.length > 1;
    const urlPostfix = isGroupchat ? "/api/start_group_chat/" : "/api/start_private_chat/";
    if (newChatMembers.length >= 1) {
      const payload = {};
      if (isGroupchat) {
        //The if statement (line 127) is never entered due to TextField having a the required property set (line 216)
        if (!groupName) {
          setErrorMessage(
            texts.please_set_a_group_name_if_youre_starting_a_chat_with_more_than_one_member
          );
          return;
        }
        payload.participants = newChatMembers.map((m) => m.id);
        payload.group_chat_name = groupName;
      } else {
        payload.profile_url_slug = newChatMembers[0].url_slug;
      }
      apiRequest({
        method: "post",
        url: urlPostfix,
        payload: payload,
        token: token,
        locale: locale,
      })
        .then(async function (response) {
          Router.push("/chat/" + response.data.chat_uuid + "/");
        })
        .catch(function (error) {
          console.log(error.response);
          // TODO: Show error message that user cant connect
        });
    } else
      setErrorMessage(
        texts.please_add_one_or_more_users_to_chat_to_by_searching_them_in_the_search_bar_above
      );
  };

  const loadMoreChats = async () => {
    const newChatData = await getChatsOfLoggedInUser(token, next, locale);
    const newChats = newChatData.chats;
    setChatsState({
      ...chatsState,
      next: newChatData.next,
      chats: [...chatsState.chats, ...parseChats(newChats, user, texts)],
    });
  };

  const handleRemoveMember = (member) => {
    setNewChatMembers([...newChatMembers.filter((m) => m.id !== member.id)]);
  };

  const getUsersToFilterOut = () => [user, ...newChatMembers];

  const renderSearchOption = (option) => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.first_name + " " + option.last_name}
      </React.Fragment>
    );
  };

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
          {userSearchEnabled ? (
            <div className={classes.searchSectionContainer}>
              <AutoCompleteSearchBar
                label={
                  newChatMembers.length < 1
                    ? texts.search_user_to_message + "..."
                    : texts.add_more_chat_participants + "..."
                }
                baseUrl={process.env.API_URL + "/api/members/?search="}
                clearOnSelect
                freeSolo
                filterOut={getUsersToFilterOut()}
                onSelect={handleAddNewChatMember}
                renderOption={renderSearchOption}
                getOptionLabel={(option) => option.first_name + " " + option.last_name}
                helperText={texts.type_the_name_of_the_users_you_want_to_message}
              />
              <form onSubmit={handleStartChat}>
                {newChatMembers.length > 1 && (
                  <TextField
                    label={texts.group_chat_name}
                    size="small"
                    className={classes.groupChatName}
                    required
                    onChange={handleGroupNameChange}
                    value={groupName}
                  />
                )}
                <div className={classes.newChatParticipantsContainer}>
                  {newChatMembers.map((m, index) => (
                    <MiniProfilePreview
                      key={index}
                      profile={m}
                      className={classes.miniProfilePreview}
                      onDelete={handleRemoveMember}
                    />
                  ))}
                </div>
                <div className={classes.buttonBar}>
                  <Button variant="contained" color="primary" type="submit">
                    {texts.start_chat}
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.cancelButton}
                    onClick={disableUserSearch}
                  >
                    {texts.cancel}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Button
              className={classes.newChatButton}
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={enableUserSearch}
            >
              {texts.new_chat}
            </Button>
          )}
          {user ? (
            <ChatPreviews
              loadFunc={loadMoreChats}
              chats={chatsState.chats}
              user={user}
              hasMore={!!chatsState.next}
            />
          ) : (
            <LoadingContainer />
          )}
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
