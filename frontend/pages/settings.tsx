import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import SettingsPage from "../src/components/account/SettingsPage";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import Layout from "../src/components/layouts/layout";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const { hub } = ctx.query;
  return {
    props: {
      hubUrl: hub || null,
      settings: await getSettings(auth_token, ctx.locale),
    },
  };
}

export default function Settings({ settings, hubUrl }) {
  const token = new Cookies().get("auth_token");
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
        <LoginNudge whatToDo={texts.to_edit_your_settings} fullPage hubUrl={hubUrl} />
      </Layout>
    );
}

const getSettings = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/account_settings/",
      token: token,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
};
