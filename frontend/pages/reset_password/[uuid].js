import React, { useContext } from "react";
import { apiRequest, getLocalePrefix, redirect } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import Form from "../../src/components/general/Form";
import Layout from "../../src/components/layouts/layout";

export async function getServerSideProps(ctx) {
  const uuid = encodeURI(ctx.query.uuid);
  return {
    props: {
      uuid: uuid,
    },
  };
}

export default function ResetPassword({ uuid }) {
  const [errorMessage, setErrorMessage] = React.useState(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });

  const fields = [
    {
      required: true,
      label: texts.enter_your_new_password,
      key: "password",
      type: "password",
    },
    {
      required: true,
      label: texts.enter_your_new_password_again,
      key: "repeatpassword",
      type: "password",
    },
  ];

  const messages = {
    submitMessage: texts.set_new_password,
  };

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    if (values.password !== values.repeatpassword) setErrorMessage(texts.passwords_dont_match);
    else {
      requestSetPassword(uuid, values.password, setErrorMessage, texts, locale);
    }
  };

  return (
    <Layout title={texts.set_a_new_password}>
      <Form
        fields={fields}
        messages={messages}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}

async function requestSetPassword(uuid, new_password, setErrorMessage, texts, locale) {
  const payload = {
    password_reset_key: uuid,
    new_password: new_password,
  };
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  try {
    const response = await apiRequest({
      method: "post",
      url: "/api/set_new_password/",
      payload: payload,
      headers: headers,
      locale: locale,
    });
    redirect("/browse", {
      message: response.data.message,
    });
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.type)
        setErrorMessage(
          <span>
            {error.response.data.message}{" "}
            <div>
              <a href={getLocalePrefix(locale) + "/resetpassword"}>
                {texts.click_here_to_get_another_password_reset_email}
              </a>
            </div>
          </span>
        );
      else setErrorMessage(error.response.data.message);
    } else {
      setErrorMessage(texts.something_went_wrong);
    }
  }
}
