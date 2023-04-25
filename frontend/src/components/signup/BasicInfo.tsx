import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";

const useStyles = makeStyles({
  appealText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default function BasicInfo({ handleSubmit, errorMessage, values }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const fields = [
    {
      required: true,
      label: texts.email,
      type: "email",
      key: "email",
      value: values["email"],
    },
    {
      required: true,
      label: texts.password,
      type: "password",
      key: "password",
      value: values["password"],
    },
    {
      required: true,
      label: texts.repeat_password,
      type: "password",
      key: "repeatpassword",
      value: values["repeatpassword"],
    },
  ];

  const messages = {
    submitMessage: texts.next_step,
    headerMessage: texts.step_1_basic_information,
    bottomMessage: texts.already_have_an_account,
  };

  const bottomLink = {
    text: texts.log_in,
    href: getLocalePrefix(locale) + "/signin",
  };

  return (
    <>
      <Typography color="secondary" className={classes.appealText}>
        {texts.here_you_can_create_your_personal_account}
      </Typography>
      <Typography color="secondary" className={classes.appealText}>
        {texts.you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up}
      </Typography>
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
      />
    </>
  );
}
