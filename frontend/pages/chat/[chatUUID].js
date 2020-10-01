import React, { useState, useContext } from "react";
import { Typography, IconButton, TextField, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FixedHeightLayout from "../../src/components/layouts/FixedHeightLayout";
import MiniProfilePreview from "../../src/components/profile/MiniProfilePreview";
import Messages from "../../src/components/communication/chat/Messages";
import SendIcon from "@material-ui/icons/Send";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import Cookies from "next-cookies";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";
import { getMessageFromServer } from "../../public/lib/messagingOperations";
import UserContext from "../../src/components/context/UserContext";
import ChatTitle from "../../src/components/communication/chat/ChatTitle";

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
    },
    showParticipantsButton: {
      cursor: "pointer"
    },
    chatParticipantsContainer: {
      background: theme.palette.grey[200],
      width: "100%",
      paddingBottom: theme.spacing(1),
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap"
    },
    chatParticipantsPreview: {
      padding: theme.spacing(1)
    }
  };
});

export default function MessageUser({
  participants,
  title,
  token,
  chatUUID,
  messages,
  nextLink,
  hasMore
}) {
  const { chatSocket } = useContext(UserContext);
  const [socketClosed, setSocketClosed] = useState(false);
  const [state, setState] = React.useState({
    nextPage: 2,
    messages: [...messages],
    nextLink: nextLink,
    hasMore: hasMore
  });

  const chatting_partner = participants[0];
  const isPrivateChat = participants.length === 1;

  if (chatSocket) {
    chatSocket.onmessage = async rawData => {
      const data = JSON.parse(rawData.data);
      if (data.chat_uuid === chatUUID) {
        const message = await getMessageFromServer(data.message_id, token);
        setState({ ...state, messages: [...state.messages, message] });
      }
    };
    chatSocket.onclose = () => {
      setSocketClosed(true);
    };
  }

  const loadMoreMessages = async () => {
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
          isPrivateChat={isPrivateChat}
          title={title}
          sendMessage={sendMessage}
          socketClosed={socketClosed}
          loadMoreMessages={loadMoreMessages}
          hasMore={state.hasMore}
          participants={participants}
        />
      ) : (
        <NoChatFoundLayout />
      )}
    </FixedHeightLayout>
  );
}

MessageUser.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const chat = await getChat(ctx.query.chatUUID, token);
  const messages_object = await getChatMessagesByUUID(ctx.query.chatUUID, token, 1);
  return {
    token: token,
    chat_uuid: chat.chat_uuid,
    participants: chat.participants,
    title: chat.title,
    messages: messages_object.messages,
    nextLink: messages_object.nextLink,
    hasMore: messages_object.hasMore,
    chatUUID: ctx.query.chatUUID
  };
};

function MessagingLayout({
  chatting_partner,
  messages,
  loading,
  sendMessage,
  /*socketClosed,*/
  loadMoreMessages,
  hasMore,
  title,
  isPrivateChat,
  participants
}) {
  const classes = useStyles();
  const [curMessage, setCurMessage] = React.useState("");
  const [showChatParticipants, setShowChatParticipants] = React.useState(false);
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

  const toggleShowChatParticipants = () => setShowChatParticipants(!showChatParticipants);

  return (
    <>
      <div className={`${classes.topBar} ${classes.maxWidth}`}>
        <IconButton className={classes.backIcon} href="/inbox">
          <KeyboardArrowLeftIcon />
        </IconButton>
        {isPrivateChat ? (
          <MiniProfilePreview profile={chatting_partner} />
        ) : (
          <div>
            <ChatTitle chat={{ name: title }} />
            <div>
              <Link
                underline="always"
                onClick={toggleShowChatParticipants}
                className={classes.showParticipantsButton}
              >
                {showChatParticipants ? "Hide chat participants" : "Show chat participants"}
              </Link>
            </div>
          </div>
        )}
      </div>
      {showChatParticipants && (
        <div className={classes.chatParticipantsContainer}>
          {participants.map((p, index) => {
            return (
              <MiniProfilePreview
                key={index}
                profile={p}
                className={classes.chatParticipantsPreview}
              />
            );
          })}
        </div>
      )}
      {loading ? (
        <div>Loading</div>
      ) : (
        <Messages
          messages={messages}
          chatting_partner={chatting_partner}
          className={`${classes.content} ${classes.maxWidth}`}
          hasMore={hasMore}
          loadFunc={loadMoreMessages}
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

function NoChatFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Chat not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
  );
}

async function getChat(chat_uuid, token) {
  const resp = await axios.get(
    process.env.API_URL + "/api/chat/" + chat_uuid + "/",
    tokenConfig(token)
  );
  return {
    participants: resp.data.participants.filter(p => p.id !== resp.data.user.id),
    title: resp.data.name
  };
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
