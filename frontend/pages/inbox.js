import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { Container, Typography, Button } from "@material-ui/core";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";
import axios from "axios";
import AddIcon from "@material-ui/icons/Add";
import tokenConfig from "../public/config/tokenConfig";
import UserContext from "../src/components/context/UserContext";
import LoadingContainer from "../src/components/general/LoadingContainer";
import AutoCompleteSearchBar from "../src/components/general/AutoCompleteSearchBar";

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
      marginBottom: theme.spacing(2)
    }
  };
});

export default function Inbox({ chatData }) {
  const classes = useStyles();
  console.log(chatData);
  const { user } = React.useContext(UserContext);
  const [userSearchEnabled, setUserSearchEnabled] = React.useState(false);
  console.log(chatData);

  const enableUserSearch = () => {
    setUserSearchEnabled(true);
  };

  return (
    <div>
      <WideLayout title="Inbox">
        <Container maxWidth="md" className={classes.root}>
          <Typography component="h1" variant="h4" className={classes.headline}>
            Inbox
          </Typography>
          {userSearchEnabled ? (
            <div>Insert Autocomplete searchbar here</div>
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
  chats.map(chat => ({
    ...chat,
    chatting_partner:
      chat.participant_one.id === user.id ? chat.participant_two : chat.participant_one,
    unread_count: chat.unread_count,
    content: chat.last_message.content
  }));

Inbox.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    chatData: await getChatsOfLoggedInUser(token)
  };
};

async function getChatsOfLoggedInUser(token) {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/chats/", tokenConfig(token));
    console.log(resp.data.results);
    return resp.data.results;
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}
