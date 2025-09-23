import CssBaseline from "@mui/material/CssBaseline";
import { Theme, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
// Add global styles
import "react-multi-carousel/lib/styles.css";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import { getCookieProps } from "../public/lib/cookieOperations";
import WebSocketService from "../public/lib/webSockets";
import UserContext from "../src/components/context/UserContext";
import theme from "../src/themes/theme";
import { CcLocale } from "../src/types";
import * as Sentry from "@sentry/react";
//import "../devlink/global.css";

//only bundle global.css if ENABLE_DEVLINK in .env is true
const isDevlinkEnabled = process.env.ENABLE_DEVLINK === "true";

// initialize sentry

Sentry.init({
  dsn: process.env.FRONTEND_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

// This is lifted from a Material UI template at https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_app.js.

export default function MyApp({ Component, pageProps = {} }) {
  const router = useRouter();
  // Cookies
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
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
    !["develop", "development", "test"].includes(process.env.ENVIRONMENT!)
  ) {
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_CODE!, {
      debug: ["develop", "development", "test"].includes(process.env.ENVIRONMENT!),
      gaOptions: {
        cookieDomain: process.env.BASE_URL_HOST,
        anonymizeIp: true,
      },
    } as any);
    setGaInitialized(true);
  }

  const API_URL = process.env.API_URL;
  const API_HOST = process.env.API_HOST;
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const SOCKET_URL = process.env.SOCKET_URL;
  const CUSTOM_HUB_URLS = process.env.CUSTOM_HUB_URLS ? process.env.CUSTOM_HUB_URLS.split(",") : [];
  const LOCATION_HUBS = process.env.LOCATION_HUBS ? process.env.LOCATION_HUBS.split(",") : [];
  // TODO: this should probably be decomposed
  // into individual state updates for
  // user, and notifications
  const [state, setState] = useState({
    user: token ? {} : (null as any),
    notifications: [] as any[],
    donationGoal: null as any,
  });

  const [webSocketClient, setWebSocketClient] = useState<WebSocket | null | undefined>(null);

  // Possible socket connection states: "disconnected", "connecting", "connected"
  const [socketConnectionState, setSocketConnectionState] = useState("connecting");

  //TODO: reload current path or main page while being logged out
  const signOut = async () => {
    const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT!);
    const cookieProps: any = {
      path: "/",
    };
    if (!develop) cookieProps.domain = "." + API_HOST;
    try {
      await apiRequest({
        method: "post",
        url: "/logout/",
        token: token,
        payload: {},
        locale: locale as CcLocale,
      });
      cookies.remove("auth_token", cookieProps);
      setState({
        ...state,
        user: null,
      });
    } catch (err) {
      console.log(err);
      cookies.remove("auth_token", cookieProps);
      setState({
        ...state,
        user: null,
      });
      return null;
    }
  };

  const hideNotification = (notificationId) => {
    const notifications = state.notifications;
    setState({
      ...state,
      notifications: notifications.filter((n) => n.id !== notificationId),
    });
  };

  const refreshNotifications = async () => {
    const notifications = await getNotifications(cookies.get("auth_token"), locale);
    setState({
      ...state,
      notifications: notifications,
    });
  };

  const signIn = async (token, expiry) => {
    const cookieProps = getCookieProps(expiry);

    cookies.set("auth_token", token, cookieProps);
    const user = await getLoggedInUser(
      cookies.get("auth_token") ? cookies.get("auth_token") : token,
      cookies
    );
    setState({
      ...state,
      user: user,
    });
  };

  useEffect(() => {
    (async () => {
      // Remove the server-side injected CSS.
      const jssStyles: any = document.querySelector("#jss-server-side");
      if (jssStyles) {
        jssStyles.parentElement.removeChild(jssStyles);
      }
      let [fetchedDonationGoal, fetchedUser, fetchedNotifications] = await Promise.all([
        getDonationGoalData(locale),
        getLoggedInUser(token, cookies),
        getNotifications(token, locale),
      ]);
      if (fetchedUser?.error === "invalid token") {
        const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT!);
        const cookieProps: any = {
          path: "/",
        };
        if (!develop) cookieProps.domain = "." + API_HOST;
        cookies.remove("auth_token", cookieProps);
        console.log("Deleted auth_token because it was invalid");
        fetchedUser = null;
      }

      setState({
        ...state,
        user: fetchedUser,
        notifications: fetchedNotifications,
        donationGoal: fetchedDonationGoal,
      });
      setLoading(false);
    })();
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

  useEffect(() => {
      if (isDevlinkEnabled) {
        import('../devlink/global.css');
      }
    }, []);

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
    CUSTOM_HUB_URLS: CUSTOM_HUB_URLS,
    setNotificationsRead: setNotificationsRead,
    pathName: pathName,
    ReactGA: ReactGA,
    updateCookies: updateCookies,
    socketConnectionState: socketConnectionState,
    donationGoal: state.donationGoal,
    acceptedNecessary: acceptedNecessary,
    locale: locale as CcLocale,
    locales: locales as CcLocale[],
    isLoading: isLoading,
    startLoading: startLoading,
    stopLoading: stopLoading,
    hideNotification: hideNotification,
    LOCATION_HUBS: LOCATION_HUBS,
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <UserContext.Provider value={contextValues}>
            <Component {...pageProps} />
          </UserContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

const getNotificationsToSetRead = (notifications, pageProps) => {
  let notifications_to_set_unread: any[] = [];
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

async function getLoggedInUser(token, cookies) {
  if (token) {
    try {
      const resp = await apiRequest({
        method: "get",
        url: "/api/my_profile/",
        token: token,
      });
      return resp.data;
    } catch (err: any) {
      const invalid_token_messages = ["Invalid token.", "Ungültiges Token"];
      console.log(err);
      if (err.response && err.response.data)
        console.log("Error in getLoggedInUser: " + err.response.data.detail);
      if (invalid_token_messages.includes(err?.response?.data?.detail)) {
        return {
          error: "invalid token",
        };
      }
      return null;
    }
  } else {
    return null;
  }
}

// I want to get the translated names for the project/orgs on the notification
// but it isn't quite working properly i.e. changing locale then checking the notification
// the names dont update until you manually refresh the page
async function getNotifications(token, locale) {
  if (token) {
    try {
      const resp = await apiRequest({
        method: "get",
        url: "/api/notifications/",
        locale: locale,
        token: token,
      });
      return resp.data.results.sort((a, b) => b.id - a.id);
    } catch (err: any) {
      if (err.response && err.response.data)
        console.log("Error in getNotifications: " + err.response.data.detail);
      if (err.response && err.response.data.detail === "Invalid token")
        console.log("invalid token! token:" + token);
      return null;
    }
  } else {
    return [];
  }
}

async function getDonationGoalData(locale) {
  if (process.env.DONATION_CAMPAIGN_RUNNING !== "true") {
    return null;
  }
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
      goal_amount: resp?.data?.goal_amount,
      current_amount: resp?.data?.current_amount,
      hub: resp?.data?.hub?.url_slug,
      call_to_action_text: resp?.data?.call_to_action_text,
      call_to_action_link: resp?.data?.call_to_action_link,
    };
    console.log(ret);
    return ret;
  } catch (err: any) {
    console.log("ERROR");
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}
