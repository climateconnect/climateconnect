import React, { useEffect } from "react";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../src/themes/theme";
import axios from "axios";
import Cookies from "universal-cookie";
import NextCookies from "next-cookies";
import UserContext from "../src/components/context/UserContext";
import { MatomoProvider } from "@datapunt/matomo-tracker-react";

//add global styles
import "react-multi-carousel/lib/styles.css";
import tokenConfig from "../public/config/tokenConfig";
import WebSocketService from "../public/lib/webSockets";

// This is lifted from a Material UI template at https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_app.js.

export default function MyApp({ Component, pageProps, user, notifications }) {
  const [stateInitialized, setStateInitialized] = React.useState(false)
  const cookies = new Cookies();
  const createInstanceIfAllowed = () => {
    return false;
  };
  const API_URL = process.env.API_URL;
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const SOCKET_URL = process.env.SOCKET_URL;
  const [state, setState] = React.useState({
    user: null,
    matomoInstance: createInstanceIfAllowed(),
    notifications: [],
    chatSocket: null
  });

  //TODO: reload current path or main page while being logged out
  const signOut = async () => {
    try {
      const token = cookies.get("token");
      await axios.post(process.env.API_URL + "/logout/", null, tokenConfig(token));
      cookies.remove("token", { path: "/" });
      setState({
        ...state,
        user: null
      });
    } catch (err) {
      console.log(err);
      cookies.remove("token", { path: "/" });
      setState({
        ...state,
        user: null
      });
      return null;
    }
  };

  const refreshNotifications = async () => {
    const notifications = await getNotifications(cookies.get("token"));
    setState({
      ...state,
      notifications: notifications
    });
  };

  const signIn = async (token, expiry) => {
    const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT);
    //TODO: set httpOnly=true to make cookie only accessible by server and sameSite=true
    const cookieProps = {
      path: "/",
      sameSite: develop ? false : "strict",
      expires: new Date(expiry),
      secure: !develop
    }
    if (!develop)
      cookieProps.domain = "."+process.env.API_HOST
    console.log(cookieProps)
    cookies.set("token", token, cookieProps);
    const user = await getLoggedInUser(cookies.get("token"));
    setState({
      user: user
    });
  };

  useEffect(() => {
    const client = WebSocketService("/ws/chat/");
    client.onopen = () => {
      console.log("connected");
    };
    client.onmessage = async () => {
      await refreshNotifications();
    };
    if (user && !stateInitialized) {
      setState({
        user: user,
        chatSocket: client,
        notifications: notifications
      });
      setStateInitialized(true)
    }
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  })

  const contextValues = {
    user: state.user,
    signOut: signOut,
    signIn: signIn,
    chatSocket: state.chatSocket,
    notifications: state.notifications,
    refreshNotifications: refreshNotifications,
    API_URL: API_URL,
    ENVIRONMENT: ENVIRONMENT,
    SOCKET_URL: SOCKET_URL
  };
  return (
    <React.Fragment>
      <Head>
        <title>Climate Connect</title>
        <link rel="icon" href="/icons/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {state.matomoInstance ? (
          <MatomoProvider value={state.matomoInstance}>
            <UserContext.Provider value={contextValues}>
              <Component {...pageProps} />
            </UserContext.Provider>
          </MatomoProvider>
        ) : (
          <UserContext.Provider value={contextValues}>
            <Component {...pageProps} />
          </UserContext.Provider>
        )}
      </ThemeProvider>
    </React.Fragment>
  );
  
}

MyApp.getInitialProps = async ctx => {
  let pageProps = {}
  if(ctx.Component && ctx.Component.getInitialProps){
    pageProps = await ctx.Component.getInitialProps(ctx.ctx)
    console.log(pageProps)
  }
  const { token } = NextCookies(ctx.ctx);
  const [user, notifications] = await Promise.all([
    getLoggedInUser(token),
    getNotifications(token)
  ])
  return {
    pageProps: pageProps,
    user: user,
    notifications: notifications
  }
}

async function getLoggedInUser(token) {
  if (token) {
    try {
      const resp = await axios.get(process.env.API_URL + "/api/my_profile/", tokenConfig(token));
      return resp.data;
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error in getLoggedInUser: " + err.response.data.detail);
      if (err.response && err.response.data.detail === "Invalid token.") 
        console.log("invalid token! token:"+token)
      return null;
    }
  } else {
    return null;
  }
}

async function getNotifications(token) {
  if (token) {
    try {
      const resp = await axios.get(process.env.API_URL + "/api/notifications/", tokenConfig(token));
      return resp.data.results;
    } catch (err) {
      if (err.response && err.response.data) console.log("Error in getNotifications: " + err.response.data.detail);
      if (err.response && err.response.data.detail === "Invalid token.") 
       console.log("invalid token! token:"+token)
      return null;
    }
  } else {
    return [];
  }
}
