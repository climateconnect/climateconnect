import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import axios from "axios";
import Router from "next/router";
import { useContext } from "react";
import UserContext from "./../src/components/context/UserContext";

export default function Signin() {
  const fields = [
    {
      required: true,
      label: "Email",
      key: "username",
      type: "email"
    },
    {
      required: true,
      label: "Password",
      key: "password",
      type: "password"
    }
  ];

  const messages = {
    submitMessage: "Sign in",
    bottomMessage: "New to Climate Connect?"
  };

  const bottomLink = {
    text: "Create an account",
    href: "/signup"
  };

  const [errorMessage, setErrorMessage] = React.useState(null);

  const { user, signIn } = useContext(UserContext);
  //TODO: remove router
  if (user) Router.push("/");

  const handleSubmit = (event, values) => {
    //don't redirect to the post url
    event.preventDefault();
    axios
      .post(process.env.API_URL + "/login/", {
        username: values.username,
        password: values.password
      })
      .then(function(response) {
        signIn(response.data.token, response.data.expiry, "/");
      })
      .catch(function(error) {
        console.log(error);
        if (error.response && error.response.data) setErrorMessage(error.response.data.message);
      });
  };

  return (
    <Layout title="Sign In">
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        usePercentage={false}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}
