import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getLocationFields } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  contrastBackground: {
    color: theme.palette.background.default_contrastText,
  },
  root: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      borderRadius: 0,
      boxShadow: "none",
    },
  },
  checkboxLabels: {
    [theme.breakpoints.up("sm")]: {
      fontSize: 14,
    },
    [theme.breakpoints.down("sm")]: {
      fontWeight: "normal",
    },
  },
  formRootClass: {
    padding: 0,
    maxWidth: 700,
    margin: "0 auto 0 0", // basically a left align
  },
  smallScreenHeadline: {
    fontSize: 35,
    textAlign: "center",
    fontWeight: "bold",
    padding: theme.spacing(4),
  },
  cardHeaderBox: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    marginBottom: 2,
  },
}));

export default function AddInfo({
  handleSubmit,
  errorMessage,
  values,
  handleGoBack,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  isSmallScreen,
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
    headerMessage: "",
  };
  const formAction = {
    href: getLocalePrefix(locale) + "/addinfo",
    method: "GET",
  };

  const GoBackArrow = () => (
    <IconButton aria-label="close" onClick={() => handleGoBack(undefined, values)}>
      <ArrowBack />
    </IconButton>
  );

  const StepCounter = () => (
    <Typography variant="subtitle1" component="div">
      {isSmallScreen && <GoBackArrow />}
      {texts.step_2_of_3_sign_up}
    </Typography>
  );

  return (
    <Card className={classes.root}>
      {/* TODO: maybe use card Header instead (?)
      see https://mui.com/material-ui/react-card/ for other usefull card components */}
      {isSmallScreen && (
        <Typography color="primary" variant="h1" className={classes.smallScreenHeadline}>
          {texts.sign_up}
        </Typography>
      )}
      <Box className={classes.cardHeaderBox}>
        {!isSmallScreen && <GoBackArrow />}
        <StepCounter />
      </Box>
      <CardContent>
        {!isSmallScreen && <Typography>{texts.signup_step_2_headline}</Typography>}
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
