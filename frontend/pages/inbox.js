import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NextCookies from "next-cookies";
import React, { useEffect, useState, useContext } from "react";
import Cookies from "universal-cookie";
import { sendToLogin, redirect } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";
import InboxBoxContent from "../src/components/communication/chat/InboxContent";
import {
  parseChats,
  parseChatData,
  getResponseFromAPI,
} from "../public/lib/communicationOperations";

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

  const [errorMessage, setErrorMessage] = useState("");

  const [chatsState, setChatsState] = useState({
    chats: parseChats(chatData, texts),
    nextPage: initialNextPage,
  });

  const resetAlertMessage = () => setErrorMessage("");

  const updateErrorMessage = (e) => {
    setErrorMessage(e);
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
          <InboxBoxContent
            updateErrorMessage={updateErrorMessage}
            loadMoreChats={loadMoreChats}
            chatsState={chatsState}
            token={token}
          />
        </Container>
      </WideLayout>
    </div>
  );
}

async function getChatsOfLoggedInUser(token, nextPage, locale) {
  const url = `/api/chats/?page=${nextPage}`;
  const resp = await getResponseFromAPI(locale, token, url);
  return {
    chats: parseChatData(resp.data.results),
    nextPage: resp.data.next ? nextPage + 1 : null,
  };
}
