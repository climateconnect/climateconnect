import { Card, Container, Theme, ThemeProvider, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../public/lib/apiOperations";
import Image from "next/image";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import { themeSignUp } from "../src/themes/signupTheme";
import ContentImageSplitView from "../src/components/layouts/ContentImageSplitLayout";
import WideLayout from "../src/components/layouts/WideLayout";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import AccountCreatedContent from "../src/components/signup/AccountCreatedContent";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      boxShadow: "none",
      borderRadius: 0,
      textAlign: "center",
    },
  },
  centerText: {
    textAlign: "center",
  },
  centerContent: {
    display: "flex",
    justifyContent: "center",
  },
  marginBottom: {
    marginBottom: theme.spacing(5),
  },
  image: {
    color: theme.palette.primary.main,
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

export default function AccountCreated({ hubUrl, hubThemeData }) {
  const classes = useStyles();
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
          <ContentImageSplitView
            minHeight="75vh"
            direction="row-reverse"
            content={
              <Card className={classes.root}>
                <AccountCreatedContent isSmallScreen={isSmallScreen} texts={texts} />
              </Card>
            }
            image={
              <Image
                src="/images/sign_up/success-factors-pana.svg"
                className={classes.image}
                alt="Sign Up"
                layout="fill" // Image will cover the container
                objectFit="contain" // Ensures it fills without stretching
              />
            }
          ></ContentImageSplitView>
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
