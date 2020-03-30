import React from "react";
import BasicInfo from "../src/components/signup/BasicInfo";
import AddInfo from "./../src/components/signup/AddInfo";
import ConfirmEmail from "./../src/components/signup/ConfirmEmail";

export default function Signup() {
  const [userInfo, setUserInfo] = React.useState({
    email: "",
    password: "",
    repeatpassword: "",
    firstname: "",
    lastname: "",
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
      firstname: values.firstname,
      lastname: values.lastname,
      country: values.country,
      city: values.city
    });
    setCurStep(steps[2]);
  };

  const handleGoBackFromAddInfo = (event, values) => {
    setUserInfo({
      ...userInfo,
      firstname: values.firstname,
      lastname: values.lastname,
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
