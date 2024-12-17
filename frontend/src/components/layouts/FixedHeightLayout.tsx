import makeStyles from "@mui/styles/makeStyles";
import Alert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";
import { getParams } from "../../../public/lib/generalOperations";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";
import theme from "../../themes/theme";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import LayoutWrapper from "./LayoutWrapper";

const useStyles = makeStyles({
  root: {
    margin: 0,
    height: "calc(100vh)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  noFlex: {
    flex: "none",
  },
});

export default function FixedHeightLayout({ children, message, messageType, title }) {
  const classes = useStyles();
  const [initialMessageType, setInitialMessageType] = useState(null);
  const [alertOpen, setAlertOpen] = useState(true);
  const [initialMessage, setInitialMessage] = useState("");
  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) {
      setInitialMessage(decodeURI(params.message));
    }
    if (params.errorMessage) {
      setInitialMessage(decodeURI(params.errorMessage));
      setInitialMessageType("error");
    }
  }, []);
  return (
    <LayoutWrapper theme={theme} title={title} fixedHeight>
      <div className={classes.root}>
        <Header noSpacingBottom className={classes.noFlex} />
        {(message || initialMessage) && alertOpen && (
          <Alert
            className={classes.alert}
            severity={
              messageType ? messageType : initialMessageType ? initialMessageType : "success"
            }
            onClose={() => {
              if (message) {
                setAlertOpen(false);
              } else {
                setInitialMessage(null);
              }
            }}
          >
            {getMessageFromUrl(message ? message : initialMessage)}
          </Alert>
        )}
        {children}
        <Footer noAbsolutePosition className={classes.noFlex} />
      </div>
    </LayoutWrapper>
  );
}
