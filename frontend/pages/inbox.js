import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { Container, Typography, Button, IconButton, TextField } from "@material-ui/core";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";
import axios from "axios";
import AddIcon from "@material-ui/icons/Add";
import tokenConfig from "../public/config/tokenConfig";
import UserContext from "../src/components/context/UserContext";
import LoadingContainer from "../src/components/general/LoadingContainer";
import AutoCompleteSearchBar from "../src/components/general/AutoCompleteSearchBar";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import MiniProfilePreview from "../src/components/profile/MiniProfilePreview";
import Router from "next/router";

const useStyles = makeStyles(theme => {
  return {
    root: {
      padding: 0
    },
    headline: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      textAlign: "center"
    },
    newChatButton: {
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1)
      }
    },
    searchSectionContainer: {
      marginBottom: theme.spacing(4),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
      }
    },
    buttonBar: {
      position: "relative",
      height: 40
    },
    cancelButton: {
      position: "absolute",
      right: 0
    },
    newChatParticipantsContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down("xs")]: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center"
      }
    },
    miniProfilePreview: {
      padding: theme.spacing(2),
      display: "inline-flex"
    },
    groupChatName: {
      marginLeft: theme.spacing(2),
      width: 250
    }
  };
});

export default function Inbox({ chatData, token }) {
  const classes = useStyles();
  const { user } = React.useContext(UserContext);
  const [userSearchEnabled, setUserSearchEnabled] = React.useState(false);
  const [newChatMembers, setNewChatMembers] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [groupName, setGroupName] = React.useState("");

  const handleGroupNameChange = e => {
    setGroupName(e.target.value);
  };

  const enableUserSearch = () => {
    setUserSearchEnabled(true);
  };

  const disableUserSearch = () => {
    setUserSearchEnabled(false);
  };

  const handleAddNewChatMember = member => {
    setNewChatMembers([...newChatMembers, member]);
  };

  const handleStartChat = e => {
    e.preventDefault();
    const isGroupchat = newChatMembers.length > 1;
    const urlPostfix = isGroupchat ? "/api/start_group_chat/" : "/api/start_private_chat/";
    if (newChatMembers.length >= 1) {
      const payload = {};
      if (isGroupchat) {
        if (!groupName) {
          setErrorMessage(
            "Please set a group name if you're starting a chat with more than one member"
          );
          return;
        }
        payload.participants = newChatMembers.map(m => m.id);
        payload.group_chat_name = groupName;
      } else {
        payload.profile_url_slug = newChatMembers[0].url_slug;
      }
      axios
        .post(process.env.API_URL + urlPostfix, payload, tokenConfig(token))
        .then(async function(response) {
          Router.push("/chat/" + response.data.chat_uuid + "/");
        })
        .catch(function(error) {
          console.log(error.response);
          // TODO: Show error message that user cant connect
        });
    } else
      setErrorMessage(
        "Please add one or more users to chat to by searching them in the search bar above"
      );
  };

  const handleRemoveMember = member => {
    setNewChatMembers([...newChatMembers.filter(m => m.id !== member.id)]);
  };

  const getUsersToFilterOut = () => [user, ...newChatMembers];

  const renderSearchOption = option => {
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
      <WideLayout title="Inbox" messageType="error" message={errorMessage}>
        <Container maxWidth="md" className={classes.root}>
          <Typography component="h1" variant="h4" className={classes.headline}>
            Inbox
          </Typography>
          {userSearchEnabled ? (
            <div className={classes.searchSectionContainer}>
              <AutoCompleteSearchBar
                label={
                  newChatMembers.length < 1
                    ? "Search user to message..."
                    : "Add more chat participants..."
                }
                baseUrl={process.env.API_URL + "/api/members/?search="}
                clearOnSelect
                freeSolo
                filterOut={getUsersToFilterOut()}
                onSelect={handleAddNewChatMember}
                renderOption={renderSearchOption}
                getOptionLabel={option => option.first_name + " " + option.last_name}
                helperText="Type the name of the user(s) you want to message."
              />
              <form onSubmit={handleStartChat}>
                {newChatMembers.length > 1 && (
                  <TextField
                    label="Group chat name"
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
                    Start Chat
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.cancelButton}
                    onClick={disableUserSearch}
                  >
                    Cancel
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
              New Chat
            </Button>
          )}
          {user ? (
            <ChatPreviews chats={parseChats(chatData, user)} user={user} />
          ) : (
            <LoadingContainer />
          )}
        </Container>
      </WideLayout>
    </div>
  );
}

const parseChats = (chats, user) =>
  chats
    ? chats.map(chat => ({
        ...chat,
        chatting_partner:
          chat.participants.length === 2 && chat.participants.filter(p => p.id != user.id)[0],
        unread_count: chat.unread_count,
        content: chat.last_message ? chat.last_message.content : "Chat has been created"
      }))
    : [];

Inbox.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    chatData: await getChatsOfLoggedInUser(token),
    token: token
  };
};

async function getChatsOfLoggedInUser(token) {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/chats/", tokenConfig(token));
    return resp.data.results;
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}
