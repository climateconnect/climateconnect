import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";

const useStyles = makeStyles((theme) => ({
  appealText: {
    textAlign: "left",
    fontWeight: "bold",
  },
  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)}px 0`,
  },
}));

export default function BasicInfo({ handleSubmit, errorMessage, values }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const title = title;
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
    <Typography component="h1" variant="h5" className={classes.mainHeading}>
    {title}
  </Typography>
      <Typography color="secondary" className={classes.appealText}>
        {texts.create_your_personal_account_you_will_have_the_opportunity}
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
