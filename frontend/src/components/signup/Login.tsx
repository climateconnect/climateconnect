import { Card, CardContent, Theme, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import Form from "./../general/Form";
import makeStyles from "@mui/styles/makeStyles";
import ContentImageSplitView from "../layouts/ContentImageSplitLayout";
import CustomAuthImage from "../hub/CustomAuthImage";

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.background.default_contrastText,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      textAlign: "center",
      fontSize: 35,
      fontWeight: "bold",
    },
  },
}));

export default function Login({
  texts,
  fields,
  messages,
  bottomLink,
  handleSubmit,
  errorMessage,
  hubUrl,
}) {
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const classes = useStyles();

  const LoginContent = () => (
    <>
      <Typography variant="h1" className={classes.title}>
        {texts.log_in}
      </Typography>
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        usePercentage={false}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </>
  );

  return (
    <>
      {isSmallScreen ? (
        <LoginContent />
      ) : (
        <ContentImageSplitView
          minHeight="75vh"
          content={
            <Card variant="outlined">
              <CardContent>
                <LoginContent />
              </CardContent>
            </Card>
          }
          leftGridSizes={{ md: 7 }}
          rightGridSizes={{ md: 5 }}
          image={<CustomAuthImage hubUrl={hubUrl} texts={texts} />}
        />
      )}
    </>
  );
}
