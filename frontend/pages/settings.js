import Axios from "axios";
import Cookies from "next-cookies";
import React, { useContext } from "react";
import tokenConfig from "../public/config/tokenConfig";
import getTexts from "../public/texts/texts";
import SettingsPage from "../src/components/account/SettingsPage";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import Layout from "../src/components/layouts/layout";

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  return {
    props: {
      settings: await getSettings(token),
      token: token,
    },
  };
}

export default function Settings({ settings, token }) {
  const { user } = useContext(UserContext);
  const [message, setMessage] = React.useState("");
  const [currentSettings, setCurrentSettings] = React.useState(settings);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  if (user)
    return (
      <Layout title={texts.settings} message={message} noSpacingBottom>
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
      <Layout title={texts.please_log_in} hideHeadline>
        <LoginNudge whatToDo={texts.to_edit_your_settings} fullPage />
      </Layout>
    );
}

const getSettings = async (token) => {
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
