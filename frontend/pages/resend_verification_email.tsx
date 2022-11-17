import React, { useContext } from "react";
import { redirect, resendEmail } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Form from "../src/components/general/Form";
import Layout from "../src/components/layouts/layout";

const fields = [
  {
    required: true,
    label: "Enter your login email",
    key: "email",
    type: "email",
  },
];

export default function ResendVerificationEmail() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  const messages = {
    submitMessage: texts.send_verification_email_again,
  };

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    resendEmail(values.email, onSuccess, onError);
  };

  const onSuccess = (resp) => {
    redirect("/browse", {
      message: resp.data.message,
    });
  };

  const onError = (error) => {
    if (error.response && error.response.data) setErrorMessage(error.response.data.message);
  };

  return (
    <div>
      <Layout title={texts.resend_verification_email}>
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
