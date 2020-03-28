import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { Container, Typography } from "@material-ui/core";
import ChatPreviews from "../src/components/communication/chat/ChatPreviews";
import TEMP_MESSAGE_DATA from "../public/data/messages.json";
import TEMP_FEATURED_PROFILE_DATA from "../public/data/profiles.json";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      padding: 0
    },
    headline: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      textAlign: "center"
    }
  };
});

export default function Inbox({ chats, loggedInUser }) {
  const classes = useStyles();
  return (
    <div>
      <WideLayout title="Inbox" loggedInUser={loggedInUser}>
        <Container maxWidth="md" className={classes.root}>
          <Typography component="h1" variant="h4" className={classes.headline}>
            Inbox
          </Typography>
          <ChatPreviews chats={chats} />
        </Container>
      </WideLayout>
    </div>
  );
}

Inbox.getInitialProps = async ctx => {
  return {
    chats: await getChatsOfLoggedInUser(ctx.query.profileUrl),
    loggedInUser: await getLoggedInUser()
  };
};

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByUrlIfExists(profileUrl) {
  return TEMP_FEATURED_PROFILE_DATA.profiles.find(({ url }) => url === profileUrl);
}

async function getLoggedInUser() {
  return TEMP_FEATURED_PROFILE_DATA.profiles.find(p => p.url === "christophstoll");
}

//This function is really ugly but it doesn't matter, because it will be replaced with a single DB call.
async function getChatsOfLoggedInUser() {
  //This is imitating the logged in user. Will be replaced by a jwt check later.
  const user = await getLoggedInUser();
  const messagesWithUser = TEMP_MESSAGE_DATA.messages.filter(
    m => m.sender === user.url || m.receiver === user.url
  );
  const messagesByChattingPartner = messagesWithUser.map(msg => {
    return {
      chatting_partner: msg.receiver === user.url ? msg.sender : msg.receiver,
      date: msg.date,
      read: msg.read,
      sent: msg.sender === user.url,
      content: msg.content
    };
  });

  const newestMessageWithPartnerOnly = messagesByChattingPartner.filter(msg => {
    const messagesWithPartnerByDate = messagesByChattingPartner
      .filter(m => m.chatting_partner === msg.chatting_partner)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (messagesWithPartnerByDate.indexOf(msg) === 0) return true;
  });

  return Promise.all(
    newestMessageWithPartnerOnly
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(async msg => {
        return {
          ...msg,
          chatting_partner: await getProfileByUrlIfExists(msg.chatting_partner),
          unread_count: messagesByChattingPartner.filter(msgToFilter => {
            return (
              msgToFilter.chatting_partner === msg.chatting_partner &&
              !msgToFilter.sent &&
              !msg.read
            );
          }).length
        };
      })
  );
}
