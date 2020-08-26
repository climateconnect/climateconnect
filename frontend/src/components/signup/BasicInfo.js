import React from "react";
import Form from "./../general/Form";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  appealText: {
    textAlign: "center",
    fontWeight: "bold"
  }
});

export default function BasicInfo({ handleSubmit, errorMessage, values }) {
  const classes = useStyles();
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
    <>
      <Typography color="secondary" className={classes.appealText}>
        Here you can create your personal account.
      </Typography>
      <Typography color="secondary" className={classes.appealText}>
        You will have an opportunity to create/add an organization once signed up.
      </Typography>
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
      />
    </>
  );
}
