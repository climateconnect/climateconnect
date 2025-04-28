import { createContext } from "react";
import { CcLocale, User } from "../../types";

const UserContext = createContext<{
  user: User | null;
  signOut?: any;
  notifications?: any;
  locale: CcLocale;
  locales: CcLocale[];
  pathName: string;
  acceptedNecessary?: boolean;
  socketConnectionState?: any;
  donationGoal?: any;
  chatSocket?: any;
  signIn?: any;
  refreshNotifications?: any;
  API_URL?: any;
  ENVIRONMENT?: any;
  SOCKET_URL?: any;
  API_HOST?: any;
  CUSTOM_HUB_URLS?: any;
  setNotificationsRead?: any;
  ReactGA?: any;
  updateCookies?: any;
  isLoading?: any;
  startLoading?: any;
  stopLoading?: any;
  hideNotification?: any;
  LOCATION_HUBS?: any;
}>(null!);

export default UserContext;
