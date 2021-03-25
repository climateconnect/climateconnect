import axios from "axios";
import React, { useContext } from "react";
import tokenConfig from "../public/config/tokenConfig";
import { redirect } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Form from "../src/components/general/Form";
import Layout from "../src/components/layouts/layout";

export default function ResetPassword() {
  const [errorMessage, setErrorMessage] = React.useState(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });

  const messages = {
    submitMessage: texts.send_password_reset_email,
  };

  const fields = [
    {
      required: true,
      label: texts.enter_your_login_email,
      key: "email",
      type: "email",
    },
  ];

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    if (values.email) {
      try {
        const response = await axios.post(
          process.env.API_URL + "/api/send_reset_password_email/",
          { email: values.email },
          tokenConfig
        );
        redirect("/browse", {
          message: response.data.message,
        });
      } catch (error) {
        console.log(error);
        if (error.response && error.response && error.response.data)
          setErrorMessage(error.response.data.message);
      }
    } else setErrorMessage(texts.you_didnt_enter_an_email);
  };

  return (
    <div>
      <Layout title={texts.reset_password}>
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
