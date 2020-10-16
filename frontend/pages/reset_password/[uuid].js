import React from "react";
import Layout from "../../src/components/layouts/layout";
import Form from "../../src/components/general/Form";
import axios from "axios";
import { redirect } from "../../public/lib/apiOperations";

ResetPassword.getInitialProps = async ctx => {
  const uuid = encodeURI(ctx.query.uuid);
  return {
    uuid: uuid
  };
};

const fields = [
  {
    required: true,
    label: "Enter your new password",
    key: "password",
    type: "password"
  },
  {
    required: true,
    label: "Enter your new password again",
    key: "repeatpassword",
    type: "password"
  }
];

const messages = {
  submitMessage: "Set new password"
};

export default function ResetPassword({ uuid }) {
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    if (values.password !== values.repeatpassword) setErrorMessage("Passwords don't match.");
    else {
      requestSetPassword(uuid, values.password, setErrorMessage);
    }
  };

  return (
    <Layout title="Set a new password">
      <Form
        fields={fields}
        messages={messages}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}

async function requestSetPassword(uuid, new_password, setErrorMessage) {
  const payload = {
    password_reset_key: uuid,
    new_password: new_password
  };
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };
  try {
    const response = await axios.post(
      process.env.API_URL + "/api/set_new_password/",
      payload,
      config
    );
    redirect("/", {
      message: response.data.message
    });
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.type)
        setErrorMessage(
          <span>
            {error.response.data.message}{" "}
            <div>
              <a href="/resetpassword">Click here to get another password reset email</a>
            </div>
          </span>
        );
      else setErrorMessage(error.response.data.message);
    } else {
      setErrorMessage("Something went wrong. Please contact our support team.");
    }
  }
}
