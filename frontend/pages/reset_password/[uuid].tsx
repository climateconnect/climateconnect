import React, { useContext } from "react";
import { apiRequest, getLocalePrefix, redirect } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import Form from "../../src/components/general/Form";
import makeStyles from "@mui/styles/makeStyles";
import getHubTheme from "../../src/themes/fetchHubTheme";
import WideLayout from "../../src/components/layouts/WideLayout";
import { Link, Typography } from "@mui/material";
import { transformThemeData } from "../../src/themes/transformThemeData";

const useStyles = makeStyles((theme) => ({
  headline: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.primary,
  },
}));

export async function getServerSideProps(ctx) {
  const uuid = encodeURI(ctx.query.uuid);
  const hubUrl = ctx.query.hub;
  const hubThemeData = await getHubTheme(hubUrl);

  return {
    props: {
      uuid: uuid,
      hubUrl: hubUrl || null, // undefined is not allowed in JSON, so we use null
      hubThemeData: hubThemeData || null, // undefined is not allowed in JSON, so we use null
    },
  };
}

export default function ResetPassword({ uuid, hubUrl, hubThemeData }) {
  const [errorMessage, setErrorMessage] = React.useState(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  const classes = useStyles();

  const fields = [
    {
      required: true,
      label: texts.enter_your_new_password,
      key: "password",
      type: "password",
    },
    {
      required: true,
      label: texts.enter_your_new_password_again,
      key: "repeatpassword",
      type: "password",
    },
  ];

  const messages = {
    submitMessage: texts.set_new_password,
  };

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    if (values.password !== values.repeatpassword) setErrorMessage(texts.passwords_dont_match);
    else {
      requestSetPassword(uuid, values.password, setErrorMessage, texts, locale, hubUrl);
    }
  };

  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;

  return (
    <WideLayout
      title={texts.set_a_new_password}
      isHubPage={hubUrl !== ""}
      customTheme={customTheme}
      hubUrl={hubUrl}
      headerBackground={hubUrl === "prio1" ? "#7883ff" : "#FFF"}
    >
      <Typography className={classes.headline} variant="h3">
        {texts.set_a_new_password}
      </Typography>
      <Form
        fields={fields}
        messages={messages}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </WideLayout>
  );
}

async function requestSetPassword(uuid, new_password, setErrorMessage, texts, locale, hubUrl) {
  const payload = {
    password_reset_key: uuid,
    new_password: new_password,
  };
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  try {
    const response = await apiRequest({
      method: "post",
      url: "/api/set_new_password/",
      payload: payload,
      headers: headers,
      locale: locale,
    });
    if (hubUrl) {
      redirect(`/hubs/${hubUrl}/browse`, {
        message: response.data.message,
      });
    } else {
      redirect("/browse", {
        message: response.data.message,
      });
    }
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.type)
        setErrorMessage(
          <span>
            {error.response.data.message}{" "}
            <div>
              <Link
                href={`${getLocalePrefix(locale)}/resetpassword${hubUrl ? `?hub=${hubUrl}` : ""}`}
              >
                {texts.click_here_to_get_another_password_reset_email}
              </Link>
            </div>
          </span>
        );
      else setErrorMessage(error.response.data.message);
    } else {
      setErrorMessage(texts.something_went_wrong);
    }
  }
}
