import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";

export default function Signup() {
  const fields = [
    {
      required: true,
      label: "Email",
      type: "email"
    },
    {
      required: true,
      label: "Password",
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

  //dummy route while we don't have backend
  const formAction = {
    href: "/create",
    method: "GET"
  };

  return (
    <Layout title="Sign In">
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        formAction={formAction}
        usePercentage={false}
      />
    </Layout>
  );
}
