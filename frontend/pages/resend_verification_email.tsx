import React, { useContext } from "react";
import { redirect, resendEmail } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Form from "../src/components/general/Form";
import WideLayout from "../src/components/layouts/WideLayout";
import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import theme from "../src/themes/theme";

const useStyles = makeStyles((theme) => ({
  headline: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.primary,
  },
}));

export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hub;

  const hubThemeData = await getHubTheme(hubUrl);

  return {
    props: {
      hubUrl: hubUrl || null, // undefined is not allowed in JSON, so we use null
      hubThemeData: hubThemeData || null, // undefined is not allowed in JSON, so we use null
    },
  };
}

export default function ResendVerificationEmail({ hubUrl, hubThemeData }) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "settings", locale: locale });
  const fields = [
    {
      required: true,
      label: texts.enter_your_login_email,
      key: "email",
      type: "email",
    },
  ];
  const messages = {
    submitMessage: texts.send_verification_email_again,
  };

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    resendEmail(values.email, onSuccess, onError);
  };

  const onSuccess = (resp) => {
    if (hubUrl) {
      redirect(`/hubs/${hubUrl}/browse`, {
        message: resp.data.message,
      });
    } else {
      redirect("/browse", {
        message: resp.data.message,
      });
    }
  };

  const onError = (error) => {
    if (error.response && error.response.data) setErrorMessage(error.response.data.message);
  };

  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;

  return (
    <WideLayout
      title={texts.resend_verification_email}
      isHubPage={hubUrl !== ""}
      customTheme={customTheme}
      hubUrl={hubUrl}
      headerBackground={ customTheme
          ? customTheme.palette.secondary.light
          : theme.palette.background.default}
    >
      <Container>
        <Typography className={classes.headline} variant="h3">
          {texts.resend_verification_email}
        </Typography>
        <Form
          fields={fields}
          messages={messages}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </Container>
    </WideLayout>
  );
}
