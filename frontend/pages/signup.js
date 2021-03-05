import axios from "axios";
import Router from "next/router";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { getParams } from "../public/lib/generalOperations";
import {
  getLocationValue, indicateWrongLocation, isLocationValid, parseLocation
} from "../public/lib/locationOperations";
import { getLastCompletedTutorialStep, getLastStepBeforeSkip } from "../public/lib/tutorialOperations";
import UserContext from "../src/components/context/UserContext";
import Layout from "../src/components/layouts/layout";
import BasicInfo from "../src/components/signup/BasicInfo";
import AddInfo from "./../src/components/signup/AddInfo";

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
  });
  const cookies = new Cookies();

  //Information about the completion state of the tutorial
  const tutorialCookie = cookies.get("finishedTutorialSteps")
  const isClimateActorCookie = cookies.get("tutorialVariables")
  const curTutorialStep = getLastCompletedTutorialStep(tutorialCookie)
  const lastCompletedTutorialStep = curTutorialStep === -1 ? 
    getLastStepBeforeSkip(cookies.get("lastStepBeforeSkipTutorial")) : 
    curTutorialStep
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
      setErrorMessages({ ...errorMessages, [steps[0]]: "Passwords don't match." });
    else setCurStep(steps[1]);
  };

  const handleAddInfoSubmit = (event, values) => {
    event.preventDefault();
    const params = getParams(window?.location?.href)
    if (!isLocationValid(values.location)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setErrorMessage);
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
    const payload = {
      email: userInfo.email.trim().toLowerCase(),
      password: userInfo.password,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      location: parseLocation(location),
      send_newsletter: values.sendNewsletter,
      from_tutorial: params?.from_tutorial === "true",
      is_activist: isClimateActorCookie?.isActivist,
      last_completed_tutorial_step: lastCompletedTutorialStep
    };
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    setIsLoading(true);
    axios
      .post(process.env.API_URL + "/signup/", payload, config)
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
    <Layout
      title="Sign Up"
      isLoading={isLoading}
      message={errorMessage}
      messageType={errorMessage && "error"}
    >
      {curStep === "basicinfo" ? (
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
      )}
    </Layout>
  );
}
