import Router from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../public/lib/apiOperations";
import { getParams } from "../public/lib/generalOperations";
import {
  getLocationValue,
  indicateWrongLocation,
  isLocationValid,
  parseLocation,
} from "../public/lib/locationOperations";
import { redirectOnLogin } from "../public/lib/profileOperations";
import {
  getLastCompletedTutorialStep,
  getLastStepBeforeSkip,
} from "../public/lib/tutorialOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import BasicInfo from "../src/components/signup/BasicInfo";
import AddInfo from "./../src/components/signup/AddInfo";
import ContentImageSplitView from "../src/components/layouts/ContentImageSplitLayout";
import Image from "next/image";
import { ThemeProvider } from "@emotion/react";
import { themeSignUp } from "../src/themes/signupTheme";
import WideLayout from "../src/components/layouts/WideLayout";
import { Container, Theme, useMediaQuery } from "@mui/material";

export default function Signup() {
  const { ReactGA } = useContext(UserContext);

  const [userInfo, setUserInfo] = React.useState({
    email: "",
    password: "",
    repeatpassword: "",
    first_name: "",
    last_name: "",
    location: {},
    newsletter: "",
    sendNewsletter: undefined,
  });
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));

  const cookies = new Cookies();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  //Information about the completion state of the tutorial
  const tutorialCookie = cookies.get("finishedTutorialSteps");
  const isClimateActorCookie = cookies.get("tutorialVariables");
  const curTutorialStep = getLastCompletedTutorialStep(tutorialCookie);
  const lastCompletedTutorialStep =
    curTutorialStep === -1
      ? getLastStepBeforeSkip(cookies.get("lastStepBeforeSkipTutorial"))
      : curTutorialStep;
  const steps = ["basicinfo", "personalinfo"];
  const [curStep, setCurStep] = useState(steps[0]);
  const [errorMessage, setErrorMessage] = useState("");
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };
  const [errorMessages, setErrorMessages] = useState(
    steps.reduce((obj, step) => {
      obj[step] = null;
      return obj;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(function () {
    if (user) {
      redirectOnLogin(user, "/", locale);
    }
  });

  const handleBasicInfoSubmit = (event, values) => {
    event.preventDefault();
    setUserInfo({
      ...userInfo,
      email: values.email,
      password: values.password,
      repeatpassword: values.password,
    });
    //TODO: add check if email is still available
    if (values.password !== values.repeatpassword)
      setErrorMessages({ ...errorMessages, [steps[0]]: texts.passwords_dont_match });
    else setCurStep(steps[1]);
  };

  const handleAddInfoSubmit = (event, values) => {
    event.preventDefault();
    const params = getParams(window?.location?.href);
    if (!isLocationValid(values.location)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setErrorMessage, texts);
      return;
    }
    const location = getLocationValue(values, "location");
    setUserInfo({
      ...userInfo,
      first_name: values.first_name,
      last_name: values.last_name,
      location: location,
      sendNewsletter: values.sendNewsletter,
    });

    const searchParams = new URLSearchParams(window.location.search);
    const hub = searchParams.get("hub") ?? "";

    const payload = {
      email: userInfo.email.trim().toLowerCase(),
      password: userInfo.password,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      location: parseLocation(location),
      send_newsletter: values.sendNewsletter,
      from_tutorial: params?.from_tutorial === "true",
      is_activist: isClimateActorCookie?.isActivist,
      last_completed_tutorial_step: lastCompletedTutorialStep,
      source_language: locale,
      hub: hub,
    };

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    setIsLoading(true);
    apiRequest({
      method: "post",
      url: "/signup/",
      payload: payload,
      headers: headers,
      locale: locale,
    })
      .then(function () {
        ReactGA.event({
          category: "User",
          action: "Created an Account",
        });
        Router.push({
          pathname: "/accountcreated/",
        });
      })
      .catch(function (error) {
        console.log(error);
        setIsLoading(false);
        if (error.response.data.message)
          setErrorMessages({ ...errorMessages, [steps[1]]: error.response.data.message });
        else if (error.response.data.length > 0)
          setErrorMessages({ ...errorMessages, [steps[1]]: error.response.data[0] });
      });
  };

  const handleGoBackFromAddInfo = (event, values) => {
    setUserInfo({
      ...userInfo,
      first_name: values.first_name,
      last_name: values.last_name,
      location: getLocationValue(values, "location"),
    });
    setCurStep(steps[0]);
  };

  return (
    <WideLayout
      title={texts.sign_up}
      message={errorMessage}
      messageType={errorMessage && "error"}
      isLoading={isLoading}
    >
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={themeSignUp}>
          <ContentImageSplitView
            minHeight="75vh"
            content={
              curStep === "basicinfo" ? (
                <BasicInfo
                  values={userInfo}
                  handleSubmit={handleBasicInfoSubmit}
                  errorMessage={errorMessages[steps[0]]}
                />
              ) : (
                curStep === "personalinfo" && (
                  <AddInfo
                    values={userInfo}
                    handleSubmit={handleAddInfoSubmit}
                    errorMessage={errorMessages[steps[1]]}
                    handleGoBack={handleGoBackFromAddInfo}
                    locationInputRef={locationInputRef}
                    locationOptionsOpen={locationOptionsOpen}
                    handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
                  />
                )
              )
            }
            leftGridSizes={{ md: 7 }}
            rightGridSizes={{ md: 5 }}
            image={
              <Image
                src="/images/sign_up/mobile-login-pana.svg"
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
