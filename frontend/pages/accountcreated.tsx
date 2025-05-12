import { Container, Theme, ThemeProvider, useMediaQuery } from "@mui/material";
import React, { useContext } from "react";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import { themeSignUp } from "../src/themes/signupTheme";
import WideLayout from "../src/components/layouts/WideLayout";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import AccountCreatedContent from "../src/components/signup/AccountCreatedContent";
import theme from "../src/themes/theme";

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

export default function AccountCreated({ hubUrl, hubThemeData }) {
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  const customThemeSignUp = hubThemeData
    ? transformThemeData(hubThemeData, themeSignUp)
    : themeSignUp;

  return (
    <WideLayout
      title={texts.account_created}
      isHubPage={hubUrl !== ""}
      customTheme={customTheme}
      hubUrl={hubUrl}
      headerBackground={
        customTheme ? customTheme.palette.secondary.light : theme.palette.background.default
      }
      footerTextColor={hubUrl && "white"}
    >
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={customThemeSignUp}>
          <AccountCreatedContent isSmallScreen={isSmallScreen} hubUrl={hubUrl} />
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
