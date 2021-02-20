import React from "react";
import Form from "./../general/Form";
import { makeStyles } from "@material-ui/core/styles";
import { getLocationFields } from "../../../public/lib/locationOperations";

const useStyles = makeStyles(() => {
  return {
    checkboxLabels: {
      fontSize: 14,
    },
  };
});

export default function AddInfo({
  handleSubmit,
  errorMessage,
  values,
  handleGoBack,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
}) {
  const classes = useStyles();
  const fields = [
    {
      required: true,
      label: "First Name",
      type: "text",
      key: "first_name",
      value: values["first_name"],
    },
    {
      required: true,
      label: "Last Name",
      type: "text",
      key: "last_name",
      value: values["last_name"],
    },
    ...getLocationFields({
      locationInputRef: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
      values: values,
      locationKey: "location"
    }),
    {
      required: false,
      label: (
        <span className={classes.checkboxLabels}>
          I would like to receive emails about updates, news and interesting projects
        </span>
      ),
      type: "checkbox",
      key: "sendNewsletter",
      value: false,
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
      value: false,
    },
  ];

  const messages = {
    submitMessage: "Next Step",
    headerMessage: "Step 2: A little bit about yourself",
  };

  //dummy route while we don't have backend
  const formAction = {
    href: "/addinfo",
    method: "GET",
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
        fieldClassName={classes.fieldClassName}
      />
    </>
  );
}
