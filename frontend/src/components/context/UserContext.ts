import { LocalSee } from "@material-ui/icons";
import { createContext } from "react";
import { User } from "../../types";

const UserContext = createContext<{
  user: User | null;
  signOut?: any;
  notifications?: any;
  locale?: any;
  pathName?: string;
  socketConnectionState?: any
  chatSocket?: any
}>({ user: null });

export default UserContext;
