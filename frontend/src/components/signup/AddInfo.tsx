import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getLocationFields } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";

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
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const fields = [
    {
      required: true,
      label: texts.first_name,
      type: "text",
      key: "first_name",
      value: values["first_name"],
    },
    {
      required: true,
      label: texts.last_name,
      type: "text",
      key: "last_name",
      value: values["last_name"],
    },
    ...getLocationFields({
      locationInputRef: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
      values: values,
      locationKey: "location",
      texts: texts,
    }),
    {
      required: false,
      label: (
        <span className={classes.checkboxLabels}>
          {texts.i_would_like_to_receive_emails_about_updates_news_and_interesting_projects}
        </span>
      ),
      type: "checkbox",
      key: "sendNewsletter",
      value: false,
    },
    {
      required: true,
      label: (
        <span className={classes.checkboxLabels}>{texts.agree_to_tos_and_privacy_policy}</span>
      ),
      type: "checkbox",
      key: "terms",
      value: false,
    },
  ];

  const messages = {
    submitMessage: texts.next_step,
    headerMessage: texts.signup_step_2_headline,
  };

  const formAction = {
    href: getLocalePrefix(locale) + "/addinfo",
    method: "get",
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
        /*TODO(undefined) fieldClassName={classes.fieldClassName} */
        autocomplete="off"
      />
    </>
  );
}
