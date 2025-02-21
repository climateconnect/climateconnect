import { Container, Theme, ThemeProvider, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import { themeSignUp } from "../src/themes/signupTheme";
import WideLayout from "../src/components/layouts/WideLayout";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import AccountCreatedContent from "../src/components/signup/AccountCreatedContent";
import { extractHubFromRedirectUrl } from "../public/lib/hubOperations";

export async function getServerSideProps(ctx) {
  const { redirect } = ctx.query;
  const hubUrl = extractHubFromRedirectUrl(redirect);
  const hubThemeData = hubUrl ? await getHubTheme(hubUrl) : null; // undefined is not allowed in JSON, so we use null

  return {
    props: {
      hubUrl: hubUrl,
      hubThemeData: hubThemeData,
    },
  };
}

export default function AccountCreated({ hubUrl, hubThemeData }) {
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

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
      headerBackground={hubUrl === "prio1" ? "#7883ff" : "#FFF"}
      footerTextColor={hubUrl && "white"}
    >
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={customThemeSignUp}>
          <AccountCreatedContent isSmallScreen={isSmallScreen} texts={texts} />
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
