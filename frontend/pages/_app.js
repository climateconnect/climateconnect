import React, { useEffect } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../src/themes/theme";
import axios from "axios";
import Cookies from "universal-cookie";
import NextCookies from "next-cookies";
import UserContext from "../src/components/context/UserContext";
import ReactGA from "react-ga";

//add global styles
import "react-multi-carousel/lib/styles.css";
import tokenConfig from "../public/config/tokenConfig";
import WebSocketService from "../public/lib/webSockets";
import { getCookieProps } from "../public/lib/cookieOperations";

// This is lifted from a Material UI template at https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_app.js.

export default function MyApp({
  Component,
  pageProps,
  user,
  notifications,
  pathName,
  donationGoal
}) {
  const [stateInitialized, setStateInitialized] = React.useState(false);
  const [gaInitialized, setGaInitialized] = React.useState(false);
  const cookies = new Cookies();
  const [acceptedStatistics, setAcceptedStatistics] = React.useState(
    cookies.get("acceptedStatistics")
  );
  const updateCookies = () => setAcceptedStatistics(cookies.get("acceptedStatistics"));
  if (
    acceptedStatistics &&
    !gaInitialized &&
    !["develop", "development", "test"].includes(process.env.ENVIRONMENT)
  ) {
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_CODE, {
      debug: ["develop", "development", "test"].includes(process.env.ENVIRONMENT),
      gaOptions: {
        cookieDomain: process.env.BASE_URL_HOST,
        anonymizeIp: true
      }
    });
    ReactGA.pageview(!!pathName ? pathName : "/");
    setGaInitialized(true);
  }
  const API_URL = process.env.API_URL;
  const API_HOST = process.env.API_HOST;
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const SOCKET_URL = process.env.SOCKET_URL;
  const [state, setState] = React.useState({
    user: user,
    notifications: [],
    chatSocket: null
  });

  //TODO: reload current path or main page while being logged out
  const signOut = async () => {
    const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT);
    const cookieProps = {
      path: "/"
    };
    if (!develop) cookieProps.domain = "." + API_HOST;
    try {
      const token = cookies.get("token");
      await axios.post(process.env.API_URL + "/logout/", null, tokenConfig(token));
      cookies.remove("token", cookieProps);
      setState({
        ...state,
        user: null
      });
    } catch (err) {
      console.log(err);
      cookies.remove("token", cookieProps);
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
    const cookieProps = getCookieProps(expiry);

    cookies.set("token", token, cookieProps);
    const user = await getLoggedInUser(cookies.get("token") ? cookies.get("token") : token);
    setState({
      user: user
    });
  };

  useEffect(() => {
    if (!stateInitialized) {
      if (user) {
        const client = WebSocketService("/ws/chat/");
        client.onopen = () => {
          console.log("connected");
        };
        client.onmessage = async () => {
          await refreshNotifications();
        };
        setState({
          user: user,
          chatSocket: client,
          notifications: notifications
        });
      }
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector("#jss-server-side");
      if (jssStyles) {
        jssStyles.parentElement.removeChild(jssStyles);
      }
      setStateInitialized(true);
    }
  });

  const contextValues = {
    user: state.user,
    signOut: signOut,
    signIn: signIn,
    chatSocket: state.chatSocket,
    notifications: state.notifications,
    refreshNotifications: refreshNotifications,
    API_URL: API_URL,
    ENVIRONMENT: ENVIRONMENT,
    SOCKET_URL: SOCKET_URL,
    API_HOST: API_HOST,
    setNotificationsRead: setNotificationsRead,
    pathName: pathName,
    ReactGA: ReactGA,
    updateCookies: updateCookies,
    donationGoal: donationGoal
  };
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <UserContext.Provider value={contextValues}>
          <Component {...pageProps} />
        </UserContext.Provider>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.getInitialProps = async ctx => {
  const { token, acceptedStatistics } = NextCookies(ctx.ctx);
  if (ctx.router.route === "/" && token) {
    ctx.ctx.res.writeHead(302, {
      Location: "/browse",
      "Content-Type": "text/html; charset=utf-8"
    });
    ctx.ctx.res.end();
    return;
  }
  const [user, notifications, donationGoal, pageProps] = await Promise.all([
    getLoggedInUser(token),
    getNotifications(token),
    process.env.DONATION_CAMPAIGN_RUNNING ? getDonationGoalData() : null,
    ctx.Component && ctx.Component.getInitialProps ? ctx.Component.getInitialProps(ctx.ctx) : {}
  ]);
  console.log(donationGoal)
  const pathName = ctx.ctx.asPath.substr(1, ctx.ctx.asPath.length);
  if (token) {
    const notificationsToSetRead = getNotificationsToSetRead(notifications, pageProps);
    if (notificationsToSetRead.length > 0) {
      const updatedNotifications = await setNotificationsRead(token, notificationsToSetRead);
      return {
        pageProps: pageProps,
        user: user,
        notifications: updatedNotifications ? updatedNotifications : [],
        acceptedStatistics: acceptedStatistics,
        pathName: pathName,
        donationGoal: donationGoal
      };
    }
  }
  return {
    pageProps: pageProps,
    user: user,
    notifications: notifications ? notifications : [],
    pathName: pathName,
    donationGoal: donationGoal
  };
};

const getNotificationsToSetRead = (notifications, pageProps) => {
  let notifications_to_set_unread = [];
  if (pageProps.comments) {
    const comment_ids = pageProps.comments.map(p => p.id);
    const comment_notifications_to_set_unread = notifications.filter(n => {
      if (n.project_comment) {
        if (
          comment_ids.includes(n.project_comment.id) ||
          comment_ids.includes(n.project_comment.parent_comment_id)
        ) {
          return true;
        }
      }
    });
    notifications_to_set_unread = [
      ...notifications_to_set_unread,
      ...comment_notifications_to_set_unread
    ];
  }
  if (pageProps.chatUUID && pageProps.messages) {
    const chat_notifications_to_set_unread = notifications.filter(n => {
      if (n.chat_uuid) return n.chat_uuid === pageProps.chatUUID;
    });
    notifications_to_set_unread = [
      ...notifications_to_set_unread,
      ...chat_notifications_to_set_unread
    ];
  }
  return notifications_to_set_unread;
};

const setNotificationsRead = async (token, notifications) => {
  if (token) {
    try {
      const resp = await axios.post(
        process.env.API_URL + "/api/set_user_notifications_read/",
        { notifications: notifications.map(n => n.id) },
        tokenConfig(token)
      );
      return resp.data;
    } catch (e) {
      console.log(e);
    }
  } else return null;
};

async function getLoggedInUser(token) {
  if (token) {
    try {
      const resp = await axios.get(process.env.API_URL + "/api/my_profile/", tokenConfig(token));
      return resp.data;
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data)
        console.log("Error in getLoggedInUser: " + err.response.data.detail);
      if (err.response && err.response.data.detail === "Invalid token.")
        console.log("invalid token! token:" + token);
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
      if (err.response && err.response.data)
        console.log("Error in getNotifications: " + err.response.data.detail);
      if (err.response && err.response.data.detail === "Invalid token.")
        console.log("invalid token! token:" + token);
      return null;
    }
  } else {
    return [];
  }
}

async function getDonationGoalData() {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/donation_goal_progress/");
    return {
      goal_name: resp.data.name,
      goal_start: resp.data.start_date,
      goal_end: resp.data.end_date,
      goal_amount: resp.data.amount,
      current_amount: resp.data.current_amount
    };
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}
