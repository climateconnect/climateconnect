import React, { useContext } from "react";
import Layout from "../src/components/layouts/layout";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import SettingsPage from "../src/components/account/SettingsPage";
import Cookies from "next-cookies";
import Axios from "axios";
import tokenConfig from "../public/config/tokenConfig";

export default function Settings({ settings, token }) {
  const { user } = useContext(UserContext);
  const [message, setMessage] = React.useState("");
  const [currentSettings, setCurrentSettings] = React.useState(settings);
  if (user)
    return (
      <Layout title="Settings" message={message} noSpacingBottom>
        <SettingsPage
          settings={currentSettings}
          setSettings={setCurrentSettings}
          token={token}
          setMessage={setMessage}
        />
      </Layout>
    );
  else
    return (
      <Layout title="Please log in" hideHeadline>
        <LoginNudge whatToDo="edit your settings." fullPage />
      </Layout>
    );
}

Settings.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  console.log(token);
  return {
    settings: await getSettings(token),
    token: token
  };
};

const getSettings = async token => {
  try {
    const resp = await Axios.get(
      process.env.API_URL + "/api/account_settings/",
      tokenConfig(token)
    );
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
};
