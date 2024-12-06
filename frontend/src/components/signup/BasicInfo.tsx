import { Card, Typography, IconButton, Box, CardContent } from "@mui/material";
import Close from "@mui/icons-material/Close";
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

  formRootClass: {
    padding: 0,
    maxWidth: 700,
    margin: "0 auto 0 0", // basically a left align
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
    bottomMessage: texts.already_have_an_account,
  };

  const bottomLink = {
    text: texts.log_in,
    href: getLocalePrefix(locale) + "/signin",
  };

  return (
    <Card>
      {/* TODO: maybe use card Header instead (?)
      see https://mui.com/material-ui/react-card/ for other usefull card components */}
      <Box
        sx={{
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => {
            console.debug("closed");
          }}
        >
          <Close />
        </IconButton>
        <Typography color="primary" variant="subtitle1" component="div">
          {/* TODO: use texts */}
          {texts.step_1_of_2_sign_up}
        </Typography>
      </Box>
      <CardContent>
        <Typography color="primary" variant="h1">
          {texts.sign_up}
        </Typography>
        <Typography color="primary" variant="h3">
          {texts.here_you_can_create_your_personal_account}
          {texts.you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up}
        </Typography>
        <Form
          className={classes.formRootClass}
          fields={fields}
          messages={messages}
          bottomLink={bottomLink}
          onSubmit={(event, values) => handleSubmit(event, values)}
          errorMessage={errorMessage}
        />
      </CardContent>
    </Card>
  );
}
