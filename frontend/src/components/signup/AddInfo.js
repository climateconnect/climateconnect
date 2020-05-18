import React from "react";
import Layout from "./../layouts/layout";
import Form from "./../general/Form";
import countries from "./../../../public/data/countries.json";

export default function AddInfo({ handleSubmit, errorMessage, values, handleGoBack }) {
  const fields = [
    {
      required: true,
      label: "First Name",
      type: "text",
      key: "first_name",
      value: values["first_name"]
    },
    {
      required: true,
      label: "Last Name",
      type: "text",
      key: "last_name",
      value: values["last_name"]
    },
    {
      required: true,
      label: "Country",
      select: {
        values: countries.map(country => {
          return { key: country, name: country };
        }),
        defaultValue: values["country"] ? values["country"] : ""
      },
      key: "country"
    },
    {
      required: true,
      label: "City/Place",
      type: "text",
      key: "city",
      value: values["city"]
    }
  ];

  const messages = {
    submitMessage: "Next Step",
    headerMessage: "Step 2: A little bit about yourself"
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
        formAction={formAction}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
        onGoBack={handleGoBack}
      />
    </Layout>
  );
}
