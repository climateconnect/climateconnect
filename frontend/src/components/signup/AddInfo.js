import React from "react";
import Form from "./../general/Form";
import countries from "./../../../public/data/countries.json";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => {
  return {
    checkboxLabels: {
      fontSize: 14
    }
  };
});

export default function AddInfo({ handleSubmit, errorMessage, values, handleGoBack }) {
  const classes = useStyles();
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
        defaultValue: values["country"] ? values["country"] : "",
        addEmptyValue: true
      },
      key: "country"
    },
    {
      required: true,
      label: "City/Place",
      type: "text",
      key: "city",
      value: values["city"]
    },
    {
      required: false,
      label: (
        <span className={classes.checkboxLabels}>
          I would like to receive E-mail updates on the projects I follow, new features and
          suggestions
        </span>
      ),
      type: "checkbox",
      key: "emails",
      value: false
    },
    {
      required: true,
      label: (
        <span className={classes.checkboxLabels}>
          I agree to the{" "}
          <a href="terms" target="_blank">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="privacy" target="_blank">
            Privacy policy
          </a>
          .
        </span>
      ),
      type: "checkbox",
      key: "terms",
      value: false
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
    <>
      <Form
        fields={fields}
        messages={messages}
        formAction={formAction}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
        onGoBack={handleGoBack}
      />
    </>
  );
}
