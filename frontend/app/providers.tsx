'use client';

import CssBaseline from "@mui/material/CssBaseline";
import { Theme, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { usePathname, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import { getCookieProps } from "../public/lib/cookieOperations";
import WebSocketService from "../public/lib/webSockets";
import UserContext from "../src/components/context/UserContext";
import theme from "../src/themes/theme";
import { CcLocale } from "../src/types";
import * as Sentry from "@sentry/react";
import { getHubslugFromUrl } from "../public/lib/hubOperations";

// Initialize sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_FRONTEND_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const [gaInitialized, setGaInitialized] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [acceptedStatistics, setAcceptedStatistics] = useState(cookies.get("acceptedStatistics"));
  const [acceptedNecessary, setAcceptedNecessary] = useState(cookies.get("acceptedNecessary"));
  
  const locale = 'en' as CcLocale; // You'll need to implement locale detection for app router
  const locales = ['en', 'de'] as CcLocale[]; // Adjust as needed

  const updateCookies = () => {
    setAcceptedStatistics(cookies.get("acceptedStatistics"));
    setAcceptedNecessary(cookies.get("acceptedNecessary"));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
  const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const CUSTOM_HUB_URLS = process.env.NEXT_PUBLIC_CUSTOM_HUB_URLS ? process.env.NEXT_PUBLIC_CUSTOM_HUB_URLS.split(",") : [];
  const LOCATION_HUBS = process.env.NEXT_PUBLIC_LOCATION_HUBS ? process.env.NEXT_PUBLIC_LOCATION_HUBS.split(",") : [];

  const [state, setState] = useState({
    user: token ? {} : (null as any),
    notifications: [] as any[],
    donationGoal: null as any,
  });

  const [webSocketClient, setWebSocketClient] = useState<WebSocket | null | undefined>(null);
  const [socketConnectionState, setSocketConnectionState] = useState("connecting");

  // ...existing code from _app.tsx (signOut, signIn, refreshNotifications, etc.)...
  // Copy all the functions from the original _app.tsx here

  const contextValues = {
    user: state.user,
    signOut: () => {}, // Implement
    signIn: () => {}, // Implement
    chatSocket: webSocketClient,
    notifications: state.notifications,
    refreshNotifications: () => {}, // Implement
    API_URL: API_URL,
    ENVIRONMENT: ENVIRONMENT,
    SOCKET_URL: SOCKET_URL,
    API_HOST: API_HOST,
    CUSTOM_HUB_URLS: CUSTOM_HUB_URLS,
    setNotificationsRead: () => {}, // Implement
    pathName: pathname,
    hubUrl: getHubslugFromUrl(params),
    ReactGA: ReactGA,
    updateCookies: updateCookies,
    socketConnectionState: socketConnectionState,
    donationGoal: state.donationGoal,
    acceptedNecessary: acceptedNecessary,
    locale: locale,
    locales: locales,
    isLoading: isLoading,
    startLoading: () => setLoading(true),
    stopLoading: () => setLoading(false),
    hideNotification: () => {}, // Implement
    LOCATION_HUBS: LOCATION_HUBS,
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserContext.Provider value={contextValues}>
          {children}
        </UserContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
