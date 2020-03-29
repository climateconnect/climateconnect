import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import axios from "axios";
import Cookies from "universal-cookie";
import Router from "next/router";

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

  const cookies = new Cookies();

  const handleSubmit = (event, values) => {
    //don't redirect to the post url
    event.preventDefault();
    axios
      .post(process.env.API_URL + "/login/", {
        username: values.username,
        password: values.password
      })
      .then(function(response) {
        cookies.set("expiry", response.data.expiry, { path: "/" });
        cookies.set("token", response.data.token, { path: "/" });
        Router.push("/");
      })
      .catch(function(error) {
        console.log(error);
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
      />
    </Layout>
  );
}
