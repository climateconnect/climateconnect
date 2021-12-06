import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactGA from "react-ga";
// Add global styles
import "react-multi-carousel/lib/styles.css";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import { getCookieProps } from "../public/lib/cookieOperations";
import WebSocketService from "../public/lib/webSockets";
import UserContext from "../src/components/context/UserContext";
import theme from "../src/themes/theme";

// This is lifted from a Material UI template at https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_app.js.

export default function MyApp({ Component, pageProps = {} }) {
  const router = useRouter();
  // Cookies
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [gaInitialized, setGaInitialized] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const [acceptedStatistics, setAcceptedStatistics] = useState(cookies.get("acceptedStatistics"));
  const [acceptedNecessary, setAcceptedNecessary] = useState(cookies.get("acceptedNecessary"));
  const updateCookies = () => {
    setAcceptedStatistics(cookies.get("acceptedStatistics"));
    setAcceptedNecessary(cookies.get("acceptedNecessary"));
  };
  const pathName = router.asPath;
  const { locale, locales } = router;
  if (
    acceptedStatistics &&
    !gaInitialized &&
    !["develop", "development", "test"].includes(process.env.ENVIRONMENT)
  ) {
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_CODE, {
      debug: ["develop", "development", "test"].includes(process.env.ENVIRONMENT),
      gaOptions: {
        cookieDomain: process.env.BASE_URL_HOST,
        anonymizeIp: true,
      },
    });
    ReactGA.pageview(pathName ? pathName : "/");
    setGaInitialized(true);
  }

  const API_URL = process.env.API_URL;
  const API_HOST = process.env.API_HOST;
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const SOCKET_URL = process.env.SOCKET_URL;

  // TODO: this should probably be decomposed
  // into individual state updates for
  // user, and notifications
  const [state, setState] = useState({
    user: token ? {} : null,
    notifications: [],
    donationGoal: null,
  });

  const [webSocketClient, setWebSocketClient] = useState(null);

  // Possible socket connection states: "disconnected", "connecting", "connected"
  const [socketConnectionState, setSocketConnectionState] = useState("connecting");

  //TODO: reload current path or main page while being logged out
  const signOut = async () => {
    const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT);
    const cookieProps = {
      path: "/",
    };
    if (!develop) cookieProps.domain = "." + API_HOST;
    try {
      await apiRequest({
        method: "post",
        url: "/logout/",
        token: token,
        payload: {},
        locale: locale,
      });
      cookies.remove("token", cookieProps);
      setState({
        ...state,
        user: null,
      });
    } catch (err) {
      console.log(err);
      cookies.remove("token", cookieProps);
      setState({
        ...state,
        user: null,
      });
      return null;
    }
  };

  const refreshNotifications = async () => {
    const notifications = await getNotifications(cookies.get("token"));
    setState({
      ...state,
      notifications: notifications,
    });
  };

  const signIn = async (token, expiry) => {
    const cookieProps = getCookieProps(expiry);

    cookies.set("token", token, cookieProps);
    const user = await getLoggedInUser(cookies.get("token") ? cookies.get("token") : token);
    setState({
      ...state,
      user: user,
    });
  };

  useEffect(async () => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    const [fetchedDonationGoal, fetchedUser, fetchedNotifications] = await Promise.all([
      getDonationGoalData(locale),
      getLoggedInUser(token),
      getNotifications(token),
    ]);

    setState({
      ...state,
      user: fetchedUser,
      notifications: fetchedNotifications,
      donationGoal: fetchedDonationGoal,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (state.user) {
      const notificationsToSetRead = getNotificationsToSetRead(state.notifications, pageProps);
      const client = WebSocketService("/ws/chat/");

      setState({
        ...state,
        user: state.user,
        notifications: state.notifications?.filter((n) => !notificationsToSetRead.includes(n)),
      });

      setWebSocketClient(client);

      if (notificationsToSetRead.length > 0) {
        setNotificationsRead(token, notificationsToSetRead, locale);
      }

      // Try to connect to the WebSocket
      connect(client);
    }
  }, [state.user]);

  const connect = (initialClient) => {
    const client = initialClient ? initialClient : WebSocketService("/ws/chat/");

    client.onopen = () => {
      setSocketConnectionState("connected");
    };

    client.onmessage = async () => {
      await refreshNotifications();
    };

    client.onclose = () => {
      // TODO: when this state is updated, it looks
      // like a mutation is triggered in React, that ultimately
      // unmounts / remounts the FAQ elements, which causes the
      // closing behavior identified in
      // https://github.com/climateconnect/climateconnect/issues/710
      //
      // Revisit this code after the most recent state testing from
      // https://github.com/climateconnect/climateconnect/pull/709
      if (socketConnectionState !== "closed") {
        setSocketConnectionState("closed");
      }

      if (process.env.SOCKET_URL) {
        setTimeout(function () {
          connect(client);
        }, 1000);
      }
    };

    if (!initialClient) {
      // TODO: when this state is updated, it looks
      // like a mutation is triggered in React, that ultimately
      // unmounts / remounts the FAQ elements, which causes the
      // closing behavior identified in
      // https://github.com/climateconnect/climateconnect/issues/710
      //
      // Revisit this code after the most recent state testing from
      // https://github.com/climateconnect/climateconnect/pull/709
      setWebSocketClient(client);
    }
  };

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const contextValues = {
    user: state.user,
    signOut: signOut,
    signIn: signIn,
    chatSocket: webSocketClient,
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
    socketConnectionState: socketConnectionState,
    donationGoal: state.donationGoal,
    acceptedNecessary: acceptedNecessary,
    locale: locale,
    locales: locales,
    isLoading: isLoading,
    startLoading: startLoading,
    stopLoading: stopLoading,
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <UserContext.Provider value={contextValues}>
          <Component {...pageProps} />
        </UserContext.Provider>
      </ThemeProvider>
    </>
  );
}

