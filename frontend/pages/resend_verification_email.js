import { resendEmail } from "../public/lib/apiOperations";
import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "../src/components/general/Form";
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
  submitMessage: "Send verification E-Mail again"
};

export default function ResendVerificationEmail() {
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    resendEmail(values.email, onSuccess, onError);
  };

  const onSuccess = resp => {
    redirect("/", {
      message: resp.data.message
    });
  };

  const onError = error => {
    if (error.response && error.response.data) setErrorMessage(error.response.data.message);
  };

  return (
    <div>
      <Layout title="Resend verification Email">
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
