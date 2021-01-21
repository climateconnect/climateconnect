import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Header from "../general/Header";
import Footer from "../general/Footer";
import theme from "../../themes/theme";
import LayoutWrapper from "./LayoutWrapper";
import { getParams } from "../../../public/lib/generalOperations";
import Alert from "@material-ui/lab/Alert";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";

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

export default function FixedHeightLayout({ 
  children,
  message,
  messageType,
  title
}) {
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
        <Footer noSpacingTop noAbsolutePosition className={classes.noFlex} />
      </div>
    </LayoutWrapper>
  );
}
