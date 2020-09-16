import React, {useEffect, useState} from "react";
import Link from "next/link";
import { Typography, IconButton, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FixedHeightLayout from "../../src/components/layouts/FixedHeightLayout";
import TEMP_FEATURED_PROFILE_DATA from "../../public/data/profiles.json";
import TEMP_MESSAGE_DATA from "../../public/data/messages.json";
import MiniProfilePreview from "../../src/components/profile/MiniProfilePreview";
import Messages from "../../src/components/communication/chat/Messages";
import SendIcon from "@material-ui/icons/Send";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import Cookies from "next-cookies";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";

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

export default function ProfilePage({ user, chatting_partner, messages }) {
  const [chatUUID, setChatUUID] = useState();
  useEffect(() => {
    const tokenObj = Cookies('ctx');
    console.log(user);
    axios.post(
        process.env.API_URL + '/api/connect_participants/',
        {'profile_url_slug': user.url},
        tokenConfig(tokenObj.token)
    ).then(function(response){
      setChatUUID(response.data['chat_id'])
    }).catch(function(error) {
      console.log(error.response);
      // TODO: Show error message that user cant connect
    })
  })

  return (
    <FixedHeightLayout title={chatting_partner ? "Message " + chatting_partner.name : "Not found"}>
      {chatting_partner ? (
        <MessagingLayout
          user={user}
          chatting_partner={chatting_partner}
          message_history={messages}
        />
      ) : (
        <NoProfileFoundLayout />
      )}
    </FixedHeightLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  return {
    user: await getLoggedInUser(ctx.query.profileUrl),
    chatting_partner: await getProfileByUrlIfExists(ctx.query.profileUrl),
    messages: await getMessagesWithUser(ctx.query.profileUrl)
  };
};

function MessagingLayout({ user, chatting_partner, message_history }) {
  const classes = useStyles();

  const [curMessage, setCurMessage] = React.useState("");
  const [messages, setMessages] = React.useState(message_history);

  const onSendMessage = event => {
    if (curMessage.trim().length > 0) {
      setMessages([
        ...messages,
        {
          receiver: chatting_partner.url_slug,
          sender: user.url_slug,
          content: curMessage,
          date: new Date()
        }
      ]);
    }
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
      <Messages
        messages={messages}
        chatting_partner={chatting_partner}
        className={`${classes.content} ${classes.maxWidth}`}
      />
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

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByUrlIfExists(profileUrl) {
  return TEMP_FEATURED_PROFILE_DATA.profiles.find(({ url }) => url === profileUrl);
}

async function getLoggedInUser(profileUrl) {
  return { url: profileUrl };
}

async function getMessagesWithUser(profileUrl) {
  //This is imitating the logged in user. Will be replaced by a jwt check later.
  const user = await getLoggedInUser(profileUrl);
  return TEMP_MESSAGE_DATA.messages.filter(
    m =>
      (m.sender === profileUrl && m.receiver === user.url_slug) ||
      (m.sender === user.url_slug && m.receiver === profileUrl)
  );
}
