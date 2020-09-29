import React, { useState, useContext } from "react";
import Link from "next/link";
import { Typography, IconButton, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FixedHeightLayout from "../../src/components/layouts/FixedHeightLayout";
import MiniProfilePreview from "../../src/components/profile/MiniProfilePreview";
import Messages from "../../src/components/communication/chat/Messages";
import SendIcon from "@material-ui/icons/Send";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import Cookies from "next-cookies";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";
import { getMessageFromServer } from "./../../public/lib/messagingOperations";
import UserContext from "../../src/components/context/UserContext";

const useStyles = makeStyles(theme => {
  return {
    backIcon: {
      float: "left",
      left: theme.spacing(1)
    },
    topBar: {
      textAlign: "center",
      padding: theme.spacing(1),
      background: theme.palette.grey[200],
      width: "100%",
      flex: "none"
    },
    content: {
      flex: "auto",
      overflowY: "auto",
      width: "100%"
    },
    bottomBar: {
      background: theme.palette.grey[200],
      flex: "none",
      width: "100%"
    },
    maxWidth: {
      maxWidth: theme.breakpoints.values["md"],
      margin: "0 auto"
    },
    sendMessageBarContent: {
      padding: theme.spacing(1)
    },
    messageInput: {
      width: "calc(100% - 60px)",
      border: 0
    },
    sendButton: {
      height: 40,
      width: 40,
      marginLeft: theme.spacing(2)
    },
    sendButtonIcon: {
      height: 35,
      width: 35
    }
  };
});

export default function MessageUser({ chatting_partner, token }) {
  const { user, chatSocket, refreshNotifications } = useContext(UserContext);
  const [chatUUID, setChatUUID] = useState();
  const [loading, setLoading] = useState(true);
  const [socketClosed, setSocketClosed] = useState(false);
  const [state, setState] = React.useState({
    hasMore: false,
    nextPage: 2,
    messages: React.useState()
  });

  if (user && !chatUUID) {
    axios
      .post(
        process.env.API_URL + "/api/connect_participants/",
        { profile_url_slug: chatting_partner.url_slug },
        tokenConfig(token)
      )
      .then(async function(response) {
        setChatUUID(response.data["chat_uuid"]);
        const messages = await getChatMessagesByUUID(response.data["chat_uuid"], token, 1);
        const sortedMessages = messages.messages.sort((a, b) => a.id - b.id);
        await refreshNotifications();
        setState({
          ...state,
          messages: sortedMessages,
          hasMore: messages.hasMore
        });
        setLoading(false);
      })
      .catch(function(error) {
        console.log(error.response);
        // TODO: Show error message that user cant connect
      });
  }
  console.log(state.messages);

  if (chatSocket) {
    chatSocket.onmessage = async rawData => {
      const data = JSON.parse(rawData.data);
      const message = await getMessageFromServer(data.message_id, token);
      setState({ ...state, messages: [...state.messages, message] });
    };
    chatSocket.onclose = () => {
      setSocketClosed(true);
    };
  }

  const loadMoreProjects = async () => {
    try {
      const newMessagesObject = await getChatMessagesByUUID(
        chatUUID,
        token,
        state.nextPage,
        state.nextLink
      );
      const newMessages = newMessagesObject.messages;
      const sortedMessages = newMessages.sort((a, b) => a.id - b.id);
      setState({
        ...state,
        nextPage: state.nextPage + 1,
        nextLink: newMessagesObject.nextLink,
        hasMore: newMessagesObject.hasMore,
        messages: [...sortedMessages, ...state.messages]
      });

      return [...sortedMessages];
    } catch (e) {
      console.log("error");
      console.log(e);
      setState({
        ...state,
        hasMore: false
      });
      return [];
    }
  };

  const sendMessage = async message => {
    chatSocket.send(JSON.stringify({ message: message, chat_uuid: chatUUID }));
  };

  return (
    <FixedHeightLayout
      title={
        chatting_partner
          ? "Message " + chatting_partner.first_name + " " + chatting_partner.last_name
          : "Not found"
      }
    >
      {chatting_partner ? (
        <MessagingLayout
          chatting_partner={chatting_partner}
          messages={state.messages}
          loading={loading}
          sendMessage={sendMessage}
          socketClosed={socketClosed}
          loadMoreProjects={loadMoreProjects}
          hasMore={state.hasMore}
        />
      ) : (
        <NoProfileFoundLayout />
      )}
    </FixedHeightLayout>
  );
}

MessageUser.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  console.log(ctx.query.profileUrl);
  return {
    chatting_partner: await getProfileByUrlIfExists(ctx.query.profileUrl),
    token: token
  };
};

function MessagingLayout({
  chatting_partner,
  messages,
  loading,
  sendMessage,
  socketClosed,
  loadMoreProjects,
  hasMore
}) {
  const classes = useStyles();
  const [curMessage, setCurMessage] = React.useState("");
  //TODO show user when socket has closed

  const onSendMessage = event => {
    sendMessage(curMessage);
    setCurMessage("");
    if (event) event.preventDefault();
  };

  const handleMessageKeydown = event => {
    if (event.key === "Enter" && event.ctrlKey) onSendMessage();
  };

  const onCurMessageChange = event => {
    setCurMessage(event.target.value);
  };

  return (
    <>
      <div className={`${classes.topBar} ${classes.maxWidth}`}>
        <IconButton className={classes.backIcon} href="/inbox">
          <KeyboardArrowLeftIcon />
        </IconButton>
        <MiniProfilePreview profile={chatting_partner} />
      </div>
      {loading ? (
        <div>Loading</div>
      ) : (
        <Messages
          messages={messages}
          chatting_partner={chatting_partner}
          className={`${classes.content} ${classes.maxWidth}`}
          hasMore={hasMore}
          loadFunc={loadMoreProjects}
        />
      )}
      <div className={`${classes.bottomBar} ${classes.maxWidth}`}>
        <form className={classes.sendMessageBarContent} onSubmit={onSendMessage}>
          <TextField
            variant="outlined"
            size="small"
            autoFocus
            multiline
            placeholder="Message"
            className={classes.messageInput}
            value={curMessage}
            onChange={onCurMessageChange}
            onKeyDown={handleMessageKeydown}
          />
          <IconButton
            disableRipple
            disableFocusRipple
            size="small"
            type="submit"
            className={classes.sendButton}
            style={{ backgroundColor: "transparent" }}
          >
            <SendIcon className={classes.sendButtonIcon} />
          </IconButton>
        </form>
      </div>
    </>
  );
}

function NoProfileFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Profile not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
  );
}

async function getChatMessagesByUUID(chat_uuid, token, page, link) {
  try {
    const url = link
      ? link
      : process.env.API_URL + "/api/messages/?chat_uuid=" + chat_uuid + "&page=" + page;
    const resp = await axios.get(url, tokenConfig(token));
    return {
      messages: resp.data.results,
      hasMore: !!resp.data.next && resp.data.next !== link,
      nextLink: resp.data.next
    };
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByUrlIfExists(profileUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/member/" + profileUrl + "/",
      tokenConfig(token)
    );
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}
