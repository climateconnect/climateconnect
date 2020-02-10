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
    },
    {
      required: true,
      label: "Repeat Password",
      type: "password"
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
        bottomLink={bottomLink}
        formAction={formAction}
        usePercentage={true}
        percentage={0}
      />
    </Layout>
  );
}
