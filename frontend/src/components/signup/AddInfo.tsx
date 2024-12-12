import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getLocationFields } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";

const useStyles = makeStyles({
  checkboxLabels: {
    fontSize: 14,
  },

  formRootClass: {
    padding: 0,
    maxWidth: 700,
    margin: "0 auto 0 0", // basically a left align
  },

  cardHeaderBox: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    marginBottom: 2,
  },
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
    submitMessage: texts.submit,
    headerMessage: "",
  };

  const formAction = {
    href: getLocalePrefix(locale) + "/addinfo",
    method: "GET",
  };

  return (
    <Card>
      {/* TODO: maybe use card Header instead (?)
      see https://mui.com/material-ui/react-card/ for other usefull card components */}
      <Box className={classes.cardHeaderBox}>
        <IconButton aria-label="close" onClick={() => handleGoBack(undefined, values)}>
          <ArrowBack />
        </IconButton>
        <Typography color="primary" variant="subtitle1" component="div">
          {texts.step_2_of_2_sign_up}
        </Typography>
      </Box>
      <CardContent>
        <Typography color="primary" variant="h3">
          {texts.signup_step_2_headline}
        </Typography>
        <Form
          fields={fields}
          className={classes.formRootClass}
          messages={messages}
          formAction={formAction}
          onSubmit={(event, values) => handleSubmit(event, values)}
          errorMessage={errorMessage}
          onGoBack={handleGoBack}
          autocomplete="off"
        />
      </CardContent>
    </Card>
  );
}
