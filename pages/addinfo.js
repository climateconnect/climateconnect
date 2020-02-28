import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import countries from "./../public/data/countries.json";

export default function Signup() {
  const fields = [
    {
      required: true,
      label: "First Name",
      type: "text"
    },
    {
      required: true,
      label: "Last Name",
      type: "text"
    },
    {
      required: true,
      label: "Country",
      select: {
        values: countries,
        defaultValue: ""
      }
    },
    {
      required: true,
      label: "City/Place",
      type: "text"
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
        usePercentage={true}
        percentage={20}
      />
    </Layout>
  );
}
