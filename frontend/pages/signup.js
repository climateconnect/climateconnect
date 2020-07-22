import React from "react";
import BasicInfo from "../src/components/signup/BasicInfo";
import AddInfo from "./../src/components/signup/AddInfo";
import ConfirmEmail from "./../src/components/signup/ConfirmEmail";
import axios from "axios";
import Router from "next/router";

export default function Signup() {
  const [userInfo, setUserInfo] = React.useState({
    email: "",
    password: "",
    repeatpassword: "",
    first_name: "",
    last_name: "",
    country: "",
    city: ""
  });

  const steps = ["basicinfo", "personalinfo", "confirmemail"];
  const [curStep, setCurStep] = React.useState(steps[0]);
  const [errorMessages, setErrorMessages] = React.useState(
    steps.reduce((obj, step) => {
      obj[step] = null;
      return obj;
    }, {})
  );

  const handleBasicInfoSubmit = (event, values) => {
    event.preventDefault();
    setUserInfo({
      ...userInfo,
      email: values.email,
      password: values.password,
      repeatpassword: values.password
    });
    //TODO: add check if email is still available
    if (values.password !== values.repeatpassword)
      setErrorMessages({ ...errorMessages, [steps[0]]: "Passwords don't match." });
    else setCurStep(steps[1]);
  };

  const handleAddInfoSubmit = (event, values) => {
    event.preventDefault();
    setUserInfo({
      ...userInfo,
      first_name: values.first_name,
      last_name: values.last_name,
      country: values.country,
      city: values.city,
      email_project_suggestions: values.emails,
      email_updates_on_projects: values.emails
    });
    const payload = {
      email: userInfo.email.trim(),
      password: userInfo.password,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      country: values.country.trim(),
      city: values.city.trim(),
      email_project_suggestions: values.emails,
      email_updates_on_projects: values.emails
    };
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };
    axios
      .post(process.env.API_URL + "/signup/", payload, config)
      .then(function(resp) {
        console.log(resp);
        Router.push({
          pathname: "/accountcreated/"
        });
        //TODO: readd this after automatic E-Mail sending is finished
        //setCurStep(steps[2]);
      })
      .catch(function(error) {
        console.log(error);
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
      country: values.country,
      city: values.city
    });
    setCurStep(steps[0]);
  };

  if (curStep === "basicinfo")
    return (
      <BasicInfo
        values={userInfo}
        handleSubmit={handleBasicInfoSubmit}
        errorMessage={errorMessages[steps[0]]}
      />
    );
  else if (curStep === "personalinfo")
    return (
      <AddInfo
        values={userInfo}
        handleSubmit={handleAddInfoSubmit}
        errorMessage={errorMessages[steps[1]]}
        handleGoBack={handleGoBackFromAddInfo}
      />
    );
  else if (curStep === "confirmemail") return <ConfirmEmail values={userInfo} />;
}
