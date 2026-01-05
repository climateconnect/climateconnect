import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import SettingsPage from "../src/components/account/SettingsPage";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import Layout from "../src/components/layouts/layout";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import theme from "../src/themes/theme";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const [settings, hubThemeData] = await Promise.all([
    getSettings(auth_token, ctx.locale),
    getHubTheme(ctx.query.hub),
  ]);

  return {
    props: {
      settings: settings,
      hubThemeData: hubThemeData || null,
      hubUrl: ctx.query.hub || null,
    },
  };
}

export default function Settings({ settings, hubThemeData, hubUrl }) {
  const token = new Cookies().get("auth_token");
  const { user } = useContext(UserContext);
  const [message, setMessage] = React.useState("");
  const [currentSettings, setCurrentSettings] = React.useState(settings);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  const layoutProps = {
    hubUrl: hubUrl,
    customTheme: customTheme,
    headerBackground: customTheme
      ? customTheme.palette.header.background
      : theme.palette.background.default,
  };
  if (user)
    return (
      <Layout title={texts.settings} message={message} {...layoutProps} noSpacingBottom>
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
