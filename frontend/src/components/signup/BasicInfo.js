import React from "react";
import Layout from "./../layouts/layout";
import Form from "./../general/Form";

export default function BasicInfo({ handleSubmit, errorMessage, values }) {
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
    text: "Log in",
    href: "/signin"
  };

  return (
    <Layout title="Sign Up">
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}