const getNotificationsToSetRead = (notifications, pageProps) => {
  let notifications_to_set_unread = [];
  if (pageProps.comments) {
    const comment_ids = pageProps.comments.map((p) => p.id);
    const comment_notifications_to_set_unread = notifications.filter((n) => {
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
      ...comment_notifications_to_set_unread,
    ];
  }
  if (pageProps.chatUUID && pageProps.messages) {
    const chat_notifications_to_set_unread = notifications.filter((n) => {
      if (n.chat_uuid) return n.chat_uuid === pageProps.chatUUID;
      if (n.idea_supporter_chat) return n.idea_supporter_chat === pageProps.chatUUID;
    });
    notifications_to_set_unread = [
      ...notifications_to_set_unread,
      ...chat_notifications_to_set_unread,
    ];
  }
  return notifications_to_set_unread;
};

const setNotificationsRead = async (token, notifications, locale) => {
  if (token) {
    try {
      const resp = await apiRequest({
        method: "post",
        url: "/api/set_user_notifications_read/",
        payload: { notifications: notifications.map((n) => n.id) },
        token: token,
        locale: locale,
      });
      return resp.data;
    } catch (e) {
      console.log(e);
    }
  } else return null;
};

async function getLoggedInUser(token) {
  if (token) {
    try {
      const resp = await apiRequest({
        method: "get",
        url: "/api/my_profile/",
        token: token,
      });
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
      const resp = await apiRequest({
        method: "get",
        url: "/api/notifications/",
        token: token,
      });
      return resp.data.results.sort((a, b) => b.id - a.id);
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

async function getDonationGoalData(locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/donation_goal_progress/",
      locale: locale,
    });
    const ret = {
      goal_name: resp?.data?.name,
      goal_start: resp?.data?.start_date,
      goal_end: resp?.data?.end_date,
      goal_amount: resp?.data?.amount,
      current_amount: resp?.data?.current_amount,
    };
    console.log(ret);
    return ret;
  } catch (err) {
    console.log("ERROR");
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}
