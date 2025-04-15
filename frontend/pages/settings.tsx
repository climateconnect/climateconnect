import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import SettingsPage from "../src/components/account/SettingsPage";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const { hub } = ctx.query;

  const hubThemeData = await getHubTheme(hub);

  return {
    props: {
      hubUrl: hub || null,
      hubThemeData: hubThemeData || null,
      settings: await getSettings(auth_token, ctx.locale),
    },
  };
}

export default function Settings({ settings, hubUrl, hubThemeData }) {
  const token = new Cookies().get("auth_token");
  const { user } = useContext(UserContext);
  const [message, setMessage] = React.useState("");
  const [currentSettings, setCurrentSettings] = React.useState(settings);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  if (user)
    return (
      <WideLayout
        title={texts.settings}
        message={message}
        hubUrl={hubUrl}
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
      >
        <SettingsPage
          settings={currentSettings}
          setSettings={setCurrentSettings}
          token={token}
          setMessage={setMessage}
        />
      </WideLayout>
    );
  else
    return (
      <WideLayout
        title={texts.please_log_in}
        message={message}
        hubUrl={hubUrl}
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
      >
        <LoginNudge whatToDo={texts.to_edit_your_settings} fullPage />
      </WideLayout>
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
