import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import axios from "axios";
import { useContext } from "react";
import UserContext from "./../src/components/context/UserContext";
import { redirectOnLogin } from "../public/lib/profileOperations";

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
    submitMessage: "Log in",
    bottomMessage: (
      <span>
        New to Climate Connect? <a href="/signup">Click here to create an account</a>
      </span>
    )
  };

  const bottomLink = {
    text: "Forgot your password?",
    href: "/resetpassword"
  };

  const [errorMessage, setErrorMessage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { user, signIn } = useContext(UserContext);
  //TODO: remove router
  if (user) {
    redirectOnLogin(user);
  }

  const handleSubmit = async (event, values) => {
    //don't redirect to the post url
    event.preventDefault();
    setIsLoading(true);
    axios
      .post(process.env.API_URL + "/login/", {
        username: values.username.toLowerCase(),
        password: values.password
      })
      .then(async function(response) {
        await signIn(response.data.token, response.data.expiry, "/");
      })
      .catch(function(error) {
        console.log(error);
        if (error.response && error.response.data) {
          if (error.response.data.type === "not_verified")
            setErrorMessage(
              <span>
                You {"haven't"} activated you account yet. Click the link in the email we sent you
                or{" "}
                <a href="resend_verification_email" target="_blank">
                  click here
                </a>{" "}
                to send the verification link again.
              </span>
            );
          else setErrorMessage(error.response.data.message);
          setIsLoading(false);
        }
      });
  };

  return (
    <Layout title="Log In" isLoading={isLoading}>
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
