import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import countries from "./../public/data/countries.json";

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

  const steps = ["basicinfo", "personalinfo"];
  const [curStep, setCurStep] = React.useState(steps[0]);
  const [errorMessages, setErrorMessages] = React.useState(
    steps.reduce((obj, step) => {
      obj[step] = null;
      return obj;
    }, {})
  );
  const handleBasicInfoSubmit = (event, values) => {
    event.preventDefault();
    if (values.password !== values.repeatpassword)
      setErrorMessages({ ...errorMessages, [steps[0]]: "Passwords don't match." });
    //TODO: add check if email is still available
    setUserInfo({
      ...userInfo,
      email: values.email,
      password: values.password,
      repeatpassword: values.password
    });
    setCurStep(steps[1]);
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

  return (
    <>
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
          />
        )
      )}
    </>
  );
}

function BasicInfo({ handleSubmit, errorMessage, values }) {
  const fields = [
    {
      required: true,
      label: "Email",
      type: "email",
      key: "email",
      value: values["email"]
    },
    {
      required: true,
      label: "Password",
      type: "password",
      key: "password",
      value: values["password"]
    },
    {
      required: true,
      label: "Repeat Password",
      type: "password",
      key: "repeatpassword",
      value: values["repeatpassword"]
    }
  ];

  const messages = {
    submitMessage: "Next Step",
    headerMessage: "Step 1: Basic Information",
    bottomMessage: "Already have an account?"
  };

  const bottomLink = {
    text: "Sign in",
    href: "/signin"
  };

  return (
    <Layout title="Sign Up">
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        usePercentage={true}
        percentage={0}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}

export function AddInfo({ handleSubmit, errorMessage, values, handleGoBack }) {
  const fields = [
    {
      required: true,
      label: "First Name",
      type: "text",
      key: "firstname",
      value: values["firstname"]
    },
    {
      required: true,
      label: "Last Name",
      type: "text",
      key: "lastname",
      value: values["lastname"]
    },
    {
      required: true,
      label: "Country",
      select: {
        values: countries.map(country => {
          return { key: country, name: country };
        }),
        defaultValue: values["country"] ? values["country"] : ""
      },
      key: "country"
    },
    {
      required: true,
      label: "City/Place",
      type: "text",
      key: "city",
      value: values["city"]
    }
  ];

  const messages = {
    submitMessage: "Next Step",
    headerMessage: "Step 2: A little bit about yourself"
  };

  //dummy route while we don't have backend
  const formAction = {
    href: "/addinfo",
    method: "GET"
  };

  return (
    <Layout title="Sign Up">
      <Form
        fields={fields}
        messages={messages}
        formAction={formAction}
        usePercentage={true}
        percentage={50}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
        onGoBack={handleGoBack}
      />
    </Layout>
  );
}
