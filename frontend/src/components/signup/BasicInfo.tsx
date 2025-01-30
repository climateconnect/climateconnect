import { Card, Typography, IconButton, Box, CardContent } from "@mui/material";
import Close from "@mui/icons-material/Close";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";
import theme from "../../themes/theme";

const useStyles = makeStyles((theme) => ({
  contrastBackground: {
    color: theme.palette.background.default_contrastText,
  },
  appealText: {
    fontWeight: "bold",
    textAlign: "center",
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
  stepIndicator: {
    marginTop: theme.spacing(1),
    textAlign: "center",
  },
});

export default function BasicInfo({ handleSubmit, errorMessage, values, texts, isSmallScreen }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
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

  const StepIndicator = () => (
    <Typography
      color={isSmallScreen ? "secondary" : "primary"}
      variant="subtitle1"
      component="div"
      className={isSmallScreen ? classes.stepIndicator : ""}
    >
      {/* TODO: use texts */}
      {texts.step_1_of_2_sign_up}
    </Typography>
  );

  const BasicInfoContent = () => (
    <>
      <Typography
        color="primary"
        variant="h1"
        className={isSmallScreen ? classes.smallScreenHeadline : ""}
      >
        {texts.sign_up}
      </Typography>
      <Typography
        color={!isSmallScreen ? "primary" : "secondary"}
        className={isSmallScreen ? classes.appealText : ""}
      >
        {texts.here_you_can_create_your_personal_account}
        {isSmallScreen && <br />}
        {texts.you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up}
      </Typography>
      <StepIndicator />
      <Form
        className={classes.formRootClass}
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        onSubmit={(event, values) => handleSubmit(event, values)}
        errorMessage={errorMessage}
      />
    </>
  );

  if (isSmallScreen) {
    return <BasicInfoContent />;
  }

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
            window.history.back();
          }}
        >
          <Close />
        </IconButton>
        <StepIndicator />
      </Box>
      <CardContent>
        <BasicInfoContent />
      </CardContent>
    </Card>
  );
}
