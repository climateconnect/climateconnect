import { createContext } from "react";
import { CcLocale, DonationGoal, User } from "../../types";

const UserContext = createContext<{
  user: User | null;
  signOut?: any;
  notifications?: any;
  locale: CcLocale;
  locales: CcLocale[];
  pathName: string;
  acceptedNecessary?: boolean;
  socketConnectionState?: any;
  donationGoals: DonationGoal[];
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
  hubUrl: string;
}>(null!);

export default UserContext;
