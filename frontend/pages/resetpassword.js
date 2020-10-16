import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "../src/components/general/Form";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
import { redirect } from "../public/lib/apiOperations";

const fields = [
  {
    required: true,
    label: "Enter your login email",
    key: "email",
    type: "email"
  }
];

const messages = {
  submitMessage: "Send password reset email"
};

export default function ResetPassword() {
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    if (values.email) {
      try {
        const response = await axios.post(
          process.env.API_URL + "/api/send_reset_password_email/",
          { email: values.email },
          tokenConfig
        );
        console.log(response);
        redirect("/", {
          message: response.data.message
        });
      } catch (error) {
        console.log(error);
        if (error.response && error.response && error.response.data)
          setErrorMessage(error.response.data.message);
      }
    } else setErrorMessage("You didn't enter an email.");
  };

  return (
    <div>
      <Layout title="Reset Password">
        <Form
          fields={fields}
          messages={messages}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </Layout>
    </div>
  );
}
